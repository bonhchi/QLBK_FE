import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE, CREDIT_DEBIT_TRANS_TYPE_CODE } from '@app/_constant';
import { Permit, User } from '@app/_models';
import { AuthenticationService, MoneyToTextService, PermitService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { CreditDebitTransService } from '@app/_services/credit-debit-trans.service';
import { UserService } from '@app/_services/user.service';
import { UtilService } from '@app/_services/util.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddCreditDebitTransComponent } from './form/add-credit-debit-trans/add-credit-debit-trans.component';
import { DetailCreditDebitTransComponent } from './form/detail-credit-debit-trans/detail-credit-debit-trans.component';
import { UpdateCreditDebitTransComponent } from './form/update-credit-debit-trans/update-credit-debit-trans.component';
import _clonceDeep from 'lodash/cloneDeep';

@Component({
  selector: 'app-credit-debit-trans',
  templateUrl: './credit-debit-trans.component.html',
  styleUrls: ['./credit-debit-trans.component.scss']
})
export class CreditDebitTransComponent implements OnInit {
  public currentUser: User;
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  public form: FormGroup;
  public isDisableBranchList: boolean = false;
  public isDisableUserList: boolean = false;
  public isLoading: boolean = false;
  public isLoadingAdd: boolean = false;
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
  public dataList: any[] = [];
  public branchList: any[] = [];
  public userList: any[] = [];
  public statementTypeList: any[] = [];
  public statementTypeOrgList: any[] = [];
  public ccyList: any[] = [];
  public ccyOrgList: any[] = [];
  public statusList: any[] = [];
  public dialogRef: any;
  public currentDate: Date = new Date();
  public isCurrentDate: boolean = false;
  
  constructor(
    public utilService: UtilService,
    public dialog: MatDialog,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
    private _creditDebitTransService: CreditDebitTransService,
    private _userService: UserService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
    this.isDisableBranchList = this.currentUser.role.some(e => { return e == 'OTHER_USER' || e == 'ADMIN' });
    this.isDisableUserList = this.currentUser.role.some(e => { return e == 'QC' || e == 'QP' || e == 'KSV' || e == 'OTHER_USER' || e == 'ADMIN' });
  }

  async ngOnInit() {
    this._formControl();

    this._getCcy();
    this._getCategoryByCode();
    this._getBranchList();
    this._getUserList();
    await this._getStatusList();

    this.onSearch();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_type: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      status: [{ value: '', disabled: false }],
      code: [{ value: '', disabled: false }],
      tran_ref_fcc: [{ value: '', disabled: false }],
      cif: [{ value: '', disabled: false }],
      branch_id: [{ value: this.currentUser.positions.branch.code, disabled: !this.isDisableBranchList }],
      user_name: [{ value: this.currentUser.username.toUpperCase(), disabled: !this.isDisableUserList }],
      created_date: [{ value: moment(new Date()).format("DD/MM/YYYY"), disabled: false }]
    });

    this.f["branch_id"].valueChanges.subscribe(s => {
      this._getUserList();      
      this.f["user_name"].setValue("");
    })
  }

  // Lấy danh sách loại tiền
  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccyOrgList = (await this._categoryService.getCcy(request)).data;
      this.ccyList = _clonceDeep(this.ccyOrgList);
      this.ccyList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  // Lấy danh sách loại giao dịch
  private async _getCategoryByCode() {
    try {
      const code = 'BANG_KE';
      this.statementTypeOrgList = (await this._categoryService.getCategoryByCode(code)).data;
      this.statementTypeList = _clonceDeep(this.statementTypeOrgList);
      this.statementTypeList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  // Lấy danh sách đơn vị
  private async _getBranchList() {
    try {
      const request = {
        active_flag: 1
      }
      this.branchList = (await this._categoryService.getBranch(request)).data;
      // this.branchList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getStatusList() {
    try {
      const code = 'BANG_KE';
      this.statusList = (await this._categoryService.getStatus(code)).data;
      this.statusList.splice(0, 0, { id: '', code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getUserList() {
    try {
      const request = {
        roles_fcc: ["GDV", "QP", "QC"],
        branch_id: this.f["branch_id"].value,
        active_flag: 1
      };
      this.userList = [];
      this.userList = (await this._userService.getList(request)).data;
      this.userList.splice(0, 0, { user_name: '', display_name: 'Tất cả', display_role_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public async onSearch() {
    if (this.form.invalid) {
      return;
    }
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    await this._getList(this._getFormRequest());
  }

  private async _getList(request: any) {
    try {
      this.dataList = [];
      this.isLoading = true;
      this._spinner.show("CreditDebitTransComponent");

      const res: any = (await this._creditDebitTransService.getList(request)).data;
      this.dataList = res.result;
      this.pageEvent.length = res.count;
      if (this.dataList.length == 0) {
        this._notificationService.error('Thông báo', "Không tìm thấy dữ liệu");
      } 

      this.isLoading = false;
      this._spinner.hide("CreditDebitTransComponent");
    } catch (error: any) {
      this._spinner.hide("CreditDebitTransComponent")
      this.isLoading = false;
      this.dataList = [];
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private _getFormRequest() {
    const request = {
      tran_type: this.f['tran_type'].value == null ? '' : this.f['tran_type'].value,
      ccy: this.f['ccy'].value == null ? '' : this.f['ccy'].value,
      status: this.f['status'].value == null ? '' : this.f['status'].value,
      code: this.f['code'].value == null ? '' : this.f['code'].value,
      tran_ref_fcc: this.f['tran_ref_fcc'].value == null ? '' : this.f['tran_ref_fcc'].value,
      cif: this.f['cif'].value == null ? '' : this.f['cif'].value,
      branch_id: this.f["branch_id"].value == null ? '' : this.f["branch_id"].value,
      user_name: this.f['user_name'].value == null ? '' : this.f['user_name'].value,
      created_date: moment(this.f["created_date"].value, 'DD/MM/YYYY').format("YYYY-MM-DD") || null,
      page_num: this.pageEvent.pageIndex,
      page_size: this.pageEvent.pageSize
    }
    return request;
  }

  public onClearForm() {
    this._formControl();
    this.onSearch();
  }

  public openForm(type: string, item: any) {
    const itemDetail = _clonceDeep(item);
    switch (type) {
      case 'DETAIL':
        this.dialogRef = this.dialog.open(DetailCreditDebitTransComponent, {
          width: '80vw',
          data: { item: itemDetail, statusList: this.statusList, statementTypeList: this.statementTypeOrgList }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if (result == 'detail') {
            this._getList(this._getFormRequest());
          }
        });
        break;
      case 'ADD':
        this.dialogRef = this.dialog.open(AddCreditDebitTransComponent, {
          width: '80vw',
          data: { ccyList: this.ccyOrgList, statementTypeList: this.statementTypeOrgList }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if (result == 'add') {
            this._getList(this._getFormRequest());
          }
        });
        break;
      case 'UPDATE':
        this.dialogRef = this.dialog.open(UpdateCreditDebitTransComponent, {
          width: '80vw',
          data: { item: itemDetail, statusList: this.statusList }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if (result == 'update') {
            this._getList(this._getFormRequest());
          }
        });
        break;
      default:
        break;
    }
  }

  public getNameStatementType(code: string) {
    const result = new List<any>(this.statementTypeList).where(w => w.code == code).toArray()[0];
    return result.name;
  }

  public renderStatusClass(status: string) {
    const result = new List<any>(this.statusList).where(w => w.code == status).toArray()[0];
    return result;
  }

  public checkShowEdit(item: any) {
    let isCheck = false;
    const makerAt = moment(item.maker_at).format("YYYY-MM-DD");
    const curDate = moment(this.currentDate).format("YYYY-MM-DD");
    this.isCurrentDate = moment(curDate).isSame(makerAt);
    if(item.status == CREDIT_DEBIT_TRANS_CHECK_STATUS_CODE.CHO_XAC_NHAN && this.isCurrentDate) {
      if(item.tran_type == CREDIT_DEBIT_TRANS_TYPE_CODE.CAN_TRU) {
        isCheck = new List<any>(item.tran_credit).any(a => a.func_id == "" || a.func_id == null) || new List<any>(item.tran_debit).any(a => a.func_id == "" || a.func_id == null);
      } else {
        if(item.tran_credit.length > 0) {
          isCheck = new List<any>(item.tran_credit).any(a => a.func_id == "" || a.func_id == null);
        }

        if(item.tran_debit.length > 0) {
          isCheck = new List<any>(item.tran_debit).any(a => a.func_id == "" || a.func_id == null);
        }
      }
    }

    return isCheck;
  }

  public setPaginatorData(page: PageEvent) {
    this.pageEvent = page;
    this._getList(this._getFormRequest());
  }
}
