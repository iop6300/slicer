import { Settings } from './settings/settings';
import { Component, signal, ViewChild } from '@angular/core';
import { Viewer } from './viewer/viewer';
import { Slicer } from './slicer';
import { Gcode } from './gcode';
import { Vector2 } from 'three';

@Component({
  selector: 'app-root',
  imports: [Viewer, Settings],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-slicer');
  modelContent = signal<ArrayBuffer | null>(null);
  slicedLayers = signal<Vector2[][][] | null>(null);

  @ViewChild(Viewer) private viewer!: Viewer;

  constructor(private slicer: Slicer, private gcodeService: Gcode) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.modelContent.set(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  slice(): void {
    const model = this.viewer.getModel();
    if (model) {
      const layers = this.slicer.slice(model);
      this.slicedLayers.set(layers);
    } else {
      console.error('No model to slice');
    }
  }

  generateGcode(): void {
    const layers = this.slicedLayers();
    if (layers) {
      const gcode = this.gcodeService.generate(layers);
      this.saveGcode(gcode);
    } else {
      console.error('No sliced layers to generate G-code from');
    }
  }

  private saveGcode(gcode: string): void {
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.gcode';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
