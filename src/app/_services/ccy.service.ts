import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Tokens, User } from '@app/_models/index';
import { JWT_TOKEN, REFRESH_TOKEN, CURRENT_USER } from '@app/_constant/index';
import { List } from 'linq-typescript';
import { environment } from '@environments/environment';



import { Response } from '@app/_models/response';

@Injectable({
  providedIn: 'root',
})
export class CCYService {

  
  private header = new HttpHeaders({
    Authorization: 'Bearer ' + JWT_TOKEN,
  }).set('Content-Type', 'application/x-www-form-urlencoded');

  private _currentUserSubject: BehaviorSubject<User>;
  public readonly currentUser: Observable<User>;
  constructor(private _http: HttpClient, private _router: Router) {
    this._currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem(CURRENT_USER))
    );
    this.currentUser = this._currentUserSubject.asObservable();
  }

  GetCategoryCurrency() {
    return this._http.get<Response<any>>(`${environment.apiUrl}/ccy/category-currency`,{}).toPromise();
 }
 
  // TIEN FIX HERE
  GetCCY(type, healTornCoin) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/getlist?type=${type}&healTornCoin=${healTornCoin}`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  SaveCCY(item: object) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/saveccys`;
    const requestOptions = { headers: this.header };
    return this._http.post<any>(url, item);
  }
  Delete(val) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/delete?id=${val}`;
    return this._http.delete<any>(url);
  }
  Approve(val) {
    var param = { id: val.id, check: val.status };

    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/Approve`;
    return this._http.put<any>(url, param);
  }




  GetCategoryCurrencyManager() {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/category-currency-manager`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  CreateCategoryCurrency(v) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/create-category-currency`;
    const requestOptions = { headers: this.header };
    return this._http.post<any>(url, v);
  }
  DeleteCategoryCurrency(val: string, code: string) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/delete-category-currency/${val}/${code}`;
    return this._http.delete<any>(url);
  }
  ApproveCategoryCurrency(code, status) {
    const url = `${environment.apiUrl}/${environment.apiVersion1}/ccy/approve-status/${code}/${status}`;
    return this._http.put<any>(url, code);
  }


}
