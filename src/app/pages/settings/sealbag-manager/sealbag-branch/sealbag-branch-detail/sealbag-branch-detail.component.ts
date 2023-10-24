import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SealBagService } from '@app/_services'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
@Component({
  selector: 'app-sealbag-branch-detail',
  templateUrl: './sealbag-branch-detail.component.html',
  styleUrls: ['./sealbag-branch-detail.component.scss']
})
export class SealbagBranchDetailComponent implements OnInit {
  form: FormGroup;
  branch_name: string = '';
  users: any[] = [];
  listUser: any;
  listUserDetail: any[] = []
  constructor(
    public dialogRef: MatDialogRef<SealbagBranchDetailComponent>,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private sealBagService: SealBagService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  get f() {
    return this.form.controls;
  }
  ngOnInit() {
    this.formControl()
    this.getSealBagListUser()
  }

  formControl() {
    this.form = this._formBuilder.group({
      user_id: [{ value: '', disabled: false }],
      branch_id: [{ value: this.data.item.name, disabled: true }],
    })
  }

  private async getSealBagListUser() {
    try {
      this.users = (await this.sealBagService.getListSealBagUser(this.data.item.id)).data
      this.users.forEach(item => {
        item.isUser = item.role == 'ADMIN' ? 'Đơn vị' : item.role + ' - ' + item.userid;
      });
      this.users.splice(0, 0, { userid: '', isUser: 'Tất cả' });
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private getDataDetail(){
    
  }

  public onOptionsSelectedRole(event): void {
    this.listUser = event;
  }


  public onSearch() {

  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }

}
