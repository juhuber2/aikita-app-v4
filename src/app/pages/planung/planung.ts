import { Component, inject } from '@angular/core';
import { Master } from '../../services/master';
import { Child } from '../../models/child';

@Component({
  selector: 'app-planung',
  imports: [],
  templateUrl: './planung.html',
  styleUrl: './planung.css'
})
export class Planung {
  
  childrenList: Child[] = [];

  masterService = inject(Master);

  getAllChildren(){
    this.masterService.getAllChildrenMaster().subscribe((res: any)=>{
      this.childrenList = res;
    })
  }
}