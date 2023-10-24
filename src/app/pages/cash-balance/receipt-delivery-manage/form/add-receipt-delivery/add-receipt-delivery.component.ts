import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { NOTIFICATION } from '@app/_constant';
import { User } from '@app/_models';
import {
  AuthenticationService,
  DeliverReceiveRecordsService,
  MoneyToTextService,
  SwAlertService,
} from '@app/_services';
import { UserService } from '@app/_services/user.service';
import { UtilService } from '@app/_services/util.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-add-receipt-delivery',
  templateUrl: './add-receipt-delivery.component.html',
  styleUrls: ['./add-receipt-delivery.component.scss'],
})
export class AddReceiptDeliveryComponent implements OnInit {
  public form: FormGroup;
  public transTypeList: any = [];
  public currentUser: User;
  public transferList: any = [];
  public transferItem: any = {};
  public receiveUserList: any[] = [];
  public isCheckedAll: boolean = false;
  public isLoading: boolean = false;
  public submitted: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _swAlertService: SwAlertService,
    private _authenticationService: AuthenticationService,
    private _notificationService: NotificationService,
    private _deliveryService: DeliverReceiveRecordsService,
    public dialogRef: MatDialogRef<AddReceiptDeliveryComponent>,
    public utilService: UtilService,
    public moneyToTextService: MoneyToTextService,
    private _spinner: NgxSpinnerService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.transTypeList = data.transTypeList;
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    await this._getTransfer();
  }

  public get f() { return this.form.controls; }

  // Handle Events
  private _formControl() {
    this.form = this._formBuilder.group({
      // delivery_at: [{ value: '21/09/2022', disabled: true }],
      delivery_at: [{ value: moment().format('DD/MM/YYYY'), disabled: true }],
      tran_type: [{ value: 'TANG_TIEP_QUY_DAU_NGAY', disabled: false }],
      delivery_no: [{ value: '', disabled: false }],

      from_branch_id: [{ value: this.currentUser.positions.branch.display_name, disabled: true }],
      from_delivery_user_id: [{ value: this.currentUser.fullname, disabled: true }],
      from_receive_user_id: [{ value: '', disabled: true }],

      to_branch_id: [{ value: '', disabled: true }],
      to_delivery_user_id: [{ value: '', disabled: true }],
      to_receive_user_id: [{ value: null, disabled: false }, Validators.required],
    });

    this.f["tran_type"].valueChanges.subscribe(s => {
      this.transferItem = [];
      this.transferList = [];
      this.receiveUserList = [];
      this.form.patchValue({
        delivery_no: '',
        from_receive_user_id: '',
        to_branch_id: '',
        to_delivery_user_id: '',
        to_receive_user_id: null
      });
      this._getTransfer();
    })
  }

  // Get API
  private async _getTransfer() {
    try {
      this._spinner.show();
      const request = {
        delivery_at: moment(this.f["delivery_at"].value, "DD/MM/YYYY").format("YYYY-MM-DD"),
        branch_id: this.currentUser.positions.branch.code,
        tran_type: this.f["tran_type"].value
      }
      this.transferList = (await this._deliveryService.getTransfer(request)).data;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  // Lấy danh sách user của đơn vị theo đơn vị
  private async _getUserList(branchId: string) {
    try {
      const request = {
        roles_fcc: ["QC", "QP"],
        branch_id: branchId,
        active_flag: 1
      }
      this.receiveUserList = (await this._userService.getList(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onCheck(item: any, sealBagList: any[]) {
    item.is_checked = !item.is_checked;
    this.isCheckedAll = (sealBagList.length === sealBagList.filter(f => f.is_checked).length) ? true : false;
  }

  public onCheckAll(e: any, sealBagList: any[]) {
    this.isCheckedAll = e.target.checked;
    sealBagList.forEach(item => { item.is_checked = e.target.checked });
  }

  public async onGetTransList() {
    const receiptNo = this.f.delivery_no.value;

    this.transferItem = this.transferList.filter(f => f.delivery_no == receiptNo)[0];

    this.form.patchValue({
      from_receive_user_id: this.transferItem.from_receive_user_id,
      to_branch_id: this.transferItem.to_branch_id,
      to_delivery_user_id: this.transferItem.to_delivery_user_id
    });

    // add field is_checked sealbag
    this.transferItem.datas.forEach(item => {
      item.data.sealbags.forEach(sealbag => sealbag.is_checked = false)
    });

    //add field totalAllAmount
    this.transferItem.datas.forEach(item => { item.data.total_all_amount = 0 });

    // lấy danh sách user của Đơn vị nhận
    await this._getUserList(this.transferItem.to_branch_id);
  }

  public calTotalAmount(itemDefPrice: any, itemData: any) {
    itemDefPrice.total = itemDefPrice.price * (itemDefPrice.number_heal + itemDefPrice.number_torn + itemDefPrice.number_coin);
    itemData.total_all_amount = new List<any>(itemData.def_price_detail).sum(s => s.total);
  }

  // Handle Submits
  public onSubmit() {
    try {
      this.isLoading = true;
      this.submitted = true;
      if (this.form.invalid) {
        this._swAlertService.error('Thông báo', "Vui lòng chọn Người nhận của đơn vị nhận");
        this.isLoading = false;
        return;
      }

      // Kiểm tra số lượng kê tồn quỹ với số lượng nhập
      const checkData = this.transferItem.datas.every(ccyItem => {
        const checkDefPrice = ccyItem.data.def_price_detail.every(defPriceItem => {
          if (
            defPriceItem.number_heal > 0 && defPriceItem.available_number_heal < defPriceItem.number_heal ||
            defPriceItem.number_torn > 0 && defPriceItem.available_number_torn < defPriceItem.number_torn ||
            defPriceItem.number_coin > 0 && defPriceItem.available_number_coin < defPriceItem.number_coin
          ) {
            this.isLoading = false;
            this._swAlertService.error('Thông báo', `Loại tiền ${ccyItem.ccy}: Số lượng kê vượt số lượng tồn quỹ`);
            return false;
          }
          return true;
        });

        if (!checkDefPrice) {
          return false;
        }
        // tổng tiền kê so với tổng tiền 
        if (ccyItem.data.tran_debit[0].total != ccyItem.data.total_all_amount) {
          this.isLoading = false;
          this._swAlertService.error('Thông báo', `Loại tiền ${ccyItem.ccy}: Cộng thành tiền chi tiết bảng kê phải bằng Tổng tiền giao dịch`);
          return false;
        }
        return true;
      });

      if (!checkData) {
        this.isLoading = false;
        return;
      }

      this.transferItem.datas.forEach(ccyItem => ccyItem.data.sealbags = ccyItem.data.sealbags.filter(f => f.is_checked === true).map(m => { return m.id }));

      const request = {
        delivery_at: moment(this.f["delivery_at"].value, "DD/MM/YYYY").format("YYYY-MM-DD"),
        tran_type: this.f["tran_type"].value,
        delivery_no: this.f["delivery_no"].value,
        from_branch_id: this.currentUser.positions.branch.code,
        from_delivery_user_id: this.currentUser.username,
        from_receive_user_id: this.f["from_receive_user_id"].value,
        to_branch_id: this.f["to_branch_id"].value,
        to_delivery_user_id: this.f["to_delivery_user_id"].value,
        to_receive_user_id: this.f["to_receive_user_id"].value,
        datas: this.transferItem.datas
      }

      this._swAlertService.withConfirmation(
        NOTIFICATION,
        'Bạn có chắc muốn tạo phiếu BBGN này không?',
    
        async () => {
          try {
            await this._deliveryService.create(request);
            this._notificationService.success(NOTIFICATION, 'Tạo phiếu BBGN thành công!');
            this.closeFormDialog('add');
            this.isLoading = false;
          } catch (error) {
            this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
            this.isLoading = false;
          }
        },
        () => {
          this.isLoading = false;
        }
      );
    } catch (error) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
