import { Injectable, signal } from '@angular/core';

export interface SlicerSettings {
  layerHeight: number;
  infillPercentage: number;
  supportMaterial: boolean;
  wallCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings = signal<SlicerSettings>({
    layerHeight: 0.2,
    infillPercentage: 20,
    supportMaterial: false,
    wallCount: 2
  });

  getSettings() {
    return this.settings.asReadonly();
  }

  updateSettings(newSettings: Partial<SlicerSettings>) {
    this.settings.update(currentSettings => ({ ...currentSettings, ...newSettings }));
  }
}
