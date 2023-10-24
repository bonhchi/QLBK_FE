import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchManagerComponent } from './branch-manager/branch-manager.component';
import { CashLimitManagerComponent } from './cash-limit-manager/cash-limit-manager.component';
import { ImportDataComponent } from './import-data/import-data.component';
import { MoneyManagerComponent } from './money-manager/money-manager.component';
import { PriceManagerComponent } from './price-manager/price-manager.component';
import { SealbagManagerComponent } from './sealbag-manager/sealbag-manager.component';
import { AuthGuard } from '@app/_helpers';

const routes: Routes = [
  { path: 'quan-ly-don-vi', component: BranchManagerComponent, canActivate: [AuthGuard] },
  { path: 'quan-ly-loai-tien', component: MoneyManagerComponent, canActivate: [AuthGuard] },      
  { path: 'quan-ly-menh-gia', component: PriceManagerComponent, canActivate: [AuthGuard] },
  { path: 'quan-ly-han-muc-bnp', component: SealbagManagerComponent, canActivate: [AuthGuard] },
  { path: 'quan-ly-han-muc-ton-quy-mac-dinh', component: CashLimitManagerComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
