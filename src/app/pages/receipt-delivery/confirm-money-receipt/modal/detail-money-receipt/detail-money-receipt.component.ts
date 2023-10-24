import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { AuthenticationService, CategoryService, DenominationService, MoneyToTextService, SwAlertService } from '@app/_services';
import * as moment from 'moment';

@Component({
  selector: 'app-detail-money-receipt',
  templateUrl: './detail-money-receipt.component.html',
  styleUrls: ['./detail-money-receipt.component.scss']
})
export class DetailMoneyReceiptComponent implements OnInit {

  public form: FormGroup;
  // currentUser: User = this._authService.currentUserValue;
  public loading = false;
  public isDelete = false;

  public minDate = new Date();
  public ccys = ['VND', 'USD'];

  transTypeList: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _swAlertService: SwAlertService,
    public moneyToText: MoneyToTextService,
    private _categoryService: CategoryService,
    private _authService: AuthenticationService,
    private _denominationService: DenominationService,
    private _notificationService: NotificationService,
    public dialogRef: MatDialogRef<DetailMoneyReceiptComponent>
  ) { }

  ngOnInit(): void {
    this._formControl();
    this._getCategoryByCode();
  }
// Get API
private async _getCategoryByCode() {
  try {
    const code = 'BBGN';
    this.transTypeList = (
      await this._categoryService.getCategoryByCode(code)
    ).data;
  } catch (error) {
    this._notificationService.error(
      'Thông báo',
      error.error?.message ? error.error.message : error.message
    );
  }
}

// Handle Events
private _formControl() {
  this.form = this._formBuilder.group({
    receipt_date: [{ value: moment().format('DD/MM/YYYY'), disabled: true }],
    receipt_type: [{ value: 'TANG_TIEP_QUY_DAU_NGAY', disabled: false }],
    receipt_no: [{ value: null, disabled: false }],
    receipt_delivery_branch: [{ value: '', disabled: true }],
    receipt_delivery_user: [{ value: '', disabled: true }],
    receipt_delivery_role: [{ value: 'QUỸ CHÍNH', disabled: true }],
    receipt_receive_user: [{ value: '', disabled: true }],
    receipt_receive_role: [{ value: 'QUỸ PHỤ', disabled: true }],
    receipt_receive_branch: [{ value: '', disabled: true }],
  });
}

public closeFormDialog(close: any) {
  this.dialogRef.close(close);
}

// Handle Submits
onSave() {

}
}
