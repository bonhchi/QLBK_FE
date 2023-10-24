import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BangKeRoutingModule } from './cash-balance-routing.module';
import { SealBagComponent } from './seal-bag/seal-bag.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { viLocale } from "ngx-bootstrap/locale";
import { BsDatepickerModule, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { defineLocale } from "ngx-bootstrap/chronos";
import { MaterialModule } from '@app/_modules/material.module';

import { SealBagCloseComponent } from './seal-bag/dialog/seal-bag-close/seal-bag-close.component';
import { SealBagOpenComponent } from './seal-bag/dialog/seal-bag-open/seal-bag-open.component';
import { SealBagDetailComponent } from './seal-bag/dialog/seal-bag-detail/seal-bag-detail.component';
import { DenominationComponent } from './denomination/denomination.component';
import { DenominationModalComponent } from './denomination/denomination-modal/denomination-modal.component';
import { ImportExportWarehouseComponent } from './import-export-warehouse/import-export-warehouse.component';
import { ImportExportDetailComponent } from './import-export-warehouse/modal/import-export-detail/import-export-detail.component';
import { ImportExportCreateComponent } from './import-export-warehouse/modal/import-export-create/import-export-create.component';
import { CreditDebitTransComponent } from './credit-debit-trans/credit-debit-trans.component';
import { DetailCreditDebitTransComponent } from './credit-debit-trans/form/detail-credit-debit-trans/detail-credit-debit-trans.component';
import { AddCreditDebitTransComponent } from './credit-debit-trans/form/add-credit-debit-trans/add-credit-debit-trans.component';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { maskConfig } from '@app/_helpers/maskConfig';
import { DenominationModalDetailComponent } from './denomination/denomination-modal-detail/denomination-modal-detail.component';
import { DenominationModalUpdateComponent } from './denomination/denomination-modal-update/denomination-modal-update.component';
import { ImportExportUpdateComponent } from './import-export-warehouse/modal/import-export-update/import-export-update.component';
import { SelectCreditDebitTransComponent } from './credit-debit-trans/form/select-credit-debit-trans/select-credit-debit-trans.component';
import { HandmadeCreditDebitTransComponent } from './credit-debit-trans/form/handmade-credit-debit-trans/handmade-credit-debit-trans.component';
import { UpdateCreditDebitTransComponent } from './credit-debit-trans/form/update-credit-debit-trans/update-credit-debit-trans.component';
import { ReceiptDeliveryManageComponent } from './receipt-delivery-manage/receipt-delivery-manage.component';
import { AddReceiptDeliveryComponent } from './receipt-delivery-manage/form/add-receipt-delivery/add-receipt-delivery.component';
import { DetailReceiptDeliveryComponent } from './receipt-delivery-manage/form/detail-receipt-delivery/detail-receipt-delivery.component';
import { FccTransReceiptDeliveryComponent } from './receipt-delivery-manage/form/fcc-trans-receipt-delivery/fcc-trans-receipt-delivery.component';

defineLocale("vi", viLocale);

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    containerClass:'theme-dark-blue',
    dateInputFormat:'DD/MM/YYYY'
  });
}
@NgModule({
  declarations: [
    // Quan ly bao niem phong
    SealBagComponent,
    SealBagCloseComponent,
    SealBagOpenComponent,
    SealBagDetailComponent,

    // Quan ly doi menh gia
    DenominationComponent,
    DenominationModalComponent,

    // Quan ly xuat nhap kho
    ImportExportWarehouseComponent,
    ImportExportDetailComponent,
    ImportExportCreateComponent,

    // Quản lý bảng kê
    CreditDebitTransComponent,
    DetailCreditDebitTransComponent,
    AddCreditDebitTransComponent,
    DenominationModalDetailComponent,
    DenominationModalUpdateComponent,
    ImportExportUpdateComponent,
    SelectCreditDebitTransComponent,
    HandmadeCreditDebitTransComponent,
    UpdateCreditDebitTransComponent,
    ReceiptDeliveryManageComponent,
    AddReceiptDeliveryComponent,
    DetailReceiptDeliveryComponent,
    FccTransReceiptDeliveryComponent
  ],
  imports: [
    CommonModule,
    BangKeRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MaterialModule,
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
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CashBalanceModule { 
  constructor(
    private bsLocaleService: BsLocaleService,
  ) {
    this.bsLocaleService.use('vi');
  }
}