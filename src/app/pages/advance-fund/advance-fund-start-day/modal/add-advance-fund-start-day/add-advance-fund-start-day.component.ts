import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { TYPE_ROLE_RESERVE_FUND } from '@app/_constant';
import { User } from '@app/_models/user';
import { AdvanceFundService, AuthenticationService, FccService, MoneyToTextService, SealBagService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { UserService } from '@app/_services/user.service';
import { UtilService } from '@app/_services/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';

import { List } from 'linq-typescript';

@Component({
  selector: 'app-add-advance-fund-start-day',
  templateUrl: './add-advance-fund-start-day.component.html',
  styleUrls: ['./add-advance-fund-start-day.component.scss']
})
export class AddAdvanceFundStartDayComponent implements OnInit {
  form: FormGroup;
  public currentUser: User;

  public isLoading: boolean = false;
  public isLoadingAdd: boolean = false;
  public submitted: boolean = false;
  public is_selected: boolean = false;
  public branchId: any;
  public totalAmount: number = 0;
  public totalMoney: number = 0;

  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public availableFundsList: any[] = [];
  public userList: any[] = [];
  public type_role: any[] = [];
  public sealBagList: any = [];
  public isChecked: boolean;
  public sealBagCheck: any = [];
  @ViewChild('ngSelectTillId') ngSelectComponent: NgSelectComponent;
  constructor(
    public dialogRef: MatDialogRef<AddAdvanceFundStartDayComponent>,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _userService: UserService,
    private _advanceFundService: AdvanceFundService,
    private _sealBagService: SealBagService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _authenticationService: AuthenticationService,
    private _autoNumber: UtilService,
  ) {
    this.type_role = TYPE_ROLE_RESERVE_FUND;
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.branchId = this.currentUser.positions.branch.id;
  }

  async ngOnInit() {
    this._getCategoryByCode();
    this._formControl();
    this._getCcy();
    this._getManagerTypeCcyList();
    this._getSealBagList();
    this._getUserRole();
  }

  get f() {
    return this.form.controls;
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_type: [{ value: 'UNG_QUY_DAU_NGAY', disabled: true }],
      role: [{ value: 'QC', disabled: false }],
      user_id: [{ value: '', disabled: false }, Validators.required],
      full_name: [{ value: '', disabled: true }],
      position: [{ value: '', disabled: true }],
      ccy: [{ value: 'VND', disabled: false }],
      amount: [{ value: 0, disabled: false }, Validators.required],
      description: [{ value: `${this.currentUser?.username.toUpperCase()} UNG QUY TU `, disabled: false }],
    })
  }

  public onOptionsSelected(event) {
    let till_vault_id = this.f.user_id.value;
    this.f['description'].setValue(`${this.currentUser?.username.toUpperCase()} UNG QUY TU ${till_vault_id != null ? till_vault_id.toUpperCase() : ''}`);
  }

  private async _getUserRole(){
    const param = {
      roles_fcc: [""],
      branch_id: this.branchId,
    };
    try {
     const res = (await this._userService.getList(param)).data;
      this.userList = res.filter(item => item.role_fcc != null)
    } catch (error: any) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
    
  }

  private async _getCategoryByCode() {
    try {
      const code = 'UNG_QUY_DAU_NGAY';
      this.statementTypeList = (await this._categoryService.getCategoryByCode(code)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccyList = (await this._categoryService.getCcy(request)).data;
      this.ccyList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getManagerTypeCcyList() {
    try {
      const request = {
        ccy: this.form.value.ccy,
        till_vault_id:this.f.user_id.value,
      };
      const res = (await this._categoryService.getManagerType(request)).data; 
      this.availableFundsList = res.map(m => { m.total = 0; return m });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }
  
  public changeUserId(){
    this._getManagerTypeCcyList();
    this._getSealBagList()
  }

  private async _getSealBagList() {
    const request = {
      ccy: this.f.ccy.value,
      assigned_id:this.f.user_id.value,
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

  public async autoNumber() {
    try {
      const res = await this._autoNumber.autoStatement(this.f.amount.value, this.availableFundsList)
      this.sum()
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public calTotalAmount(item: any) {
    item.total = item.price * (item.number_heal + item.number_torn + item.number_coin)
    this.sum()
  }

  public sum() {
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_torn + s.number_coin)));
    let sumSealBag = new List<any>(this.sealBagCheck).where(s => s.is_selected).sum(s => s.balance)
    this.totalMoney = this.totalAmount + sumSealBag
  }

  public onChangeCcy() {
    this._getManagerTypeCcyList();
    this._getSealBagList();
  }

  public async onSave() {

    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    
    if (this.form.value.amount == 0) {
      this._notificationService.error('Thông báo', "Số tiền phải lớn hơn 0, Không thể ứng quỹ đầu ngày");
      return;
    }
    
    if (this.form.value.amount != this.totalAmount) {
      this._notificationService.error('Thông báo', "Số tiền ngoài BNP và cộng thành tiền phải bằng nhau");
      this.f['amount'].setValue(0);
      return;
    }

    if (new List<any>(this.availableFundsList).any(item => item.number_heal > 0  && item.available_number_heal < item.number_heal)
    || new List<any>(this.availableFundsList).any(item => item.number_torn > 0  && item.available_number_torn < item.number_torn)
    || new List<any>(this.availableFundsList).any(item => item.number_coin > 0  && item.available_number_coin < item.number_coin)) {

      return;
    }
    const request = {
      ccy: this.f.ccy.value,
      tran_type: this.f.tran_type.value,
      till_vault_id: this.f.user_id.value,
      balance: this.totalMoney,
      description: this.f.description.value,
      role_func_id: this.f.role.value,
      sealbags: this.sealBagCheck?.map(item => item.id),
      def_price_detail: this.availableFundsList
    }

    try {
      this.isLoading = true;
      const res = await this._advanceFundService.create(request)
      this.isLoading = false;
      this._notificationService.success('Thành công', 'Tạo thành công')
      this.closeFormDialog(close)
    } catch (error: any) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public checkUncheckAll() {
    for (let i = 0; i < this.sealBagList.length; i++) {
      this.sealBagList[i].is_selected = this.isChecked;
    }
    this._getCheckedItemList();
    this.sum()
  }

  public isAllSelected() {
    this.isChecked = this.sealBagList.every((item: any) => {
      return item.is_selected == true;
    })
    this._getCheckedItemList()
    this.sum()

  }

  private _getCheckedItemList() {
    this.sealBagCheck = [];
    for (let i = 0; i < this.sealBagList.length; i++) {
      if (this.sealBagList[i].is_selected)
        this.sealBagCheck.push(this.sealBagList[i])
    }
  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}
