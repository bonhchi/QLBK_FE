import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, filter, take  } from 'rxjs/operators';

import { AuthenticationService } from '@app/_services';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private _router: Router,
    private _authenticationService: AuthenticationService
  ) {}
      
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // add authorization header with jwt token if available
      if (this._authenticationService.getJwtToken()) {
        request = this._addToken(request, this._authenticationService.getJwtToken());
      }

      return next.handle(request);
  }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   if (this._authenticationService.getJwtToken()) {
  //       request = this._addToken(request, this._authenticationService.getJwtToken());
  //   }

  //   return next.handle(request)
  //     .pipe(
  //       catchError(error => {
  //           if (error instanceof HttpErrorResponse && error.status === 401) {
  //               //this.authenticationService.verify();
  //               return this._handle401Error(request, next);
  //             } else {
  //               console.log(error.status);
  //                 if(error.status === 0){
  //                   //location.reload();
  //                 }
  //               //return Observable.throw(error);
  //               return throwError(error);
  //             }
  //       })
  //     );
  // }

  private _addToken(request: HttpRequest<any>, token: string): any {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private _handle401Error(request: HttpRequest<any>, next: HttpHandler): any {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this._authenticationService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.jwt);
          return next.handle(this._addToken(request, token.jwt));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this._addToken(request, jwt));
        })
      );
    }
  }
}