import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import {} from '@app/_services/';
@Component({
  selector: 'app-branch-create',
  templateUrl: './branch-create.component.html',
  styleUrls: ['./branch-create.component.scss']
})
export class BranchCreateComponent implements OnInit {

  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  constructor(
    private _notificationService: NotificationService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BranchCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this._formControl();
  }
  _formControl() {
    this.form = this.formBuilder.group({
      head: [{ value: this.data.heads[0].branch_code, disabled: false }, Validators.required],
      kqtt: [{ value: '', disabled: false }, Validators.required],
    });
  }
  get f() { return this.form.controls; }
  public onSubmit(){
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    try{
      this.isLoading = true;
      var request = {
        ccy: this.f.ccy.value,
        denominations: this.f.denominations.value,
      }
      // this.directEmpList = (await this._employeeService.getList(request)).data;
      this.isLoading = false;
    }catch(error:any){
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
  }
}
