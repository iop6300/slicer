import { Injectable, inject } from '@angular/core';
import { Mesh, Vector2, Plane, Vector3, BufferGeometry, BufferAttribute, Triangle, Line3 } from 'three';
import * as ClipperLib from 'js-clipper';
import { SettingsService } from './settings.service';

interface ClipperPoint {
  X: number;
  Y: number;
}

@Injectable({
  providedIn: 'root'
})
export class Slicer {
  private settingsService = inject(SettingsService);

  slice(model: Mesh): Vector2[][][] {
    console.log('Slicing model:', model);
    const { layerHeight, wallCount } = this.settingsService.getSettings()();


    const geometry = model.geometry;
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;

    if (!boundingBox) {
      console.error('Bounding box could not be computed.');
      return [];
    }

    const layers = [];
    for (let z = boundingBox.min.z; z < boundingBox.max.z; z += layerHeight) {
      const plane = new Plane(new Vector3(0, 0, 1), -z);
      const layerLines = this.getLayer(geometry, plane);
      if (layerLines.length > 0) {
        const polygons = this.connectLines(layerLines, wallCount);
        layers.push(polygons);
      }
    }

    console.log('Sliced layers (polygons):', layers);
    return layers;
  }

  private getLayer(geometry: BufferGeometry, plane: Plane): Line3[] {
    const layerLines = [];
    const positions = geometry.attributes['position'] as BufferAttribute;
    const triangle = new Triangle();

    for (let i = 0; i < positions.count; i += 3) {
      triangle.a.fromBufferAttribute(positions, i);
      triangle.b.fromBufferAttribute(positions, i + 1);
      triangle.c.fromBufferAttribute(positions, i + 2);

      const intersectionPoints = [];
      const edges = [
        new Line3(triangle.a, triangle.b),
        new Line3(triangle.b, triangle.c),
        new Line3(triangle.c, triangle.a)
      ];

      for (const edge of edges) {
        const intersectionPoint = new Vector3();
        if (plane.intersectLine(edge, intersectionPoint)) {
          intersectionPoints.push(intersectionPoint);
        }
      }

      if (intersectionPoints.length === 2) {
        layerLines.push(new Line3(intersectionPoints[0], intersectionPoints[1]));
      }
    }

    return layerLines;
  }

  private connectLines(lines: Line3[], wallCount: number): Vector2[][] {
    const scale = 1000; // Scale for integer coordinates
    const clipper = new ClipperLib.Clipper();
    const paths = lines.map(line => [
      { X: Math.round(line.start.x * scale), Y: Math.round(line.start.y * scale) },
      { X: Math.round(line.end.x * scale), Y: Math.round(line.end.y * scale) }
    ]);

    clipper.AddPaths(paths, ClipperLib.PolyType.ptSubject, false);

    const solution = new ClipperLib.Paths();
    clipper.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    if (wallCount < 1) {
      wallCount = 1;
    }

    const allWalls: ClipperPoint[][] = [];
    const nozzleWidth = 0.4; // This should probably be a setting later
    const offsetDelta = -nozzleWidth * scale;

    solution.forEach((path: ClipperPoint[]) => {
      let currentPaths = [path];
      allWalls.push(...currentPaths);

      for (let i = 1; i < wallCount; i++) {
        if (currentPaths.length === 0) break;

        const co = new ClipperLib.ClipperOffset();
        co.AddPaths(currentPaths, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        
        const offsetSolution = new ClipperLib.Paths();
        co.Execute(offsetSolution, offsetDelta);
        
        currentPaths = offsetSolution;
        if (currentPaths.length > 0) {
          allWalls.push(...currentPaths);
        }
      }
    });

    const polygons = allWalls.map((path: ClipperPoint[]) =>
      path.map((point: ClipperPoint) => new Vector2(point.X / scale, point.Y / scale))
    );

    return polygons;
  }
}
