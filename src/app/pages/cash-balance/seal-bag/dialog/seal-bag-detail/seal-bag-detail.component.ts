
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MoneyToTextService } from '@app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SEALBAG_STATUS_CODE, SEALBAG_TYPE_CODE, } from '@app/_constant';
import { List } from 'linq-typescript';

@Component({
  selector: 'app-seal-bag-detail',
  templateUrl: './seal-bag-detail.component.html',
  styleUrls: ['./seal-bag-detail.component.scss']
})
export class SealBagDetailComponent implements OnInit {
  public form: FormGroup;
  public ccyList: any[] = [];
  public sealBagDetail: any = {};
  public availableFundsList: any[] = [];
  public sealBagBranchList: any[] = [];
  public sealBagTypeCode: any = SEALBAG_TYPE_CODE;
  public sealBagStatusCode: any = SEALBAG_STATUS_CODE;
  public totalAmount: number = 0;
  public totalAmountSealBagBranch: number = 0;

  constructor(
    public dialogRef: MatDialogRef<SealBagDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public moneyToTextService: MoneyToTextService,

    private _formBuilder: FormBuilder,
  ) {
    this.ccyList = this.data.ccyList;
    this.sealBagDetail = data.item;
    this.availableFundsList = data.item.def_price_detail;
    this.sealBagBranchList = data.item.sealbags ?? [];
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => s.price * s.number_heal);
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

  closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }

}

