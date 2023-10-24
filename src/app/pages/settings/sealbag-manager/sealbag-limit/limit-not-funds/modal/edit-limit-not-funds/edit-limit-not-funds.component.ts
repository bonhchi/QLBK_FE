import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';

@Component({
  selector: 'app-edit-limit-not-funds',
  templateUrl: './edit-limit-not-funds.component.html',
  styleUrls: ['./edit-limit-not-funds.component.scss']
})
export class EditLimitNotFundsComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditLimitNotFundsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this._formControl()
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      ccys: [{ value: '', disabled: false }, Validators.required],
      code: [{ value: '', disabled: false }, Validators.required],
      branch_id: [{ value: '', disabled: false }, Validators.required],
    
    });
  }
  get f() { return this.form.controls }

  public onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

  }
  public closeFormDialog(close: string) {
    this.dialogRef.close(close)
  }

}
