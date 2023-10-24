import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SealBagService, MoneyToTextService, AuthenticationService, SwAlertService } from '@app/_services';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@app/_models/user';
import { SEALBAG_STATUS_CODE, SEALBAG_TYPE_CODE } from '@app/_constant';
import { List } from 'linq-typescript';
import _clonceDeep from 'lodash/cloneDeep';
import { CategoryService } from '@app/_services/category.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-seal-bag-close',
  templateUrl: './seal-bag-close.component.html',
  styleUrls: ['./seal-bag-close.component.scss']
})

export class SealBagCloseComponent implements OnInit {
  public currentUser: User;
  public form: FormGroup;
  public ccyList: any[] = [];
  public sealBagDetail: any = {};
  public availableFundsList: any[] = [];
  public sealBagBranchList: any[] = [];
  public sealBagTypeCode: any = SEALBAG_TYPE_CODE;
  public sealBagStatusCode: any = SEALBAG_STATUS_CODE;
  public totalAmount: number = 0;
  public totalAmountSealBagBranch: number = 0;
  public isLoading: boolean = false;
  public isCheckedAll: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SealBagCloseComponent>,    
    public moneyToTextService: MoneyToTextService,
    @Inject(MAT_DIALOG_DATA) public data: any,

    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _formBuilder: FormBuilder,
    private _authService: AuthenticationService,
    private _spinner: NgxSpinnerService,
    private _sealBagService: SealBagService,
    private _swAlertService: SwAlertService,
  ) {
    this.currentUser = this._authService.currentUserValue;
    this.ccyList = this.data.ccyList;
    this.sealBagDetail = data.item;
  }
  
  async ngOnInit() {
    this._formControl();

    if(this.sealBagDetail.branch_flag == 0) {
      // lấy bảng kê tồn quỹ
      await this._getManagerTypeCcyList();
    } else {
      // lấy danh sách bao niêm phong đơn vị
      await this._getSealBagBranchList();
    }
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      sealBagName: [{ value: this.sealBagDetail.name, disabled: true }],
      ccy: [{ value: this.sealBagDetail.ccy, disabled: true }],
    });
  }

  private async _getManagerTypeCcyList() {
    try {
      const request = {
        ccy: this.sealBagDetail.ccy,
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.availableFundsList = res.map((ob, i) => ({ ...ob, "total": 0 }));
      this.isCheckedAll = false;
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private async _getSealBagBranchList() {
    try {
      const request = {
        ccy: this.sealBagDetail.ccy,
        type: this.sealBagDetail.tran_type,
        status: this.sealBagStatusCode.DA_NIEM_PHONG,
        assigned_id: this.currentUser.username
      }
      const res = (await this._sealBagService.getSealbagList(request)).data.result;
      this.sealBagBranchList = res.map((ob, i) => ( { ...ob, "is_checked": false } ));
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public calTotalAmount(item: any) {
    switch (this.sealBagDetail.tran_type) {
      case this.sealBagTypeCode.BNP_LANH:
        this.totalAmount =  new List<any>(this.availableFundsList).sum(s => s.price * s.number_heal);
        item.total = item.number_heal * item.price
        break;
      case this.sealBagTypeCode.BNP_RACH:
        this.totalAmount =  new List<any>(this.availableFundsList).sum(s => s.price * s.number_torn);
        item.total = item.number_torn * item.price;
      default:
        break;
    }
  }

  private _calTotalAmountSealBagBranch() {
    this.totalAmountSealBagBranch = new List<any>(this.sealBagBranchList).where(w => w.is_checked == true).sum(s => s.balance);
  }

  public onCheck(item: any) {
    item.is_checked = !item.is_checked;
    this.isCheckedAll = (this.sealBagBranchList.length === this.sealBagBranchList.filter(f => f.is_checked).length) ? true : false;
    this._calTotalAmountSealBagBranch();
  }

  public onCheckAll(e: any) {
    this.isCheckedAll = e.target.checked;
    this.sealBagBranchList.forEach(item => { item.is_checked = e.target.checked });
    this._calTotalAmountSealBagBranch();
  }

  public async onSubmit() {
    try {
      this.isLoading = true;

      if(this.sealBagDetail.branch_flag == 0) {
        var request = {
          sealbags: [],
          def_price_detail: this.availableFundsList
        }
      } else {
        const checkedList = this.sealBagBranchList.filter(f => f.is_checked === true);
        if(checkedList.length == 0) {
          this._notificationService.error('Thông báo', "Vui lòng chọn bao niêm phong");
          this.isLoading = false;
          return;
        }
        const sealBagBranchIdList = checkedList.map(m => { return m.id });
        var request = {
          sealbags: sealBagBranchIdList,
          def_price_detail: []
        }
      }

      this._swAlertService.withConfirmation(
        "Thông báo",
        `Bạn có chắc muốn niêm phong mã <b>${this.sealBagDetail.code}</b> bao niêm phong này không?`,
        async () => {
          try {
            await this._sealBagService.sealSealBag(this.sealBagDetail.id, request);
            this.isLoading= false;
            this._notificationService.success('Thành công', 'Niêm phong thành công');
            this.closeFormDialog('update')
          } catch (error: any) {
            this.isLoading= false;
            this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
          }
        },
        () => { 
          this.isLoading = false;
        }
      );
    } catch (error) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

}
