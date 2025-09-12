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
  /*sidebar*/
  menu = [
      { title: 'Dashboard', icon: 'bi bi-house', route: '/dashboard' },
      { title: 'Reports', icon: 'bi bi-bar-chart', route: '/reports' },
      {
        title: 'Management', icon: 'bi bi-gear', children: [
          { title: 'Users', route: '/management/users' },
          { title: 'Products', route: '/management/products' }
        ]
      },
      { title: 'Settings', icon: 'bi bi-sliders', route: '/settings' }
    ];

  /*navbar*/
  kindergarten: string = "Caritas Linz";
  adress: string = "Pillweinstraße 11";
  numberChildren: number = 23;
  numberBetreuer: number = 4;

  router = inject(Router)
  onlogOff() {
    this.router.navigate(['/login'])
  }
}