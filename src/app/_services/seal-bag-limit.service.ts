import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tokens, User } from '@app/_models/index';
import { JWT_TOKEN, REFRESH_TOKEN, CURRENT_USER } from '@app/_constant/index';
import { environment } from '@environments/environment';
import { Response } from '@app/_models/response';

@Injectable({
  providedIn: 'root',
})
export class SealBagLimitService {
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

  getBranchLimit(param: any) {
    const url = `${environment.apiUrl}/branch-cluster-treasury/get-list-paged?branchId=${param.branch_id}&status=${param.status}&wareHouse=${param.warehouse}&pageNum=${param.pageIndex}&pageSize=${param.pageSize}`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  // getBranchLimit(param: any) {
  //   const url = `${environment.apiUrl}/sealbaglimit/get-branch-limit?branchId=${param.branch_id}&status=${param.status}&wareHouse=${param.warehouse}&pageNum=${param.pageIndex}&pageSize=${param.pageSize}`;
  //   const requestOptions = { headers: this.header };
  //   return this._http.get<any>(url, requestOptions);
  // }

  GetTellerLimit(param: any) {
    const url = `${environment.apiUrl}/SealBagLimit/get-teller-limit?branchCode=${param.branch_code}&status=${param.status}&pageNum=${param.pageIndex}&pageSize=${param.pageSize}`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  Save(item: object) {
    const url = `${environment.apiUrl}/SealBagLimit/insert-update-limit`;
    const requestOptions = { headers: this.header };
    return this._http.post<any>(url, item, requestOptions);
  }

  Delete(id: string) {
    const url = `${environment.apiUrl}/SealBagLimit/delete?id=${id}`;
    return this._http.delete<any>(url);
  }

  GetBranch() {
    const url = `${environment.apiUrl}/system/get-all-branch`;
    return this._http.get<any>(url);
  }

  // InsertUpdateBranchLimit(branch_id: string) {
  //   const url = `${environment.apiUrl}/SealBag/create/${branch_id}`;
  //   return this._http.post<any>(url, {});
  // }

  public InsertUpdateBranchLimit(branch_id: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/SealBag/create/${branch_id}`,{}).toPromise()
  }

  InsertUpdateTellerLimit(item) {
    const url = `${environment.apiUrl}/SealBagLimit/insert-update-teller-limit`;
    return this._http.post<any>(url, item);
  }

  InsertUpdateCurrencyTellerLimit(item) {
    const url = `${environment.apiUrl}/SealBagLimit/insert-update-currency-teller-limit`;
    return this._http.post<any>(url, item);
  }

  GetCurrencyTellerLimit() {
    const url = `${environment.apiUrl}/SealBagLimit/get-currency-teller-limit`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  GetLimitsNotfunds(item) {
    const url = `${environment.apiUrl}/SealBagLimit/get-sealbag-limit-not-funds`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  InsertUpdateLimitFunds(item) {
    const url = `${environment.apiUrl}/SealBagLimit/insert-update-funds-limit`;
    return this._http.post<any>(url, item);
  }

  GetLimitsfunds() {
    const url = `${environment.apiUrl}/SealBagLimit/get-sealbag-limit-funds`;
    const requestOptions = { headers: this.header };
    return this._http.get<any>(url, requestOptions);
  }

  InsertUpdateLimitNotFunds(item) {
    const url = `${environment.apiUrl}/SealBagLimit/insert-update-fund-not-limit`;
    return this._http.post<any>(url, item);
  }

  UpdateStatusCurrencyTeller(ccy: string, status: number) {
    const url = `${environment.apiUrl}/SealBagLimit/update-status-currency-teller/${ccy}/${status}`;
    return this._http.get<any>(url);
  }
  //#region Hạn mức BNP Thủ quỹ (Đơn vị) không được tồn quỹ (Not Reserve Funds)
  NotReserveFundGetList(branch_id: string) {
    const url = `${environment.apiUrl}/sealbaglimit/not-reserve-fund`;
    return this._http.get<any>(url, { params: {branch_id: branch_id} });
  }

  NotReserveFundInsert(item: any) {
    const url = `${environment.apiUrl}/sealbaglimit/not-reserve-fund/insert`;
    return this._http.post<any>(url, item);
  }

  NotReserveFundUpdate(item: any) {
    const url = `${environment.apiUrl}/sealbaglimit/not-reserve-fund/update`;
    return this._http.post<any>(url, item);
  }

  NotReserveFundUpdateStatus(branchCode: string, ccy: string) {
    const url = `${environment.apiUrl}/sealbaglimit/not-reserve-fund/active/${branchCode}/${ccy}`;
    return this._http.post<any>(url, branchCode);
  }
  //#endregion

}
