import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { WeekPlannerSettings } from '../wpsettings/wpsettings';

// Frontend Models (für interne Verwendung)
interface PlannedActivityModel {
  id?: number;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  plannedDayId?: number;
  sourceType?: 'new' | 'logdata' | 'recurring';
  logDataId?: number;
  color?: string;
}

interface PlannedDayModel {
  id?: number;
  date: string;
  dayOfWeek: string;
  weekPlannerId?: number;
  activities: PlannedActivityModel[];
}

interface WeekPlannerModel {
  id?: number;
  startDate: string;
  endDate: string;
  groupId: number;
  plannedDays?: PlannedDayModel[];
}

// Backend DTOs (wie vom Backend erwartet)
interface BackendPlannedActivity {
  id?: number;
  hourTime: string;        // "09:00:00"
  activity: string;        // Titel der Aktivität
  details?: string;        // Beschreibung
  activityId?: number;
  plannedDayId?: number;
}

interface BackendPlannedDay {
  id?: number;
  day: string;            // "Monday", "Tuesday", etc.
  weekPlannerId?: number;
  activities: BackendPlannedActivity[];
}

interface BackendWeekPlanner {
  id?: number;
  startDate: string;      // "2024-01-15T00:00:00"
  endDate: string;        // "2024-01-19T00:00:00"
  groupId: number;
  plannedDays?: BackendPlannedDay[];
}

interface LogDataModel {
  id: number;
  childId: number;
  createdUtc: string;
  createdById: number;
  fullDataId: number;
  goal: string;
  activities: string[];
  observations?: string;
  area?: string;
  subArea?: string;
  age?: number;
}

interface GroupModel {
  id: number;
  name: string;
}

@Component({
  selector: 'app-week-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './week-planner.html',
  styleUrl: './week-planner.css'
})
export class WeekPlanner implements OnInit {
  private baseUrl = `${environment.apiUrl}/api`;

  // Gruppe
  selectedGroupId: number = 0;
  selectedGroup: GroupModel | null = null;
  groups: GroupModel[] = [];

  // Aktuelle Woche
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();
  weekTitle: string = '';

  // Wochenplan Daten
  currentWeekPlanner: WeekPlannerModel | null = null;
  weekDays: PlannedDayModel[] = [];
  
  // Settings
  settings: WeekPlannerSettings | null = null;
  
  // Stunden für die Zeitachse
  hours: string[] = [];
  
  // LogDatas der letzten 2 Wochen
  recentLogDatas: LogDataModel[] = [];
  
  // Drag & Drop
  draggedActivity: PlannedActivityModel | LogDataModel | null = null;

  // Modal State
  showActivityModal: boolean = false;
  isEditMode: boolean = false;
  editingActivityIndex: number = -1;
  modalDayIndex: number = -1;
  modalHour: string = '';
  newActivityForm = {
    title: '',
    startTime: '',
    endTime: '',
    description: ''
  };

