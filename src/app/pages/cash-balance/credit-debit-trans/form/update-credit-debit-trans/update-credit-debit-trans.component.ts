import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE, CREDIT_DEBIT_TRANS_TYPE_CODE, CUSTOMER_TYPE_LIST, NOTIFICATION } from '@app/_constant';
import { MoneyToTextService, SwAlertService } from '@app/_services';
import { CreditDebitTransService } from '@app/_services/credit-debit-trans.service';
import { UtilService } from '@app/_services/util.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-update-credit-debit-trans',
  templateUrl: './update-credit-debit-trans.component.html',
  styleUrls: ['./update-credit-debit-trans.component.scss']
})
export class UpdateCreditDebitTransComponent implements OnInit {
  public form: FormGroup;
  public formCustInfo: FormGroup;
  public totalCreditAmount: number = 0;
  public totalDebitAmount: number = 0;
  public totalCreditDebitAmount: number = 0;
  public transTypeText: string = 'Thực Chi/Thực nộp';
  public amountText: string = '';
  public payStatementDescription: string = '';
  public totalAmount: number = 0;
  public totalOddAmount: number = 0;
  public totalAllAmount: number = 0;
  public isLoading: boolean = false;
  public isLoadingCancel: boolean = false;
  public isShowContent: boolean = false;
  public customerTypeList: any[] = CUSTOMER_TYPE_LIST;
  public isCurrentDate: boolean = false;
  public currentDate: Date = new Date();
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilService: UtilService,
    public dialogRef: MatDialogRef<UpdateCreditDebitTransComponent>,
    public dialog: MatDialog,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _creditDebitTransService: CreditDebitTransService,
    private _swAlertService: SwAlertService,
  ) { }

  ngOnInit(): void {console.log(this.data)
    this._formControl();
    this._formControlInfo();

    this.payStatementDescription = this.data.item.description;
    this._reCalAllTransAmount();

    const makerAt = moment(this.data.item.maker_at).format("YYYY-MM-DD");
    const curDate = moment(this.currentDate).format("YYYY-MM-DD");
    this.isCurrentDate = moment(curDate).isSame(makerAt);
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      guest: [{ value: this.data.item.guest_flag, disabled: true }],
      statement_type: [{ value: this.data.item.tran_type, disabled: true }],
      ccy: [{ value: this.data.item.ccy, disabled: true }]
    })
  }

  private _formControlInfo() {
    this.formCustInfo = this._formBuilder.group({
      cif: [{ value: this.data.item.cust_no, disabled: true }],
      full_name: [{ value: this.data.item.cust_name, disabled: true }, Validators.required],
      issue_no: [{ value: this.data.item.cust_id_card_no, disabled: true }, Validators.required],
      phone: [{ value: this.data.item.cust_phone, disabled: true }, Validators.required],
      issue_date: [{ value: this.data.item.cust_id_card_date_issue ? moment(this.data.item.cust_id_card_date_issue).format("DD/MM/YYYY") : '', disabled: true }],
      issue_place: [{ value: this.data.item.cust_id_card_place_issue, disabled: true }],
      address: [{ value: this.data.item.cust_address, disabled: true }],
    })
  }

  private _reCalAllTransAmount() {
    if(this.data.item.tran_credit?.length > 0) {
      this.totalCreditAmount = new List<any>(this.data.item.tran_credit).sum(s => s.amount);
    }
    
    if(this.data.item.tran_debit?.length > 0) {
      this.totalDebitAmount = new List<any>(this.data.item.tran_debit).sum(s => s.amount);
    }

    switch (this.f["statement_type"].value) {
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU:
        this.isShowContent = false;
        this.transTypeText = 'Thực Chi/Thực nộp';
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
        this.isShowContent = true;
        this.transTypeText = 'Thực nộp';
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
        this.isShowContent = true;
        this.transTypeText = 'Thực Chi';
        break;
      default:
        break;
    }
    this.totalCreditDebitAmount = Math.abs(this.totalDebitAmount - this.totalCreditAmount);
    this.amountText = this.moneyToTextService.DocSo(this.totalCreditDebitAmount, this.f["ccy"].value);

    this.totalAmount =  new List<any>(this.data.item.def_price_detai_data).sum(s => (s.price * (s.number_heal + s.number_coin)));
    this.totalOddAmount = this.totalCreditDebitAmount - this.totalAmount;
    this.totalAllAmount = this.totalAmount + this.totalOddAmount;
  }

  public async onSubmit() {
    try {
      this.isLoading = true;
      if(this.data.item.tran_credit && new List<any>(this.data.item?.tran_credit).any(a => a.trn_ref_no == null)) {
        this._notificationService.error('Thông báo', "Vui lòng nhập Số giao dịch");
        this.isLoading = false;
        return;
      }

      if(this.data.item.tran_debit && new List<any>(this.data.item?.tran_debit).any(a => a.trn_ref_no == null)) {
        this._notificationService.error('Thông báo', "Vui lòng nhập Số giao dịch");
        this.isLoading = false;
        return;
      }
      
      await this._creditDebitTransService.update(this.data.item.id, this.data.item);
      this.isLoading = false;
      this._notificationService.success('Thành công', 'Cập nhật bảng kê thành công');
      this.closeFormDialog('update');
    } catch (error: any) {
      this.isLoading= false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onCancel() {
    try {
      this.isLoadingCancel = true;
      this._swAlertService.withConfirmation(
        NOTIFICATION,
        'Bạn có chắc muốn hủy bảng kê này không?',
        async () => {
          try {
            await this._creditDebitTransService.cancel(this.data.item.id);
            this.isLoadingCancel = false;
            this._notificationService.success('Thành công', 'Hủy bảng kê thành công');
            this.closeFormDialog('update');
          } catch (error) {
            this.isLoadingCancel = false;
            this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
          }
        },
        () => {
          this.isLoadingCancel = false;
        }
      );
    } catch (error) {
      this.isLoadingCancel = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: string) {
    this.dialogRef.close(close);
  }
}
