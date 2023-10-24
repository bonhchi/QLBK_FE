import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';
    //   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);

@Injectable({
  providedIn: 'root'
})
export class FccService {

  constructor(private _http: HttpClient) { }

  public getUserList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fcc/user-list`, { params: request }).toPromise();
  }
  public getUserRole(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/user`, { params: request }).toPromise();
  }

}
