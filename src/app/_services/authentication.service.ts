import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Tokens, User } from '@app/_models';
import { List } from 'linq-typescript';
import { environment } from '@environments/environment';
import {JWT_TOKEN,REFRESH_TOKEN, CURRENT_USER, ORG_MENU,MENU } from '@app/_constant';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private _http: HttpClient,
    private _router: Router
  ) {
    this._currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem(CURRENT_USER)));
    this.currentUser = this._currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this._currentUserSubject.value;
  }

  public getJwtToken(): any {
    return localStorage.getItem(JWT_TOKEN);
  }

  public isLoggedIn(): boolean {
    return !!this.getJwtToken();
  }

  public verify(): any {
    return this._http.get<any>(`${environment.apiUrl}/${environment.apiVersion1}/account/verify`)
      .pipe(map(user => {
        let menus = new List<any>(user.data.menus).where(w => w.parent_id === null).toArray();

        menus.forEach(menu => {
          this._getChildrenMenu(menu, user.data.menus);
        });

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(CURRENT_USER, JSON.stringify(user.data.user));
        localStorage.setItem(ORG_MENU, JSON.stringify(user.data.menus));
        localStorage.setItem(MENU, JSON.stringify(menus));
        // store token
        this._storeTokens({ jwt: user.data.token, refresh_token: '' });

        this._currentUserSubject.next(user.data.user_info);
        //location.reload();
        return user;
      }, (error: any) => {
      }));
  }

  public login(username: string, password: string): any {
    return this._http.post<any>(`${environment.apiUrl}/${environment.apiVersion1}/account/login`, { username, password })
      .pipe(map(user => {
        let menus = new List<any>(user.data.menus).where(w => w.parent_id === null).toArray();
        menus.forEach(menu => {
          this._getChildrenMenu(menu, user.data.menus);
        });

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(CURRENT_USER, JSON.stringify(user.data.user_info));
        localStorage.setItem(ORG_MENU, JSON.stringify(user.data.menus));
        localStorage.setItem(MENU, JSON.stringify(menus));
        // store token
        this._storeTokens({ jwt: user.data.token, refresh_token: '' });

        this._currentUserSubject.next(user.data.user_info);
        return user;
      },(error: any) => {
      }));
  }

  public logout(): void {
    // remove user from local storage and set current user to null
    this._currentUserSubject.next(null!);
    this._removeStorage();
  }

  public refreshToken(): any {
    return this._http.get<any>(`${environment.apiUrl}/${environment.apiVersion1}/account/${this._getRefreshToken()}/refresh`)
      .pipe(tap((tokens: any) => {
        localStorage.setItem(JWT_TOKEN, tokens.jwt);
      }, error => {
        this.logout();
        this._router.navigate(['login']);
      }));
  }

  private _getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN);
  }

  private _getChildrenMenu(menu: any, orgMenus: any): void {
    menu.menus = new List<any>(orgMenus).where(w => w.parent_id === menu.id).toArray();
    menu.menus.forEach((item: any) => {
      this._getChildrenMenu(item, orgMenus);
    });
  }

  private _storeTokens(tokens: Tokens): void {
    localStorage.setItem(JWT_TOKEN, tokens.jwt);
    localStorage.setItem(REFRESH_TOKEN, tokens.refresh_token);
  }

  private _removeStorage(): void {
    localStorage.removeItem(MENU);
    localStorage.removeItem(ORG_MENU);
    localStorage.removeItem(CURRENT_USER);
    localStorage.removeItem(JWT_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }

}
