import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/_helpers';
import { ActualFundManageComponent } from './actual-fund-manage/actual-fund-manage.component';
import { ActualFundBranchComponent } from './actual-fund-branch/actual-fund-branch.component';

const routes: Routes = [
  { path: 'khoa-mo-so', component: ActualFundManageComponent, canActivate: [AuthGuard] },
  { path: 'user-tai-don-vi', component: ActualFundBranchComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActualFundManageRoutingModule { }
