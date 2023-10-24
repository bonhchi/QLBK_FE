import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PriceDetailComponent } from './modal/price-detail/price-detail.component';
import { PriceCreateComponent } from './modal/price-create/price-create.component';
import {  STATUS_SYSTEM } from '@app/_constant';
import { PRICE_TEMPLATE } from '@app/_constant/price';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _clone from 'lodash/clone';
import { NgxSpinnerService } from 'ngx-spinner';
import { CategoryService } from '@app/_services/category.service';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { MoneyToTextService } from '@app/_services';

@Component({
  selector: 'app-price-manager',
  templateUrl: './price-manager.component.html',
  styleUrls: ['./price-manager.component.scss']
})
export class PriceManagerComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public dialogCheckRef: any;
  public priceList: any[] = PRICE_TEMPLATE;
  public ccys: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    public moneyToTextService: MoneyToTextService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this._formControl();

    //lấy danh sách loại tiền
    this._getCcy();

    //lấy danh sách mệnh giá
    this.onSearch();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      ccy: [{ value: 'VND', disabled: false }],
    });
  }

  private async _getCcy() {
    try {
      const request = {
        active_flag: 1
      }
      this.ccys = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public async onSearch() {
    try {
      this._spinner.show();
      const request = {
        ccy: this.f["ccy"].value
      }
      this.priceList = (await this._categoryService.getTypeCcy(request)).data;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  openFormMoney(form, money) {
    if (form == 'create') {
      this.dialogCheckRef = this.dialog.open(PriceCreateComponent, {
        width: '30%',
        data: money
      });
    }
    if (form == 'detail') {
      this.dialogCheckRef = this.dialog.open(PriceDetailComponent, {
        width: '30%',
        data: money
      });
    }

    this.dialogCheckRef.afterClosed().subscribe((result) => {
      // if (result == 'detail') {

      // }
    });
  }

  public findStatus(activeFlag) {
    return _find(STATUS_SYSTEM, { 'id': activeFlag });
  }
}
