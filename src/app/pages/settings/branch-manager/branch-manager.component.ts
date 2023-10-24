import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BranchCreateComponent } from './modal/branch-create/branch-create.component';
import { BranchDetailComponent } from './modal/branch-detail/branch-detail.component';
import {  STATUS_SYSTEM, HEAD } from '@app/_constant';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _clone from 'lodash/clone';
import convertVietNamText from '@app/_helpers/tools';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { CategoryService } from '@app/_services/category.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-branch-manager',
  templateUrl: './branch-manager.component.html',
  styleUrls: ['./branch-manager.component.scss']
})

export class BranchManagerComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public dialogCheckRef: any;
  public originalBranch: any = {};
  public branchList: any[] = [];
  public orgBranchList: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    public dialog: MatDialog,
  ) { }

  async ngOnInit(): Promise<void> {
    this._formControl();

    // lấy đơn vị gốc 000 - Hội Sở
    await this._getOriginalBranch();

    // lấy danh sách đơn vị theo đơn vị cha
    await this._getBranch();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      head: [{ value: '', disabled: true }],
      branch_name: [{ value: '', disabled: false }],
    });
  }

  private async _getOriginalBranch() {
    try {
      const request = {
        code: "000",
        rank: 1
      }
      this.originalBranch = (await this._categoryService.getBranch(request)).data[0];
      this.f["head"].setValue(this.originalBranch.display_name);
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getBranch() {
    try {
      this._spinner.show();
      const request = {
        parent_id: this.originalBranch.id
      }
      this.branchList = (await this._categoryService.getBranch(request)).data;
      this.orgBranchList = this.branchList;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
  

  public onSearch() {
    let input = convertVietNamText(this.f.branch_name.value);
    let kqttFilter = _filter(_clone(this.orgBranchList), function (kqtt) {
      let kqttName = convertVietNamText(kqtt.name)
      if (kqttName.includes(input)) {
        return true;
      }
    });
    this.branchList = kqttFilter;
  }

  public resetFilter(){
    this.f.branch_name.setValue("");
    this.branchList = this.orgBranchList;
  }


  openFormMoney(form, money) {
    if (form == 'create') {
      this.dialogCheckRef = this.dialog.open(BranchCreateComponent, {
        width: '30%',
        data: {heads: this.branchList}
      });
    }
    if (form == 'detail') {
      this.dialogCheckRef = this.dialog.open(BranchDetailComponent, {
        width: '50%',
        data: money
      });
    }

    this.dialogCheckRef.afterClosed().subscribe((result) => {
      // if (result == 'detail') {

      // }
    });
  }

  public findStatus(activeFlag) {
    return _find(STATUS_SYSTEM, { 'id': activeFlag });
  }
}
