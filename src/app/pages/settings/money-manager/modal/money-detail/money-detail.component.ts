import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import {} from '@app/_services/';
@Component({
  selector: 'app-money-detail',
  templateUrl: './money-detail.component.html',
  styleUrls: ['./money-detail.component.scss']
})
export class MoneyDetailComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public isLoadingDelete : boolean = false;

  constructor(
    private _notificationService: NotificationService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MoneyDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this._formControl();
  }

  _formControl() {
    this.form = this.formBuilder.group({
      name: [{ value: this.data.name, disabled: false }, Validators.required],
      code: [{ value: this.data.code, disabled: false }, Validators.required],
      active_flag: new FormControl(this.data.active_flag, Validators.required)
    });
  }

  get f() { return this.form.controls; }

  public onSubmitEdit(){
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    try{
      this.isLoading = true;
      var request = {
        name: this.f.name.value,
        code: this.f.code.value,
        active_flag: true
      }
      // this.directEmpList = (await this._employeeService.getList(request)).data;
      this.isLoading = false;
    }catch(error:any){
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onSubmitDelete(){
    try{
      this.isLoadingDelete = true;
      var request = {
        name: this.f.name.value,
        code: this.f.code.value,
      }
      // this.directEmpList = (await this._employeeService.getList(request)).data;
      this.isLoadingDelete = false;
    }catch(error:any){
      this.isLoadingDelete = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
  }
}
