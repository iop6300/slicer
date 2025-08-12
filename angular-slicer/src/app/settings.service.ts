import { Injectable, signal } from '@angular/core';

export interface SlicerSettings {
  layerHeight: number;
  infillPercentage: number;
  supportMaterial: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings = signal<SlicerSettings>({
    layerHeight: 0.2,
    infillPercentage: 20,
    supportMaterial: false
  });

  getSettings() {
    return this.settings.asReadonly();
  }

  updateSettings(newSettings: Partial<SlicerSettings>) {
    this.settings.update(currentSettings => ({ ...currentSettings, ...newSettings }));
  }
}
