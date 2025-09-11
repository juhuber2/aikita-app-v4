import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
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
}
