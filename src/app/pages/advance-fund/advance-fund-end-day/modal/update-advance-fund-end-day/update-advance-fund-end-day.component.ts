import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { TYPE_ROLE_RESERVE_FUND } from '@app/_constant';
import { AdvanceFundService, AuthenticationService, FccService, MoneyToTextService, PermitService, SealBagService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';

import { List } from 'linq-typescript';
import { Permit, User } from '@app/_models';
@Component({
  selector: 'app-update-advance-fund-end-day',
  templateUrl: './update-advance-fund-end-day.component.html',
  styleUrls: ['./update-advance-fund-end-day.component.scss']
})
export class UpdateAdvanceFundEndDayComponent implements OnInit {
  form: FormGroup;
  public currentUser: User;
  is_selected: boolean = false;

  public isLoading: boolean = false;
  public isLoadingAdd: boolean = false;
  public submitted: boolean = false;
  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public availableFundsList: any[] = [];
  public totalAmount: number = 0;
  public totalMoney: number = 0;
  public userList: any[] = [];
  public type_role: any[] = [];
  public sealBagList: any = [];
  public isChecked: boolean;
  public sealBagCheck: any = [];
  public fundDetail: any = {};
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

  constructor(
    public dialogRef: MatDialogRef<UpdateAdvanceFundEndDayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _fccService: FccService,
    private _advanceFundService: AdvanceFundService,
    private _sealBagService: SealBagService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
  ) {
    this.type_role = TYPE_ROLE_RESERVE_FUND;
    this.fundDetail = data.item;
    this.ccyList = data.ccyList
    this.userList = data.userList
    this.availableFundsList = data.item.def_price_detail_data;
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
  }

  async ngOnInit() {
    this._getCategoryByCode();
    this._formControl();
    this._setFormControl();
    this._getSealBagList();
    this._onOptionsSelected();
    this.calTotalAmount({});

  }

  get f() {
    return this.form.controls;
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_type: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      user_id: [{ value: '', disabled: true }],
      full_name: [{ value: '', disabled: false }],
      position: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: true }],
      amount: [{ value: 0, disabled: false },Validators.required],
      description: [{ value: '', disabled: false }],
    })
  }

  private _setFormControl() { 
    this.f['tran_type'].setValue(this.fundDetail.tran_type);
    this.f['role'].setValue("QC");
    this.f['user_id'].setValue(this.fundDetail.till_vault_id);
    this.f['full_name'].setValue('');
    this.f['position'].setValue('');
    this.f['ccy'].setValue(this.fundDetail.ccy);
    this.f['amount'].setValue(this.fundDetail.balance);
    this.f['description'].setValue('');
  }


  private async _getCategoryByCode() {
    try {
      const code = 'HOAN_QUY_CUOI_NGAY';
      this.statementTypeList = (await this._categoryService.getCategoryByCode(code)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getSealBagList() {
    const request = {
      ccy: this.f.ccy.value,
      status: 'DA_NIEM_PHONG',
    };
    try {
      const res = await this._sealBagService.getSealbagList(request)
      if (res.code == "OK") {
        this.sealBagList = res.data.result;
        this.sealBagList.forEach(item => {
          item.is_selected = false
        });
      }
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private _onOptionsSelected() {
    const roleId = this.userList.find(item => item.role_id == this.f.role.value)
    this.form.controls['user_id'].setValue(roleId.user_id)
  }

  public calTotalAmount(item: any) {
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_torn + s.number_coin)));
    item.total = item.price * (item.number_heal + item.number_torn + item.number_coin)
    this.sum()
  }

  public sum() {
    let sumSealBag = new List<any>(this.sealBagCheck).where(s => s.is_selected).sum(s => s.balance)
    this.totalMoney = this.totalAmount + sumSealBag
  }

  public onChangeCcy() {
    this._getSealBagList();
  }

  public async onUpdate() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    if (this.form.value.amount == 0) {
      this._notificationService.error('Thông báo',  "Số tiền phải lớn hơn 0, Bạn mới có thể Hoàn quỹ cuối ngày" );
      return;
    }
    if (this.form.value.amount != this.totalAmount) {
      this._notificationService.error('Thông báo',  "Số tiền ngoài BNP và cộng thành tiền phải bằng nhau" );
      this.f['amount'].setValue(0);
      return;
    }
    const request = {
      ccy: this.f.ccy.value,
      tran_type:this.f.tran_type.value,
      till_vault_id: this.f.user_id.value,
      balance: this.f.amount.value,
      description: this.f.description.value,
      fcc_func_id: this.f.role.value,
      sealbags: this.sealBagCheck,
      def_price_detail_data: this.availableFundsList
    }
    
    try {
      const res = await this._advanceFundService.create(request)
      this._notificationService.success('Thành công', 'Cập nhật Hoàn quỹ cuối ngày' );
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }

  }

  public checkUncheckAll() {
    for (let i = 0; i < this.sealBagList.length; i++) {
      this.sealBagList[i].is_selected = this.isChecked;
    }
    this._getCheckedItemList();
  }

  public isAllSelected() {
    this.isChecked = this.sealBagList.every((item: any) => {
      return item.is_selected == true;
    })
    this._getCheckedItemList()
  }

  private _getCheckedItemList() {
    this.sealBagCheck = [];
    for (let i = 0; i < this.sealBagList.length; i++) {
      if (this.sealBagList[i].is_selected)
        this.sealBagCheck.push(this.sealBagList[i].id)
    }
  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}

