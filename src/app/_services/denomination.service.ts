import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DenominationService {
  constructor(private _http: HttpClient) { }

  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price`, request).toPromise();
  }

  public update(id: any): Promise<any> {
    return this._http.put<any>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price/${id}`, {}).toPromise();
  }

  public delete(id: string): Promise<any> {
    return this._http.delete<any>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price/${id}`).toPromise();
  }

  public send(id: string): Promise<any> {
    return this._http.put<any>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price/${id}/send`, {}).toPromise();
  }

  public approve(id: string): Promise<any> {
    return this._http.put<any>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price/${id}/approve`, {}).toPromise();
  }

  public cancel(id: string): Promise<any> {
    return this._http.put<any>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price/${id}/cancel`, {}).toPromise();
  }

  public getData(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/change_def_price`, { params: request }).toPromise();
  }

  calculationTellerOrSubFundStatementOfMoney(ccy: string) {
    const url = `${environment.apiUrl}/denomination/calculation-teller-or-subFund-statement-of-money/${ccy}`;
    return this._http.get<any>(url);
  }
}
