import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService, DenominationService, MoneyToTextService } from '@app/_services';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-denomination-modal-update',
  templateUrl: './denomination-modal-update.component.html',
  styleUrls: ['./denomination-modal-update.component.scss']
})
export class DenominationModalUpdateComponent implements OnInit {

  currentDate: Date = new Date();
  form: FormGroup;
  currentUser: User = this._authService.currentUserValue;
  loading = false;
  isDelete = false;

  transactionType: any;
  moneyList: any;
  totalAmount: number = 0;

  currencyList: any = [];
  listDenomination: any = [];
  listTypeCcy: any = [];


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _authService: AuthenticationService,
    public moneyToText: MoneyToTextService,
    private _denominationService: DenominationService,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    public dialogRef: MatDialogRef<DenominationModalUpdateComponent>,
  ) { }

  ngOnInit(): void {
    this.currencyList = this.data.listCurrency;
    this.transactionType = this.data.typeAumont;
    this.listDenomination = this.data.denomination;
    this.moneyList = this.data.item.def_price_detail;
    this.formControl();
    this.getManagerTypeCcy();
  }

  get f() {
    return this.form.controls;
  }

  // // Get API
  private async getManagerTypeCcy() {
    try {
      const request = {
        ccy: this.f.transactionCcy.value,
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.listTypeCcy = res.map((ob, i) => ({ ...ob, "total": 0, "number_credit": 0, "number_debit": 0 }));
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Handle Events
  public formControl() {
    this.form = this._formBuilder.group({
      transactionCcy: [{ value: this.data.item.ccy, disabled: false }],
      transactionDate: [{ value: moment().format('DD/MM/YYYY'), disabled: true }],
      transactionType: [{ value: this.data.item.tran_type, disabled: false }],
      transactionStatus: [{ value: null, disabled: false }],
      transactionContent: [{ value: this.data.item.description, disabled: false }]
    });
  }

  public calTotalAmount(item: any) {
    item.total = (item.number_credit * item.price) - (item.number_debit * item.price);
    this.totalAmount =  new List<any>(this.listTypeCcy).sum(s => s.total);
  }

  onChangeType() {
    this.getManagerTypeCcy();
  }

  public onOptionsSelected() {
    this.getManagerTypeCcy();
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

  public async onDelete(id) {
    try {
      const res = await this._denominationService.delete(id);
      this._notificationService.success('Thành công', res.message);
    } catch (error: any) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Handle Submits
  public async onSubmit() {
    if (this.totalAmount > 200 && this.f.transactionCcy.value != 'VND') {
      this._notificationService.error('Thông báo', 'Tổng tiền không được lớn hơn 200');
      return;
    }
    if (this.totalAmount != 0 && this.f.transactionCcy.value != 'VND') {
      this._notificationService.error('Thông báo', 'Tổng tiền phải bằng 0');
      return;
    }

    // tslint:disable-next-line: max-line-length
    if (new List<any>(this.listDenomination).sum(s => s.number_credit) == 0 && new List<any>(this.listDenomination).sum(s => s.number_debit) == 0) {
      this._notificationService.error('Thông báo', 'Vui lòng nhập số vào bảng kê');
      return;
    }

    try {
      const id = this.data.item.id;
      const res = await this._denominationService.update(id);
      this._notificationService.success('Thành công', res.message);
      this.closeFormDialog(close);
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

}
