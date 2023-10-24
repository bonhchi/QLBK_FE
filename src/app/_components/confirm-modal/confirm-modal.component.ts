import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import { ConfirmModalService } from './_services/confirm-modal.service';

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})

export class ConfirmModalComponent implements OnInit {
  private _subscription: Subscription = new Subscription();
  public confirmModal: any;

  constructor(
    private _sanitizer: DomSanitizer,
    private confirmModalService: ConfirmModalService
  ) { }

  public ngOnInit(): void {
    this._subscription = this.confirmModalService.onConfirmModal().subscribe(modal => {
      this.confirmModal = modal;
    });
  }

  public transform(v: string) : SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v); 
  }

  public ngOnDestroy(): void {
    if(this._subscription) {
      this._subscription.unsubscribe();
    }
  }

}
