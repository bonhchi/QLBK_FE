import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { Permit, User } from '@app/_models';
import { AuthenticationService, CategoryService, DeliverReceiveRecordsService, MoneyToTextService, PermitService, SwAlertService, UtilService } from '@app/_services';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import _clonceDeep from 'lodash/cloneDeep';
import { AddReceiptDeliveryComponent } from './form/add-receipt-delivery/add-receipt-delivery.component';
import { DetailReceiptDeliveryComponent } from './form/detail-receipt-delivery/detail-receipt-delivery.component';

@Component({
  selector: 'app-receipt-delivery-manage',
  templateUrl: './receipt-delivery-manage.component.html',
  styleUrls: ['./receipt-delivery-manage.component.scss']
})
export class ReceiptDeliveryManageComponent implements OnInit {
  public form: FormGroup;
  public currentUser: User;
  public isLoading = false;

  public branches: any;
  public statusList: any;

  public ccyList: any = [];
  public dataList: any = [];
  public transTypeList: any = [];
  public transTypeOrgList: any = [];

  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };

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

  public isDisableBranchList: boolean = false;

  constructor(
    public dialog: MatDialog,
    public utilService: UtilService,
    public spinner: NgxSpinnerService,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _swAlertService: SwAlertService,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
    private _deliveryService: DeliverReceiveRecordsService,
    private _spinner: NgxSpinnerService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();

    this.isDisableBranchList = this.currentUser.role.some(e => { return e == "OTHER_USER" || e == "ADMIN" });
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    this._getBranchList();
    this._getTransTypeList();
    await this._getStatusList();
    
    this.onSearch();
  }

  public get f() { return this.form.controls; }

  // Handle Events
  private _formControl() {
    this.form = this._formBuilder.group({
      receipt_type: [{ value: '', disabled: false }],
      receipt_spend_branch: [{ value: this.currentUser.positions.branch.code, disabled: !this.isDisableBranchList }],
      receipt_receive_branch: [{ value: '', disabled: false }],
      receipt_date: [{ value: moment().format('DD/MM/YYYY'), disabled: false }],
      receipt_status: [{ value: '', disabled: false }],
      receipt_code: [{ value: '', disabled: false }],
      receipt_no: [{ value: '', disabled: false }],
    });
  }
  
  // Get API
  private async _getTransTypeList() {
    try {
      const code = 'BBGN';
      this.transTypeOrgList = (await this._categoryService.getCategoryByCode(code)).data;
      this.transTypeList = _clonceDeep(this.transTypeOrgList);
      this.transTypeList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getBranchList() {
    try {
      this.branches = (await this._categoryService.getBranch('')).data;
      this.branches.forEach((item) => { item.display_name = item.code + ' - ' + item.name });
      this.branches.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private async _getStatusList() {
    try {
      const product_code = 'BIEN_BAN_GIAO_NHAN';
      this.statusList = (await this._categoryService.getStatus(product_code)).data;
      this.statusList.splice(0, 0, { id: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private _getFormRequest() {
    const request = {
      code: this.f.receipt_code.value,
      ccy: '',
      type: this.f.receipt_type.value,
      status: this.f.receipt_status.value,
      from_branch_id: this.f.receipt_spend_branch.value,
      to_branch_id: this.f.receipt_receive_branch.value,
      tran_date: moment(this.f.receipt_date.value, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
      delivery_no: this.f.receipt_no.value,
      page_size: this.pageEvent.pageSize,
      page_num: this.pageEvent.pageIndex,
    };
    return request;
  }

  private async _getList() {
    try {
      this.isLoading = true;
      this._spinner.show("ReceiptDeliveryComponent");

      const res = (await this._deliveryService.getData(this._getFormRequest())).data;
      this.dataList = res.result;
      this.pageEvent.length = res.count;

      this.isLoading = false;
      this._spinner.hide("ReceiptDeliveryComponent");
    } catch (error) {
      this.isLoading = false;
      this._spinner.hide("ReceiptDeliveryComponent");
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  setPaginatorData(page: any): void {
    this.form.value.page_num = page.pageIndex;
  }

  public getValue(code){
    return this.transTypeList.filter(item => item.code == code)[0]?.name;
  }

  // Handle Submits
  openForm(type: string, item: any) {
    if (type === 'ADD') {
      const dialogRef = this.dialog.open(AddReceiptDeliveryComponent, {
        width: '85vw',
        data: { transTypeList: this.transTypeOrgList },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'add') {
          this._getList();
        }
      });
    } else if (type === 'DETAIL') {
      const dialogRef = this.dialog.open(DetailReceiptDeliveryComponent, {
        width: '85vw',
        data: { item: _clonceDeep(item), transTypeList: this.transTypeOrgList, statusList: this.statusList }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'detail') {
          this._getList();
        }
      });
    }
  }

  public async onSearch() {
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._getList();
  }

  onClearForm() {
    this._formControl();
    this.onSearch();
  }
}
