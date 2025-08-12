import { Component, inject } from '@angular/core';
import { SettingsService } from '../settings.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  private settingsService = inject(SettingsService);
  settings = this.settingsService.getSettings();

  updateSettings(newSettings: any) {
    this.settingsService.updateSettings(newSettings);
  }
}