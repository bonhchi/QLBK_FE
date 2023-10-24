import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@app/_models/response';
import { environment } from '@environments/environment';
    //   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private _http: HttpClient) { }

  public getList(request: any): Promise<any> {
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/employee/seller`, { params: request }).toPromise()
  }
  public create(request: any): Promise<any> {
    return this._http.post<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/buy`, request).toPromise()
  }
  public deleteFileForBuy( id: string): Promise<any> {
    return this._http.delete<any>(`${environment.apiUrl}/${environment.apiVersion1}/buy/${id}/contract`).toPromise()
  }
  public update(request: any): Promise<any> {
    return this._http.patch<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/management/trans-adjustment/update`, request).toPromise()
  }


  // public async getEmployeeService(request) {
  //   try {
  //     let employee = (await this._employeeService.getList(request)).data;
  //     this._notificationService.success('Thành công', 'Tạo thành công' );
  //     return employee
  //   } catch (error: any) {
  //     this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
  //   }
  // }

}
