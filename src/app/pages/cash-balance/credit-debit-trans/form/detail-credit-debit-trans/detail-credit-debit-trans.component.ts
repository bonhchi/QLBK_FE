import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE, CREDIT_DEBIT_TRANS_TYPE_CODE, CUSTOMER_TYPE_LIST, NOTIFICATION } from '@app/_constant'
import { AuthenticationService, MoneyToTextService, PermitService, SwAlertService } from '@app/_services';
import { List } from 'linq-typescript';
import { CreditDebitTransService } from '@app/_services/credit-debit-trans.service';
import { Permit, User } from '@app/_models';
import * as moment from 'moment';
import { UtilService } from '@app/_services/util.service';

@Component({
  selector: 'app-detail-credit-debit-trans',
  templateUrl: './detail-credit-debit-trans.component.html',
  styleUrls: ['./detail-credit-debit-trans.component.scss']
})
export class DetailCreditDebitTransComponent implements OnInit {
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
  public isShowContent: boolean = false;
  public isLoading: boolean = false;
  public isLoadingCancel: boolean = false;
  public isLoadingConfirm: boolean = false;
  public isLoadingPrintPDF: boolean = false;
  public isLoadingPrintStatment: boolean = false;
  public customerTypeList: any[] = CUSTOMER_TYPE_LIST;
  public isShowPrintStatement: boolean = false;
  public isShowPrintPDF: boolean = false;
  public isShowConfirm: boolean = false;
  public isShowCancel: boolean = false;
  public permit: Permit = {
    is_query: false,
    is_add: false,
    is_delete: false,
    is_send_approve: false,
    is_upload: false,
    is_approve: false,
    is_approve_upload: false,
    is_edit: false,
    is_print: false,
    is_export: false,
    is_reject: false,
  };
  public currentUser: User;
  public isCurrentDate: boolean = false;
  public currentDate: Date = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilService: UtilService,
    public dialogRef: MatDialogRef<DetailCreditDebitTransComponent>,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _swAlertService: SwAlertService,
    private _creditDebitTransService: CreditDebitTransService,
    private _permitService: PermitService,
    private _authenticationService: AuthenticationService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
  }

  ngOnInit(): void {
    this._formControl();
    this._formControlInfo();

    this.payStatementDescription = this.data.item.description;
    this._reCalAllTransAmount();

    const makerAt = moment(this.data.item.maker_at).format("YYYY-MM-DD");
    const curDate = moment(this.currentDate).format("YYYY-MM-DD");
    this.isCurrentDate = moment(curDate).isSame(makerAt);

    switch (this.data.item.status) {
      case CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.DA_HUY:
        this.isShowCancel = false;
        this.isShowConfirm = false;
        this.isShowPrintPDF = false;
        break;
      case CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.CHO_XAC_NHAN:
        this.isShowCancel = true;
        this.isShowConfirm = true;
        if(this.data.item.tran_type == CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU) {
          this.isShowConfirm = new List<any>(this.data.item.tran_credit).any(a => a.trn_ref_no != "" && a.trn_ref_no != null) && new List<any>(this.data.item.tran_debit).any(a => a.trn_ref_no != "" && a.trn_ref_no != null);
        } else {
          if(this.data.item.tran_credit.length > 0) {
            this.isShowConfirm = new List<any>(this.data.item.tran_credit).any(a => a.trn_ref_no != "" && a.trn_ref_no != null);
          }
      
          if(this.data.item.tran_debit.length > 0) {
            this.isShowConfirm = new List<any>(this.data.item.tran_debit).any(a => a.trn_ref_no != "" && a.trn_ref_no != null);
          }
        }
        this.isShowPrintPDF = true;
        break;      
      case CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.DA_XAC_NHAN:
        this.isShowCancel = true;
        this.isShowConfirm = false;
        this.isShowPrintPDF = true;
        break;
      default:
        break;
    }
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      guest: [{ value: this.data.item.guest_flag, disabled: true }],
      statement_type: [{ value: this.data.item.tran_type, disabled: true }],
      statement_type_name: [{ value: this._getNameStatementType(this.data.item.tran_type), disabled: true }],
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
        if(this.totalCreditAmount > this.totalDebitAmount) {
          this.transTypeText = "Thực Nộp";
        } else if(this.totalCreditAmount < this.totalDebitAmount) {
          this.transTypeText = "Thực Chi";
        } else {
          this.transTypeText = "Thực Chi/Thực Nộp";
        }
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
        this.isShowContent = true;
        this.transTypeText = 'Thực nộp';
        if(this.data.item.tran_credit.length == 1 && this.data.item.status == CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.DA_XAC_NHAN) {
          this.isShowPrintStatement = true;
        }
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
        this.isShowContent = true;
        this.transTypeText = 'Thực Chi';
        if(this.data.item.tran_debit.length == 1 && this.data.item.status == CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.DA_XAC_NHAN){
          this.isShowPrintStatement = true;
        }
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

  public onConfirm() {
    try {
      this.isLoadingConfirm = true;
      this._swAlertService.withConfirmation(
        NOTIFICATION,
        'Bạn có chắc muốn xác nhận bảng kê này không?',
        async () => {
          try {
            await this._creditDebitTransService.approval(this.data.item.id);
            this.isLoadingConfirm = false;
            this._notificationService.success('Thành công', 'Xác nhận bảng kê thành công');
            this.closeFormDialog('detail');
          } catch (error) {
            this.isLoadingConfirm = false;
            this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
          }
        },
        () => {
          this.isLoadingConfirm = false;
        }
      );
    } catch (error) {
      this.isLoadingConfirm = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
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
            this.closeFormDialog('detail');
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

  public async onPrintPDF() {
    try {
      this.isLoadingPrintPDF = true;
      await this._creditDebitTransService.printPDF(this.data.item.id).then(
        (result: Blob) => {
          this.isLoadingPrintPDF = false;
          const blob = new Blob([result], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error => {
          this.isLoadingPrintPDF = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoadingPrintPDF = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onPrintStatment() {
    let transRefNo = "";
    let funcId = "";
    switch (this.f["statement_type"].value) {
      case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
        transRefNo = this.data.item.tran_credit[0].trn_ref_no;
        funcId = this.data.item.tran_credit[0].func_id;
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
        transRefNo = this.data.item.tran_debit[0].trn_ref_no;
        funcId = this.data.item.tran_debit[0].func_id;
        break;
      default:
        break;
    }
    const url = this._creditDebitTransService.printStatment(transRefNo, funcId);
    window.open(url, '_blank');
  }

  private _getNameStatementType(code: string) {
    const result = new List<any>(this.data.statementTypeList).where(w => w.code == code).toArray()[0];
    return result.name;
  }

  public closeFormDialog(close: string) {
    this.dialogRef.close(close);
  }

}
