import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Child } from '../models/child';
import { ChildGroup } from '../models/child-group';
import { Suggestion } from '../models/suggestion';

@Injectable({
  providedIn: 'root'
})
export class Master {
  private childrenUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/children';
  private selectionUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/selection';
  private childGroupUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/childGroup';
  private suggestionUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/suggestion';

  constructor(private http: HttpClient) {}

  // ---- Auswahl ----
  getAreaDataMaster(): Observable<any[]> {
    return this.http.get<any[]>(this.selectionUrl);
  }

   // ---- Auswahl Solution ----
  getSuggestionByIdDataMaster(id: number): Observable<Suggestion> {
    return this.http.get<Suggestion>(`${this.suggestionUrl}/${id}`);
  }

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

  getKinderNachGruppe(gruppe: string): Observable<ChildGroup[]> {
    return this.http.get<ChildGroup[]>(`${this.childGroupUrl}?gruppe=${gruppe}`);
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
}