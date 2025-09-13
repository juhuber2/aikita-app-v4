import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Child } from '../models/child';


@Injectable({
  providedIn: 'root'
})
export class Master {
  
  constructor(private http: HttpClient) {}

  baseUrl = "https://68c3eac481ff90c8e61a9272.mockapi.io/aikita/children";

  getAllChildrenMaster() {
    return this.http.get(this.baseUrl)
  }

  getChildById() {

  }

  addChildrenMaster(child: Child) {
    return this.http.post<Child>(this.baseUrl, child);
  }
}