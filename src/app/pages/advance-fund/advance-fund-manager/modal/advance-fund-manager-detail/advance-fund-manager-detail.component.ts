import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import {MoneyToTextService } from '@app/_services/money-to-text.service';
import _find from 'lodash/find';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { STATUS_MANAGE_ALLOCATION, ADVANCE_FUND_MANAGER} from '@app/_constant';
import { AuthenticationService, PermitService, UtilService, AllocateService, SwAlertService } from '@app/_services';
import { Permit, User } from '@app/_models';

@Component({
  selector: 'app-advance-fund-manager-detail',
  templateUrl: './advance-fund-manager-detail.component.html',
  styleUrls: ['./advance-fund-manager-detail.component.scss']
})
export class AdvanceFundManagerDetailComponent implements OnInit {
  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
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
  public currentUser: User;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public ADVANCE_FUND_MANAGER: any [] = ADVANCE_FUND_MANAGER;
  public cloneDataMoney:any = {};
  constructor(
    public _utilService: UtilService,
    private _notificationService: NotificationService,
    private _swAlertService: SwAlertService,
    private _authenticationService: AuthenticationService,
    private _allocateService: AllocateService,
    public moneyToText: MoneyToTextService,
    private _permitService: PermitService,
    public dialogRef: MatDialogRef<AdvanceFundManagerDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.permit = this._permitService.getPermitByUser();
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this.calcTotalMoneyInFund();
  }
  public calcTotalMoneyInFund(){
      let cloneDataMoney = JSON.parse(JSON.stringify(this.data.data))
      cloneDataMoney.allotment_data.map((ccy)=>{
        ccy.total_money_ccy = 0;
        ccy.users.map((user)=>{
          user.total_money = 0;
          user.moneys.map((money)=>{
            user.total_money += money.price * (money.number_heal + money.number_torn + money.number_coin)
          })
          ccy.total_money_ccy += user.total_money;
        })
      })
      this.cloneDataMoney = cloneDataMoney;
  }
  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
  }
  public calculatorTotal(statement_money){
    let total = 0 ;
    statement_money.map((money)=>{
      total += money.total;
    })
    return total;
  }
  public renderBranch(branch_id){
    if(branch_id){
     let branch = _find(this.data.branchList,{'id':branch_id})
     return `${branch.id} - ${branch.name}`
    }
  }
  public renderDataAdvanceStatus(status) {
    return _find(STATUS_MANAGE_ALLOCATION, { 'id': status });
  }
  public async exportPDF() {
    try{
      let params = {

        "id": this.data.data.id,
        "assigned_id": this.currentUser.username
      }
      await this._allocateService.printAllocate(this.data.data.id, params).then(
        (result: Blob) => {
          const blob = new Blob([result], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
    }catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  public async refuseAllocate(){
    this._swAlertService.withConfirmation(
      'Thông báo',
      `Bạn có chắc hủy phân bổ đầu ngày này không?`,
      async () => {
        this.isLoading = true;
        try {
          let params = {
            "id": this.data.data.id,
            "description": ""
          }
          const res = await this._allocateService.refuseAllocate(this.data.data.id, params);
          this.isLoading = false;
          this._notificationService.success('Thành công', 'Đã hủy phân bổ đầu ngày');
          this.closeFormDialog('DETAIL');
        } catch (error: any) {
          this.isLoading = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => {

      }
    );
  }
  public async approveAllocate(){
    this._swAlertService.withConfirmation(
      'Thông báo',
      `Bạn xác nhận phân bổ đầu ngày này không?`,
      async () => {
        this.isLoading = true;
        try {
          let params = {
            "description": ""
          }
          const res = await this._allocateService.approveAllocate(this.data.data.id, params);
          this.isLoading = false;
          this._notificationService.success('Thành công', 'Đã xác nhận phân bổ đầu ngày');
          this.closeFormDialog('DETAIL');
        } catch (error: any) {
          this.isLoading = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => {
       
      }
    );

  }
}
