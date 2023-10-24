import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CategoryService } from '@app/_services/category.service';
import { CUSTOMER_DOC_TYPE_LIST, CUSTOMER_TYPE_LIST, CREDIT_DEBIT_TRANS_TYPE_CODE, NOTIFICATION } from '@app/_constant'
import { MoneyToTextService, SwAlertService } from '@app/_services';
import { List } from 'linq-typescript';
import { CreditDebitTransService } from '@app/_services/credit-debit-trans.service';
import * as moment from 'moment';
import { SelectCreditDebitTransComponent } from '../select-credit-debit-trans/select-credit-debit-trans.component';
import { HandmadeCreditDebitTransComponent } from '../handmade-credit-debit-trans/handmade-credit-debit-trans.component';
import { UtilService } from '@app/_services/util.service';
import _clonceDeep from 'lodash/cloneDeep';
import _sumBy from 'lodash/sumBy';

@Component({
  selector: 'app-add-credit-debit-trans',
  templateUrl: './add-credit-debit-trans.component.html',
  styleUrls: ['./add-credit-debit-trans.component.scss']
})

export class AddCreditDebitTransComponent implements OnInit {
  public form: FormGroup;
  public customerTypeList: any[] = CUSTOMER_TYPE_LIST;
  public customerDocTypeList: any[] = CUSTOMER_DOC_TYPE_LIST;
  public isGuest: boolean = true;
  public isShowCredit: boolean = true; // THU
  public isShowDebit: boolean = true; // CHI
  public isLoading: boolean = false;
  public isLoadingSearch: boolean = false;
  public creditTransList: any[] = [];
  public debitTransList: any[] = [];
  public submittedFormCustInfo: boolean = false;
  public formCustInfo: FormGroup;
  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public dialogRefSelectTrans: any;
  public isShowButton: boolean = true;
  public isShowContent: boolean = false;
  public totalCreditAmount: number = 0;
  public totalDebitAmount: number = 0;
  public totalCreditDebitAmount: number = 0;
  public transTypeText: string = 'Thực Chi/Thực Nộp';
  public amountText: string = '';
  public payStatementDescription: string = '';
  public totalAmount: number = 0;
  public totalOddAmount: number = 0;
  public totalAllAmount: number = 0;
  public availableFundsList: any[] = [];
  public availableFundsOrgList: any[] = [];
  public submitted: boolean = false;
  public isHandTrans: boolean = false;
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddCreditDebitTransComponent>,
    public dialog: MatDialog,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _creditDebitTransService: CreditDebitTransService,
    private _swAlertService: SwAlertService,
    private _utilService: UtilService,
  ) {
    this.ccyList = data.ccyList;
    this.statementTypeList = data.statementTypeList;
  }

  ngOnInit(): void {
    this._formControl();
    this._formControlInfo();
    this._getManagerTypeCcyList();

    this.f["guest"].valueChanges.subscribe(s => {
      this.form.patchValue({
        customer_doc_type: null,
        customer_num: null
      });

      this._resetAll();
      this.formCustInfo.reset();
      
      if(s == 1) {
        this.isGuest = true;        
        this.formCustInfo.disable();
        this.onRestFormCustInfo();
      } else {
        this.isGuest = false;
        this.formCustInfo.enable();
      }

      this.formCustInfo.controls["phone"].enable();
    });

    this.f["customer_doc_type"].valueChanges.subscribe(s => {
      this.form.patchValue({
        customer_num: null
      });
      this._resetAll();
    });

    this.f["ccy"].valueChanges.subscribe(s => {
      this._resetAll();
    });

    this.f["statement_type"].valueChanges.subscribe(s => {
      this._resetAll();
      switch (s) {
        case CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU:
          this.isShowCredit = true;
          this.isShowDebit = true;
          this.isShowContent = false;
          this.transTypeText = 'Thực Chi/Thực nộp';
          this.isShowButton = true;
          break;
        case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
          this.isShowCredit = true;
          this.isShowDebit = false;
          this.isShowContent = true;
          this.transTypeText = 'Thực nộp';
          this.isShowButton = false;
          break;
        case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
          this.isShowCredit = false;
          this.isShowDebit = true;
          this.isShowContent = true;
          this.transTypeText = 'Thực Chi';
          this.isShowButton = true;
          break;
        default:
          break;
      }
    });

    this.amountText = this.moneyToTextService.DocSo(this.totalCreditDebitAmount, this.f["ccy"].value);
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      guest: [{ value: 1, disabled: false }],
      statement_type: [{ value: 'CAN_TRU', disabled: false }],
      ccy: [{ value: 'VND', disabled: false }],
      customer_doc_type: [{ value: null, disabled: !this.isGuest }, Validators.required],
      customer_num: [{ value: null, disabled: !this.isGuest }, Validators.required]
    });
  }

  get fCustInfo() { return this.formCustInfo.controls; }

  private _formControlInfo() {
    this.formCustInfo = this._formBuilder.group({
      cif: [{ value: null, disabled: true }],
      full_name: [{ value: null, disabled: true }, Validators.required],
      issue_no: [{ value: null, disabled: true }, Validators.required],
      phone: [{ value: null, disabled: false }],
      issue_date: [{ value: null, disabled: true }],
      issue_place: [{ value: null, disabled: true }],
      address: [{ value: null, disabled: true }],
    })
  }

  private _resetAll() {
    // this.isShowButton = false;
    // this.formCustInfo.reset();
    this.creditTransList = [];
    this.debitTransList = [];
    this.totalCreditDebitAmount = 0;
    this.totalCreditAmount = 0;
    this.totalDebitAmount = 0;
    this.amountText = 'Không';
    this.payStatementDescription = '';

    this._reCalAllTransAmount();
  }

  public onRestFormCustInfo() {
    this.f["customer_doc_type"].enable({ emitEvent: false });
    this.f["customer_num"].enable();
    this.formCustInfo.reset();
    this._resetAll();
  }
  
  private async _getManagerTypeCcyList() {
    try {
      const request = {
        ccy: this.form.value.ccy,
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.availableFundsOrgList = res.map((ob, i) => ({ ...ob, "total": 0 }));
      this.availableFundsList = _clonceDeep(this.availableFundsOrgList);
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onChangeCcy() {
    this._getManagerTypeCcyList();
  }

  public async onSearchCust() {
    try {
      this.submittedFormCustInfo = true;
      this.isLoadingSearch = true;

      if(this.form.invalid) {
        this.isLoadingSearch = false;
        return;
      }

      const customerDocType: string = this.f["customer_doc_type"].value;
      const customerNum: string = this.f["customer_num"].value;

      if (customerDocType.toUpperCase() == 'CIF' && customerNum.length !== 7) {
        this._swAlertService.warning('Thông Báo', 'Số CIF phải đủ 7 kí tự', false);
        this.isLoadingSearch = false;
        return;
        // tslint:disable-next-line: max-line-length
      } else if (customerDocType.toUpperCase() == 'REF' && customerNum.length !== 16) {
        this._swAlertService.warning('Thông Báo', 'Số REF phải đủ 16 kí tự', false);
        this.isLoadingSearch = false;
        return;
      }

      const request = {
        type: this.f["customer_doc_type"].value,
        value: this.f["customer_num"].value
      };
      const custInfo = (await this._creditDebitTransService.getCustInfo(request)).data;
      this.formCustInfo.patchValue({
        cif: custInfo.cif,
        full_name: custInfo.cust_name,
        issue_no: custInfo.cmnd,
        phone: custInfo.phone,
        issue_date: custInfo.issue_date ? moment(custInfo.issue_date).format("DD/MM/YYYY") : null,
        issue_place: custInfo.issue_place,
        address: custInfo.address
      });

      this.f["customer_doc_type"].disable({ emitEvent: false });
      this.f["customer_num"].disable();
      this.isLoadingSearch = false;
      this.submitted = true;
    } catch (error) {
      this.isLoadingSearch = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public onSubmit() {
    try{
      this.submitted = true;
      this.isLoading = true;
      if(this.formCustInfo.invalid) {
        this._swAlertService.error('Thông báo', "Thông tin khách hàng không hợp lệ");
        this.isLoading= false;
        return;
      }

      if(this.f["ccy"].value == "VND" && Math.abs(this.totalOddAmount) >= 200) {
        this._swAlertService.error('Thông báo', "Số tiền chênh lệch lẻ >= 200 VND. Vui lòng kiểm tra lại");
        this.isLoading= false;
        return;
      }

      if(this.f["ccy"].value != "VND" && Math.abs(this.totalOddAmount) != 0 ) {
        this._swAlertService.error('Thông báo', "Số tiền chênh lệch lẻ phải = 0. Vui lòng kiểm tra lại");
        this.isLoading= false;
        return;
      }

      if(this.totalAmount == 0 && this.totalCreditDebitAmount != 0) {
        this._swAlertService.error('Thông báo', "Vui lòng nhập Chi tiết bảng kê");
        this.isLoading= false;
        return;
      }

      if(this.isShowButton) { //chỉ check bảng kê đối với giao dịch thực chi
        if (
          new List<any>(this.availableFundsList).any( (item) => item.number_heal > 0 && item.available_number_heal < item.number_heal ) ||
          new List<any>(this.availableFundsList).any( (item) => item.number_torn > 0 && item.available_number_torn < item.number_torn ) ||
          new List<any>(this.availableFundsList).any( (item) => item.number_coin > 0 && item.available_number_coin < item.number_coin )
        ) {
          this.isLoading= false;
          return;
        }
      }

      switch (this.f["statement_type"].value) {
        case CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU:
          if(this.debitTransList.length == 0 || this.creditTransList.length == 0) {
            this._swAlertService.error('Thông báo', "Bảng kê cấn trừ: Có ít nhất 1 giao dịch thu và 1 giao dịch chi");
            this.isLoading= false;
            return;
          }
          break;
        case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
          if(this.creditTransList.length == 0) {
            this._swAlertService.error('Thông báo', "Bảng kê thu: Có ít nhất 1 giao dịch thu");
            this.isLoading= false;
            return;
          }

          if(this.totalCreditDebitAmount == 0) {
            this._swAlertService.error('Thông báo', "Tổng tiền Thực Thu phải khác 0");
            this.isLoading= false;
            return;
          }
    
          if(this.totalAmount == 0) {
            this._swAlertService.error('Thông báo', "Vui lòng nhập Chi tiết bảng kê");
            this.isLoading= false;
            return;
          }
          break;
        case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
        case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
          if(this.debitTransList.length == 0) {
            this._swAlertService.error('Thông báo', "Bảng kê chi: Có ít nhất 1 giao dịch chi");
            this.isLoading= false;
            return;
          }

          if(this.totalCreditDebitAmount == 0) {
            this._swAlertService.error('Thông báo', "Tổng tiền Thực Chi phải khác 0");
            this.isLoading= false;
            return;
          }
    
          if(this.totalAmount == 0) {
            this._swAlertService.error('Thông báo', "Vui lòng nhập Chi tiết bảng kê");
            this.isLoading= false;
            return;
          }
          break;
        default:
          break;
      }

      const request = {
        tran_type: this.f["statement_type"].value,
        ccy: this.f["ccy"].value,
        cust_no: this.fCustInfo["cif"].value,
        cust_name: this.fCustInfo["full_name"].value,
        cust_phone: this.fCustInfo["phone"].value,
        cust_id_card_no: this.fCustInfo["issue_no"].value,
        cust_id_card_date_issue: this.fCustInfo["issue_date"].value ? moment(this.fCustInfo["issue_date"].value, 'DD/MM/YYYY').format("YYYY-MM-DD") : null,
        cust_id_card_place_issue: this.fCustInfo["issue_place"].value,
        cust_address: this.fCustInfo["address"].value,
        guest_flag: this.f["guest"].value,
        tran_credit: this.creditTransList,
        tran_debit: this.debitTransList,
        def_price_detail: this.availableFundsList,
        description: this.payStatementDescription
      };
      this._swAlertService.withConfirmation(
        NOTIFICATION,
        `Bạn có chắc muốn tạo bảng kê này không?`,
        async () => {
          try {
            await this._creditDebitTransService.create(request);
            this.isLoading = false;
            this._notificationService.success('Thành công', 'Tạo bảng kê thành công');
            this.closeFormDialog('add');
          } catch (error: any) {
            this.isLoading= false;
            this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
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

  public openForm(type: string) {
    const request = {
      drcr_ind: type,
      ccy: this.f["ccy"].value,
      trn_type: this.f["statement_type"].value,
      cif: this.fCustInfo["cif"].value,
      id_card: this.fCustInfo["issue_no"].value
    }
    this.dialogRefSelectTrans = this.dialog.open(SelectCreditDebitTransComponent, {
      width: '80vw',
      data: request
    });
    this.dialogRefSelectTrans.afterClosed().subscribe((result: any) => {
      if (result?.type == 'add') {
        if(type == 'CHI') {
          const checkType = new List<any>(this.debitTransList).any(a => a.type == "HANDMADE");
           if(checkType) {
             this.debitTransList = [];
           }
          this.debitTransList = result.data;
          // this.totalDebitAmount = new List<any>(this.debitTransList).sum(s => s.amount);
          // const description = new List<any>(this.debitTransList).select(s => s.description).toArray();
          // this.payStatementDescription = description.join(";");
        } else {
          const checkType = new List<any>(this.creditTransList).any(a => a.type == "HANDMADE");
          if(checkType) {
            this.creditTransList = [];
          }
          this.creditTransList = result.data;
          // this.totalCreditAmount = new List<any>(this.creditTransList).sum(s => s.amount);
          // const description = new List<any>(this.creditTransList).select(s => s.description).toArray();
          // this.payStatementDescription = description.join(";");
        }

        // this.totalCreditDebitAmount = Math.abs(this.totalDebitAmount - this.totalCreditAmount);
        // this.amountText = this.moneyToTextService.DocSo(this.totalCreditDebitAmount, this.f["ccy"].value);
        this._reCalAllTransAmount();
      }
    });
  }

  public openFormHandMade(type: string) {
    const request = {
      drcr_ind: type,
      ccy: this.f["ccy"].value,
      trn_type: this.f["statement_type"].value,
      cif: this.fCustInfo["cif"].value,
      id_card: this.fCustInfo["issue_no"].value
    }
    this.dialogRefSelectTrans = this.dialog.open(HandmadeCreditDebitTransComponent, {
      width: '40vw',
      data: request
    });
    this.dialogRefSelectTrans.afterClosed().subscribe((result: any) => {
      if (result?.type == 'add') {
        if(type == 'CHI') {
           const checkType = new List<any>(this.debitTransList).any(a => a.type == "FCC");
           if(checkType) {
             this.debitTransList = [];
           }
          this.debitTransList.push(result.data);
        } else {
          const checkType = new List<any>(this.creditTransList).any(a => a.type == "FCC");
          if(checkType) {
            this.creditTransList = [];
          }
          this.creditTransList.push(result.data);
        }
        this._reCalAllTransAmount();
      }
    });
  }

  public onDeleteCreditTrans(item: any) {
    const index = this.creditTransList.indexOf(item);
    this.creditTransList.splice(index, 1);
    
    this._reCalAllTransAmount();
  }

  public onDeleteDebitTrans(item: any) {
    const index = this.debitTransList.indexOf(item);
    this.debitTransList.splice(index, 1);
    
    this._reCalAllTransAmount();
  }

  private _reCalAllTransAmount() {
    this.totalCreditAmount = new List<any>(this.creditTransList).sum(s => Number(s.amount));
    
    this.totalDebitAmount = new List<any>(this.debitTransList).sum(s => Number(s.amount));

    if(this.f["ccy"].value != 'VND') {
      this.totalCreditAmount = Number(this.totalCreditAmount.toFixed(2));
      this.totalDebitAmount = Number(this.totalDebitAmount.toFixed(2));
    }

    switch (this.f["statement_type"].value) {
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU:
        if(this.totalCreditAmount > this.totalDebitAmount) {
          this.transTypeText = "Thực Nộp";
          this.isShowButton = false;
        } else if(this.totalCreditAmount < this.totalDebitAmount) {
          this.transTypeText = "Thực Chi";
          this.isShowButton = true;
        } else {
          this.transTypeText = "Thực Chi/Thực Nộp";
          this.isShowButton = false;
        }
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.THU:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_TCTD:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_THU_NHNN:
        this.payStatementDescription = (new List<any>(this.creditTransList).select(s => s.description).toArray()).join(";");
        break;
      case CREDIT_DEBIT_TRANS_TYPE_CODE.CHI:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_ATM:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_DIEU_TIEP_QUY:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_NHNN:
      case CREDIT_DEBIT_TRANS_TYPE_CODE.BBGN_CHI_TCTD:
        this.payStatementDescription = (new List<any>(this.debitTransList).select(s => s.description).toArray()).join(";");
        break;
      default:
        break;
    }
    this.totalCreditDebitAmount = Math.abs(this.totalDebitAmount - this.totalCreditAmount);
    this.amountText = this.moneyToTextService.DocSo(this.totalCreditDebitAmount, this.f["ccy"].value);
    this.availableFundsList = _clonceDeep(this.availableFundsOrgList);
    this.totalAmount = 0;
    this.totalOddAmount = 0;
    this.totalAllAmount = 0;
  }

  public calTotalAmount(item: any) {
    item.total = item.price * (item.number_heal + item.number_coin);
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_coin)));
    this.totalOddAmount = Number(this.totalCreditDebitAmount) - Number(this.totalAmount);
    this.totalAllAmount = Number(this.totalAmount) + Number(this.totalOddAmount);
    if(this.f["ccy"].value != 'VND') {
      this.totalOddAmount = Number(this.totalOddAmount.toFixed(2));
      this.totalAllAmount = Number(this.totalAllAmount.toFixed(2));
    }
  }

  public autoStatement() {
    this.availableFundsList = this._utilService.autoStatement(this.totalCreditDebitAmount, this.availableFundsList);
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_coin)));
    this.totalOddAmount = Number(this.totalCreditDebitAmount) - Number(this.totalAmount);
    this.totalAllAmount = Number(this.totalAmount) + Number(this.totalOddAmount);
    if(this.f["ccy"].value != 'VND') {
      this.totalOddAmount = Number(this.totalOddAmount.toFixed(2));
      this.totalAllAmount = Number(this.totalAllAmount.toFixed(2));
    }
  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }

}
