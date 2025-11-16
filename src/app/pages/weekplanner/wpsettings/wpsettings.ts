import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface WeekPlannerSettings {
  id?: number;
  groupId: number;
  startHour: number;
  endHour: number;
  enabledDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  recurringActivities: RecurringActivity[];
}

export interface RecurringActivity {
  id?: number;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  days: string[]; // ["monday", "tuesday", etc.]
  color?: string;
  settingsId?: number;
}

interface GroupModel {
  id: number;
  name: string;
}

@Component({
  selector: 'app-wpsettings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './wpsettings.html',
  styleUrl: './wpsettings.css'
})
export class WPSettings implements OnInit {
  private baseUrl = `${environment.apiUrl}/api`;

  // Gruppen
  groups: GroupModel[] = [];
  selectedGroupId: number = 0;

  // Settings
  settings: WeekPlannerSettings = {
    groupId: 0,
    startHour: 7,
    endHour: 17,
    enabledDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    recurringActivities: []
  };

  // UI State
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isEditMode: boolean = false;
  editingIndex: number = -1;

  // Vorschläge für wiederkehrende Aktivitäten
  activitySuggestions = [
    { title: 'Morgenkreis', startTime: '08:00', endTime: '08:30', color: '#FFA07A' },
    { title: 'Frühdienst', startTime: '07:00', endTime: '08:00', color: '#98D8C8' },
    { title: 'Mittagessen', startTime: '12:00', endTime: '13:00', color: '#FFD700' },
    { title: 'Mittagsrast', startTime: '13:00', endTime: '14:30', color: '#87CEEB' },
    { title: 'Jause', startTime: '09:00', endTime: '09:30', color: '#FFB6C1' },
    { title: 'Freispiel', startTime: '10:00', endTime: '11:30', color: '#DDA0DD' },
    { title: 'Garten', startTime: '15:00', endTime: '16:00', color: '#90EE90' },
    { title: 'Abholzeit', startTime: '16:00', endTime: '17:00', color: '#F0E68C' }
  ];

  // Neue Aktivität
  newActivity: RecurringActivity = {
    title: '',
    startTime: '08:00',
    endTime: '09:00',
    description: '',
    days: []
  };

