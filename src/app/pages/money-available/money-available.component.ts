import { Component, Inject, OnInit } from '@angular/core';
import {  MoneyToTextService, CategoryService, FundService, AuthenticationService } from '@app/_services/index';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TRANSACTION_TYPE } from '@app/_constant/index';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models/user';
@Component({
  selector: 'app-money-available',
  templateUrl: './money-available.component.html',
  styleUrls: ['./money-available.component.scss']
})
export class MoneyAvailableComponent implements OnInit {
  public currentUser: User;
  public form!: FormGroup;
  public system_id: any = [];
  public ccys: any [] = [];
  public isChecked: boolean = false;
  public moneyAvailable :any[]  = []
  public moneyAvailableType :any[]  = [
    {id:'COM_HOLD', name:'Thực tế'},
    {id:'COM', name:'Khả dụng'},
    {id: 'HOLD', name:'Hold'}
  ]
  public total = 0;
  public isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogCheckRef: MatDialogRef<MoneyAvailableComponent>,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    private _fundService: FundService,
    public moneyToText: MoneyToTextService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this._formControl();
    this._fetchCCYS();
    this._fetchMoneyAvailable();
    this._fetchSystemType();
  }

  private _formControl() {
    this.form = this.formBuilder.group({
      ccy: [{ value: 'VND', disabled: false }],
      status: [{ value: this.moneyAvailableType[0].id,  disabled: false }],
      system_id: [{ value: "",  disabled: false }]
    });
  }

  get f() { return this.form.controls; }

  private _fetchSystemType(){
    this.system_id = TRANSACTION_TYPE
  // try {
    //   this.ccys = (await this._categoryService.getCcy({})).data;
    // } catch (error: any) {
    //   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    // }
  }

  

  private async _fetchMoneyAvailable(){
    let request = {
      user_id : this.currentUser.username.toUpperCase(),
      branch_id: this.currentUser.positions.branch.id,
      status: this.f.status.value,
      ccy: this.f.ccy.value,
      system_id: this.f.system_id.value,
      tran_type:""
    }
    this.isLoading = true;
    try {
      this.moneyAvailable = (await this._fundService.getCurrentFund(request)).data.result;
      let total = 0;
      this.moneyAvailable.map((money)=>{
        money.total = money.price * (money.number_heal + money.number_torn + money.number_coin)
        total+= money.total;
      })
      this.total = total;
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _fetchCCYS() {
    try {
      this.ccys = (await this._categoryService.getCcy({})).data;
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  
  public async onSubmit(){
    this._fetchMoneyAvailable();
  }

  public closeFormDialog(close){
    this.dialogCheckRef.close(close);
  }

}
