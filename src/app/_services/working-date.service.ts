import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Response } from '@app/_models/response';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { AuthenticationService } from '.';
import { User } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class WorkingDateService {
  private _behaviorSubject: BehaviorSubject<string>;
  public workingDate: Observable<string>;
  private _currentUser: User;

  constructor(
    private _http: HttpClient,
    private _authenticationService: AuthenticationService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this._currentUser = x);
    this._behaviorSubject = new BehaviorSubject<string>('');
  }

  public onWorkingDate(): Observable<string> {
    return this._behaviorSubject.asObservable();
  }

  public clear(): void {
    this._behaviorSubject.next('');
  }

  public getWorkingDate(): any {
    const branchCode = this._currentUser.positions_fcc.branch_code;
    return this._http.get<Response<any>>(`${environment.apiUrl}/${environment.apiVersion1}/fund/tran-lock/${branchCode}/working-date`)
      .pipe(map(result => {
        const workingDate = moment(result.data).format('DD/MM/YYYY');
        this._behaviorSubject.next(workingDate);
        this.workingDate = this._behaviorSubject.asObservable();
        return workingDate;
      },(error: any) => {
      }));
  }
}
