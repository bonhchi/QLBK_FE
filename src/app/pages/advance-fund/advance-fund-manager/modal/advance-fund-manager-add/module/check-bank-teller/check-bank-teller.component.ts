import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { AuthenticationService, CategoryService } from '@app/_services';
import * as moment from 'moment';
import { AllocateService } from '@app/_services/allocate.service';
import {TYPE_ROLE_RESERVE_FUND} from '@app/_constant';
import { User } from '@app/_models';
import _filter from 'lodash/filter';
import _find from 'lodash/find';
@Component({
  selector: 'app-check-bank-teller',
  templateUrl: './check-bank-teller.component.html',
  styleUrls: ['./check-bank-teller.component.scss']
})

export class CheckBankTellerComponent implements OnInit {
  @Output() catchDataMoneys = new EventEmitter<Object>();
  @Output() catchDataRole = new EventEmitter<String>();
  @Input() ccys: any[] = [];

  public form: FormGroup;
  public currentUser: User;
  public moneys: any[] = [];
  public users: any[] = [];
  public cloneCcys: any[] = [];
  public TYPE_ROLE_RESERVE_FUND = TYPE_ROLE_RESERVE_FUND;

  constructor(
    private _notificationService: NotificationService,
    private _allocateService: AllocateService,
    private _authenticationService: AuthenticationService,
    private _formBuilder: FormBuilder,
    private _categoryService: CategoryService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  public async ngOnInit() {
    this._formControl();
  }
  ngOnChanges() {
    if (this.ccys.length > 0 && this.cloneCcys != this.ccys) {
      this._fetchAndGroupData();
    }
  }
  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      branch_id: [{ value: this.currentUser.positions.branch.display_name, disabled: true }],
      created_date: [{ value: 'Hôm nay - ' + moment().format('DD/MM/YYYY'), disabled: true }],
      ccy: [{ value: ['VND'], disabled: false }, Validators.required],
      role_func_id: [{ value: TYPE_ROLE_RESERVE_FUND[0].id, disabled: false }],
    });
  }

  private async _fetchAndGroupData() {
    const ccySelectedList = this.ccys.filter(f => { return this.f["ccy"].value.includes(f.code) }).map((m, index) => {
      return {
        id: m.code,
        name: m.name,
        input: 0
      }
    });
    let moneys = await this._fetchMoney(ccySelectedList);
    let users = await this._fetchBankTeller(this.f.ccy.value);
    //CCYS = ['CCY':[USERS':[MONEYS:[]
    users.map((user) => {
      let money = _find(moneys, function (data) { return data.name == user.ccy });
      user.money_delivery = 0;
      user.money_receive = 0;
      user.moneys = money.value;
    });

    moneys.map((money) => {
      return money.users = _filter(users, function (data) { return data.ccy == money.name });
    });
    this.catchDataMoneys.emit(moneys);
  }
  private countTotal(moneys) {
    let total = 0
    moneys.map((money) => {
      total += money.price * (money.available_number_coin + money.available_number_torn + money.available_number_heal)
    })
    return total;
  }
  private async _fetchMoney(ccys) {
    try {
      await Promise.all(
        ccys.map(async (ccy, index) => {
          ccy.ccy = ccy.name;
          ccy.value = (await this._categoryService.getManagerType({ 'Ccy': ccy.name })).data;
          ccy.total = this.countTotal(ccy.value);
        })
      )
      return ccys;
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _fetchBankTeller(ccys: string[]) {
    try {
      const request = {
        assigned_id: this.currentUser.username,
        ccy: ccys
      };
      this.users = (await this._allocateService.getInfoAllocateUser(request)).data;
      return _filter(this.users, { 'heal_flag': 'Y', 'till_status': 'OPEN' });;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public changeCcy() {
    this._fetchAndGroupData();
  }

  public changeRole() {
    this.catchDataRole.emit(this.f.role_func_id.value);
  }

  public onSubmit() {

  }

}
