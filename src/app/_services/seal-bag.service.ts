import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Response } from '@app/_models/response';
@Injectable({
  providedIn: 'root'
})
export class SealBagService {
  constructor(private _http: HttpClient) { }
  public getSealbagList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/sealbag`, { params: request }).toPromise();
  }
  public sealSealBag(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/sealbag/${id}/seal`, request).toPromise();
  }
  public unsealSealBag(id: string, request: any): Promise<any> {
    return this._http.put<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/sealbag/${id}/unseal`, request).toPromise();
  }
  public getListSealBagPagination(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/SealBag/sealbag-list-paginated?branchId=${request.branch_id}&pageNum=${request.pageNum}&pageSize=${request.pageSize}`).toPromise()
  }
  public getListSealBagUser(branchId: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/SealBag/get-sealbag-user?branchId=${branchId}`).toPromise()
  }
  public sealbagDetail(sealBagCode: string): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/SealBag/detail/${sealBagCode}`).toPromise()
  }
}
