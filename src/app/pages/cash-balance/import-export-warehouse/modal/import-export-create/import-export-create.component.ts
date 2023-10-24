import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { NOTIFICATION, SEALBAG_STATUS_CODE } from '@app/_constant';
import { User } from '@app/_models';
import { AuthenticationService, CCYService, SealBagService, SwAlertService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { MoneyToTextService } from '@app/_services/money-to-text.service';
import { WarehouseImportExportService } from '@app/_services/warehouse-import-export.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';
@Component({
  selector: 'app-import-export-create',
  templateUrl: './import-export-create.component.html',
  styleUrls: ['./import-export-create.component.scss']
})
export class ImportExportCreateComponent implements OnInit {
  public form: FormGroup;
  public currentUser: User;
  public type: any;

  public sealbagCheck: any = [];
  public listTransType: any = [];
  public listCurrency: any = [];
  public listTypeCcy: any = [];
  public sealbagList: any = [];
  public statement_money: any = [];

  public isSelected = false;
  public isChecked = false;
  public isLoading = false;
  public submitted = false;
  public userIsGDV = true;

  public total = 0;
  public totalAmount = 0;
  public totalMoney = 0;


  constructor(
    private _sealBagService: SealBagService,
    private _categoryService: CategoryService,
    private _warehouseImportExportService: WarehouseImportExportService,
    private _notificationService: NotificationService,
    private _CCYService: CCYService,
    private formBuilder: FormBuilder,
    private _authenticationService: AuthenticationService,
    public dialogRef: MatDialogRef<ImportExportCreateComponent>,
    public moneyToTextService: MoneyToTextService,
    private _swAlertService: SwAlertService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this._formControl();
    this._getCcy();
    this._getSealBagList();
    this._getCategoryByCode();
    this._getManagerTypeCcy();
    this.onTypeChange();
  }

  get f() { return this.form.controls; }

  // Get API
  private async _getCategoryByCode() {
    try {
      const code = 'XUAT_NHAP_KHO';
      this.listTransType = (
        await this._categoryService.getCategoryByCode(code)
      ).data;
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getCcy() {
    try {
      const request = {
        active_flag: 1,
      };
      this.listCurrency = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getManagerTypeCcy() {
    try {
      const request = {
        ccy: this.f.transaction_ccy.value,
        warehouse_flag: this.f.transaction_type.value == 'XUAT_KHO' ? 1 : 0
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.listTypeCcy = res.map(val => { val.total = 0; return val; });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getSealBagList() {
    const request = {
      ccy: this.f.transaction_ccy.value,
      status: SEALBAG_STATUS_CODE.DA_NIEM_PHONG
    };
    try {
      const res = (await this._sealBagService.getSealbagList(request)).data;
      this.sealbagList = res.result;
      this.sealbagList.forEach(item => {
        item.is_selected = false;
      });
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public getFormRequest() {
    const request = {
      tran_type: this.f.transaction_type.value,
      description: this.f.transaction_content.value,
      ccy: this.f.transaction_ccy.value,
      sealbags: this.sealbagCheck?.map(item => item.id),
      def_price_detail: this.listTypeCcy
    };
    return request;
  }

  // Handle Events
  _formControl() {
    this.form = this.formBuilder.group({
      transaction_code: [{ value: '', disabled: true }, Validators.required],
      transaction_type: [{ value: 'XUAT_KHO', disabled: false }, Validators.required],
      transaction_date: [{ value: moment().format('DD/MM/YYYY'), disabled: true }, Validators.required],
      transaction_ccy: [{ value: 'VND', disabled: false }, Validators.required],
      transaction_content: [{ value: '', disabled: false }],
      user_name: [{ value: this.currentUser.username.toUpperCase(), disabled: true }],
    });
  }

  onTypeChange() {
    this.statement_money = [];
    const warehouse_type =
      this.f.transaction_type.value?.toUpperCase();
    this.f.transaction_content.setValue(
      `${warehouse_type == 'XUAT_KHO'
        ? 'Xuất kho hoạt động'
        : warehouse_type == 'NHAP_KHO'
          ? 'Nhập kho hoạt động'
          : ''
      }`
    );
    this._getManagerTypeCcy();
  }

  public onAllSelected() {
    this.isChecked = this.sealbagList.every((item: any) => {
      return item.isSelected == true;
    });
    this._getCheckedItemList();
  }

  public onUncheckAll() {
    for (let i = 0; i < this.sealbagList.length; i++) {
      this.sealbagList[i].isSelected = this.isChecked;
    }
    this._getCheckedItemList();
  }

  private _getCheckedItemList() {
    this.sealbagCheck = [];
    for (let i = 0; i < this.sealbagList.length; i++) {
      if (this.sealbagList[i].isSelected) {
        this.sealbagCheck.push(this.sealbagList[i]);
      }
    }
  }

  public changeMoney() {
    this._getManagerTypeCcy();
    this._getSealBagList();
    this.isChecked = false;
  }

  public calTotalAmount(item: any) {
    this.totalAmount = new List<any>(this.listTypeCcy).sum(s => s.price * (s.number_heal + s.number_torn + s.number_coin));
    item.total = item.price * (item.number_heal + item.number_torn + item.number_coin);
    this.sum();
  }

  public sum() {
    let sumSealBag = new List<any>(this.sealbagCheck).where(s => s.is_selected).sum(s => s.balance);
    this.totalMoney = this.totalAmount + sumSealBag;
  }

  // Handle Sumbits
  public async onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

  onSave() {
    if (new List<any>(this.listTypeCcy).sum(s => s.number_heal) == 0 && new List<any>(this.listTypeCcy).sum(s => s.number_torn) == 0 && new List<any>(this.listTypeCcy).sum(s => s.number_coin) == 0) {
      this._notificationService.error('Thông báo', 'Vui lòng nhập vào bảng kê');
      return;
    }

    if (new List<any>(this.listTypeCcy).any(item => item.number_heal > 0 && item.available_number_heal < item.number_heal)
      || new List<any>(this.listTypeCcy).any(item => item.number_torn > 0 && item.available_number_torn < item.number_torn)
      || new List<any>(this.listTypeCcy).any(item => item.number_coin > 0 && item.available_number_coin < item.number_coin)) {
      this._notificationService.error('Thông báo', 'Số tờ kê vượt số tờ tồn quỹ');
      return;
    }

    this.isLoading = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Anh/Chị có muốn thêm dữ liệu này không?',
      async () => {
        try {
          await this._warehouseImportExportService.create(this.getFormRequest());
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được thêm mới thành công!');
          this.isLoading = false;
          this.closeFormDialog('add');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
          this.isLoading = false;
        }
      },
      () => {
        this.isLoading = false;
      }
    );
  }
}
