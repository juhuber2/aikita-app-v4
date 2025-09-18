import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  debugger;
  const token = localStorage.getItem("angularToken");

  const newReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  })

  return next(newReq);
};