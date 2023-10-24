import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import {MoneyToTextService, AllocateService} from '@app/_services'
@Component({
  selector: 'app-check-bnp',
  templateUrl: './check-bnp.component.html',
  styleUrls: ['./check-bnp.component.scss']
})
export class CheckBnpComponent implements OnInit {
  @Output() catchDataBNP = new EventEmitter<Object>();
  @Input() dataMoney: any[] = [];
  @Input() user:any;
  public bnp: any = [];
  public cloneDataMoney: any = [];
  constructor(
    private _notificationService: NotificationService,
    private _allocateService: AllocateService,
    public moneyToTextService: MoneyToTextService,
  ) {
  }
  ngOnChanges(){
    if(this.dataMoney.length > 0 && this.dataMoney != this.cloneDataMoney){
      let ccys = [];
      this.dataMoney.map((money)=>{
        ccys.push(money.ccy)
      })
      this._fetchBNP(ccys)
    }
  }
  public ngOnInit(): void {

  }
  
  private async _fetchBNP(ccys: string[]){
    try{
      let request = {
        ccy: ccys,
        assigned_id: this.user.username
      }
      this.bnp = (await this._allocateService.getInfoAllocateSealbag(request)).data;

      let dataReturn = this.bnp.map((bnp)=>{
        bnp.id = bnp.seal_bag_id;
        bnp.assigned_id = bnp.received_assign_id;
        bnp.balance = bnp.seal_bag_balance;
        return bnp
      })
      this.catchDataBNP.emit(dataReturn);
    }catch(error){
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
}
