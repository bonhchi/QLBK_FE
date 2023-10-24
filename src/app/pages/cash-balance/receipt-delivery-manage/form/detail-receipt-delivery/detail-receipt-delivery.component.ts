import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddMoneyReceiptComponent } from '@app/pages/receipt-delivery/confirm-money-receipt/modal/add-money-receipt/add-money-receipt.component';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { NOTIFICATION, RECEIPT_DELIVERY_MANA_STATUS_CODE } from '@app/_constant';
import { User } from '@app/_models';
import { AuthenticationService, DeliverReceiveRecordsService, MoneyToTextService, SwAlertService, UtilService } from '@app/_services';
import { List } from 'linq-typescript';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { FccTransReceiptDeliveryComponent } from '../fcc-trans-receipt-delivery/fcc-trans-receipt-delivery.component';

@Component({
  selector: 'app-detail-receipt-delivery',
  templateUrl: './detail-receipt-delivery.component.html',
  styleUrls: ['./detail-receipt-delivery.component.scss']
})
export class DetailReceiptDeliveryComponent implements OnInit {
  public currentUser: User;
  public form: FormGroup;
  public transferItem: any = {};
  public transTypeList: any = [];
  
  public isLoadingConfirmCredit: boolean = false;
  public isLoadingConfirmDebit: boolean = false;
  public isLoadingCancel: boolean = false;
  public isLoadingPrint: boolean = false;
  public isLoadingUpdate: boolean = false;
  public isloadingBtnNQTT: boolean = false;

  public isShowConfirmCredit: boolean = false;
  public isShowConfirmDebit: boolean = false;
  public isShowCancel: boolean = false;
  public isShowUpdate: boolean = false;
  public isShowPrint: boolean = false;
  public isShowButtonNQTT: boolean = false;
  public isShowButtonFCC: boolean = false;

