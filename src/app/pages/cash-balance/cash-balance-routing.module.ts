import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DenominationComponent } from './denomination/denomination.component';
import { SealBagComponent } from './seal-bag/seal-bag.component';
import {ImportExportWarehouseComponent} from './import-export-warehouse/import-export-warehouse.component';
import { CreditDebitTransComponent } from './credit-debit-trans/credit-debit-trans.component';
import { ReceiptDeliveryManageComponent } from './receipt-delivery-manage/receipt-delivery-manage.component';

const routes: Routes = [
  { path: 'bang-ke-can-tru', component: CreditDebitTransComponent  },
  { path: 'bao-niem-phong', component: SealBagComponent  },
  { path: 'doi-menh-gia', component: DenominationComponent  },
  { path: 'phieu-xuat-nhap-kho', component: ImportExportWarehouseComponent  },
  { path: 'bien-ban-giao-nhan', component: ReceiptDeliveryManageComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BangKeRoutingModule { }
