import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { AuthGuard } from '@app/_helpers';
import { LoginComponent } from './layouts/auth/login/login.component';
import { AdminComponent } from './layouts/admin/admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'cai-dat',
        loadChildren: () => import('@pages/settings/settings.module').then(load => load.SettingsModule), data: { preload: true }
      },
      {
        path: 'bang-ke',
        loadChildren: () => import('@pages/cash-balance/cash-balance.module').then(load => load.CashBalanceModule), data: { preload: true }
      },
      {
        path: 'ung-hoan-quy',
        loadChildren: () => import('@pages/advance-fund/advance-fund.module').then(load => load.AdvanceFundModule), data: { preload: true }
      },
      {
        path: 'bien-ban-giao-nhan',
        loadChildren: () => import('@pages/receipt-delivery/receipt-delivery.module').then(load => load.ReceiptDeliveryModule), data: { preload: true }
      },
      {
        path: 'ton-quy-thuc-te',
        loadChildren: () => import('@pages/actual-fund-manage/actual-fund-manage.module').then(load => load.ActualFundManageModule), data: { preload: true }
      },
      {
        path: 'bao-cao',
        loadChildren: () => import('@pages/report-manage/report-manage.module').then(load => load.ReportManageModule), data: { preload: true }
      },
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  // {
  //   path: '**',
  //   redirectTo: '',
  //   pathMatch: 'full'
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [
    // CustomPreloadingStrategyService
  ],
  declarations: [
  ]
})
export class AppRoutingModule { }
