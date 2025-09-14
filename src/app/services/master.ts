import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Master {

  private childrenUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/children';
  private selectionUrl = 'https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/selection';

  constructor(private http: HttpClient) { }

  // ---- Auswahl (Bereich/Sub/Subsec) ----
  getAreaDataMaster(): Observable<any[]> {
    return this.http.get<any[]>(this.selectionUrl);
  }

  // ---- Kinder-CRUD ----
  getAllChildrenMaster(): Observable<any[]> {
    return this.http.get<any[]>(this.childrenUrl);
  }

  getChildByIdMaster(id: string): Observable<any> {
    return this.http.get<any>(`${this.childrenUrl}/${id}`);
  }

  addChildrenMaster(child: any): Observable<any> {
    return this.http.post<any>(this.childrenUrl, child);
  }

  updateChildMaster(id: string, child: any): Observable<any> {
    return this.http.put<any>(`${this.childrenUrl}/${id}`, child);
  }

  deleteChildMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.childrenUrl}/${id}`);
  }
}
