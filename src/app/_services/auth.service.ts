import { Injectable, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { User, Tokens, Menu } from '@app/_models/index';
import { JWT_TOKEN, REFRESH_TOKEN, CURRENT_USER, MENU } from '@app/_constant/index';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
// import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { List } from 'linq-typescript';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public userData: any;
  public showLoader: boolean = false;

  private _currentUserSubject: BehaviorSubject<User>;
  private _currentMenuSubject: BehaviorSubject<Menu[]>;
  public currentUser: Observable<User>;
  public currentMenu: Observable<Menu[]>;
  constructor(
    public router: Router,
    public ngZone: NgZone,
    private http: HttpClient,
  ) {
    this._currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this._currentUserSubject.asObservable();

    this._currentMenuSubject = new BehaviorSubject<Menu[]>(JSON.parse(localStorage.getItem(MENU)));
    this.currentMenu = this._currentMenuSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this._currentUserSubject.value;
  }

  getJwtToken() {
    return localStorage.getItem(JWT_TOKEN);
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  verify() {
    return this.http
      .get<any>(
        `${environment.apiUrl}/${environment.apiVersion1}/account/verify`
      )
      .pipe(
        map(
          (user) => {
            let menus = new List<any>(user.data.menus)
              .where((w) => w.parentid === null)
              .toArray();

            menus.forEach((menu) => {
              this.getChirrentMenu(menu, user.data.menus);
            });

            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem(
              "JOB", "0"
            );
            localStorage.setItem(
              CURRENT_USER,
              JSON.stringify(user.data.user_info)
            );
            // localStorage.setItem(
            //   ORG_MENU,
            //   JSON.stringify(user.data.user_menus)
            // );
            localStorage.setItem(MENU, JSON.stringify(menus));
            // store token
            this.storeTokens({ jwt: user.data.user_token, refresh_token: '' });

            this._currentUserSubject.next(user.data.user_info);
            //location.reload();
            return user;
          },
          (error) => {
            console.log(error);
          }
        )
      );
  }

  login(credentials: { username: string; password: string }) {
    this.showLoader = true;
    return this.http
      .post<any>(
        `${environment.apiUrl}/${environment.apiVersion1}/account/login`, credentials
      )
      .pipe(
        map(
          (user) => {
            this.showLoader = false;
            let menu = user.data.menu;
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem(CURRENT_USER, JSON.stringify(user.data.user)
            );
            // localStorage.setItem(this.ORG_MENU, JSON.stringify(user.data.user_menus));
            localStorage.setItem(MENU, JSON.stringify(menu));
            // store token
            this.storeTokens({ jwt: user.data.token, refresh_token: '' });

            this._currentUserSubject.next(user.data.user);
            this._currentMenuSubject.next(menu);
            this.startRefreshTokenTimer();
            this.ngZone.run(() => {
              this.router.navigate(['/dashboard']);
            });
            return user;
          },
          (error) => {
            this.showLoader = false;
            return error;
          }
        )
      );
  }

  logout() {
    // remove user from local storage and set current user to null
    this.http.post<any>(`${environment.apiUrl}/${environment.apiVersion1}/account/revoke-token`, {}).subscribe();
    this.stopRefreshTokenTimer();

    this._currentUserSubject.next(null);
    this._currentMenuSubject.next(null);
    this.removeStorage();
  }

  refreshToken() {

    try {
      return this.http
        .post<any>(
          `${environment.apiUrl}/${environment.apiVersion1}/account/refresh-token`, {}
        )
        .pipe(
          tap(
            (result: any) => {
              localStorage.setItem(JWT_TOKEN, result.data.token);
              this.startRefreshTokenTimer();
            },
            (error) => {
              this.logout();
              this.router.navigate(['login']);
            }
          )
        );
    } catch (error) {

    }

  }

  private getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN);
  }

  private getChirrentMenu(menu, orgMenus) {
    menu.MENU_CHILD = new List<any>(orgMenus)
      .where((w) => w.PARENT_ID === menu.MENU_ID)
      .toArray();
    menu.MENU_CHILD.forEach(item => {
      this.getChirrentMenu(item, orgMenus);
    });
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(JWT_TOKEN, tokens.jwt);
    localStorage.setItem(REFRESH_TOKEN, tokens.refresh_token);
  }

  private removeStorage() {
    localStorage.removeItem(MENU);
    // localStorage.removeItem(this.ORG_MENU);
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(JWT_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    var token = this.getJwtToken().split('.')[1];
    var base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const jwtToken = JSON.parse(jsonPayload);

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}