  dayNames = [
    { key: 'monday', label: 'Mo' },
    { key: 'tuesday', label: 'Di' },
    { key: 'wednesday', label: 'Mi' },
    { key: 'thursday', label: 'Do' },
    { key: 'friday', label: 'Fr' },
    { key: 'saturday', label: 'Sa' },
    { key: 'sunday', label: 'So' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.http.get<GroupModel[]>(`${this.baseUrl}/groups`).subscribe({
      next: (groups) => {
        this.groups = groups;
        if (groups.length > 0 && this.selectedGroupId === 0) {
          this.selectedGroupId = groups[0].id;
          this.settings.groupId = groups[0].id;
          this.loadSettings();
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Gruppen:', error);
        this.errorMessage = 'Fehler beim Laden der Gruppen';
      }
    });
  }

  onGroupChange(): void {
    this.settings.groupId = this.selectedGroupId;
    this.loadSettings();
  }

  loadSettings(): void {
    if (this.selectedGroupId === 0) return;

    this.isLoading = true;
    
    // Lade Settings für die gewählte Gruppe
    this.http.get<any>(`${this.baseUrl}/weekplannersettings/group/${this.selectedGroupId}`).subscribe({
      next: (groupSettings) => {
        console.log('Empfangene Settings vom Backend:', groupSettings);
        
        // Prüfe ob enabledDays existiert, falls nicht: erstelle Default
        if (!groupSettings.enabledDays) {
          groupSettings.enabledDays = {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          };
        }
        
        // Prüfe ob recurringActivities existiert und ein Array ist
        if (!groupSettings.recurringActivities) {
          groupSettings.recurringActivities = [];
        }
        
        // Wenn recurringActivities ein JSON-String ist, parse es
        if (typeof groupSettings.recurringActivities === 'string') {
          try {
            groupSettings.recurringActivities = JSON.parse(groupSettings.recurringActivities);
          } catch (e) {
            console.error('Fehler beim Parsen von recurringActivities:', e);
            groupSettings.recurringActivities = [];
          }
        }
        
        // Konvertiere Days von Backend-Format ("Monday") zu Frontend-Format ("monday")
        if (Array.isArray(groupSettings.recurringActivities)) {
          groupSettings.recurringActivities.forEach((activity: any) => {
            // Parse days falls es ein JSON-String ist
            if (typeof activity.days === 'string') {
              try {
                activity.days = JSON.parse(activity.days);
              } catch (e) {
                console.error('Fehler beim Parsen von activity.days:', e);
                activity.days = [];
              }
            }
            
            // Konvertiere zu lowercase
            if (Array.isArray(activity.days)) {
              activity.days = activity.days.map((day: string) => day.toLowerCase());
            } else {
              activity.days = [];
            }
          });
        }
        
        this.settings = groupSettings as WeekPlannerSettings;
        console.log('Finales settings-Objekt:', this.settings);
        console.log('startHour:', this.settings.startHour);
        console.log('endHour:', this.settings.endHour);
        console.log('enabledDays:', this.settings.enabledDays);
        console.log('recurringActivities:', this.settings.recurringActivities);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Settings:', error);
        // Falls keine Settings existieren, behalte die Default-Werte
        this.isLoading = false;
      }
    });
  }

  async saveSettings() {
    if (!this.selectedGroupId) {
      this.errorMessage = 'Bitte wähle zuerst eine Gruppe aus.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      // Konvertiere days zurück zu Großbuchstaben für Backend
      const settingsToSend = {
        groupId: this.selectedGroupId,
        startHour: this.settings.startHour,
        endHour: this.settings.endHour,
        enabledDays: this.settings.enabledDays,
        recurringActivities: this.settings.recurringActivities.map((activity: any) => ({
          ...activity,
          days: activity.days?.map((day: string) => 
            day.charAt(0).toUpperCase() + day.slice(1)
          ) || []
        }))
      };

      console.log('Sende Settings an Backend:', JSON.stringify(settingsToSend, null, 2));

      try {
        // Schritt 1: Prüfe ob Settings existieren
        console.log('🔍 Prüfe ob Settings existieren für Gruppe:', this.selectedGroupId);
        const existingSettings = await this.http.get<any>(
          `${this.baseUrl}/weekplannersettings/group/${this.selectedGroupId}`
        ).toPromise();

        console.log('✅ Settings existieren bereits, verwende PUT');
        console.log('Existierende Settings ID:', existingSettings.id);

        // Schritt 2: Settings existieren → PUT verwenden
        const result = await this.http.put<any>(
          `${this.baseUrl}/weekplannersettings/${existingSettings.id}`,
          settingsToSend
        ).toPromise();

        console.log('✅ Settings aktualisiert:', result);
        this.handleSaveSuccess(settingsToSend, result);

      } catch (error: any) {
        if (error.status === 404) {
          // Schritt 3: Settings existieren NICHT → POST verwenden
          console.log('⚠️ Settings existieren nicht (404), verwende POST');
          const result = await this.http.post<any>(
            `${this.baseUrl}/weekplannersettings`,
            settingsToSend
          ).toPromise();

          console.log('✅ Settings erstellt:', result);
          this.handleSaveSuccess(settingsToSend, result);
        } else {
          throw error;
        }
      }

    } catch (error: any) {
      console.error('❌ Fehler beim Speichern der Settings:', error);
      this.errorMessage = error.error?.message || 'Fehler beim Speichern der Einstellungen.';
    } finally {
      this.isSaving = false;
    }
  }

  private handleSaveSuccess(sentSettings: any, result: any) {
    this.isSaving = false;

    // Backend gibt möglicherweise enabledDays als null zurück
    if (!result.enabledDays && sentSettings.enabledDays) {
      console.log('⚠️ enabledDays ist null, verwende gesendete Werte');
      result.enabledDays = sentSettings.enabledDays;
    }

    // Backend gibt möglicherweise recurringActivities als null zurück
    if (!result.recurringActivities && sentSettings.recurringActivities) {
      console.log('⚠️ recurringActivities ist null, verwende gesendete Werte');
      result.recurringActivities = sentSettings.recurringActivities;
    }

    this.settings = result;
    
    // Zeige Erfolgsmeldung
    this.successMessage = 'Einstellungen erfolgreich gespeichert! Alle bestehenden und zukünftigen Wochenpläne wurden automatisch synchronisiert.';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 8000);
  }

  addActivityFromSuggestion(suggestion: any): void {
    const newActivity: RecurringActivity = {
      title: suggestion.title,
      startTime: suggestion.startTime,
      endTime: suggestion.endTime,
      description: '',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: suggestion.color
    };
    this.settings.recurringActivities.push(newActivity);
  }

  addCustomActivity(): void {
    if (!this.newActivity.title || this.newActivity.days.length === 0) {
      alert('Bitte Titel und mindestens einen Tag auswählen');
      return;
    }

    this.settings.recurringActivities.push({ ...this.newActivity });
    this.resetActivityForm();
  }

  editActivity(index: number): void {
    this.isEditMode = true;
    this.editingIndex = index;
    const activity = this.settings.recurringActivities[index];
    this.newActivity = { ...activity };
  }

  updateActivity(): void {
    if (!this.newActivity.title || this.newActivity.days.length === 0) {
      alert('Bitte Titel und mindestens einen Tag auswählen');
      return;
    }

    this.settings.recurringActivities[this.editingIndex] = { ...this.newActivity };
    this.resetActivityForm();
  }

  cancelEdit(): void {
    this.resetActivityForm();
  }

  resetActivityForm(): void {
    this.isEditMode = false;
    this.editingIndex = -1;
    this.newActivity = {
      title: '',
      startTime: '08:00',
      endTime: '09:00',
      description: '',
      days: []
    };
  }

  removeActivity(index: number): void {
    if (confirm('Möchten Sie diese Aktivität wirklich löschen?')) {
      this.settings.recurringActivities.splice(index, 1);
    }
  }

  toggleDay(day: string): void {
    const index = this.newActivity.days.indexOf(day);
    if (index > -1) {
      this.newActivity.days.splice(index, 1);
    } else {
      this.newActivity.days.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.newActivity.days.includes(day);
  }

  getDayLabel(days: string[]): string {
    const labels: { [key: string]: string } = {
      monday: 'Mo',
      tuesday: 'Di',
      wednesday: 'Mi',
      thursday: 'Do',
      friday: 'Fr',
      saturday: 'Sa',
      sunday: 'So'
    };
    return days.map(d => labels[d]).join(', ');
  }

  formatTimeWithSeconds(time: string): string {
    // Konvertiert "08:00" oder "08:00:00" zu "08:00:00"
    if (!time) return '00:00:00';
    
    const parts = time.split(':');
    if (parts.length === 2) { // "HH:mm"
      return `${time}:00`;
    } else if (parts.length === 3) { // "HH:mm:ss"
      return time;
    }
    
    // Fallback
    return '00:00:00';
  }

  capitalizeDay(day: string): string {
    // Konvertiert "monday" zu "Monday"
    if (!day || day.length === 0) return '';
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  }

  getHourOptions(): number[] {
    return Array.from({ length: 18 }, (_, i) => i + 6); // 6-23 Uhr
  }
}
