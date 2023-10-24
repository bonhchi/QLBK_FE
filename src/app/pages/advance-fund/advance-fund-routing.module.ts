import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/_helpers';
import { AdvanceFundDayComponent } from './advance-fund-day/advance-fund-day.component';
import { AdvanceFundStartDayComponent } from './advance-fund-start-day/advance-fund-start-day.component';
import { AdvanceFundEndDayComponent} from './advance-fund-end-day/advance-fund-end-day.component';
import { AdvanceFundManagerComponent} from './advance-fund-manager/advance-fund-manager.component';

const routes: Routes = [
  { path: 'ung-hoan-quy-trong-ngay', component: AdvanceFundDayComponent, canActivate: [AuthGuard] },
  { path: 'ung-quy-dau-ngay', component: AdvanceFundStartDayComponent, canActivate: [AuthGuard] },
  { path: 'hoan-quy-cuoi-ngay', component: AdvanceFundEndDayComponent, canActivate: [AuthGuard] },
  { path: 'phan-bo-dau-ngay', component: AdvanceFundManagerComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdvanceFundRoutingModule { }
