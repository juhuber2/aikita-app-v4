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
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Master {
  private childrenUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/children';
  private childGroupUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/childGroup';

  private baseUrlPreSets = 'https://aikita-api-114119385008.europe-west1.run.app/api'; //alt, aber läuft noch
  private baseUrlObservation = 'https://aikitabewebapi-114119385008.europe-west1.run.app/api'; //neu

  constructor(private http: HttpClient) {}


  // ---- Vorschläge in Formular einfügen ----
  getAllAreas(): Observable<AreaModel[]> {
    return this.http.get<AreaModel[]>(`${this.baseUrlObservation}/areas`);
  }

  getSubareas(): Observable<SubAreaModel[]> {
    return this.http.get<SubAreaModel[]>(`${this.baseUrlObservation}/subareas`);
  }

  getSubsections(): Observable<SubSectionModel[]> {
    return this.http.get<SubSectionModel[]>(`${this.baseUrlObservation}/subsections`);
  }

  getGoals(): Observable<GoalModel[]> {
    return this.http.get<GoalModel[]>(`${this.baseUrlObservation}/goals`);
  }

  getActivities(): Observable<ActivityModel[]> {
    return this.http.get<ActivityModel[]>(`${this.baseUrlObservation}/activities`);
  }

  //an Backend senden - nur observation
  addObservation(observationData: ObservationModel): Observable<ObservationModel> {
  return this.http.post<ObservationModel>(`${this.baseUrlObservation}/ai/infer`, observationData);
  }

  //an Backend senden - KI + UserÄnderung
  addSuggestion(data: any): Observable<any> {
  return this.http.post<SuggestionModel>(`${this.baseUrlObservation}/ai/save`, data);
  }


//------------------------------------------------------------------------------------------------------
  // ---- Kinder-CRUD ----
  getAllChildrenMaster(): Observable<Child[]> {
    return this.http.get<Child[]>(this.childrenUrl);
  }

  getChildByIdMaster(id: string): Observable<Child> {
    return this.http.get<Child>(`${this.childrenUrl}/${id}`);
  }

  addChildrenMaster(child: Child): Observable<Child> {
    return this.http.post<Child>(this.childrenUrl, child);
  }

  updateChildMaster(id: string, child: Child): Observable<Child> {
    return this.http.put<Child>(`${this.childrenUrl}/${id}`, child);
  }

  deleteChildMaster(id: string): Observable<void> {
    return this.http.delete<void>(`${this.childrenUrl}/${id}`);
  }

  //Kinderliste
  getKinder(): Observable<ChildGroup[]> {
    return this.http.get<ChildGroup[]>(this.childGroupUrl);
  }

  getKinderNachGruppe(id: number): Observable<ChildGroup[]> {
    return this.http.get<ChildGroup[]>(`${this.baseUrlObservation}/groups/${id}`);
  }

  getKindById(id: number): Observable<ChildGroup> {
    return this.http.get<ChildGroup>(`${this.childGroupUrl}/${id}`);
  }

  addKind(kind: ChildGroup): Observable<ChildGroup> {
    return this.http.post<ChildGroup>(this.childGroupUrl, kind);
  }

  updateKind(kind: ChildGroup): Observable<ChildGroup> {
    return this.http.put<ChildGroup>(`${this.childGroupUrl}/${kind.id}`, kind);
  }

  deleteKind(id: number): Observable<void> {
    return this.http.delete<void>(`${this.childGroupUrl}/${id}`);
  }


//------------------------------------------------------------------------------------------------------
  // ---- Settings ----
 // 1Die eigentlichen Daten (Startwerte)
  private settings: Settings = {
    kindergarten: 'Caritas Linz',
    numberChildren: 23,
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