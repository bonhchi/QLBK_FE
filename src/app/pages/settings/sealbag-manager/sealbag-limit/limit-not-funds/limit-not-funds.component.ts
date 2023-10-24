import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CategoryService } from '@app/_services/category.service';
import { AddLimitNotFundsComponent } from './modal/add-limit-not-funds/add-limit-not-funds.component';
import { EditLimitNotFundsComponent } from './modal/edit-limit-not-funds/edit-limit-not-funds.component';
@Component({
  selector: 'app-limit-not-funds',
  templateUrl: './limit-not-funds.component.html',
  styleUrls: ['./limit-not-funds.component.scss']
})
export class LimitNotFundsComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public branchs:any[] = []
  constructor(
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this._getBranch()
    this._formControl()
  }
  
  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      branch_id: [{ value: '', disabled: false }],
    });
  }
 public onSearch(){

  }
  private async _getBranch() {
    try {
      this.branchs = (await this._categoryService.getBranch("")).data;
      this.branchs.splice(0, 0, { id: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  public openForm(type, data) {
    switch (type) {
      case 'Add':
        const dialogRefAdd = this.dialog.open(AddLimitNotFundsComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefAdd.afterClosed().subscribe(result => {
        });
        break;
      case 'Edit':
        const dialogRefEdit = this.dialog.open(EditLimitNotFundsComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefEdit.afterClosed().subscribe(result => {
        });
        break;

      default:
        break;
    }
  }

}
