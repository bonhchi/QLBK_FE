import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { DeliverReceiveRecordsService } from '@app/_services';
import _clonceDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-fcc-trans-receipt-delivery',
  templateUrl: './fcc-trans-receipt-delivery.component.html',
  styleUrls: ['./fcc-trans-receipt-delivery.component.scss']
})
export class FccTransReceiptDeliveryComponent implements OnInit {
  public dataList: any[] = [];
  public isLoading: boolean = false;
  public closeDialog: any = { type: 'close', data: null };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<FccTransReceiptDeliveryComponent>,
    private _deliveryService: DeliverReceiveRecordsService,
    private _notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this._getFccTransList();
  }

  private async _getFccTransList() {
    try {
      const request = {
        id: this.data.transferItem.id
      }
      this.dataList = (await this._deliveryService.getTransferFCC(request)).data;
      this.dataList.map(m => m.checked_list = m.data[0]);
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onSubmit() {
    const checkedList = [];
    this.dataList.map(m => {
      const res = {
        ccy: m.ccy,
        data: [m.checked_list]
      };
      checkedList.push(res);
    });
    const closeDialogAdd = {
      type: 'add',
      data: checkedList
    }
    this.closeFormDialog(closeDialogAdd);
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
