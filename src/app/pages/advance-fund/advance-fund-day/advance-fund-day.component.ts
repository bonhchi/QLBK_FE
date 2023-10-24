import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { Permit, User } from '@app/_models';
import * as moment from 'moment';
import _find from 'lodash/find';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService, MoneyToTextService, PermitService } from '@app/_services';
import { ADVANCE_FUND_TYPE, ADVANCE_FUND_ROLE, WAREHOUSE_STATUS, ADVANCE_FUND_DAY_TYPE, ADVANCE_FUND_STATUS } from '@app/_constant';
import { AdvanceFundService, FccService, CategoryService } from '@app/_services';
import {AdvanceFunDayDetailComponent} from './modal/advance-fun-day-detail/advance-fun-day-detail.component';
import {AdvanceFundDayAddComponent} from './modal/advance-fund-day-add/advance-fund-day-add.component';
@Component({
  selector: 'app-advance-fund-day',
  templateUrl: './advance-fund-day.component.html',
  styleUrls: ['./advance-fund-day.component.scss']
})
export class AdvanceFundDayComponent implements OnInit {
public currentUser: User;
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  public form: FormGroup;
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
  public ccyList: any[] = [];
  public transaction_type: any[] = ADVANCE_FUND_DAY_TYPE;
  public branchList: any[] = [];
  public listAdvanceFund: any[] = [];
  public dialogRef: any;
  public ADVANCE_FUND_TYPE: any[] = ADVANCE_FUND_TYPE;
  public ADVANCE_FUND_ROLE: any[] = ADVANCE_FUND_ROLE;
  public ADVANCE_FUND_STATUS: any[] = ADVANCE_FUND_STATUS;
  public WAREHOUSE_STATUS: any[] = WAREHOUSE_STATUS;
  public minDate = new Date();

  constructor(
  	public _moneyToTextService: MoneyToTextService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
    private _advanceFundService: AdvanceFundService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
  }

  ngOnInit(): void {
    this._formControl();
    this._getCcy();
    this._getBranch();
    this._getList(this._getFormRequest());
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      code: [{ value: '', disabled: false }],
      type: [{ value: '', disabled: false }],
      created_date: [{ value: moment(new Date()).format("DD/MM/YYYY"), disabled: false }],
      status: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      branch_id: [{ value: '', disabled: false }],
      fcc_func_id: [{ value: '', disabled: false }],
      balance: [{ value: '', disabled: false }],
      fcc_ref_no: [{ value: '', disabled: false }],
    });
  }

  private _getFormRequest() {
    const request = {
      code: this.f['code'].value,
      type: this.f['type'].value,
      status: this.f['status'].value,
      ccy: this.f['ccy'].value,
      branch_id: this.f['branch_id'].value,
      fcc_func_id: this.f['fcc_func_id'].value,
      balance: this.f['balance'].value,
      fcc_ref_no: this.f['fcc_ref_no'].value,
      page_num: this.pageEvent.pageIndex,
      page_size: this.pageEvent.pageSize,
      created_date: ''
    }
    if(this.f["created_date"].value){
      request.created_date = moment(this.f["created_date"].value, 'DD/MM/YYYY').format("YYYY-MM-DD")
    }
    return request;
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

  
  private async _getTranType() {
    this.transaction_type = ADVANCE_FUND_DAY_TYPE;

  }
  private async _getBranch() {
    try {
      this.branchList = (await this._categoryService.getBranch({})).data;
      this.branchList.splice(0, 0, {id:'', code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public  onSearch() {
    if (this.form.invalid) {
      return;
    }
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._getList(this._getFormRequest(),true);
  }

  private async _getList(request: any,is_check?:boolean) {
    try {
      this.isLoading = true;
      this._spinner.show();
      const res: any = (await this._advanceFundService.getList(request)).data;
      this.listAdvanceFund = res.result;
      this.pageEvent.length = res.count;
      if (this.listAdvanceFund.length == 0 && is_check) {
        this._notificationService.error('Thông báo', "Không tìm thấy dữ liệu");
      } 

      this.isLoading = false;
      this._spinner.hide();
    } catch (error: any) {
      this._spinner.hide()
      this.isLoading = false;
      this.listAdvanceFund = [];
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onClearForm() {
    this._formControl()
    this._getList(this._getFormRequest());  
  }

  public openForm(type: string, item: any) {
    switch (type) {
      case 'DETAIL':
        this.dialogRef = this.dialog.open(AdvanceFunDayDetailComponent, {
          width: '70vw',
          data: {
            transaction_types: this.transaction_type,
            transaction_roles: ADVANCE_FUND_ROLE,
            item
          }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if(result == 'detail') {
            this._getList(this._getFormRequest());
          }
        });
        break;
      case 'ADD':
        this.dialogRef = this.dialog.open(AdvanceFundDayAddComponent, {
          width: '70vw',
          // minHeight:'60vh',
          data: {
            transaction_types: this.transaction_type,
            transaction_roles: ADVANCE_FUND_ROLE,
            ccys: this.ccyList,
            item
          }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if(result == 'add') {
            this._getList(this._getFormRequest());
          }
        });
        break;
    }
  }

  public setPaginatorData(page: PageEvent) {
    this.pageEvent = page;
    this._getList(this._getFormRequest());
  }
  public renderDataAdvanceFund(type){
    return (_find(ADVANCE_FUND_TYPE, { 'id': type })).name
  }
  public renderDataAdvanceRole(type){
    if(type){
      return (_find(ADVANCE_FUND_ROLE, { 'id': type })).name
    }
  }
  public renderDataAdvanceStatus(status) {
    return _find(ADVANCE_FUND_STATUS, { 'code': status });
  }
}
