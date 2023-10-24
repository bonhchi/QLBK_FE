import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';
//   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);

@Injectable({
  providedIn: 'root'
})
export class FundService {

  constructor(private _http: HttpClient) { }

  public getCurrentFund(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund`, { params: request }).toPromise()
  }
  public getCurrentFundDate(branch_id: String): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branch_id}/working-date`).toPromise()
  }

  public getDenoBranch(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/deno-user`, { params: request }).toPromise()
  }

  public getDenoUserBranch(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/deno-branch`, { params: request }).toPromise()
  }

  public getStatusBranchId(branchId: string): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchId}`, {}).toPromise()
  }

  public updateStatus(branchId: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchId}`, {}).toPromise()
  }

  public opproveStatus(branchId: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchId}/approve`, {}).toPromise()
  }

  public reject(branchId: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchId}/reject`, {}).toPromise()
  }

  public transferDate(branchId:string): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchId}/transfer-date`, {}).toPromise()
  }


}
