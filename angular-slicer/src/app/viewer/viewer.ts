import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [],
  templateUrl: './viewer.html',
  styleUrl: './viewer.css'
})
export class Viewer implements OnInit, OnChanges {
  @ViewChild('rendererCanvas', { static: true })
  private rendererCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() modelContent: ArrayBuffer | null = null;
  @Input() slicedLayers: THREE.Vector2[][][] | null = null;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Mesh;
  private sliceGroup: THREE.Group = new THREE.Group();

  constructor() { }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.rendererCanvas.nativeElement, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.background = new THREE.Color(0xdddddd);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.scene.add(this.sliceGroup);

    this.camera.position.z = 5;

    this.animate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelContent'] && this.modelContent) {
      this.loadModel();
    }
    if (changes['slicedLayers'] && this.slicedLayers) {
      this.renderSlices();
    }
  }

  private loadModel(): void {
    if (!this.modelContent) return;
    if (this.model) {
      this.scene.remove(this.model);
    }
    this.clearSlices();

    const loader = new STLLoader();
    const geometry = loader.parse(this.modelContent);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    this.model = new THREE.Mesh(geometry, material);
    this.scene.add(this.model);

    // Center the model
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);
  }

  private renderSlices(): void {
    this.clearSlices();
    if (!this.slicedLayers || !this.model) return;

    this.slicedLayers.forEach((layer, layerIndex) => {
      if (!this.model.geometry.boundingBox) {
        this.model.geometry.computeBoundingBox();
      }
      const boundingBox = this.model.geometry.boundingBox;
      if (!boundingBox) return;

      const z = (boundingBox.min.z + layerIndex * 0.2); // This is not robust
      layer.forEach(polygon => {
        const points = polygon.map(p => new THREE.Vector3(p.x, p.y, z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(geometry, material);
        this.sliceGroup.add(line);
      });
    });
  }

  private clearSlices(): void {
    this.sliceGroup.children.forEach(child => this.sliceGroup.remove(child));
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    if (this.model) {
      this.model.rotation.y += 0.01;
    }

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public getModel(): THREE.Mesh {
    return this.model;
  }
}
