import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreditDebitTransService {

  constructor(private _http: HttpClient) { }

  public getList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement`, { params: request }).toPromise();
  }

  public getCustInfo(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/core-fcc/customer`, { params: request }).toPromise();
  }

  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement`, request).toPromise()
  }

  public update(id: string, request: any): Promise<any> {
    return this._http.patch<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}`, request).toPromise()
  }

  public sendApproval(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}/send`, {}).toPromise()
  }

  public approval(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}/approve`, {}).toPromise()
  }

  public cancel(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}/cancel`, {}).toPromise()
  }

  public delete(id: string): Promise<any> {
    return this._http.delete<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}`).toPromise()
  }

  public getCreditDebitTransList(request): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/core-fcc/trn`, { params: request }).toPromise();
  }

  public printPDF(id: string): Promise<Blob>  {
    return this._http.get(`${environment.apiUrl}/${environment.apiVersion1}/paystatement/${id}/print`, { responseType: 'blob' }).toPromise();
  }

  public printStatment(refNo: string, funcId: string) {
    return `${environment.depositSlipUrl}${refNo}&funcid=${funcId}`;
  }
}
