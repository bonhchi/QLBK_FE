import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { Permit, User } from '@app/_models';
import * as moment from 'moment';
import _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService, MoneyToTextService, PermitService, UtilService } from '@app/_services';
import { ADVANCE_FUND_TYPE, ADVANCE_FUND_MANAGER } from '@app/_constant';
import { CategoryService, AllocateService } from '@app/_services';
import { AdvanceFundManagerAddComponent } from './modal/advance-fund-manager-add/advance-fund-manager-add.component';
import { AdvanceFundManagerDetailComponent } from './modal/advance-fund-manager-detail/advance-fund-manager-detail.component';
@Component({
  selector: 'app-advance-fund-manager',
  templateUrl: './advance-fund-manager.component.html',
  styleUrls: ['./advance-fund-manager.component.scss']
})

export class AdvanceFundManagerComponent implements OnInit {
  public currentUser: User;
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  public form!: FormGroup;
  public isLoading: boolean = false;
  public isLoadingAdd: boolean = false;
  public permit: Permit;
  public dataList: any[] = [];
  public ccyList: any[] = [];
  public userList: any[] = [];
  public transaction_type: any[] = [];
  public branchList: any[] = [];
  public statusList: any[] = [];
  public dialogRef: any;
  public ADVANCE_FUND_MANAGER: any[] = ADVANCE_FUND_MANAGER;
  public toDate = new Date();
  constructor(
  	public _moneyToTextService: MoneyToTextService,
    public dialog: MatDialog,
    public utilService: UtilService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _spinner: NgxSpinnerService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
    private _allocateService: AllocateService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    this._getCcy();
    this._getBranch();
    this._getStatus();
    this._getList(this._getFormRequest());
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      created_date: [{ value: moment().format("DD/MM/YYYY"), disabled: false }],
      status: [{ value: '', disabled: false }],
      branch_id: [{ value: this.currentUser.positions.branch.code, disabled: false }],
    });
  }

  private async _getStatus() {
    try {
      const product_code = 'PHAN_BO_DAU_NGAY';
      this.statusList = (await this._categoryService.getStatus(product_code)).data;
      this.statusList.splice(0, 0, { id: '', code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccyList = (await this._categoryService.getCcy(request)).data;
      this.ccyList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getBranch() {
    try {
      this.branchList = (await this._categoryService.getBranch({})).data;
      this.branchList.splice(0, 0, {id:'', code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public  onSearch() {
    if (this.form.invalid) {
      return;
    }
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._getList(this._getFormRequest());
  }

  private async _getList(request: any) {
    try {
      this.dataList = [];
      this.isLoading = true;
      this._spinner.show();

      const res: any = (await this._allocateService.getInfoAllocate(request)).data;
      this.dataList = res.result;
      this.pageEvent.length = res.total;
      // if (this.dataList.length == 0) {
      //   this._notificationService.error('Thông báo', "Không tìm thấy dữ liệu");
      // } 

      this.isLoading = false;
      this._spinner.hide();
    } catch (error: any) {
      this._spinner.hide()
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private _getFormRequest() {
    const request = {
      status: this.f['status'].value,
      branch_id: this.f['branch_id'].value,
      created_date: moment(this.f["created_date"].value, 'DD/MM/YYYY').format("YYYY-MM-DD"),
      page_size: this.pageEvent.pageSize,
      page_num: this.pageEvent.pageIndex,
    }
    // if(this.f["created_date"].value){
    //   request.created_date = moment(this.f["created_date"].value, 'DD/MM/YYYY').format("YYYY-MM-DD")
    // }
    return request;
  }

  public onClearForm() {
    this._formControl();
    this.onSearch();
  }

  public openForm(type: string, data: any) {
    switch (type) {
      case 'DETAIL':
        this.dialogRef = this.dialog.open(AdvanceFundManagerDetailComponent, {
          width: '95vw',
          data: {data,branchList:this.branchList},
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if (result == 'DETAIL') {
            this._getList(this._getFormRequest());
          }
        });
        break;
      case 'ADD':
        this.dialogRef = this.dialog.open(AdvanceFundManagerAddComponent, {
          width: '95vw',
          data: { user:this.currentUser },
          disableClose: true,
        });
        this.dialogRef.afterClosed().subscribe((result: any) => {
          if (result == 'ADD') {
            this._getList(this._getFormRequest());
          }
        });
        break;
    }
  }
  public renderBranch(branch_id){
    if(branch_id && this.branchList.length > 0){
      let branch = _.find(this.branchList,{'id':branch_id})
      return `${branch.id} - ${branch.name}`
    }
    return ''
  }
  public renderUserName(userList){
    let contentName = []
    userList.map((user)=>{
      contentName.push(user.user_name);
    })
    return _.join(_.union(contentName),', ');
  }
  public setPaginatorData(page: PageEvent) {
    this.pageEvent = page;
    this._getList(this._getFormRequest());
  }

  public renderDataAdvanceFund(type){
    return (_.find(ADVANCE_FUND_TYPE, { 'id': type })).name
  }
}
