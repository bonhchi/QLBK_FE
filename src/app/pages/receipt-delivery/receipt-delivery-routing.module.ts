import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReceiptDeliveryComponent } from './receipt-delivery/receipt-delivery.component';
import { ConfirmMoneyReceiptComponent } from './confirm-money-receipt/confirm-money-receipt.component';
import { AuthGuard } from '@app/_helpers';

const routes: Routes = [
  { path: 'tao-phieu', component: ReceiptDeliveryComponent, canActivate: [AuthGuard] },
  { path: 'xac-nhan', component: ConfirmMoneyReceiptComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReceiptDeliveryRoutingModule { }
