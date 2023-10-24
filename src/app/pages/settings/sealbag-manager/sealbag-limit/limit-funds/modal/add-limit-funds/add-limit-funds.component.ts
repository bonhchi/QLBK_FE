import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CategoryService } from '@app/_services/category.service';
import { NotificationService } from '@app/_components/notification/_services/notification.service';


@Component({
  selector: 'app-add-limit-funds',
  templateUrl: './add-limit-funds.component.html',
  styleUrls: ['./add-limit-funds.component.scss']
})
export class AddLimitFundsComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public ccys: any = [];
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLimitFundsComponent>,
    private _categoryService: CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this._getCcy()
    this._formControl()
   
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      ccy: [{ value: 'VND', disabled: false }, Validators.required],
    });
  }

  get f() { return this.form.controls }

  private async _getCcy() {
    try {
      const request = {
        active_flag: 1
      }
      this.ccys = (await this._categoryService.getCcy(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

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
