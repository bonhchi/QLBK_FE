import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService, CCYService, MoneyToTextService, SwAlertService, WarehouseImportExportService } from '@app/_services';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-import-export-update',
  templateUrl: './import-export-update.component.html',
  styleUrls: ['./import-export-update.component.scss']
})
export class ImportExportUpdateComponent implements OnInit {
  public form: FormGroup;
  public currentUser: User;
  public type: any;
  public typeCCY: any;
  public totalAmount: any;

  public listTransType: any = [];
  public listCurrency: any = [];
  public listTypeCcy: any = [];
  public statement_money: any = [];

  public isLoading = false;
  public submitted = false;
  public userIsGDV = true;


  constructor(
    private _CCYService: CCYService,
    private formBuilder: FormBuilder,
    public moneyToText: MoneyToTextService,
    private _swAlertService: SwAlertService,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    private _warehouseImportExportService: WarehouseImportExportService,
    public dialogRef: MatDialogRef<ImportExportUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
   }

  ngOnInit(): void {
    this._formControl();
    this._getCcy();
    this._getCategoryByCode();
    // this._getManagerTypeCcy();
    this.typeCCY = this.data.def_price_detail;
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
      const request = { active_flag: 1 };
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
      };
      this.listTypeCcy = (
        await this._categoryService.getManagerType(request)
      ).data;
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public getFormRequest() {
    const request = {
      ccy: this.f.transaction_ccy.value,
      tran_type: this.f.transaction_type.value,
      description: this.f.transaction_content.value,
      sealbags: [],
      def_price_detail_data: this.listTypeCcy
    };
    return request;
  }


  // Handle Events
  public _formControl() {
    this.form = this.formBuilder.group({
      transaction_code: [{ value: '', disabled: true }],
      transaction_type: [{ value: this.data.tran_type, disabled: false }],
      transaction_date: [{ value: moment(this.data.maker_at).format('DD/MM/YYYY'), disabled: true }],
      transaction_ccy: [{ value: this.data.ccy, disabled: false }],
      transaction_content: [{ value: this.data.description, disabled: false }],
      user_name: [{ value: this.currentUser.username, disabled: true }],
    });
  }

  onTypeChange() {
    this.statement_money = [];
    let warehouse_type =
      this.f.transaction_type.value?.toUpperCase();
    this.f.transaction_content.setValue(
      `${warehouse_type == 'XUAT_KHO'
        ? 'Xuất kho hoạt động'
        : warehouse_type == 'NHAP_KHO'
          ? 'Nhập kho hoạt động'
          : ''
      }`
    );
  }

  calTotalAmount(item: string) {
    this.totalAmount =  new List<any>(this.listTypeCcy).sum(s => s.price * (s.number_heal + s.number_torn + s.number_coin));
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

  /// XỬ LÝ TABLE
  checkUncheckAll(v) {
    this.statement_money.forEach((e) => {
      if (v.ccy == e.ccy) {
        e.seal_bag.forEach((t) => {
          t.checked = v.checkedAll;
        });
      }
    });
    this.sum(v);
  }
  sum(v) {
    this.statement_money.forEach((e) => {
      if (e.ccy == v.ccy) {
        e.total =
          new List<any>(e.statement_money).sum(
            (s) => s.price * (s.available_number_heal + s.available_number_torn + s.available_number_coin)
          ) +
          new List<any>(e.seal_bag)
            .where((w) => w.checked)
            .sum((s) => s.seal_bag_balance);
      }
    });
  }
  modelChange(v) {
    this.statement_money.forEach((e) => {
      e.seal_bag.forEach((t) => {
        if (t.seal_bag_code == v.seal_bag_code) {
          t.checked = v.checked;
        }
      });
    });
    this.sum(v);
  }

  onUpdate() {
    // const id = this.data.id;
    // this._swAlertService.withConfirmation(
    //   NOTIFICATION,
    //   'Anh/Chị có muốn thêm dữ liệu này không?',
    //   async () => {
    //     try {
    //       await this._warehouseImportExportService.update(id);
    //       this._swAlertService.success(NOTIFICATION, 'Dữ liệu đã được cập nhật thành công!');
    //       this.closeFormDialog(close);
    //     } catch (error) {
    //       this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    //     }
    //   },
    //   () => { }
    // );
  }
}
