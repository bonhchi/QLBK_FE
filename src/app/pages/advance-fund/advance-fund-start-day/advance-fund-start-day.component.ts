import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { ADVANCE_FUND_STATUS } from '@app/_constant';
import { Permit, User } from '@app/_models';
import * as moment from 'moment';
import _find from 'lodash/find';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService, MoneyToTextService, PermitService, SwAlertService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { ADVANCE_FUND_TYPE, ADVANCE_FUND_ROLE, WAREHOUSE_STATUS } from '@app/_constant';
import { AdvanceFundService, FccService } from '@app/_services';
import { AddAdvanceFundStartDayComponent } from './modal/add-advance-fund-start-day/add-advance-fund-start-day.component';
import { DetailAdvanceFundStartDayComponent } from './modal/detail-advance-fund-start-day/detail-advance-fund-start-day.component';
import { UpdateAdvanceFundStartDayComponent } from './modal/update-advance-fund-start-day/update-advance-fund-start-day.component';
@Component({
  selector: 'app-advance-fund-start-day',
  templateUrl: './advance-fund-start-day.component.html',
  styleUrls: ['./advance-fund-start-day.component.scss']
})
export class AdvanceFundStartDayComponent implements OnInit {
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
  public dataList: any[] = [];
  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public userList: any[] = [];
  public branchList: any[] = [];
  public listAdvanceFund: any[] = [];
  public dialogRef: any;
  public statusList: any[] = ADVANCE_FUND_STATUS;
  public ADVANCE_FUND_TYPE: any[] = ADVANCE_FUND_TYPE;
  public ADVANCE_FUND_ROLE: any[] = ADVANCE_FUND_ROLE;
  public WAREHOUSE_STATUS: any[] = WAREHOUSE_STATUS;
  
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
      created_date: [{ value: moment(new Date()).format("DD/MM/YYYY"), disabled: false }],
      status: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      branch_id: [{ value: '', disabled: false }],
      amount: [{ value: '', disabled: false }],
      balance: [{ value: '', disabled: false }],
      fcc_ref_no: [{ value: '', disabled: false }],
    });
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

  private async _getBranch() {
    try {
      this.branchList = (await this._categoryService.getBranch({})).data;
      this.branchList.splice(0, 0, { code: '', display_name: 'Tất cả' })
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onSearch() {
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
      const res = await this._advanceFundService.getList(this._getFormRequest());
        this.listAdvanceFund = res.data.result;
        this.pageEvent.length = res.data.count;
        this.isLoading = false;
        this._spinner.hide();
        if (this.listAdvanceFund.length == 0 && is_check) {
          this._notificationService.error('Thông báo', "Không tìm thấy dữ liệu");
        }
    } catch (error: any) {
      this._spinner.hide()
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private _getFormRequest() {
    const request = {
      code: this.f['code'].value,
      ccy: this.f['ccy'].value,
      branch_id: this.f['branch_id'].value,
      type: 'UNG_QUY_DAU_NGAY',
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

  public onClearForm() {
    this._formControl()
  }

  public openForm(type: string, item: any) {
    switch (type) {
      case 'DETAIL':
        this.dialogRef = this.dialog.open(DetailAdvanceFundStartDayComponent, {
          width: '70vw',
          data: { type, item, ccyList: this.ccyList,}
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          this._getList(this._getFormRequest());
        });
        break;
      case 'EDIT':
        this.dialogRef = this.dialog.open(UpdateAdvanceFundStartDayComponent, {
          width: '70vw',
          data: { type, item, ccyList: this.ccyList }
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          this._getList(this._getFormRequest());
        });
        break;
      case 'ADD':
        this.dialogRef = this.dialog.open(AddAdvanceFundStartDayComponent, {
          width: '70vw',
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          this._getList(this._getFormRequest());
        });
        break;
    }
  }

  public setPaginatorData(page: PageEvent) {
    this.pageEvent = page;
    this._getList(this._getFormRequest());
  }

  public renderDataAdvanceFund(type) {
    return (_find(ADVANCE_FUND_TYPE, { 'id': type })).name
  }

  public renderDataAdvanceRole(type:string) {
    if(type){
      return (_find(ADVANCE_FUND_ROLE, { 'id': type })).name
    }
  }

  public renderDataAdvanceStatus(status) {
    return _find(ADVANCE_FUND_STATUS, { 'code': status });
  }
}
