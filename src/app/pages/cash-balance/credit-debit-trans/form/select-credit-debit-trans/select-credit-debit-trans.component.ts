import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CREDIT_DEBIT_TRANS_FCC_STATUS_LIST } from '@app/_constant';
import { CreditDebitTransService } from '@app/_services/credit-debit-trans.service';
import { List } from 'linq-typescript';
import { NgxSpinnerService } from 'ngx-spinner';
import _ from 'lodash';
import { MoneyToTextService } from '@app/_services';

@Component({
  selector: 'app-select-credit-debit-trans',
  templateUrl: './select-credit-debit-trans.component.html',
  styleUrls: ['./select-credit-debit-trans.component.scss']
})

export class SelectCreditDebitTransComponent implements OnInit {
  public form: FormGroup;
  public formFilter: FormGroup;
  public isLoading: boolean = false;
  public isLoadingFilter: boolean = false;
  public isDisableBtnSubmit: boolean = true;
  public statusList: any[] = CREDIT_DEBIT_TRANS_FCC_STATUS_LIST;
  public functionIdList: any[] = [];
  public dataList: any[] = [];
  public dataOrgList: any[] = [];
  public closeDialog: any = { type: 'close', data: null };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SelectCreditDebitTransComponent>,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _spinner: NgxSpinnerService,
    private _creditDebitTransService: CreditDebitTransService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this._formControl();
    this._formFilterControl();

    this.onSearch();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      status: [{ value: '', disabled: false }],
      func_id: [{ value: '', disabled: false }],
      amount: [{ value: '', disabled: false }],
      trn_ref_no: [{ value: '', disabled: false }],
      trn_type: [{ value: this.data.trn_type, disabled: true }],
      drcr_ind: [{ value: this.data.drcr_ind, disabled: false }],
      ccy: [{ value: this.data.ccy, disabled: true }],
      cif: [{ value: this.data.cif, disabled: true }],
      id_card: [{ value: this.data.id_card, disabled: true }],
    });
  }

  get fFilter() { return this.formFilter.controls; }

  private _formFilterControl() {
    this.formFilter = this._formBuilder.group({
      trn_status: [{ value: '', disabled: false }],
      func_id: [{ value: '', disabled: false }],
      amount: [{ value: null, disabled: false }],
      trn_ref_no: [{ value: '', disabled: false }]
    });

    this.formFilter.valueChanges.subscribe(s => {
      let filter = _.omitBy(this.formFilter.value, _.isEmpty);
      if(filter.amount) {
        filter.amount = Number(filter.amount);
      }
      this.dataList = _.filter(this.dataOrgList, filter);
    });
  }

  public async onSearch() {
    try {
      this.isLoading = true;
      this._spinner.show('SelectCreditDebitTransComponent');

      const request = {
        status: this.f['status'].value == null ? '' : this.f['status'].value,
        func_id: this.f['func_id'].value == null ? '' : this.f['func_id'].value,
        amount: this.f['amount'].value == null ? '' : this.f['amount'].value,
        trn_ref_no: this.f['trn_ref_no'].value == null ? '' : this.f['trn_ref_no'].value,
        trn_type: this.f['trn_type'].value == null ? '' : this.f['trn_type'].value,
        drcr_ind: this.f['drcr_ind'].value == null ? '' : this.f['drcr_ind'].value,
        ccy: this.f['ccy'].value == null ? '' : this.f['ccy'].value,
        id_card: this.f['id_card'].value == null ? '' : this.f['id_card'].value
      }

      const res = (await this._creditDebitTransService.getCreditDebitTransList(request)).data;
      this.dataOrgList = res.map((ob, i) => ( { ...ob, "is_checked": false, "insert_type": "FCC" } ));
      this.dataList = _.cloneDeep(this.dataOrgList);

      const funcIdList = this.dataList.map(m => { return { id: m.func_id, code: m.func_id, name: m.func_id } });
      this.functionIdList = [...new Set(funcIdList.map(tag => tag.id))];
      this.functionIdList.splice(0, 0, { id: '', code: '', name: 'Tất cả' });

      this._spinner.hide('SelectCreditDebitTransComponent');
      this.isLoading = false;
    } catch (error: any) {
      this._spinner.hide('SelectCreditDebitTransComponent');
      this.isLoading = false;
      this.dataList = [];
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onCheck(item: any) {
    item.is_checked = !item.is_checked;
    this.isDisableBtnSubmit = !this.dataList.some(e => { return e.is_checked === true });
  }

  public onSubmit() {
    const checkedList = this.dataList.filter(f => f.is_checked === true);
    const closeDialogAdd = {
      type: 'add',
      data: checkedList
    }
    this.closeFormDialog(closeDialogAdd);
  }

  public renderStatus(status: string) {
    return this.statusList.filter(f => f.code == status)[0].name;
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
