import { Component, Inject, OnInit } from '@angular/core';
import { NOTIFICATION } from '@app/_constant';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { DenominationService, MoneyToTextService, SwAlertService, UtilService } from '@app/_services';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-denomination-modal-detail',
  templateUrl: './denomination-modal-detail.component.html',
  styleUrls: ['./denomination-modal-detail.component.scss']
})
export class DenominationModalDetailComponent implements OnInit {

  form: FormGroup;

  public transactionType: any;
  public totalAmount: any;
  public date: any;
  public dayBefore: any;
  public isCurrentDate = true;

  public currencyList: any = [];
  public denominationList: any = [];
  public typeCcyList: any = [];

  currentDate: Date = new Date();

  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilService: UtilService,
    public moneyToTextService: MoneyToTextService,
    private _swAlertService: SwAlertService,
    private _denominationService: DenominationService,
    private _notificationService: NotificationService,
    public dialogRef: MatDialogRef<DenominationModalDetailComponent>,
  ) { }

  ngOnInit(): void {
    this.currencyList = this.data.listCurrency;
    this.transactionType = this.data.typeAumont;
    this.typeCcyList = this.data.item.def_price_detail;
    this.date = moment(this.currentDate).format('YYYY-MM-DD');
    this.dayBefore = moment(this.data.item.maker_at).format('YYYY-MM-DD');
    this.totalAmount =  new List<any>(this.typeCcyList).sum(s => (s.number_credit * s.price) - (s.number_debit * s.price));
    this.formControl();
    this.getDate();
  }

  public formControl() {
    this.form = this._formBuilder.group({
      transactionCcy: [{ value: this.data.item.ccy, disabled: true }],
      transactionDate: [{ value: moment(this.data.item.maker_at).format('DD/MM/YYYY'), disabled: true }],
      transactionType: [{ value: this.data.item.tran_type, disabled: true }],
      transactionStatus: [{ value: null, disabled: true }],
      transactionContent: [{ value: this.data.item.description, disabled: true }]
    });
  }

  // Handle Events
  public getDate() {
    if (this.date != this.dayBefore) {
      this.isCurrentDate = false;
    } else {
      this.isCurrentDate = true;
    }
    console.log(this.isCurrentDate);
  }

  // Handle Submits
  public async onSend() {
    try {
      const res = await this._denominationService.send(this.data.item.id);
      this._notificationService.success('Thành công', res.message);
      this.dialogRef.close(close);
    } catch (error: any) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public async onApprove() {
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Bạn có chắc muốn xác nhận dữ liệu này không?',
      async () => {
        try {
          await this._denominationService.approve(this.data.item.id);
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được xác nhận thành công!');
          this.closeFormDialog(close);
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => { }
    );
  }

  public async onCancel() {
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Bạn có chắc muốn hủy dữ liệu này không?',
      async () => {
        try {
          await this._denominationService.cancel(this.data.item.id);
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được hủy thành công!');
          this.closeFormDialog(close);
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => { }
    );
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
