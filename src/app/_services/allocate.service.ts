import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';
    //   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);

@Injectable({
  providedIn: 'root'
})
export class AllocateService {

  constructor(private _http: HttpClient) { }

  public getInfoAllocate(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate`, { params: request }).toPromise()
  }
  public getInfoAllocateUser(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate/users`, { params: request }).toPromise()
  }
  public getInfoAllocateSealbag(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate/sealbag`, { params: request }).toPromise()
  }
  public createAllocate(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate/allocate`, request).toPromise();
  }
  public approveAllocate(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate/${id}/send`, request).toPromise();
  }
  public refuseAllocate(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/allocate/${id}/cancel`, request).toPromise();
  }
  public printAllocate(id: string, request: any): Promise<Blob> {
    return this._http.get(`${environment.apiUrl}/${environment.apiVersion1}/allocate/${id}/print`, { responseType: 'blob' }).toPromise();
  }
}
