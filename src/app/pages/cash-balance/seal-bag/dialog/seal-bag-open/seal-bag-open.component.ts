import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SealBagService, MoneyToTextService, SwAlertService } from '@app/_services';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SEALBAG_STATUS_CODE, SEALBAG_TYPE_CODE, } from '@app/_constant';
import { List } from 'linq-typescript';
import _clonceDeep from 'lodash/cloneDeep'

@Component({
  selector: 'app-seal-bag-open',
  templateUrl: './seal-bag-open.component.html',
  styleUrls: ['./seal-bag-open.component.scss']
})
export class SealBagOpenComponent implements OnInit {
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

  constructor(
    public dialogRef: MatDialogRef<SealBagOpenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public moneyToTextService: MoneyToTextService,

    private _formBuilder: FormBuilder,    
    private _swAlertService: SwAlertService,
    private _notificationService: NotificationService,
    private _sealBagService: SealBagService,
  ) {
    this.ccyList = this.data.ccyList;
    this.sealBagDetail = data.item;
    this.availableFundsList = data.item.def_price_detail;
    this.sealBagBranchList = data.item.sealbags ?? [];
    this.totalAmount =  new List<any>(this.availableFundsList).sum(s => s.price * s.number_heal);
    this.totalAmountSealBagBranch = new List<any>(this.sealBagBranchList).sum(s => s.balance);
  }

  async ngOnInit() {
    this._formControl();
  }
  
  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      sealBagName: [{ value: this.sealBagDetail.name, disabled: true }],
      ccy: [{ value: this.sealBagDetail.ccy, disabled: true }],
    });
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
        var request = {
          sealbags: [],
          def_price_detail: []
        }
      }

      this._swAlertService.withConfirmation(
        "Thông báo",
        `Bạn có chắc muốn mở niêm phong mã <b>${this.sealBagDetail.code}</b> bao niêm phong này không?`,
        async () => {
          try {
            await this._sealBagService.unsealSealBag(this.sealBagDetail.id, request);
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

  closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
