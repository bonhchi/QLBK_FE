import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
@Component({
  selector: 'app-add-limit-tellers',
  templateUrl: './add-limit-tellers.component.html',
  styleUrls: ['./add-limit-tellers.component.scss']
})
export class AddLimitTellersComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLimitTellersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this._formControl()
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      ccys: [{ value: '', disabled: false }, Validators.required],
      code: [{ value: '', disabled: false }, Validators.required],
      active_flag: new FormControl(this.data.active_flag, Validators.required)
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
