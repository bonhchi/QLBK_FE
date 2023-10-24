import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

import { ReceiptDeliveryRoutingModule } from './receipt-delivery-routing.module';
import { ReceiptDeliveryComponent } from './receipt-delivery/receipt-delivery.component';
import { DetailReceiptDeliveryComponent } from './receipt-delivery/modal/detail-receipt-delivery/detail-receipt-delivery.component';
import { AddReceiptDeliveryComponent } from './receipt-delivery/modal/add-receipt-delivery/add-receipt-delivery.component';
import { ConfirmMoneyReceiptComponent } from './confirm-money-receipt/confirm-money-receipt.component';
import { AddMoneyReceiptComponent } from './confirm-money-receipt/modal/add-money-receipt/add-money-receipt.component';
import { DetailMoneyReceiptComponent } from './confirm-money-receipt/modal/detail-money-receipt/detail-money-receipt.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { defineLocale } from "ngx-bootstrap/chronos";
import { viLocale } from "ngx-bootstrap/locale";
import { MaterialModule } from '@app/_modules/material.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { maskConfig } from '@app/_helpers/maskConfig';

defineLocale('vi', viLocale);

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD/MM/YYYY'
  });
}
@NgModule({
  declarations: [
    ReceiptDeliveryComponent,
    DetailReceiptDeliveryComponent,
    AddReceiptDeliveryComponent,
    ConfirmMoneyReceiptComponent,
    AddMoneyReceiptComponent,
    DetailMoneyReceiptComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxSpinnerModule,
    MaterialModule,
    ReceiptDeliveryRoutingModule,
    BsDatepickerModule.forRoot(),
    NgxMaskModule.forRoot(maskConfig),
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: BsDatepickerConfig, useFactory: getDatepickerConfig },
  ],
})
export class ReceiptDeliveryModule {
  constructor(
    private bsLocaleService: BsLocaleService,
  ) {
    this.bsLocaleService.use('vi');
  }
}
