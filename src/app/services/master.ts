import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Child } from '../models/child';
import { ChildGroup } from '../models/child-group';
import { AreaModel } from '../models/suggestion';
import { SubAreaModel } from '../models/suggestion';
import { SubSectionModel } from '../models/suggestion';
import { GoalModel } from '../models/suggestion';
import { ActivityModel } from '../models/suggestion';
import { ObservationModel } from '../models/suggestion';
import { SuggestionModel } from '../models/suggestion';
import { Settings } from '../models/settings';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Master {
  // Zentrale Backend URL aus Environment
  private baseUrl = `${environment.apiUrl}/api`;

  // Child-Endpoints
  private childrenUrl = `${this.baseUrl}/childs`;

  // ChildGroup-Endpoints
  private childrenGroupUrl = `${this.baseUrl}/childs/bygroup`;

  constructor(private http: HttpClient) {
    // Debug: Zeige die konfigurierten URLs
    console.log('🔧 Master Service initialized');
    console.log('🌐 Base URL:', this.baseUrl);
    console.log('👶 Children URL:', this.childrenUrl);
  }


  // ---- Vorschläge in Formular einfügen ----
  getAllAreas(): Observable<AreaModel[]> {
    return this.http.get<AreaModel[]>(`${this.baseUrl}/areas`);
  }

  getSubareas(): Observable<SubAreaModel[]> {
    return this.http.get<SubAreaModel[]>(`${this.baseUrl}/subareas`);
  }

  getSubsections(): Observable<SubSectionModel[]> {
    return this.http.get<SubSectionModel[]>(`${this.baseUrl}/subsections`);
  }

  getGoals(): Observable<GoalModel[]> {
    return this.http.get<GoalModel[]>(`${this.baseUrl}/goals`);
  }

  getActivities(): Observable<ActivityModel[]> {
    return this.http.get<ActivityModel[]>(`${this.baseUrl}/activities`);
  }

  //an Backend senden - nur observation
  // Endpoint: /AiResultDatas/infer = echtes AI Model
  // Endpoint: /AiResultDatas/infer/mock = Mock-Daten ohne AI
  addObservation(observationData: ObservationModel): Observable<ObservationModel> {
    const endpoint = `${this.baseUrl}/AiResultDatas/infer`; // Ändere zu /AiResultDatas/infer/mock für Mock-Daten
    console.log(' Sende Beobachtung an:', endpoint);
    console.log('📤 Payload:', observationData);
    return this.http.post<ObservationModel>(endpoint, observationData);
  }

  //an Backend senden - KI + UserÄnderung
  addSuggestion(data: any): Observable<any> {
  return this.http.post<SuggestionModel>(`${this.baseUrl}/ai/save`, data);
  }



//------------------------------------------------------------------------------------------------------
  // ---- Kinder-CRUD (Backend API) ----
  getAllChildrenMaster(): Observable<Child[]> {
    return this.http.get<Child[]>(this.childrenUrl);
  }

  getChildrenCount(): Observable<number> {
    return this.getAllChildrenMaster().pipe(
      map(children => children.length)
    );
  }

  getChildByIdMaster(id: number): Observable<Child> {
    return this.http.get<Child>(`${this.childrenUrl}/${id}`);
  }

  addChildrenMaster(child: Child): Observable<Child> {
    return this.http.post<Child>(this.childrenUrl, child);
  }

  updateChildMaster(id: number, child: Child): Observable<Child> {
    return this.http.put<Child>(`${this.childrenUrl}/${id}`, child);
  }

  deleteChildMaster(id: number): Observable<void> {
    return this.http.delete<void>(`${this.childrenUrl}/${id}`);
  }

  // Kinder nach Gruppe filtern
  getChildrenByGroupId(groupId: number): Observable<Child[]> {
    return this.http.get<Child[]>(`${this.childrenGroupUrl}/${groupId}`);
  }

  //Kinderliste
  getKinder(): Observable<Child[]> {
    return this.http.get<Child[]>(this.childrenUrl);
  }

  getKindById(id: number): Observable<Child> {
    return this.http.get<Child>(`${this.childrenUrl}/${id}`);
  }

  addKind(kind: Child): Observable<Child> {
    return this.http.post<Child>(this.childrenUrl, kind);
  }

  updateKind(kind: Child): Observable<Child> {
    return this.http.put<Child>(`${this.childrenUrl}/${kind.id}`, kind);
  }

  deleteKind(id: number): Observable<void> {
    return this.http.delete<void>(`${this.childrenUrl}/${id}`);
  }


//------------------------------------------------------------------------------------------------------
  // ---- Settings ----
 // Die eigentlichen Daten (Startwerte)
  private settings: Settings = {
    kindergarten: 'Caritas Linz',
    numberChildren: 0,
    numberBetreuer: 4
  };

  // Das Subject, das immer den aktuellen Wert kennt und Änderungen weitergibt
  private settingsSubject = new BehaviorSubject<Settings>(this.settings);

  // Öffentliches Observable, das andere Komponenten abonnieren können
  settings$ = this.settingsSubject.asObservable();

  // Getter – gibt die aktuellen Werte zurück (z. B. beim Init)
  getSettings(): Settings {
    return { ...this.settings };
  }

  // Setter – aktualisiert die Werte und informiert alle Abonnenten
  updateSettings(newSettings: Settings): void {
    this.settings = { ...newSettings };
    this.settingsSubject.next(this.settings);
    console.log('Updated settings:', this.settings);
  }
}