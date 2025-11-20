import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Master } from '../services/master';
import { Settings } from '../models/settings';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, RouterLink, RouterOutlet],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})

export class Sidebar {

  /*navbar*/
  kindergarten: string = '';
  numberChildren: number = 0;
  numberBetreuer: number = 0;

  constructor(private s: Master) {}

  ngOnInit(): void {
      this.s.settings$.subscribe((current: Settings) => {
        this.kindergarten = current.kindergarten;
        this.numberChildren = current.numberChildren;
        this.numberBetreuer = current.numberBetreuer;
      });
  }

  router = inject(Router);
  onlogOff() {
    sessionStorage.removeItem('angularToken');
    this.router.navigate(['/loginMain'])
  }
}