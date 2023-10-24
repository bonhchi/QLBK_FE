import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlertModule, BreadcrumbModule, ConfirmModalModule, NotificationModule } from '@app/_components';
import { MaterialModule } from '@app/_modules/material.module';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSpinnerModule } from 'ngx-spinner';
import { maskConfig } from '@app/_helpers/maskConfig';
import { MoneyDetailComponent } from './money-manager/modal/money-detail/money-detail.component';
import { MoneyCreateComponent } from './money-manager/modal/money-create/money-create.component';
import { PriceDetailComponent } from './price-manager/modal/price-detail/price-detail.component';
import { PriceCreateComponent } from './price-manager/modal/price-create/price-create.component';
import { BranchCreateComponent } from './branch-manager/modal/branch-create/branch-create.component';
import { BranchDetailComponent } from './branch-manager/modal/branch-detail/branch-detail.component';
import { ChildBranchCreateComponent } from './branch-manager/modal/child-branch/child-branch-create/child-branch-create.component';
import { ChildBranchDetailComponent } from './branch-manager/modal/child-branch/child-branch-detail/child-branch-detail.component';
import { SealbagBranchComponent } from './sealbag-manager/sealbag-branch/sealbag-branch.component';
import { SealbagLimitComponent } from './sealbag-manager/sealbag-limit/sealbag-limit.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { MoneyManagerComponent } from './money-manager/money-manager.component';
import { PriceManagerComponent } from './price-manager/price-manager.component';
import { BranchManagerComponent } from './branch-manager/branch-manager.component';
import { SealbagManagerComponent } from './sealbag-manager/sealbag-manager.component';
import { CashLimitManagerComponent } from './cash-limit-manager/cash-limit-manager.component';
import { ImportDataComponent } from './import-data/import-data.component';
import { SealbagBranchDetailComponent } from './sealbag-manager/sealbag-branch/sealbag-branch-detail/sealbag-branch-detail.component';
import { LimitTellersComponent } from './sealbag-manager/sealbag-limit/limit-tellers/limit-tellers.component';
import { AddLimitTellersComponent } from './sealbag-manager/sealbag-limit/limit-tellers/modal/add-limit-tellers/add-limit-tellers.component';
import { EditLimitTellersComponent } from './sealbag-manager/sealbag-limit/limit-tellers/modal/edit-limit-tellers/edit-limit-tellers.component';
import { LimitNotFundsComponent } from './sealbag-manager/sealbag-limit/limit-not-funds/limit-not-funds.component';
import { AddLimitNotFundsComponent } from './sealbag-manager/sealbag-limit/limit-not-funds/modal/add-limit-not-funds/add-limit-not-funds.component';
import { EditLimitNotFundsComponent } from './sealbag-manager/sealbag-limit/limit-not-funds/modal/edit-limit-not-funds/edit-limit-not-funds.component';
import { LimitFundsComponent } from './sealbag-manager/sealbag-limit/limit-funds/limit-funds.component';
import { AddLimitFundsComponent } from './sealbag-manager/sealbag-limit/limit-funds/modal/add-limit-funds/add-limit-funds.component';
import { EditLimitFundsComponent } from './sealbag-manager/sealbag-limit/limit-funds/modal/edit-limit-funds/edit-limit-funds.component';
import { DetailLimitFundsComponent } from './sealbag-manager/sealbag-limit/limit-funds/modal/detail-limit-funds/detail-limit-funds.component';

@NgModule({
  declarations: [
    MoneyManagerComponent,
    PriceManagerComponent,
    BranchManagerComponent,
    SealbagManagerComponent,
    CashLimitManagerComponent,
    ImportDataComponent,
    MoneyDetailComponent,
    PriceDetailComponent,
    PriceCreateComponent,
    MoneyCreateComponent,
    BranchCreateComponent,
    BranchDetailComponent,
    ChildBranchDetailComponent,
    ChildBranchCreateComponent,

    // Quan ly han muc bao niem phong
    SealbagBranchComponent,
    SealbagLimitComponent,
    SealbagBranchDetailComponent,
    LimitTellersComponent,
    AddLimitTellersComponent,
    EditLimitTellersComponent,
    LimitNotFundsComponent,
    AddLimitNotFundsComponent,
    EditLimitNotFundsComponent,
    LimitFundsComponent,
    AddLimitFundsComponent,
    EditLimitFundsComponent,
    DetailLimitFundsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NotificationModule,
    NgSelectModule,
    MaterialModule,
    NgxSpinnerModule,
    NgxMaskModule.forRoot(maskConfig),
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SettingsModule { }
