import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Master {
  
  constructor(private http: HttpClient) {}

  getAllChildrenMaster() {
    return this.http.get("https://aikita.free.beeceptor.com/api/aikita/children")
  }
}

