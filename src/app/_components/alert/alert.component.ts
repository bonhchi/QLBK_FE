import { Component, OnInit, OnDestroy } from '@angular/core';

import { AlertService } from './_services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  public alert: any;
  private _subscription: Subscription = new Subscription();

  constructor(private _alertService: AlertService) { }

  public ngOnInit(): void {
    this._subscription = this._alertService.onAlert()
      .subscribe(alert => {
        switch (alert && alert.type) {
          case 'success':
            alert.cssClass = 'alert alert-success';
            alert.textClass = 'text-success';
            break;
          case 'info':
            alert.cssClass = 'alert alert-info';
            alert.textClass = 'text-success';
            break;
          case 'warning':
            alert.cssClass = 'alert alert-warning';
            alert.textClass = 'text-success';
            break;
          case 'error':
            alert.cssClass = 'alert alert-danger';
            alert.textClass = 'text-danger';
            break;
          case 'primary':
            alert.cssClass = 'alert alert-primary';
            alert.textClass = 'text-success';
            break;
          case 'secondary':
            alert.cssClass = 'alert alert-secondary';
            alert.textClass = 'text-danger';
            break;
        }

        this.alert = alert;
      });
  }

  public ngOnDestroy(): void {
    if(this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
