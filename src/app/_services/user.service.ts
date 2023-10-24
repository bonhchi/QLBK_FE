import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _http: HttpClient) { }

  public getList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/user`, { params: request }).toPromise();
  }
}
