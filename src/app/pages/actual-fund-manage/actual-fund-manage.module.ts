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
import { ActualFundManageRoutingModule } from './actual-fund-manage-routing.module';
import { ActualFundBranchComponent } from './actual-fund-branch/actual-fund-branch.component';
import { ActualFundManageComponent } from './actual-fund-manage/actual-fund-manage.component';
import { DetailFundManageComponent } from './actual-fund-manage/modal/detail-fund-manage/detail-fund-manage.component';
import { BranchListFundManageComponent } from './actual-fund-manage/modal/branch-list-fund-manage/branch-list-fund-manage.component';

defineLocale("vi", viLocale);

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    containerClass:'theme-dark-blue',
    dateInputFormat:'DD/MM/YYYY'
  });
}
@NgModule({
  declarations: [
    ActualFundBranchComponent,
    ActualFundManageComponent,
    DetailFundManageComponent,
    BranchListFundManageComponent
  ],
  imports: [
    CommonModule,
    ActualFundManageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    MaterialModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot(maskConfig),
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    { provide: BsDatepickerConfig, useFactory: getDatepickerConfig },
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ActualFundManageModule {
  constructor(
    private bsLocaleService: BsLocaleService,
  ) {
    this.bsLocaleService.use('vi');
  }
}