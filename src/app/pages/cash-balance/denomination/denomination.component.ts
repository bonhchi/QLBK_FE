import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { STATUSDENOMINATION, NOTIFICATION } from '@app/_constant';
import { User } from '@app/_models';
import {
  AuthenticationService,
  AuthService,
  CCYService,
  DenominationService,
  MoneyToTextService,
  SwAlertService,
} from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { DenominationModalDetailComponent } from './denomination-modal-detail/denomination-modal-detail.component';
import { DenominationModalUpdateComponent } from './denomination-modal-update/denomination-modal-update.component';
import { DenominationModalComponent } from './denomination-modal/denomination-modal.component';
@Component({
  selector: 'app-denomination',
  templateUrl: './denomination.component.html',
  styleUrls: ['./denomination.component.scss'],
  providers: [DatePipe],
})
export class DenominationComponent implements OnInit {
  form: FormGroup;
  currentUser: User;
  currentDate: Date = new Date();

  isLoading = false;
  isCurrentDate = true;
  isLoadingSearch = false;

  public date: any;
  public day_before: any;
  public totalRow: any;
  public dialogCheckRef: any;
  public listTransType: any[] = [];
  public listCurrency: any = [];
  public listStatus: any = [];
  public listDenomination: any = [];

  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };

  constructor(
    public dialog: MatDialog,
    public moneyToText: MoneyToTextService,
    public spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _authenticationService: AuthenticationService,
    private _categoryService: CategoryService,
    private _swAlertService: SwAlertService,
    private _denominationService: DenominationService,
    private _notificationService: NotificationService
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.date = moment(this.currentDate).format('YYYY-MM-DD');
    this.listStatus = STATUSDENOMINATION;
    this._formControl();
    this._getCcy();
    this._getStatus();
    this._getCategoryByCode();
    this.getListDenomination();
  }

  get f() {
    return this.form.controls;
  }

  private _formControl() {
    this.form = this.formBuilder.group({
      denominationType: [{ value: '', disabled: false }],
      denominationCcy: [{ value: '', disabled: false }],
      denominationStatus: [{ value: '', disabled: false }],
      denominationBalance: [{ value: null, disabled: false }],
      denominationCode: [{ value: '', disabled: false }],
      userId: [{ value: this.currentUser.username, disabled: true }],
      denominationDate: [
        { value: moment(new Date()).format('DD/MM/YYYY'), disabled: false },
      ],
    });
  }

  // Get API
  // Lấy danh sách loại tiền
  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.listCurrency = (await this._categoryService.getCcy(request)).data;
      this.listCurrency.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Lấy danh sách loại giao dịch
  private async _getCategoryByCode() {
    try {
      const code = 'DOI_MENH_GIA';
      this.listTransType = (
        await this._categoryService.getCategoryByCode(code)
      ).data;
      this.listTransType.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getStatus() {
    try {
      const code = 'DOI_MENH_GIA';
      this.listStatus = (await this._categoryService.getStatus(code)).data;
      this.listStatus.splice(0, 0, { id: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public async getListDenomination() {
    try {
      this.isLoadingSearch = true;
      this.spinner.show();
      const res = (
        await this._denominationService.getData(this._getFormRequest())
      ).data;
      this.listDenomination = res.result;
      this.pageEvent.length = res.count;
      if (this.listDenomination.length == 0) {
        this._notificationService.error('Thông báo', 'Không tìm thấy dữ liệu');
      }
      this.isLoadingSearch = false;
      this.spinner.hide();
    } catch (error) {
      this.isLoadingSearch = false;
      this.spinner.hide();
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Handle Events
  private _getFormRequest() {
    const request = {
      code: this.f.denominationCode.value,
      price:
        this.f.denominationBalance.value == null
          ? ''
          : this.f.denominationBalance.value,
      ccy: this.f.denominationCcy.value,
      status: this.f.denominationStatus.value,
      created_date: '',
      page_size: this.pageEvent.pageSize,
      page_num: this.pageEvent.pageIndex,
      type: this.f.denominationType.value,
    };
    if (this.f.denominationDate.value) {
      request.created_date = moment(
        this.f.denominationDate.value,
        'DD/MM/YYYY'
      ).format('YYYY-MM-DD');
    }
    return request;
  }

  public getDateCompare(e) {
    this.day_before = moment(e).format('YYYY-MM-DD');
    if (this.date != this.day_before) {
      this.isCurrentDate = false;
    } else {
      this.isCurrentDate = true;
    }
    this.getListDenomination();
  }

  public getValue(code) {
    return this.listTransType.filter((item) => item.code === code)[0]?.name;
  }

  setPaginatorData(page: any): void {
    this.pageEvent = page;
    this.getListDenomination();
  }

  // Handle Submits
  onSubmit() {
    this.getListDenomination();
  }

  openForm(type: string, v: any) {
    if (type === 'Add') {
      this.dialogCheckRef = this.dialog.open(DenominationModalComponent, {
        width: '70%',
        data: {
          item: v,
          type: type,
          listCurrency: this.listCurrency,
          typeAumont: this.listTransType,
        },
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        if (result === 'close_create') {
          this.getListDenomination();
        } else {
          this.getListDenomination().then((rs) => {
              this.openForm('View', this.listDenomination[0]);
            });
        }
      });
    } if (type === 'View') {
      this.dialogCheckRef = this.dialog.open(DenominationModalDetailComponent, {
        width: '70%',
        data: {
          item: v,
          type: type,
          listCurrency: this.listCurrency,
          typeAumont: this.listTransType,
        },
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        this.getListDenomination();
      });
    }
  }

  public onDelete(id: string) {
    try {
      this._swAlertService.withConfirmation(
        NOTIFICATION,
        'Anh/Chị có muốn xóa dữ liệu này không?',
        async () => {
          const res = await this._denominationService.delete(id);
          this._swAlertService.success(
            NOTIFICATION,
            'Dữ liệu đã được xóa thành công!'
          );
          this.getListDenomination();
        },
        () => {}
      );
    } catch (error: any) {
      this._swAlertService.error('Thông báo', error.error.message);
    }
  }

  onClearForm() {
    this._formControl();
  }
}
