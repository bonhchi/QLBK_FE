import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import _find from 'lodash/find';
import Swal  from 'sweetalert2';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { CategoryService, AllocateService } from '@app/_services';
import {TYPE_ROLE_RESERVE_FUND} from '@app/_constant';
@Component({
  selector: 'app-advance-fund-manager-add',
  templateUrl: './advance-fund-manager-add.component.html',
  styleUrls: ['./advance-fund-manager-add.component.scss']
})

export class AdvanceFundManagerAddComponent implements OnInit {
  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public stateBtnSave: boolean = false;
  public pageIndex = 0;
  public ccys:any[] = [];
  public dataMoney:any[] = [];
  public dataBNP = [];
  public role_func_id = TYPE_ROLE_RESERVE_FUND[0].id;
  public dataAllotments = [];
  constructor(
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _allocateService: AllocateService,
    public dialogRef: MatDialogRef<AdvanceFundManagerAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { 
  }

  async ngOnInit() {
    await this._getCcy();
  }
  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccys = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
    return;
    Swal.fire({
      title: 'Đóng bảng nhập liệu',
      // text: "Bạn có chắc đóng bảng!",
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#c6c7c8',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogRef.close(close);
      }
    })
  }

  //HANDLE DATA
  public catchDataMoneys(data){
    this.dataMoney = data
  }
  public catchDataRole(data){
    this.role_func_id = data;
  }
  public catchResultData(data){
    this.dataAllotments = data;
    if(this.dataAllotments.length > 0){
      this.stateBtnSave = true;
    }
    if(this.dataAllotments.length == 0){
      this.stateBtnSave = false;
    }
  }
  public catchDataBNP(data){
    this.dataBNP = data;
  }
  public checkValidationAllotment(allotments){
    let result = true;
    allotments.map((ccy)=>{
      let total = ccy.users[0].money_receive;
      ccy.users.map((user)=>{
        if(total != user.money_receive){
          result = false
        }
      })
    })
    return result;
  }
  // SAVE AND PUSH DATA TO API
  public async saveAdvanceFund(){
    if(this.checkValidationAllotment(this.dataAllotments)){
      this.isLoading =  true;
      try {
        let param = {
          "tran_type": "PHAN_BO_DAU_NGAY",
          "role_func_id": this.role_func_id,
          "sealbags": this.dataBNP,
          "allotments": this.dataAllotments,
        }
        await this._allocateService.createAllocate(param);
        this.isLoading =  false;
        this._notificationService.success('Thông báo','Đã thêm phân bổ đầu ngày');
        this.closeFormDialog('ADD');
      } catch (error) {
        this.isLoading =  false;
        this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
      }
    }else{
      this._notificationService.error('Thông báo', 'Không thể phân bổ do số tiền không bằng nhau');
    }
  }

  ///STEPER
  public next() {
    if(this.pageIndex == 0 && this.dataMoney.length == 0){
      this._notificationService.error('Thông báo', 'Kiểm tra nhập liệu loại tiền');
        return;
    }
    if(this.pageIndex == 0 && this.dataMoney.length > 0){
      let hasUser = true;
      this.dataMoney.map((ccy)=>{
        if(ccy.users && ccy.users.length == 0){
          hasUser = false
        }
      })
      // check result
      if(!hasUser){
        this._notificationService.error('Thông báo', `Kiểm tra danh sách GDV tương ứng với loại tiền`);
        return;
      }
    }
    this.pageIndex +=1;
    this.stepper.next()
  }
  public changeStep(index: number) {
    this.stepper.selectedIndex = index;
  }
  public back() {
    this.pageIndex -=1;
    this.stepper.previous();
  }
}
