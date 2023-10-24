import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { map } from 'rxjs/operators';
import { Response } from '@app/_models/response';

@Injectable({
  providedIn: 'root',
})
export class WarehouseImportExportService {


  constructor(private _http: HttpClient) {
  }

  public getData(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse`, { params: request }).toPromise();
  }

  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse`, request).toPromise();
  }

  public update(request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse`, request).toPromise();
  }

  public send(id: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/send`, {}).toPromise();
  }

  public send_revert(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/send-revert?reason=${request}`, {}).toPromise();
  }

  public approve(id: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/approve`, {}).toPromise();
  }

  public reject(id: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/reject`, {}).toPromise();
  }

  public cancel(id: any, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/cancel`, request).toPromise();
  }

  public delete(id: any): Promise<any> {
    return this._http.delete<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}`, {}).toPromise();
  }

  public print(id: string, type: any): Promise<Blob>  {
    return this._http.get(`${environment.apiUrl}/${environment.apiVersion1}/warehouse/${id}/print?type=${type}`, { responseType: 'blob' }).toPromise();
  }
}