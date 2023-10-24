import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { STATUS_SYSTEM } from '@app/_constant';
import {} from '@app/_services/';
import _find from 'lodash/find';
import _filter from 'lodash/filter';
import _clone from 'lodash/clone';
import convertVietNamText from '@app/_helpers/tools';
import {ChildBranchCreateComponent} from '../child-branch/child-branch-create/child-branch-create.component';
import {ChildBranchDetailComponent} from '../child-branch/child-branch-detail/child-branch-detail.component';
import { CategoryService } from '@app/_services/category.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-branch-detail',
  templateUrl: './branch-detail.component.html',
  styleUrls: ['./branch-detail.component.scss']
})

export class BranchDetailComponent implements OnInit {
  public formFilter: FormGroup;
  public formDetail: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public isLoadingDelete : boolean = false
  public branchList: any [] =[];
  public orgBranchList: any [] =[];
  public dialogChildBranch: any;

  constructor(
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<BranchDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this._formControl();

    // lấy danh sách đơn vị theo đơn vị cha
    await this._getBranch();
  }

  get fDetail() { return this.formDetail.controls; }
  get fFilter() { return this.formFilter.controls; }

  _formControl() {
    this.formDetail = this.formBuilder.group({
      branch_code: [{ value: this.data.code, disabled: true }, Validators.required],
      branch_name: [{ value: this.data.name, disabled: false }, Validators.required],
      is_warehouse: [{ value: this.data.is_warehouse, disabled: false }, Validators.required],
      branch_active: [{ value: this.data.active_flag, disabled: false }, Validators.required],
    });

    this.formFilter = this.formBuilder.group({
      branch_name: [{ value: '', disabled: false }],
    });
  }

  private async _getBranch() {
    try {
      this._spinner.show();
      const request = {
        parent_id: this.data.id
      }
      this.branchList = (await this._categoryService.getBranch(request)).data;
      this.orgBranchList = this.branchList;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onSearch(){
    let input = convertVietNamText(this.fFilter.branch_name.value);
    let branchFilter = _filter(_clone(this.orgBranchList), function (branch) {
      let branchName = convertVietNamText(branch.name)
      if (branchName.includes(input)) {
        return true;
      }
    });
    this.branchList = branchFilter;
  }

  public resetFilter(){
    this.fFilter.branch_name.setValue('');
    this.branchList = this.orgBranchList;
  }

  public onSubmitEdit(){
    // this.submitted = true;
    // if (this.formDetail.invalid) {
    //   return;
    // }
    // try{
    //   this.isLoading = true;
    //   var request = {
    //     name: this.fDetail.name.value,
    //     code: this.fDetail.code.value,
    //     status: true
    //   }
    //   // this.directEmpList = (await this._employeeService.getList(request)).data;
    //   this.isLoading = false;
    // }catch(error:any){
    //   this.isLoading = false;
    //   this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    // }
  }

  openFormChildBranch(form, data) {
    if (form == 'create') {
      this.dialogChildBranch = this.dialog.open(ChildBranchCreateComponent, {
        width: '30%',
        data: {kqtt: this.data.branch_name}
      });
    }
    if (form == 'detail') {
      this.dialogChildBranch = this.dialog.open(ChildBranchDetailComponent, {
        width: '30%',
        data: {branch: data, kqtt: this.data.branch_name}
      });
    }
  }

  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
  }

  public findStatus(activeFlag) {
    return _find(STATUS_SYSTEM, { 'id': activeFlag });
  }
}
