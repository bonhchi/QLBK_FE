import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MoneyToTextService } from '@app/_services';
import * as moment from 'moment';

@Component({
  selector: 'app-handmade-credit-debit-trans',
  templateUrl: './handmade-credit-debit-trans.component.html',
  styleUrls: ['./handmade-credit-debit-trans.component.scss']
})
export class HandmadeCreditDebitTransComponent implements OnInit {
  public form: FormGroup;
  public submitted: boolean = false;
  public closeDialog: any = { type: 'close', data: null };
  public mask: string = 'separator.0';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HandmadeCreditDebitTransComponent>,
    private _formBuilder: FormBuilder,
    public moneyToTextService: MoneyToTextService,
  ) {
    this.mask = data.ccy == "VND" ? 'separator.0' : 'separator.2'; 
  }

  ngOnInit(): void {
    this._formControl();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      trn_ref_no: [{ value: '', disabled: false }],
      id_card: [{ value: this.data.id_card, disabled: false }],
      cif: [{ value: this.data.cif, disabled: false }],
      func_id: [{ value: '', disabled: false }],
      amount: [{ value: 0, disabled: false }, [Validators.required, Validators.min(1)]],
      ccy: [{ value: this.data.ccy, disabled: false }],
      trn_date: [{ value: moment().format("YYYY-MM-DD"), disabled: false }],
      trn_type: [{ value: this.data.drcr_ind, disabled: false }],
      trn_status: [{ value: '', disabled: false }],
      status: [{ value: '', disabled: false }],
      description: [{ value: '', disabled: false }, Validators.required],
      insert_type: [{ value: 'HANDMADE', disabled: false }],
    });
  }

  public onSubmit() {
    this.submitted = true;
    if(this.form.invalid) {
      return;
    }
    const closeDialogAdd = {
      type: 'add',
      data: this.form.value
    }
    this.closeFormDialog(closeDialogAdd);
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
