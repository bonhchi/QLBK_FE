import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, MoneyToTextService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { UtilService } from '@app/_services/util.service';
import { WarehouseImportExportService } from '@app/_services/warehouse-import-export.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImportExportCreateComponent } from './modal/import-export-create/import-export-create.component';
import { ImportExportDetailComponent } from './modal/import-export-detail/import-export-detail.component';
import { ImportExportUpdateComponent } from './modal/import-export-update/import-export-update.component';

@Component({
  selector: 'app-import-export-warehouse',
  templateUrl: './import-export-warehouse.component.html',
  styleUrls: ['./import-export-warehouse.component.scss'],
  providers: [DatePipe],
})

export class ImportExportWarehouseComponent implements OnInit {
  public form: FormGroup;
  public currentUser: User;
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };
  public isDisableBranchList = false;

  public isLoading = false;
  public isRole: boolean;
  public dialogCheckRef: any;

  public statusList: any[] = [];
  public originalBranch: any = {};
  public categoryByCode: any[] = [];
  public branchs: any[] = [];
  public ccys: any[] = [];
  public warehouseList: any = [];

  constructor(
    public utilService: UtilService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    public spinner: NgxSpinnerService,
    private _categoryService: CategoryService,
    public moneyToTextService: MoneyToTextService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    private _warehouseImportExportService: WarehouseImportExportService,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
    this.isRole = this.currentUser.role.every(e => e == 'KSV');
    this.isDisableBranchList = this.currentUser.role.some(e => e == 'OTHER_USER' || e == 'ADMIN');
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    await this._getStatus();
    await this._getWareHouseBranch();
    await this._getCategoryByCode();
    this._getWareHouseList();
  }

  get f() { return this.form.controls; }

  // Handle Events
  private _formControl() {
    this.form = this.formBuilder.group({
      transaction_type: [{ value: '', disabled: false }],
      transaction_status: [{ value: '', disabled: false }],
      transaction_code: [{ value: '', disabled: false }],
      transaction_branch: [{ value: this.currentUser.positions.branch.code, disabled: !this.isDisableBranchList }],
      transaction_date: [{ value: moment(new Date()).format('DD/MM/YYYY'), disabled: false }],
    });
  }

  // Get API
  // Lấy ds đơn vị
  private async _getWareHouseBranch() {
    try {
      this.branchs = (await this._categoryService.getBranch('')).data;
      this.branchs.forEach((item) => {
        item.display_name = item.code + ' - ' + item.name;
      });
      this.branchs.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Lấy ds loại giao dịch
  private async _getCategoryByCode() {
    try {
      const code = 'XUAT_NHAP_KHO';
      this.categoryByCode = (
        await this._categoryService.getCategoryByCode(code)
      ).data;
      this.categoryByCode.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getStatus() {
    try {
      const product_code = 'XUAT_NHAP_KHO';
      this.statusList = (await this._categoryService.getStatus(product_code)).data;
      this.statusList.splice(0, 0, { id: '', code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private _getFormRequest() {
    const request = {
      code: this.f.transaction_code.value,
      price: 0,
      tran_type: this.f.transaction_type.value,
      status: this.f.transaction_status.value,
      created_date: '',
      page_num: this.pageEvent.pageIndex,
      page_size: this.pageEvent.pageSize,
    };
    if (this.f.transaction_date.value) {
      request.created_date = moment(this.f.transaction_date.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    return request;
  }

  public getValue(code) {
    return this.categoryByCode.filter(item => item.code === code)[0]?.name;
  }

  public getBranchValue(code) {
    return this.branchs.filter(item => item.code === code)[0]?.name;
  }

  private async _getWareHouseList() {
    try {
      this.isLoading = true;
      this.spinner.show();
      const res = (await this._warehouseImportExportService.getData(this._getFormRequest())).data;
      if (this.isRole) {
        this.warehouseList = res.result.filter(item => (item.status !== 'KHOI_TAO' && item.status !== 'DA_XOA'));
      } else {
        this.warehouseList = res.result;
      }
      this.pageEvent.length = res.count;
      if (this.warehouseList.length == 0) {
        this._notificationService.error('Thông báo', 'Không tìm thấy dữ liệu');
      }
      this.isLoading = false;
      this.spinner.hide();
    } catch (error) {
      this.isLoading = false;
      this.spinner.hide();
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  // Handle Submits
  public openModal(type: string, item: any) {
    if (type == 'Add') {
      this.dialogCheckRef = this.dialog.open(ImportExportCreateComponent, {
        width: '70%',
        data: type,
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        if (result === 'add') {
          this._getWareHouseList();
        }
      });
    }

    if (type == 'View') {
      this.dialogCheckRef = this.dialog.open(ImportExportDetailComponent, {
        width: '70%',
        data: { item, statusList: this.statusList, transType: this.categoryByCode }
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        if (result === 'detail') {
          this._getWareHouseList();
        }
      });
    }

    if (type == 'Update') {
      this.dialogCheckRef = this.dialog.open(ImportExportUpdateComponent, {
        width: '70%',
        data: { item, statusList: this.statusList }
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        if (result === 'update') {
          this._getWareHouseList();
        }
      });
    }
  }

  public onClearForm() {
    this._formControl();
    this.onSubmit();
  }

  public async onSubmit() {
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._getWareHouseList();
  }

  public setPaginatorData(page) {
    this.pageEvent = page;
    this._getWareHouseList();
  }
}
