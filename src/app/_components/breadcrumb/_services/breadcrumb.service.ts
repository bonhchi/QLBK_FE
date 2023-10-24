import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export interface BreadCrumb {
  url: string;
  name: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbService {
  private _behaviorSubject = new BehaviorSubject<BreadCrumb[]>([]);

  constructor() { }

  public onBreadCrumb(): Observable<BreadCrumb[]> {
    return this._behaviorSubject.asObservable();
  }

  public breadCrumb(value: BreadCrumb[]): void {
    this._behaviorSubject.next(value);
  }

  public clear(): void {
    this._behaviorSubject.next([]);
  }
}
