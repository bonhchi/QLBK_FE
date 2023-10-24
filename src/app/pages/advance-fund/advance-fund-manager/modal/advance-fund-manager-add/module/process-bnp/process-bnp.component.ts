import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CategoryService, MoneyToTextService, UtilService, } from '@app/_services';
import _ from 'lodash';
@Component({
  selector: 'app-process-bnp',
  templateUrl: './process-bnp.component.html',
  styleUrls: ['./process-bnp.component.scss'],
})

export class ProcessBnpComponent implements OnInit {
  @Input() ccys: any[] = [];
  @Input() dataBNP: any[] = [];
  @Input() dataMoney: any[] = [];
  @Input() originDataMoney: any[] = [];
  @Output() catchResultData = new EventEmitter<Object>();
  
  public submitted:boolean = false;
  public form: FormGroup;
  public cloneDataMoney = [];
  public cloneMoneyFund = [];
  public cloneMoneyFundWhenSubmit = [];
  public cloneCCys = [];
  constructor(
    private formBuilder: FormBuilder,
    private _utilService: UtilService,
    private _notificationService: NotificationService,
    public moneyToText: MoneyToTextService,
  ) {
  }
  ngOnInit(): void {
    this._formControl(['VND'])
  }
  ngOnChanges(){
    if(this.dataMoney.length > 0 && this.cloneDataMoney != this.dataMoney){
      let initData = JSON.parse(JSON.stringify(this.dataMoney))
      this.cloneDataMoney = initData;
      this.cloneMoneyFund = initData;
    }
    if(this.ccys.length > 0 && this.cloneCCys != this.ccys){
      this.cloneCCys = this.ccys;
      this._formControl(this.ccys);
    }
  }
  public _formControl(ccys) {
    let formGroupCCy = {};
    ccys.map((ccy) => {
      formGroupCCy = {...formGroupCCy,...{[ccy.name]: [{ value: '', disabled: false }]}}
    })
    this.form = this.formBuilder.group(formGroupCCy);
  }
  get f() { return this.form.controls; }
  public checkDivisor(){
    let checkDivisor = true;
    let checkInput = true;
    let checkMoneyReceive = true;
    let countUser = this.cloneDataMoney[0].users.length;
    this.cloneDataMoney.map((money)=>{
      if(money.input *1 % countUser > 0){
        checkDivisor = false;
      }
      if(money.input > money.total){
        checkInput = false;
      }
    })
    if(!checkDivisor){
      this._notificationService.error('Thông báo', 'Số tiền chia bị lẻ');
      return false
    }
    if(!checkInput){
      this._notificationService.error('Thông báo', 'Số tiền phân bổ vượt quá số tiền hiện có');
      return false
    }
    // if(!checkMoneyReceive){
    //   this._notificationService.info('Thông báo', 'Không đủ số tờ mệnh giá, số tiền thực tế bị thấp hơn');
    // }
    return true;
  }
  public async clearForm(){
    this.cloneDataMoney = JSON.parse(JSON.stringify(this.dataMoney));
    this.onSubmit();
    this.catchResultData.emit([]);
    this.submitted = false;
  }
  public countTotalMoneyReceive(moneys){
    let total = 0;
    moneys.map((money)=>{
      total += money.price * (money.number_heal + money.number_torn + money.number_coin);
    })
    return total;
  }
  public async onSubmit() {
    let checkValidation = this.checkDivisor();
    if(checkValidation){
      let initData  = JSON.parse(JSON.stringify(this.dataMoney))
      let moneyProcess  = initData;
      let moneyFund  = initData;

      let countUser = moneyProcess[0].users.length;
       moneyProcess.forEach((money, indexMoney) => {
         money.users.forEach((user, index)=>{
          money.input = (_.find(this.cloneDataMoney, function(o) { return o.name == money.name; })).input * 1;
          user.money_delivery = money.input * 1 / countUser;
          let autoStatementProcessBNP = this._utilService.autoStatementProcessBNP(user.money_delivery, user.moneys, moneyFund[indexMoney].value);
          user.moneys = autoStatementProcessBNP.datas;
          moneyFund[indexMoney].value = autoStatementProcessBNP.moneyFund;
          user.money_receive = this.countTotalMoneyReceive(user.moneys);

        })
      })
      moneyProcess.forEach((money, indexMoney) => {
        money.value = moneyFund[indexMoney].value;
      })
      this.cloneDataMoney =  JSON.parse(JSON.stringify(moneyProcess));
      this.cloneMoneyFundWhenSubmit =  JSON.parse(JSON.stringify(moneyProcess));
      this.submitted = true;
      this.catchResultData.emit(moneyProcess);
    }
    if(!checkValidation){
      this.submitted = false;
      this.catchResultData.emit([]);
    }
  }
  public changeNumberHeal(input, originData, indexCcy, indexUser, indexMoney){
    let originNumberHeal = this.cloneDataMoney[indexCcy].users[indexUser].moneys[indexMoney].available_number_heal;
    let totalCurrentNumberHeal = 0
     this.cloneDataMoney[indexCcy].users.map((user)=>{
      totalCurrentNumberHeal += user.moneys[indexMoney].number_heal;
    });
    if(originNumberHeal >= totalCurrentNumberHeal && input.target.value * 1 >= 0){
      this.cloneDataMoney[indexCcy].users[indexUser].moneys[indexMoney].number_heal = input.target.value * 1;
      this.cloneDataMoney[indexCcy].users[indexUser].money_receive = this.countTotalMoneyReceive(this.cloneDataMoney[indexCcy].users[indexUser].moneys);
      this.cloneDataMoney[indexCcy].value[indexMoney].available_number_heal = originNumberHeal - totalCurrentNumberHeal;
      this._notificationService.info('Thông báo', 'Đã cập nhật số tờ');
    }
    else{
      this.cloneDataMoney[indexCcy].users[indexUser].moneys[indexMoney].number_heal = this.cloneMoneyFundWhenSubmit[indexCcy].users[indexUser].moneys[indexMoney].number_heal;
      this.cloneDataMoney[indexCcy].users[indexUser].money_receive = this.countTotalMoneyReceive(this.cloneMoneyFundWhenSubmit[indexCcy].users[indexUser].moneys);
      this.cloneDataMoney[indexCcy].value[indexMoney].available_number_heal = this.cloneMoneyFundWhenSubmit[indexCcy].value[indexMoney].available_number_heal;
      this._notificationService.error('Thông báo', 'Kiểm tra nhập liệu số tờ trong tồn quỹ');
    }
    this.catchResultData.emit(this.cloneDataMoney);
  }
  public async autoNumber(amount, listMoney) {
    try {
      const res = await this._utilService.autoStatement(amount, listMoney)
      return res
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  checkDisabledInputTorn(data){
    if(!this.submitted){
      return true
    }
    if(this.submitted && data.ccy === 'VND' && data.price > 5000){
      return true
    }
    return false
  }
}