  // UI State
  isLoading: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGroups();
  }

  // ===== Gruppen-Verwaltung =====

  loadGroups(): void {
    this.http.get<GroupModel[]>(`${this.baseUrl}/groups`).subscribe({
      next: (groups) => {
        console.log('Geladene Gruppen:', groups);
        this.groups = groups;
        if (groups.length > 0) {
          this.selectedGroupId = groups[0].id;
          this.selectedGroup = groups[0];
          this.loadSettings();
        } else {
          console.warn('Keine Gruppen gefunden');
          this.errorMessage = 'Keine Gruppen gefunden';
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Gruppen:', error);
        console.error('Error Details:', error.error);
        this.errorMessage = `Fehler beim Laden der Gruppen: ${error.message || 'Unbekannter Fehler'}`;
      }
    });
  }

  loadSettings(): void {
    // Lade Settings für die ausgewählte Gruppe
    this.http.get<WeekPlannerSettings>(`${this.baseUrl}/weekplannersettings/group/${this.selectedGroupId}`).subscribe({
      next: (groupSettings) => {
        console.log('Geladene Settings:', groupSettings);
        this.settings = groupSettings;
        this.generateHours();
        this.setCurrentWeek();
        this.loadWeekPlanner();
        this.loadRecentLogDatas();
      },
      error: (error) => {
        console.error('Fehler beim Laden der Settings:', error);
        // Falls keine Settings existieren (404), verwende Default-Werte
        if (error.status === 404) {
          console.log('Keine Settings gefunden, verwende Defaults');
        }
        this.generateHours(7, 17);
        this.setCurrentWeek();
        this.loadWeekPlanner();
        this.loadRecentLogDatas();
      }
    });
  }

  // ===== Datums-Verwaltung =====
  
  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Montag als erster Tag
    
    this.currentWeekStart = new Date(today);
    this.currentWeekStart.setDate(today.getDate() + diff);
    this.currentWeekStart.setHours(0, 0, 0, 0);
    
    this.currentWeekEnd = new Date(this.currentWeekStart);
    this.currentWeekEnd.setDate(this.currentWeekStart.getDate() + 6);
    this.currentWeekEnd.setHours(0, 0, 0, 0); // Setze auf 00:00 für Backend-Validierung
    
    this.updateWeekTitle();
    this.initializeWeekDays();
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() - 7);
    this.updateWeekTitle();
    this.initializeWeekDays();
    this.loadWeekPlanner();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd.setDate(this.currentWeekEnd.getDate() + 7);
    this.updateWeekTitle();
    this.initializeWeekDays();
    this.loadWeekPlanner();
  }

  updateWeekTitle(): void {
    const startStr = this.formatDate(this.currentWeekStart);
    const endStr = this.formatDate(this.currentWeekEnd);
    this.weekTitle = `${startStr} - ${endStr}`;
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateDisplay(dateString: string): string {
    // Konvertiert "2025-11-15" zu "15.11"
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }

  initializeWeekDays(): void {
    const dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      // Prüfe ob der Tag aktiviert ist
      if (this.settings?.enabledDays && !(this.settings.enabledDays as any)[dayKeys[i]]) {
        continue;
      }

      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      
      this.weekDays.push({
        date: this.formatDateISO(date),
        dayOfWeek: dayNames[i],
        activities: []
      });
    }
  }

  generateHours(startHour?: number, endHour?: number): void {
    const start = startHour || this.settings?.startHour || 7;
    const end = endHour || this.settings?.endHour || 17;
    
    this.hours = [];
    for (let hour = start; hour <= end; hour++) {
      this.hours.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }

  // ===== API Calls =====

  loadWeekPlanner(): void {
    if (this.selectedGroupId === 0) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔄 Lade Wochenplan für Gruppe:', this.selectedGroupId);
    console.log('📅 Woche:', this.formatDateISO(this.currentWeekStart), 'bis', this.formatDateISO(this.currentWeekEnd));
    
    // Lade Wochenpläne für die ausgewählte Gruppe
    this.http.get<BackendWeekPlanner[]>(`${this.baseUrl}/weekplanners/group/${this.selectedGroupId}`).subscribe({
      next: (backendPlanners) => {
        console.log('📥 Empfangene Wochenpläner vom Backend:', backendPlanners);
        
        const weekStart = this.formatDateTimeISO(this.formatDateISO(this.currentWeekStart));
        const existingPlanner = backendPlanners.find(p => 
          p.startDate === weekStart && p.groupId === this.selectedGroupId
        );
        
        console.log('🔍 Gesuchtes StartDate:', weekStart);
        console.log('✅ Gefundener Planner:', existingPlanner);
        
        if (existingPlanner && existingPlanner.id) {
          // Konvertiere Backend-Daten zu Frontend-Modell
          this.currentWeekPlanner = this.mapBackendToWeekPlanner(existingPlanner);
          
          console.log('📋 PlannedDays im Backend:', existingPlanner.plannedDays);
          
          // Lade Details und merge mit weekDays
          if (existingPlanner.plannedDays) {
            existingPlanner.plannedDays.forEach(backendDay => {
              console.log(`📆 Tag ${backendDay.day} hat ${backendDay.activities.length} Aktivitäten:`, backendDay.activities);
              
              const dayModel = this.mapBackendToPlannedDay(backendDay);
              const weekDay = this.weekDays.find(wd => {
                // Match by day name
                const backendDayNameMap: { [key: string]: string } = {
                  'Monday': 'Montag', 'Tuesday': 'Dienstag', 'Wednesday': 'Mittwoch',
                  'Thursday': 'Donnerstag', 'Friday': 'Freitag', 'Saturday': 'Samstag', 'Sunday': 'Sonntag'
                };
                return wd.dayOfWeek === backendDayNameMap[backendDay.day];
              });
              
              if (weekDay) {
                weekDay.id = dayModel.id;
                weekDay.weekPlannerId = dayModel.weekPlannerId;
                weekDay.activities = dayModel.activities;
                console.log(`✅ ${weekDay.dayOfWeek} hat jetzt ${weekDay.activities.length} Aktivitäten`);
              } else {
                console.warn(`⚠️ Kein weekDay gefunden für ${backendDay.day}`);
              }
            });
          }
          
          console.log('🎯 Finale weekDays:', this.weekDays);
          this.isLoading = false;
        } else {
          console.log('❌ Kein Wochenplan gefunden - lade RecurringActivities');
          // Kein Wochenplan vorhanden - lade wiederkehrende Aktivitäten
          this.currentWeekPlanner = null;
          this.loadRecurringActivities();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden der Wochenpläne:', error);
        // Falls 404, dann existiert noch kein Wochenplan -> erstelle automatisch einen
        if (error.status === 404) {
          console.log('❌ Kein Wochenplan gefunden - erstelle automatisch einen neuen');
          this.currentWeekPlanner = null;
          this.createWeekPlannerAutomatically();
        } else {
          this.errorMessage = 'Fehler beim Laden der Wochenpläne';
          this.isLoading = false;
        }
      }
    });
  }

  async createWeekPlannerAutomatically(): Promise<void> {
    try {
      console.log('🆕 Erstelle automatisch neuen Wochenplan für Gruppe', this.selectedGroupId);
      console.log('📅 StartDate:', this.currentWeekStart, '→ ISO:', this.formatDateISO(this.currentWeekStart));
      console.log('📅 EndDate:', this.currentWeekEnd, '→ ISO:', this.formatDateISO(this.currentWeekEnd));
      
      const startISO = this.formatDateISO(this.currentWeekStart);
      const endISO = this.formatDateISO(this.currentWeekEnd);
      
      // Berechne Tage-Differenz zur Validierung
      const daysDiff = (new Date(endISO).getTime() - new Date(startISO).getTime()) / (1000 * 60 * 60 * 24);
      console.log('📊 Tage-Differenz:', daysDiff, '(muss zwischen 0 und 6 sein)');
      
      // Erstelle leeren Wochenplan - Backend fügt RecurringActivities automatisch hinzu
      const newWeekPlanner: WeekPlannerModel = {
        startDate: startISO,
        endDate: endISO,
        groupId: this.selectedGroupId,
        plannedDays: [] // Leer - Backend füllt mit RecurringActivities
      };

      // Konvertiere zu Backend-Format
      const backendData = this.mapWeekPlannerToBackend(newWeekPlanner);

      console.log('📤 Sende leeren Wochenplan an Backend:', backendData);

      // Erstelle neuen Wochenplan
      const created = await this.http.post<BackendWeekPlanner>(
        `${this.baseUrl}/weekplanners`,
        backendData
      ).toPromise();

      console.log('✅ Wochenplan erfolgreich erstellt:', created);

      if (created) {
        // Lade den neu erstellten Wochenplan (mit RecurringActivities vom Backend)
        console.log('🔄 Lade neu erstellten Wochenplan neu...');
        this.loadWeekPlanner();
      }
    } catch (error) {
      console.error('❌ Fehler beim automatischen Erstellen des Wochenplans:', error);
      // Fallback: Zeige RecurringActivities manuell an
      this.loadRecurringActivities();
      this.isLoading = false;
    }
  }

  loadRecurringActivities(): void {
    console.log('🔄 Lade RecurringActivities');
    console.log('📋 Settings:', this.settings);
    console.log('🔁 RecurringActivities:', this.settings?.recurringActivities);
    
    if (!this.settings?.recurringActivities) {
      console.warn('⚠️ Keine RecurringActivities in Settings gefunden!');
      return;
    }

    // Erweiterte dayMap für beide Formate (lowercase und capitalized)
    const dayMap: { [key: string]: string } = {
      // Lowercase (Frontend-Format)
      monday: 'Montag',
      tuesday: 'Dienstag',
      wednesday: 'Mittwoch',
      thursday: 'Donnerstag',
      friday: 'Freitag',
      saturday: 'Samstag',
      sunday: 'Sonntag',
      // Capitalized (Backend-Format)
      Monday: 'Montag',
      Tuesday: 'Dienstag',
      Wednesday: 'Mittwoch',
      Thursday: 'Donnerstag',
      Friday: 'Freitag',
      Saturday: 'Samstag',
      Sunday: 'Sonntag'
    };

    console.log('📅 WeekDays vor dem Hinzufügen:', this.weekDays);

    this.settings.recurringActivities.forEach((recurring, index) => {
      console.log(`🔁 Verarbeite RecurringActivity ${index + 1}:`, recurring);
      
      if (!recurring.days || recurring.days.length === 0) {
        console.warn(`  ⚠️ Activity '${recurring.title}' hat keine Tage!`);
        return;
      }
      
      recurring.days.forEach(dayKey => {
        const dayName = dayMap[dayKey];
        console.log(`  📆 Suche Tag für '${dayKey}' -> '${dayName}'`);
        
        if (!dayName) {
          console.warn(`  ⚠️ Unbekannter Tag-Key '${dayKey}'`);
          return;
        }
        
        const day = this.weekDays.find(d => d.dayOfWeek === dayName);
        
        if (day) {
          const newActivity = {
            title: recurring.title,
            startTime: recurring.startTime,
            endTime: recurring.endTime,
            description: recurring.description,
            sourceType: 'recurring' as const,
            color: recurring.color
          };
          
          day.activities.push(newActivity);
          console.log(`  ✅ Aktivität '${recurring.title}' zu ${dayName} hinzugefügt`);
        } else {
          console.warn(`  ⚠️ Tag '${dayName}' nicht in weekDays gefunden!`);
          console.warn(`  📋 Verfügbare weekDays:`, this.weekDays.map(d => d.dayOfWeek));
        }
      });
    });
    
    console.log('📅 WeekDays nach dem Hinzufügen:', this.weekDays);
  }

  loadWeekPlannerDetails(plannerId: number): void {
    // Lade PlannedDays für diesen WeekPlanner
    this.http.get<PlannedDayModel[]>(`${this.baseUrl}/planneddays`).subscribe({
      next: (days) => {
        const plannerDays = days.filter(d => d.weekPlannerId === plannerId);
        
        // Lade PlannedActivities für jeden Tag
        this.http.get<PlannedActivityModel[]>(`${this.baseUrl}/plannedactivities`).subscribe({
          next: (activities) => {
            plannerDays.forEach(day => {
              day.activities = activities.filter(a => a.plannedDayId === day.id);
            });
            
            // Merge mit weekDays
            this.weekDays.forEach(weekDay => {
              const existingDay = plannerDays.find(pd => pd.date === weekDay.date);
              if (existingDay) {
                weekDay.id = existingDay.id;
                weekDay.weekPlannerId = existingDay.weekPlannerId;
                weekDay.activities = existingDay.activities;
              }
            });
            
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Fehler beim Laden der Aktivitäten:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Tage:', error);
        this.isLoading = false;
      }
    });
  }

  loadRecentLogDatas(): void {
    console.log('📥 Lade Aktivitäten der letzten 2 Wochen...');
    
    // Verwende den spezifischen Endpoint für Aktivitäten der letzten 2 Wochen
    this.http.get<LogDataModel[]>(`${this.baseUrl}/logdatas/activities/lastTwoWeeks`).subscribe({
      next: (activities) => {
        console.log('✅ Aktivitäten geladen:', activities.length);
        console.log('📋 Aktivitäten:', activities);
        
        // Sortiere nach createdUtc (neueste zuerst)
        this.recentLogDatas = activities.sort((a, b) => 
          new Date(b.createdUtc).getTime() - new Date(a.createdUtc).getTime()
        );
        
        console.log('📊 Sortierte Aktivitäten:', this.recentLogDatas);
      },
      error: (error) => {
        console.error('❌ Fehler beim Laden der Aktivitäten:', error);
        this.recentLogDatas = [];
      }
    });
  }

  // ===== Drag & Drop =====

  onDragStart(activity: PlannedActivityModel | LogDataModel): void {
    this.draggedActivity = activity;
  }

  onDragStartActivity(logData: LogDataModel, activityName: string): void {
    // Erstelle ein temporäres Objekt für die einzelne Aktivität
    this.draggedActivity = {
      ...logData,
      selectedActivity: activityName
    } as any;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dayIndex: number, hour: string): void {
    event.preventDefault();
    
    if (!this.draggedActivity) return;
    
    const activity = this.draggedActivity;
    
    // Erstelle neue Aktivität für den Wochenplan
    const draggedData = activity as any;
    
    // Prüfe ob es eine einzelne Aktivität oder komplette LogData ist
    const logData = draggedData as LogDataModel;
    const activityTitle = draggedData.selectedActivity || logData.goal || draggedData.title || 'Neue Aktivität';
    const activityDescription = draggedData.selectedActivity 
      ? `Ziel: ${logData.goal}` 
      : (logData.activities?.join(', ') || draggedData.description || '');
    
    const newActivity: PlannedActivityModel = {
      title: activityTitle,
      startTime: hour,
      endTime: this.calculateEndTime(hour, 60), // Default 60 Min
      description: activityDescription,
      sourceType: logData.id ? 'logdata' : 'new',
      logDataId: logData.id
    };
    
    this.weekDays[dayIndex].activities.push(newActivity);
    this.draggedActivity = null;
  }

  calculateEndTime(startTime: string, durationMinutes?: number): string {
    if (durationMinutes) {
      // Mit Duration berechnen
      const [hours, minutes] = startTime.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + durationMinutes;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    } else {
      // Default: +1 Stunde
      const [hour] = startTime.split(':').map(Number);
      const endHour = (hour + 1).toString().padStart(2, '0');
      return `${endHour}:00`;
    }
  }

  removeActivity(dayIndex: number, activityIndex: number): void {
    this.weekDays[dayIndex].activities.splice(activityIndex, 1);
  }

  // ===== Speichern =====

  async saveWeekPlanner(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';

    try {
      // Erstelle WeekPlanner-Modell mit allen Daten
      const weekPlannerModel: WeekPlannerModel = {
        id: this.currentWeekPlanner?.id,
        startDate: this.formatDateISO(this.currentWeekStart),
        endDate: this.formatDateISO(this.currentWeekEnd),
        groupId: this.selectedGroupId,
        plannedDays: this.weekDays.filter(day => day.activities.length > 0)
      };

      // Konvertiere zu Backend-Format
      const backendData = this.mapWeekPlannerToBackend(weekPlannerModel);

      if (this.currentWeekPlanner?.id) {
        // Update existierenden Wochenplan
        const updated = await this.http.put<BackendWeekPlanner>(
          `${this.baseUrl}/weekplanners/${this.currentWeekPlanner.id}`,
          backendData
        ).toPromise();
        
        if (updated) {
          this.currentWeekPlanner = this.mapBackendToWeekPlanner(updated);
        }
      } else {
        // Erstelle neuen Wochenplan
        const created = await this.http.post<BackendWeekPlanner>(
          `${this.baseUrl}/weekplanners`,
          backendData
        ).toPromise();
        
        if (created) {
          this.currentWeekPlanner = this.mapBackendToWeekPlanner(created);
        }
      }

      alert('Wochenplan erfolgreich gespeichert!');
      this.loadWeekPlanner();
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      this.errorMessage = 'Fehler beim Speichern des Wochenplans';
    } finally {
      this.isSaving = false;
    }
  }

  // ===== Modal Functions =====

  openActivityModal(dayIndex: number, hour: string): void {
    this.modalDayIndex = dayIndex;
    this.modalHour = hour;
    this.isEditMode = false;
    this.editingActivityIndex = -1;
    
    // Vorausfüllen der Zeiten
    this.newActivityForm.startTime = hour;
    const [hourNum, minute] = hour.split(':').map(Number);
    const endHour = (hourNum + 1).toString().padStart(2, '0');
    this.newActivityForm.endTime = `${endHour}:${minute.toString().padStart(2, '0')}`;
    
    this.showActivityModal = true;
  }

  closeActivityModal(): void {
    this.showActivityModal = false;
    this.isEditMode = false;
    this.editingActivityIndex = -1;
    this.newActivityForm = {
      title: '',
      startTime: '',
      endTime: '',
      description: ''
    };
    this.modalDayIndex = -1;
    this.modalHour = '';
  }

  addActivityFromModal(): void {
    if (!this.newActivityForm.title.trim()) {
      alert('Bitte geben Sie einen Titel ein');
      return;
    }

    if (this.modalDayIndex < 0 || this.modalDayIndex >= this.weekDays.length) {
      return;
    }

    if (this.isEditMode && this.editingActivityIndex >= 0) {
      // Bearbeitungsmodus: Existierende Aktivität aktualisieren
      const activity = this.weekDays[this.modalDayIndex].activities[this.editingActivityIndex];
      activity.title = this.newActivityForm.title;
      activity.startTime = this.newActivityForm.startTime;
      activity.endTime = this.newActivityForm.endTime;
      activity.description = this.newActivityForm.description;
    } else {
      // Hinzufügen-Modus: Neue Aktivität erstellen
      const newActivity: PlannedActivityModel = {
        title: this.newActivityForm.title,
        startTime: this.newActivityForm.startTime,
        endTime: this.newActivityForm.endTime,
        description: this.newActivityForm.description,
        sourceType: 'new'
      };

      this.weekDays[this.modalDayIndex].activities.push(newActivity);
    }

    this.closeActivityModal();
  }

  editActivity(dayIndex: number, activityIndex: number): void {
    const activity = this.weekDays[dayIndex].activities[activityIndex];
    this.newActivityForm.title = activity.title;
    this.newActivityForm.startTime = activity.startTime;
    this.newActivityForm.endTime = activity.endTime;
    this.newActivityForm.description = activity.description || '';
    this.isEditMode = true;
    this.editingActivityIndex = activityIndex;
    this.modalDayIndex = dayIndex;
    this.showActivityModal = true;

  }

  getActivitiesForHour(dayIndex: number, hour: string): PlannedActivityModel[] {
    return this.weekDays[dayIndex].activities.filter(activity => {
      // Extrahiere die Stunde aus der Startzeit (z.B. "11:30" -> 11)
      const activityHour = parseInt(activity.startTime.split(':')[0]);
      const blockHour = parseInt(hour.split(':')[0]);
      
      // Zeige Aktivität im Stundenblock, der ihre Startzeit enthält
      // z.B. 11:30 wird im Block 11:00 angezeigt
      return activityHour === blockHour;
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  // ===== Backend Mapping Functions =====

  mapWeekPlannerToBackend(weekPlanner: WeekPlannerModel): BackendWeekPlanner {
    return {
      id: weekPlanner.id,
      startDate: this.formatDateTimeISO(weekPlanner.startDate),
      endDate: this.formatDateTimeISO(weekPlanner.endDate),
      groupId: weekPlanner.groupId,
      plannedDays: weekPlanner.plannedDays?.map(day => this.mapPlannedDayToBackend(day))
    };
  }

  mapPlannedDayToBackend(day: PlannedDayModel): BackendPlannedDay {
    // Konvertiere "Montag" zu "Monday"
    const dayNameMap: { [key: string]: string } = {
      'Montag': 'Monday',
      'Dienstag': 'Tuesday',
      'Mittwoch': 'Wednesday',
      'Donnerstag': 'Thursday',
      'Freitag': 'Friday',
      'Samstag': 'Saturday',
      'Sonntag': 'Sunday'
    };

    return {
      id: day.id,
      day: dayNameMap[day.dayOfWeek] || day.dayOfWeek,
      weekPlannerId: day.weekPlannerId,
      activities: day.activities.map(activity => this.mapActivityToBackend(activity))
    };
  }

  mapActivityToBackend(activity: PlannedActivityModel): BackendPlannedActivity {
    return {
      id: activity.id,
      hourTime: this.formatTimeWithSeconds(activity.startTime),
      activity: activity.title,
      details: activity.description,
      activityId: undefined,
      plannedDayId: activity.plannedDayId
    };
  }

  mapBackendToWeekPlanner(backend: BackendWeekPlanner): WeekPlannerModel {
    return {
      id: backend.id,
      startDate: backend.startDate.split('T')[0], // "2024-01-15T00:00:00" -> "2024-01-15"
      endDate: backend.endDate.split('T')[0],
      groupId: backend.groupId,
      plannedDays: backend.plannedDays?.map(day => this.mapBackendToPlannedDay(day))
    };
  }

  mapBackendToPlannedDay(backendDay: BackendPlannedDay): PlannedDayModel {
    // Konvertiere "Monday" zu "Montag"
    const dayNameMap: { [key: string]: string } = {
      'Monday': 'Montag',
      'Tuesday': 'Dienstag',
      'Wednesday': 'Mittwoch',
      'Thursday': 'Donnerstag',
      'Friday': 'Freitag',
      'Saturday': 'Samstag',
      'Sunday': 'Sonntag'
    };

    // Berechne das Datum basierend auf dem Tag
    const dayOfWeek = dayNameMap[backendDay.day] || backendDay.day;
    
    return {
      id: backendDay.id,
      date: '', // Muss separat gesetzt werden basierend auf weekStartDate
      dayOfWeek: dayOfWeek,
      weekPlannerId: backendDay.weekPlannerId,
      activities: backendDay.activities.map(activity => this.mapBackendToActivity(activity))
    };
  }

  mapBackendToActivity(backendActivity: BackendPlannedActivity): PlannedActivityModel {
    return {
      id: backendActivity.id,
      title: backendActivity.activity,
      startTime: backendActivity.hourTime.substring(0, 5), // "09:00:00" -> "09:00"
      endTime: this.calculateEndTime(backendActivity.hourTime), // Schätzung: +1 Stunde
      description: backendActivity.details,
      plannedDayId: backendActivity.plannedDayId,
      sourceType: 'new'
    };
  }

  formatTimeWithSeconds(time: string): string {
    // Konvertiert "08:00" zu "08:00:00"
    if (time.length === 5) {
      return `${time}:00`;
    }
    return time;
  }

  formatDateTimeISO(date: string): string {
    // Konvertiert "2024-01-15" zu "2024-01-15T00:00:00"
    if (date.includes('T')) {
      return date; // Bereits im richtigen Format
    }
    return `${date}T00:00:00`;
  }
}
