import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthenticationService, CategoryService, FccService, FundService, MoneyToTextService, PermitService } from '@app/_services';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { Permit, User } from '@app/_models';
import { cloneDeep } from 'lodash';
import { CREDIT_DEBIT_TRANS_USER_ROLE } from '@app/_constant';
import { UserService } from '@app/_services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgSelectComponent } from '@ng-select/ng-select';
import { List } from 'linq-typescript';
@Component({
  selector: 'app-actual-fund-branch',
  templateUrl: './actual-fund-branch.component.html',
  styleUrls: ['./actual-fund-branch.component.scss']
})
export class ActualFundBranchComponent implements OnInit {
  public currentUser: User;
  public form: FormGroup;
  public branchId: any;
  public priceList: any = [];
  public userList: any[] = [];
  public ccyList: any[] = [];
  public branchList: any[] = [];
  public denoBranchList: any = [];
  public isLoading = false;
  public isGDV = false;
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
  public userRoleList: any[] = CREDIT_DEBIT_TRANS_USER_ROLE;
  public isDisableBranchList = false;
  public isDisableUserList = false;

  @ViewChild('ngSelectTillId') ngSelectComponent: NgSelectComponent;
  constructor(
    private _formBuilder: FormBuilder,
    private _fccService: FccService,
    private _fundService: FundService,
    private _userService: UserService,
    private _spinner: NgxSpinnerService,
    public moneyToTextService: MoneyToTextService,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
    this.branchId = this.currentUser.positions.branch.id;
    this.isGDV = this.currentUser.role.some(s => { return s === 'GDV' });
    this.isDisableBranchList = this.currentUser.role.some(e => { return e === 'OTHER_USER' || e === 'ADMIN' });
    this.isDisableUserList = this.currentUser.role.some(e => { return e === 'QC' || e === 'QP' || e === 'KSV' });
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    this._getUserList();
    this._getCcy();
    this._getBranch();
    this._getDenoBranchList();
  }

  public get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      ccy: [{ value: 'VND', disabled: false }],
      branch_id: [{ value: this.currentUser.positions.branch.code, disabled: !this.isDisableBranchList }],
      role: [{ value: this.isGDV ? this.currentUser.role[0] : '', disabled: !this.isDisableUserList }],
      user_id: [{ value: this.isGDV ? this.currentUser.username.toUpperCase() : null, disabled: !this.isDisableUserList }],
      current_date: [{ value: moment().format('DD/MM/YYYY'), disabled: true }],
    });
  }

  // Get API
  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccyList = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getBranch() {
    try {
      this.branchList = (await this._categoryService.getBranch({})).data;
      this.branchList.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getUserList() {
    const request = {
      roles_fcc: [this.f.role.value],
      branch_id: this.branchId
    };
    try {
      this._spinner.show();
      this.userList = (await this._userService.getList(request)).data;
      if (this.f.role.value === '') {
        this._spinner.hide();
      }
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getDenoBranchList() {
    try {
      this.isLoading = true;
      this._spinner.show();
      const res = (await this._fundService.getDenoUserBranch(this.getFormRequest())).data;
      this.denoBranchList = res.result;
      this.priceList = this.denoBranchList.map(item => item.func_data.map(val => val.price));
      this.isLoading = false;
      this._spinner.hide();
    } catch (error) {
      this.isLoading = false;
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public getFormRequest() {
    const request = {
      branch_id: this.f.branch_id.value,
      tran_date: moment(this.f.current_date.value, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
      ccy: this.f.ccy.value,
      role_id: '',
      user_id: (this.f.user_id.value === null || this.f.user_id.value === undefined) ? '' : this.f.user_id.value
    };
    return request;
  }
  public calcTotalPrice(item: any) {
    const data = new List<any>(this.denoBranchList).selectMany<any>(f => f.func_data).where(w => w.id === item.id).sum(s => s.number);
    return data;
  }

  public calcTotalBalance() {
    const data = new List<any>(this.denoBranchList).sum(s => Number.parseFloat(s.totals));
    return data;
  }
  // Handle Events
  public async onChangeUserRole(e) {
    await this._getUserList();
    const filter = this.userList.filter(item => item.role_fcc === e.id)[0]?.user_name;
    this.f.user_id.setValue(filter);
  }

  // Handle Submits
  public async onSearch() {
    this._getDenoBranchList();
  }

  public onClearForm() {
    this._formControl();
  }

}
