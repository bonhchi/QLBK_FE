import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliverReceiveRecordsService {

  constructor(private _http: HttpClient) { }

  public getData(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery`, { params: request }).toPromise();
  }

  public getTransfer(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/transfer`, { params: request }).toPromise();
  }

  public getTransferFCC(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/transfer_fcc`, { params: request }).toPromise();
  }

  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery`, request).toPromise();
  }

  public update(id: string, request: any): Promise<any> {
    return this._http.patch<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/${id}`, request).toPromise();
  }

  public delete(id: string, request: any): Promise<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      }),
      body: request
    }
    return this._http.delete<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/${id}`, options ).toPromise();
  }
  
  public send(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/${id}/send`, {}).toPromise();
  }

  public approve(id: string): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/delivery/${id}/approve`, {}).toPromise();
  }

  public print(id: string): Promise<Blob> {
    return this._http.get(`${environment.apiUrl}/${environment.apiVersion1}/delivery/${id}/print`, { responseType: 'blob' }).toPromise();
  }
}
