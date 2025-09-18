import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  /*navbar*/
  kindergarten: string = "Caritas Linz";
  adress: string = "Pillweinstraße 11";
  numberChildren: number = 23;
  numberBetreuer: number = 4;

  router = inject(Router);
  onlogOff() {
    localStorage.removeItem('angularToken');
    this.router.navigate(['/loginMain'])
  }
}