  public isCurrentDate: boolean = false;
  public currentDate: Date = new Date();
  public dialogRefForm: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public utilService: UtilService,
    public moneyToTextService: MoneyToTextService,
    public dialogRef: MatDialogRef<AddMoneyReceiptComponent>,
    private _formBuilder: FormBuilder,
    private _swAlertService: SwAlertService,
    private _notificationService: NotificationService,
    private _deliveryService: DeliverReceiveRecordsService,
    private _authenticationService: AuthenticationService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.transferItem = data.item;
    this.transTypeList = data.transTypeList;
  }

  ngOnInit(): void {
    this._formControl();

    const makerAt = moment(this.data.item.delivery_at).format("YYYY-MM-DD");
    const curDate = moment(this.currentDate).format("YYYY-MM-DD");
    this.isCurrentDate = moment(curDate).isSame(makerAt);

    switch (this.transferItem.status) {
      case RECEIPT_DELIVERY_MANA_STATUS_CODE.CHO_HOAN_THANH_CHI:        
        const isActionButtonDebit = this.currentUser.positions.branch.code === this.transferItem.from_branch_id ? true : false;
        this.isShowCancel = isActionButtonDebit;
        this.isShowUpdate = isActionButtonDebit;
        this.isShowConfirmCredit = false;
        this.isShowConfirmDebit = isActionButtonDebit;
        this.isShowPrint = true;
        this.isShowButtonNQTT = isActionButtonDebit;
        this.isShowButtonFCC = isActionButtonDebit;
        break;
      case RECEIPT_DELIVERY_MANA_STATUS_CODE.CHO_HOAN_THANH_THU:        
        const isActionButtonCredit = this.currentUser.positions.branch.code === this.transferItem.to_branch_id ? true : false;
        this.isShowCancel = isActionButtonCredit;
        this.isShowUpdate = isActionButtonCredit;
        this.isShowConfirmCredit = isActionButtonCredit;
        this.isShowConfirmDebit = false;
        this.isShowPrint = true;
        this.isShowButtonNQTT = isActionButtonCredit;
        this.isShowButtonFCC = isActionButtonCredit;
        break;
      case RECEIPT_DELIVERY_MANA_STATUS_CODE.HOAN_THANH:
        this.isShowCancel = false;
        this.isShowUpdate = false;
        this.isShowConfirmCredit = false;
        this.isShowConfirmDebit = false;
        this.isShowPrint = true;
        this.isShowButtonNQTT = false;
        this.isShowButtonFCC = false;
        break;
      case RECEIPT_DELIVERY_MANA_STATUS_CODE.DA_HUY:
        this.isShowCancel = false;
        this.isShowUpdate = false;
        this.isShowConfirmCredit = false;
        this.isShowConfirmDebit = false;
        this.isShowPrint = false;
        this.isShowButtonNQTT = false;
        this.isShowButtonFCC = false;
        break;
      default:
        break;
    }
  }

  public get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      delivery_at: [{ value: moment(this.transferItem.delivery_at).format('DD/MM/YYYY'), disabled: true }],
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

  public calTotalAmount(itemDefPriceCcy: any) {
    return new List<any>(itemDefPriceCcy).sum(s => s.total);
  }

  public async getRefNoNQTT() {
    try {
      this.isloadingBtnNQTT = true;

      const request = {
        delivery_at: moment(this.f["delivery_at"].value, "DD/MM/YYYY").format("YYYY-MM-DD"),
        branch_id: this.transferItem.from_branch_id,
        tran_type: this.f["tran_type"].value,
        trn_ref_no: this.transferItem.delivery_no
      }
      const res = (await this._deliveryService.getTransfer(request)).data[0];
      const transList = [];
      res.datas.forEach(dataItem => {
        const trans = {
          ccy: dataItem.ccy,
          tran_debit: dataItem.data.tran_debit,
          tran_credit: dataItem.data.tran_credit
        }
        transList.push(trans);
      });

      if(this.isShowConfirmDebit) {
        const checkFccRefNoDebit = transList.every(m => {
          if(m.tran_debit.every(e => !!e.fcc_ref_no)) {
            return true;
          }
          return false;
        });

        if(checkFccRefNoDebit) {
          this.transferItem.datas.map(mData => {
            mData.data.tran_debit = transList.filter(f => f.ccy == mData.ccy)[0].tran_debit;
          });
        } else {
          this._swAlertService.error('Thông báo', `Chưa có bút toán chi bên NQTT`);
          this.isloadingBtnNQTT = false;
          return;
        }        
      }

      if(this.isShowConfirmCredit) {
        const checkFccRefNoCredit = transList.every(m => {
          if(m.tran_credit.every(e => !!e.fcc_ref_no)) {
            return true;
          }
          return false;
        });

        if(checkFccRefNoCredit) {
          this.transferItem.datas.map(mData => {
            mData.data.tran_credit = transList.filter(f => f.ccy == mData.ccy)[0].tran_credit;
          });
        } else {
          this._swAlertService.error('Thông báo', `Chưa có bút toán thu bên NQTT`);
          this.isloadingBtnNQTT = false;
          return;
        }
      }
      this.isloadingBtnNQTT = false;

      // Cập nhật bút toán
      this.onUpdate();
    } catch (error) {
      this.isloadingBtnNQTT = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public openForm(type: string) {
    switch (type) {
      case 'FCC':
        this.dialogRefForm = this.dialog.open(FccTransReceiptDeliveryComponent, {
          width: '80vw',
          data: { transferItem: this.transferItem }
        });
        this.dialogRefForm.afterClosed().subscribe((result: any) => {
          if (result.type == 'add') {
            this.transferItem.datas.map(mData => {
              mData.data.tran_debit = result.data.filter(f => f.ccy == mData.ccy.substr(0,3))[0].data;
            });
          }
        });
        break;
      default:
        break;
    }
  }

  public async onConfirmCredit() {
    try {
      this.isLoadingConfirmCredit = true;

      const checkRefNo = this.transferItem.datas.every(dataItem => {
        if(dataItem.data.tran_credit.every(e => !!e.fcc_ref_no)) {
          return true;
        }
        this.isLoadingConfirmCredit = false;
        this._swAlertService.error('Thông báo', `Loại tiền ${dataItem.ccy}: Chưa có số giao dịch hạch toán thu`);
        return false;
      });

      if(!checkRefNo) {
        return;
      }

      await this._deliveryService.send(this.transferItem.id);
      this._notificationService.success('Thành công', 'Hoàn thành thu phiếu BBGN thành công');
      this.isLoadingConfirmCredit = false;
      this.closeFormDialog('detail');
    } catch (error) {
      this.isLoadingConfirmCredit = false;
      this._swAlertService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public async onConfirmDebit() {
    try {
      this.isLoadingConfirmDebit = true;

      const checkRefNo = this.transferItem.datas.every(dataItem => {
        if(dataItem.data.tran_debit.every(e => !!e.fcc_ref_no)) {
          return true;
        }
        this.isLoadingConfirmDebit = false;
        this._swAlertService.error('Thông báo', `Loại tiền ${dataItem.ccy}: Chưa có số giao dịch hạch toán chi`);
        return false;
      });

      if(!checkRefNo) {
        return;
      }

      await this._deliveryService.send(this.transferItem.id);
      this._notificationService.success('Thành công', 'Hoàn thành chi phiếu BBGN thành công');
      this.isLoadingConfirmDebit = false;
      this.closeFormDialog('detail');
    } catch (error) {
      this.isLoadingConfirmDebit = false;
      this._swAlertService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public async onUpdate() {
    try {
      this.isLoadingUpdate = true;

      const checkRefNo = this.transferItem.datas.every(dataItem => {
        if(this.isShowConfirmDebit) {
          if(dataItem.data.tran_debit.every(e => !!e.fcc_ref_no)) {
            return true;
          }
          this.isLoadingUpdate = false;
          this._swAlertService.error('Thông báo', `Loại tiền ${dataItem.ccy}: Chưa có số giao dịch hạch toán chi`);
          return false;
        } else {
          if(dataItem.data.tran_credit.every(e => !!e.fcc_ref_no)) {
            return true;
          }
          this.isLoadingUpdate = false;
          this._swAlertService.error('Thông báo', `Loại tiền ${dataItem.ccy}: Chưa có số giao dịch hạch toán thu`);
          return false;
        }      
      });

      if(!checkRefNo) {
        return;
      }

      await this._deliveryService.update(this.transferItem.id, this.transferItem);
      this._notificationService.success('Thành công', 'Cập nhật phiếu BBGN thành công');
      this.isLoadingUpdate = false;
    } catch (error) {
      this.isLoadingUpdate = false;
      this._swAlertService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onCancel() {
    this.isLoadingCancel = true;
    Swal.fire({
      title: 'Hủy phiếu BBGN này',
      inputPlaceholder: 'Nhập lý do',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.value) {
        try {
          await this._deliveryService.delete(this.transferItem.id, { 'cancel_reason': result.value });
          this._notificationService.success('Thành công', 'Hủy phiếu BBGN thành công');
          this.isLoadingCancel = false;
          this.closeFormDialog('detail');
        } catch (error: any) {
          this.isLoadingCancel = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
      this.isLoadingCancel = false;
    });
  }

  public async onPrint() {
    try {
      this.isLoadingPrint = true;
      await this._deliveryService.print(this.transferItem.id).then(
        (result: Blob) => {
          this.isLoadingPrint = false;
          const blob = new Blob([result], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error => {
          this.isLoadingPrint = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoadingPrint = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

}
