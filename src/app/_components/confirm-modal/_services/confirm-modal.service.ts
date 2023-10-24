import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmModalService {
  private _subject = new Subject<any>();

  constructor() { }

  public onConfirmModal(): Observable<any> {
    return this._subject.asObservable();
  }

  public confirmModal(title: string, message: string, okFn: () => void, cancelFn: () => void): void {
    this._setConfirmation(title, message, okFn, cancelFn);
  }

  private _setConfirmation(title: string, message: string, okFn: () => void, cancelFn: () => void): void {
    let that = this;
    this._subject.next({ 
      title, 
      message,
      okFn: () => {
        that._subject.next(null);
        okFn();
      },
      cancelFn: () => {
        that._subject.next(null);
        cancelFn();
      }
    })
  }

  public clear(): void {
    this._subject.next(null);
  }
}
