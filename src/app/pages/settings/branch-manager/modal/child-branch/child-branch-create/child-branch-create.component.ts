import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import {} from '@app/_services/';
@Component({
  selector: 'app-child-branch-create',
  templateUrl: './child-branch-create.component.html',
  styleUrls: ['./child-branch-create.component.scss']
})
export class ChildBranchCreateComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public isLoadingDelete : boolean = false
  constructor(
    private _notificationService: NotificationService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ChildBranchCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this._formControl();
  }
  _formControl() {
    this.form = this.formBuilder.group({
      kqtt_name: [{ value: this.data.kqtt, disabled: false }, Validators.required],
      branch_name: [{ value: this.data.kqtt.branch_name, disabled: false }, Validators.required],
      status: new FormControl(true, Validators.required)
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
        status: true
      }
      // this.directEmpList = (await this._employeeService.getList(request)).data;
      this.isLoading = false;
    }catch(error:any){
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  // openFormMoney(form, money) {
  //   if (form == 'create') {
  //     this.dialogRef = this.dialog.open(BranchCreateComponent, {
  //       width: '30%',
  //       data: {heads:this.heads}
  //     });
  //   }
  //   if (form == 'detail') {
  //     this.dialogRef = this.dialog.open(BranchDetailComponent, {
  //       width: '50%',
  //       data: money
  //     });
  //   }
  // }
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
