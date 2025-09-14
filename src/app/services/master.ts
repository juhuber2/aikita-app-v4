import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Child } from '../models/child';

@Injectable({
  providedIn: 'root'
})
export class Master {
  private childrenUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/children';
  private selectionUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/selection';

  constructor(private http: HttpClient) {}

  // ---- Auswahl ----
  getAreaDataMaster(): Observable<any[]> {
    return this.http.get<any[]>(this.selectionUrl);
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
}
