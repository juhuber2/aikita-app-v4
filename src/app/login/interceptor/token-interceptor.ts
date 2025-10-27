import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const token = sessionStorage.getItem("angularToken");

    if (token) {
      // Backend erwartet X-Session-Token Header
      req = req.clone({
        setHeaders: { 
          'X-Session-Token': token
        }
      });
      console.log('🔑 Token hinzugefügt:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ Kein Token in sessionStorage gefunden!');
    }
  } catch (e) {
    console.error('Fehler beim Lesen des Tokens:', e);
  }

  return next(req);
};