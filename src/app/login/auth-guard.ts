import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  //check, ob im localStorage ein Token gepeichert ist
  const token = localStorage.getItem('angularToken');
  if (token) {
    return true; // Zugriff erlaubt
  } else {
    router.navigate(['/loginMain']);
    return false;
  }
};