import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('authGuard')
  const router = inject(Router);

  const isLoggedIn = localStorage.getItem('angularToken');
  if (isLoggedIn != null) {
    return true;
  } else {
    router.navigateByUrl('/loginMain');
    return false;
  }
};