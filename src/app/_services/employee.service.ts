import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { Tokens, User } from '@app/_models/index';
import { JWT_TOKEN, REFRESH_TOKEN, CURRENT_USER } from '@app/_constant/index';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private _currentUserSubject: BehaviorSubject<User>;
  public readonly currentUser: Observable<User>;

  constructor(
    private _http: HttpClient,
    private _router: Router,
    private authService: AuthService
  ) {
    this._currentUserSubject = new BehaviorSubject<User>(
      this.authService.currentUserValue
    );
    this.currentUser = this._currentUserSubject.asObservable();
  }

  getEmployeeWithRole(role: string, branchCode: string) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/employee/employee-with-role/${role}/${branchCode}`;
    return this._http.get<any>(url, {})
      .pipe(map(data => {
        return data;
      }));
  }

  getEmployeeWithBranchCode(branchCode: string) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/employee/employee-with-branch/${branchCode}`;
    return this._http.get<any>(url, {})
      .pipe(map(data => {
        return data;
      }));
  }

  getEmployeeWithBranchCodeWithoutTrader(branchCode: string) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/employee/employee-with-branch-without-trader/${branchCode}`;
    return this._http.get<any>(url, {})
      .pipe(map(data => {
        return data;
      }));
  }
}