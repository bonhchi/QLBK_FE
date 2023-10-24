import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportManageRoutingModule } from './report-manage-routing.module';
import { ReportComponent } from './report/report.component';
import { Report01Component } from './report/form/report01/report01.component';
import { Report02Component } from './report/form/report02/report02.component';
import { Report03Component } from './report/form/report03/report03.component';
import { Report04Component } from './report/form/report04/report04.component';
import { Report05Component } from './report/form/report05/report05.component';
import { Report06Component } from './report/form/report06/report06.component';
import { Report07Component } from './report/form/report07/report07.component';
import { Report08Component } from './report/form/report08/report08.component';
import { Report09Component } from './report/form/report09/report09.component';
import { Report10Component } from './report/form/report10/report10.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialModule } from '@app/_modules/material.module';
import { AdvanceFundRoutingModule } from '../advance-fund/advance-fund-routing.module';
import { NgxMaskModule } from 'ngx-mask';
import { maskConfig } from '@app/_helpers/maskConfig';
import { BsDatepickerConfig, BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from "ngx-bootstrap/chronos";
import { viLocale } from "ngx-bootstrap/locale";
import { ReportCreateComponent } from './report/form/modal/report-create/report-create.component';
import { ReportDetailComponent } from './report/form/modal/report-detail/report-detail.component';
import { ReportUpdateComponent } from './report/form/modal/report-update/report-update.component';
import { Report11Component } from './report/form/report11/report11.component';

defineLocale("vi", viLocale);

export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    containerClass:'theme-dark-blue',
    dateInputFormat:'DD/MM/YYYY'
  });
}

@NgModule({
  declarations: [
    ReportComponent,
    Report01Component,
    Report02Component,
    Report03Component,
    Report04Component,
    Report05Component,
    Report06Component,
    Report07Component,
    Report08Component,
    Report09Component,
    Report10Component,
    ReportCreateComponent,
    ReportDetailComponent,
    ReportUpdateComponent,
    Report11Component,
  ],
  imports: [
    CommonModule,
    ReportManageRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MaterialModule,
    AdvanceFundRoutingModule,
    NgxMaskModule.forRoot(maskConfig),
    BsDatepickerModule.forRoot(),
  ],
  providers: [
    { provide: BsDatepickerConfig, useFactory: getDatepickerConfig },
  ],
})
export class ReportManageModule {
  constructor(
    private bsLocaleService: BsLocaleService,
  ) {
    this.bsLocaleService.use('vi');
  }
}
