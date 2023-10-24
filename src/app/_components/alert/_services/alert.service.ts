import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private _subject = new Subject<any>();
  private _keepAfterRouteChange = false;

  constructor(
    private router: Router
  ) { 
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
          if (this._keepAfterRouteChange) {
              // only keep for a single route change
              this._keepAfterRouteChange = false;
          } else {
              // clear alert messages
              this.clear();
          }
      }
    });
  }
  
  // enable subscribing to alerts observable
  public onAlert(): Observable<any> {
    return this._subject.asObservable();
  }

  // convenience methods
  public success(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'success', keepAfterRouteChange);
  }

  public info(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'info', keepAfterRouteChange);
  }

  public warning(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'warning', keepAfterRouteChange);
  }

  public error(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'error', keepAfterRouteChange);
  }

  public primary(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'primary', keepAfterRouteChange);
  }

  public secondary(message: string, keepAfterRouteChange = false): void {
    this.alert(message, 'secondary', keepAfterRouteChange);
  }

  // main alert method    
  public alert(message: string, type: string, keepAfterRouteChange: boolean): void {
    this._keepAfterRouteChange = keepAfterRouteChange;
    this._subject.next({ type, message });
  }

  // clear alerts
  public clear(): void {
    this._subject.next(null);
  }
}
