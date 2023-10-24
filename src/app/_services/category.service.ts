import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private _http: HttpClient) { }

  public getBranch(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/branch`, { params: request }).toPromise();
  }

  public getCcy(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/ccy`, { params: request }).toPromise();
  }

  public getTypeCcy(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/type-ccy`, { params: request }).toPromise();
  }

  public getStatus(product_code: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/${product_code}/status`).toPromise();
  }

  public getCategoryByCode(code: string): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/${code}/type`).toPromise();
  }

  public getManagerType(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/category/manager-type`, { params: request }).toPromise();
  }
}
