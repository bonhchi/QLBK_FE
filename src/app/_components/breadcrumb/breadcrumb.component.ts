import { Component, OnInit } from '@angular/core';

import { BreadCrumb, BreadCrumbService } from './_services/breadcrumb.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  public breadCrumbs: BreadCrumb[] = [];
  private _subscription: Subscription = new Subscription();

  constructor(
    private _breadCrumbService: BreadCrumbService
  ) { }

  public ngOnInit(): void {
    this._subscription = this._breadCrumbService.onBreadCrumb().subscribe(x => this.breadCrumbs = x);
  }

  public ngOnDestroy(): void {
    if(this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}
