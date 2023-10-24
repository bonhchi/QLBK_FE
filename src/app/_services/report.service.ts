import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Response } from "@app/_models";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class ReportService {
  constructor(private _http: HttpClient) { }

  public getReportList(id: string, request: any): Promise<any> {
    return this._http
      .get<Response<any>>(
        `${environment.apiUrl}/${environment.apiVersion1}/report/${id}/tran`,
        { params: request }
      )
      .toPromise();
  }

  public getReportType(request: any): Promise<any> {
    return this._http
      .get<Response<any>>(
        `${environment.apiUrl}/${environment.apiVersion1}/report/`,
        { params: request }
      )
      .toPromise();
  }

  public create(id: string, request: any): Promise<any> {
    return this._http
      .post<Response<any>>(
        `${environment.apiUrl}/${environment.apiVersion1}/report/${id}/tran`,
        request
      )
      .toPromise();
  }

  public getReportQuery(id: string, request: any): Promise<any> {
    return this._http
      .get<Response<any>>(
        `${environment.apiUrl}/${environment.apiVersion1}/report/${id}/query?query_data=${request}`
      )
      .toPromise();
  }

  public print(id: string, tranId: string, type: string, user: string): Promise<any> {
    return this._http.post(`${environment.apiUrl}/${environment.apiVersion1}/report/${id}/tran/${tranId}/print/${type}`, '', { responseType: 'blob' }).toPromise();
  }
}
