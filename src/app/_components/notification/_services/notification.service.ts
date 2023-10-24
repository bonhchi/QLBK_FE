import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Notification, NotificationType } from '../_models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _subject = new Subject<Notification>();
  private _notificationId = 0;

  constructor() { }

  public onNotification(): Observable<Notification> {
    return this._subject.asObservable();
  }

  public success(title: string, message: string, timeout = 5000): void {
    this._subject.next(new Notification(this._notificationId++, NotificationType.success, title, message, timeout, 'alert alert-success my-noti-alert'));
  }

  public error(title: string, message: string, timeout = 5000): void {
    this._subject.next(new Notification(this._notificationId++, NotificationType.error, title, message, timeout, 'alert alert-danger my-noti-alert'));
  }

  public warning(title: string, message: string, timeout = 5000): void {
    this._subject.next(new Notification(this._notificationId++, NotificationType.warning, title, message, timeout, 'alert alert-warning my-noti-alert'));
  }

  public info(title: string, message: string, timeout = 5000): void {
    this._subject.next(new Notification(this._notificationId++, NotificationType.info, title, message, timeout, 'alert alert-info my-noti-alert'));
  }

  public clear(): void {
    this._subject.next(<Notification>{});
  }
}
