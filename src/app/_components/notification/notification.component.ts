import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationService } from './_services/notification.service';
import { Notification, NotificationType } from './_models/notification';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  public notifications: Notification [] = [];
  private _subscription: Subscription = new Subscription();

  constructor(
    private _notificationService: NotificationService
  ) { }

  public ngOnInit(): void {
    this._subscription = this._notificationService.onNotification().subscribe(notification => {
      this.notifications.push(notification);

      if (notification.timeout !== 0) {
        setTimeout( () => this.close(notification), notification.timeout);
      }
    })
  }

  public getIcon(type: NotificationType) {
    let icon = '';
    switch (type) {
      case NotificationType.success:
        icon = 'fa fa-check';
        break;
      case NotificationType.warning:
        icon = 'fa fa-warning';
        break;
      case NotificationType.info:
        icon = 'fa fa-info';
        break;
      case NotificationType.error:
        icon = 'fa fa-times';
        break;
    }
    return icon;
  }

  public ngOnDestroy(): void {
    if(this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  public close(notification: Notification): void {
    this.notifications = this.notifications.filter( noti => noti.id != notification.id );
  }

}
