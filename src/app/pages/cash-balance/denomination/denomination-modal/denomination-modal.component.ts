
import { DatePipe } from '@angular/common';
import { STATUSDENOMINATION, NOTIFICATION } from '@app/_constant';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, AuthService, DenominationService, MoneyToTextService, SwAlertService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-denomination-modal',
  templateUrl: './denomination-modal.component.html',
  styleUrls: ['./denomination-modal.component.scss']
})
export class DenominationModalComponent implements OnInit {

  public currentDate: Date = new Date();
  public form: FormGroup;
  public currentUser: User;
  public isSaveLoading = false;
  public isDelete = false;

  public role: any;
  public transactionType: any;
  public denomination: any;
  public defPriceDetail: any;
  public listCurrency: any = [];
  public listTypeCcy: any = [];
  public totalAmount = 0;

  public isGDV: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public spinner: NgxSpinnerService,
    public moneyToText: MoneyToTextService,
    private _swAlertService: SwAlertService,
    private _categoryService: CategoryService,
    private _authService: AuthenticationService,
    private _denominationService: DenominationService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<DenominationModalComponent>,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
    this.role = this.currentUser.role[0];
    this.isGDV = this.currentUser.role.some(s => { return s == 'GDV' });
  }

  ngOnInit() {
    this._formControl();
    this._getCcy();
    this._getCategoryByCode();
    this.getManagerTypeCcy();
  }

  get f() {
    return this.form.controls;
  }

  // Get API
  private async getManagerTypeCcy() {
    try {
      // this.spinner.show();
      const request = {
        ccy: this.f.transactionCcy.value,
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.listTypeCcy = res.map((ob, i) => ({ ...ob, 'total': 0, 'number_credit': 0, 'number_debit': 0 }));
      // this.spinner.hide();
    } catch (error) {
      // this.spinner.hide();
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.listCurrency = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getCategoryByCode() {
    try {
      const code = 'DOI_MENH_GIA';
      let res = (await this._categoryService.getCategoryByCode(code)).data;
      if (this.isGDV) {
        res = res.filter(f => f.code == "TIEN_LANH");
      }
      this.transactionType = res;
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Handle Events
  private _formControl() {
    this.form = this._formBuilder.group({
      transactionCcy: [{ value: 'VND', disabled: false }],
      transactionDate: [{ value: moment().format('DD/MM/YYYY'), disabled: true }],
      transactionType: [{ value: 'TIEN_LANH', disabled: this.isGDV }],
      transactionStatus: [{ value: null, disabled: false }],
      transactionCcyStatementMoney: [{ value: [] }],
      transactionContent: [{ value: 'Đổi mệnh giá', disabled: false }]
    });
  }

  public calTotalAmount(item: any) {
    item.total = (item.number_credit * item.price) - (item.number_debit * item.price);
    this.totalAmount = new List<any>(this.listTypeCcy).sum(s => s.total);
  }

  private _getFormRequest() {
    const request = {
      ccy: this.f.transactionCcy.value,
      description: this.f.transactionContent.value,
      tran_type: this.f.transactionType.value,
      def_price_detail: this.listTypeCcy
    };
    return request;
  }

  public onResetValue(item: any, type: string) {
    if (type == 'credit') {
      item.number_credit = 0;
    } else if (type == 'debit') {
      item.number_debit = 0;
    }
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
    if (this.totalAmount != 0) {
      this._notificationService.error('Thông báo', 'Tổng tiền phải bằng 0');
      return;
    }

    // tslint:disable-next-line: max-line-length
    if (new List<any>(this.listTypeCcy).sum(s => s.number_credit) == 0 && new List<any>(this.listTypeCcy).sum(s => s.number_debit) == 0) {
      this._notificationService.error('Thông báo', 'Vui lòng nhập vào bảng kê');
      return;
    }

    // VND
    const heal = new List<any>(this.listTypeCcy).any(item => item.number_debit > 0 && item.available_number_heal < item.number_debit);

    if (heal && (this.f.transactionType.value == 'TIEN_LANH' || this.f.transactionType.value == 'LANH_RACH')) {
      this._notificationService.error('Thông báo', 'Số tờ kê của số lượng chi vượt số tờ tồn quỹ');
      return;
    }

    const torn = new List<any>(this.listTypeCcy).any(item => item.number_debit > 0 && item.available_number_torn < item.number_debit);

    if (torn && (this.f.transactionType.value == 'TIEN_RACH' || this.f.transactionType.value == 'RACH_LANH')) {
      this._notificationService.error('Thông báo', 'Số tờ kê của số lượng chi vượt số tờ tồn quỹ');
      return;
    }


    // Khác VND
    if (this.f.transactionCcy.value != 'VND' && heal && (this.f.transactionType.value == 'TIEN_LANH' || this.f.transactionType.value == 'LANH_RACH')) {
      this._notificationService.error('Thông báo', 'Số tờ kê của số lượng chi vượt số tờ tồn quỹ');
      return;
    }

    if (this.f.transactionCcy.value != 'VND' && torn && (this.f.transactionType.value == 'TIEN_RACH' || this.f.transactionType.value == 'RACH_LANH')) {
      this._notificationService.error('Thông báo', 'Số tờ kê của số lượng chi vượt số tờ tồn quỹ');
      return;
    }

    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Anh/Chị có muốn thêm dữ liệu này không?',
      async () => {
        try {
          await this._denominationService.create(this._getFormRequest());
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được thêm mới thành công!');
          this.closeFormDialog(close);
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => { }
    );
  }
}
