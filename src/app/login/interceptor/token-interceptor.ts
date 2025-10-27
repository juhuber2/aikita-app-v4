import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem("angularToken");

  if (token) {
    // Backend erwartet X-Session-Token Header
    req = req.clone({
      setHeaders: { 
        'X-Session-Token': token
      }
    });
    console.log('Token hinzugefügt:', token.substring(0, 20) + '...');
  } else {
    console.warn('Kein Token in sessionStorage gefunden!');
  }
  
  return next(req);
};