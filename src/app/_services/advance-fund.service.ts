import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';
//   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);

@Injectable({
  providedIn: 'root'
})
export class AdvanceFundService {

  constructor(private _http: HttpClient) { }

  public getList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund`, { params: request }).toPromise();
  }
  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund`, request).toPromise()
  }

  public advanceFundSend(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund/${id}/send`, {}).toPromise();
  }

  public advanceFundApprove(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund/${id}/approve`, {}).toPromise();
  }

  public advanceFundUpdate(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund/${id}`, request).toPromise();
  }

  public advanceFundCancel(id: string,request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund/${id}/cancel`,  request).toPromise();
  }

  public advanceFundPrint(id: string): Promise<Blob>  {
    return this._http.get(`${environment.apiUrl}/${environment.apiVersion1}/advance_fund/${id}/print`, { responseType: 'blob' }).toPromise();
  }
}
