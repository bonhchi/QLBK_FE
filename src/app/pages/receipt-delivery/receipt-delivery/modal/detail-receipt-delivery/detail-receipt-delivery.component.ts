import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddMoneyReceiptComponent } from '@app/pages/receipt-delivery/confirm-money-receipt/modal/add-money-receipt/add-money-receipt.component';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { MoneyToTextService, SwAlertService, UtilService } from '@app/_services';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-detail-receipt-delivery',
  templateUrl: './detail-receipt-delivery.component.html',
  styleUrls: ['./detail-receipt-delivery.component.scss']
})
export class DetailReceiptDeliveryComponent implements OnInit {
  public form: FormGroup;
  public transferItem: any = {};
  public transTypeList: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilService: UtilService,
    public moneyToTextService: MoneyToTextService,
    public dialogRef: MatDialogRef<AddMoneyReceiptComponent>,
    private _formBuilder: FormBuilder,
    private _swAlertService: SwAlertService,
    private _notificationService: NotificationService,
  ) {
    this.transferItem = data.item;
    this.transTypeList = data.transTypeList
  }

  ngOnInit(): void {
    this._formControl();
  }

  public get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_date: [{ value: moment(this.transferItem.delivery_at).format('DD/MM/YYYY'), disabled: true }],
      tran_type: [{ value: this.transferItem.tran_type, disabled: true }],
      delivery_no: [{ value: this.transferItem.delivery_no, disabled: true }],

      from_branch_id: [{ value: this.transferItem.from_branch_id, disabled: true }],
      from_delivery_user_id: [{ value: this.transferItem.from_delivery_user_id, disabled: true }],
      from_receive_user_id: [{ value: this.transferItem.from_receive_user_id, disabled: true }],

      to_branch_id: [{ value: this.transferItem.to_branch_id, disabled: true }],
      to_delivery_user_id: [{ value: this.transferItem.to_delivery_user_id, disabled: true }],
      to_receive_user_id: [{ value: this.transferItem.to_receive_user_id, disabled: true }],
    });
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

}
