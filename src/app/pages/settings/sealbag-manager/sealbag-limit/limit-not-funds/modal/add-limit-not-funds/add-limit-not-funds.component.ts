import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CategoryService } from '@app/_services/category.service';
import { NotificationService } from '@app/_components/notification/_services/notification.service';

@Component({
  selector: 'app-add-limit-not-funds',
  templateUrl: './add-limit-not-funds.component.html',
  styleUrls: ['./add-limit-not-funds.component.scss']
})
export class AddLimitNotFundsComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public branchs:any[] = []
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddLimitNotFundsComponent>,
    private _categoryService: CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    this._getBranch()
    this._formControl()
   
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      branch_id: [{ value: '', disabled: false }, Validators.required],
    });
  }
  get f() { return this.form.controls }

  private async _getBranch() {
    try {
      this.branchs = (await this._categoryService.getBranch("")).data;
      this.branchs.splice(0, 0, { id: '', display_name: 'Tất cả' });
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
