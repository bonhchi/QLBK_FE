import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MoneyDetailComponent } from './modal/money-detail/money-detail.component';
import { MoneyCreateComponent } from './modal/money-create/money-create.component';
import {  STATUS_SYSTEM } from '@app/_constant';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _clone from 'lodash/clone';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CategoryService } from '@app/_services/category.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-money-manager',
  templateUrl: './money-manager.component.html',
  styleUrls: ['./money-manager.component.scss']
})
export class MoneyManagerComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public dialogCheckRef: any;
  // public moneyListOrigin: any[] = MONEY_TEMPLATE;
  public moneyList: any[] = [];

  constructor(
    // private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // this._formControl();

    this._getCcy();
  }

  private async _getCcy() {
    try {
      this._spinner.show();
      const request = {}
      this.moneyList = (await this._categoryService.getCcy(request)).data;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  // get f() { return this.form.controls; }

  // public onSearch() {
  //   let input = (this.f.name.value).toLowerCase();
  //   let moneyFilter = _filter(_clone(this.moneyListOrigin), function (money) {
  //     let moneyName = money.name.toLowerCase()
  //     if (moneyName.includes(input)) {
  //       return true;
  //     }
  //   });
  //   this.moneyList = moneyFilter;
  // }
  
  // _formControl() {
  //   this.form = this._formBuilder.group({
  //     name: [{ value: '', disabled: false }],
  //   });
  // }

  // public resetFilter() {
  //   this.moneyList = this.moneyListOrigin;
  //   this.form.reset();
  // }

  openFormMoney(form, money) {
    if (form == 'create') {
      this.dialogCheckRef = this.dialog.open(MoneyCreateComponent, {
        width: '30%',
        data: money
      });
    }

    if (form == 'detail') {
      this.dialogCheckRef = this.dialog.open(MoneyDetailComponent, {
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
