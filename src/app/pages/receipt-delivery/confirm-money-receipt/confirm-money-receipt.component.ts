import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService, MoneyToTextService, SwAlertService } from '@app/_services';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { AddMoneyReceiptComponent } from './modal/add-money-receipt/add-money-receipt.component';
import { DetailMoneyReceiptComponent } from './modal/detail-money-receipt/detail-money-receipt.component';

@Component({
  selector: 'app-confirm-money-receipt',
  templateUrl: './confirm-money-receipt.component.html',
  styleUrls: ['./confirm-money-receipt.component.scss']
})
export class ConfirmMoneyReceiptComponent implements OnInit {
  form: FormGroup;
  currentUser: User;
  isLoading = false;

  branches: any;
  status: any;

  transTypeList: any = [];
  ccyList: any = [];

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
    private _authenticationService: AuthenticationService,
    private _categoryService: CategoryService,
    private _swAlertService: SwAlertService,
    private _notificationService: NotificationService
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.formControl();
    this._getBranch();
    this._getStatus();
    this._getCategoryByCode();
  }

  // Get API
  private async _getCategoryByCode() {
    try {
      const code = 'BBGN';
      this.transTypeList = (
        await this._categoryService.getCategoryByCode(code)
      ).data;
      this.transTypeList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getBranch() {
    try {
      this.branches = (await this._categoryService.getBranch('')).data;
      this.branches.forEach((item) => {
        item.display_name = item.code + ' - ' + item.name;
      });
      this.branches.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  private async _getStatus() {
    try {
      const product_code = 'BIEN_BAN_GIAO_NHAN';
      this.status = (await this._categoryService.getStatus(product_code)).data;
      this.status.splice(0, 0, { id: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  // Handle Events
  public formControl() {
    this.form = this.formBuilder.group({
      receipt_type: [{ value: '', disabled: false }],
      receipt_spend_branch: [{ value: '', disabled: false }],
      receipt_receive_branch: [
        {
          value:
            this.currentUser.positions.branch.code != '000'
              ? this.currentUser.positions.branch.code
              : '',
          disabled:
            this.currentUser.positions.branch.code != '000' ? true : false,
        },
      ],
      receipt_date: [{ value: moment().format('DD/MM/YYYY'), disabled: false }],
      receipt_status: [{ value: '', disabled: false }],
      receipt_no: [{ value: '', disabled: false }],
    });
  }

  setPaginatorData(page: any): void {
    this.form.value.page_num = page.pageIndex;
  }

  // Handle Submits
  openForm(type: string, v: any) {
    if (type === 'Add') {
      const dialogRef = this.dialog.open(AddMoneyReceiptComponent, {
        width: '70%',
        data: {
          type: type,
        },
      });
      dialogRef.afterClosed().subscribe((result) => { });
    } else if (type === 'View') {
      const dialogRef = this.dialog.open(DetailMoneyReceiptComponent, {
        width: '70%',
        data: {
          type: type,
          data: v
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
      });
    };
  }

  onSubmit() { }

  onClearForm() {
    this.formControl();
  }
}
