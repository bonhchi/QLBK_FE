import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { viLocale } from "ngx-bootstrap/locale";
import { BsDatepickerModule, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerModule } from 'ngx-spinner';
import { defineLocale } from "ngx-bootstrap/chronos";
import { MaterialModule } from '@app/_modules/material.module';
import { NgxMaskModule } from 'ngx-mask';
import { maskConfig } from '@app/_helpers/maskConfig';
import { AdvanceFundRoutingModule } from './advance-fund-routing.module';
import { AdvanceFundStartDayComponent } from './advance-fund-start-day/advance-fund-start-day.component';
import { AdvanceFundEndDayComponent } from './advance-fund-end-day/advance-fund-end-day.component';
import { AdvanceFundManagerComponent } from './advance-fund-manager/advance-fund-manager.component';
import { AdvanceFundDayComponent } from './advance-fund-day/advance-fund-day.component';
import { AddAdvanceFundStartDayComponent } from './advance-fund-start-day/modal/add-advance-fund-start-day/add-advance-fund-start-day.component';
import { DetailAdvanceFundStartDayComponent } from './advance-fund-start-day/modal/detail-advance-fund-start-day/detail-advance-fund-start-day.component';
import { AdvanceFunDayDetailComponent } from './advance-fund-day/modal/advance-fun-day-detail/advance-fun-day-detail.component';
import { AdvanceFundManagerAddComponent } from './advance-fund-manager/modal/advance-fund-manager-add/advance-fund-manager-add.component';
import { AdvanceFundManagerDetailComponent } from './advance-fund-manager/modal/advance-fund-manager-detail/advance-fund-manager-detail.component';
import { CheckBankTellerComponent } from './advance-fund-manager/modal/advance-fund-manager-add/module/check-bank-teller/check-bank-teller.component';
import { CheckBnpComponent } from './advance-fund-manager/modal/advance-fund-manager-add/module/check-bnp/check-bnp.component';
import { ProcessBnpComponent } from './advance-fund-manager/modal/advance-fund-manager-add/module/process-bnp/process-bnp.component';
import { AdvanceFundDayAddComponent } from './advance-fund-day/modal/advance-fund-day-add/advance-fund-day-add.component';
import { UpdateAdvanceFundStartDayComponent } from './advance-fund-start-day/modal/update-advance-fund-start-day/update-advance-fund-start-day.component';
import { AddAdvanceFundEndDayComponent } from './advance-fund-end-day/modal/add-advance-fund-end-day/add-advance-fund-end-day.component';
import { DetailAdvanceFundEndDayComponent } from './advance-fund-end-day/modal/detail-advance-fund-end-day/detail-advance-fund-end-day.component';
import { UpdateAdvanceFundEndDayComponent } from './advance-fund-end-day/modal/update-advance-fund-end-day/update-advance-fund-end-day.component';


defineLocale("vi", viLocale);

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    containerClass:'theme-dark-blue',
    dateInputFormat:'DD/MM/YYYY'
  });
}
@NgModule({
  declarations: [
    AdvanceFundDayComponent,
    AdvanceFundStartDayComponent,
    AdvanceFundEndDayComponent,
    AdvanceFundManagerComponent,
    AddAdvanceFundStartDayComponent,
    DetailAdvanceFundStartDayComponent,
    AdvanceFunDayDetailComponent,
    AdvanceFundManagerAddComponent,
    AdvanceFundManagerDetailComponent,
    CheckBankTellerComponent,
    CheckBnpComponent,
    ProcessBnpComponent,
    AdvanceFundDayAddComponent,
    UpdateAdvanceFundStartDayComponent,
    AddAdvanceFundEndDayComponent,
    DetailAdvanceFundEndDayComponent,
    UpdateAdvanceFundEndDayComponent,
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MaterialModule,
    AdvanceFundRoutingModule,
    NgxMaskModule.forRoot(maskConfig),
    BsDatepickerModule.forRoot(),
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
export class AdvanceFundModule {
  constructor(
    private bsLocaleService: BsLocaleService,
  ) {
    this.bsLocaleService.use('vi');
  }
}