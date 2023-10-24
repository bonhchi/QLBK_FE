import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { NOTIFICATION, STATUS } from '@app/_constant';
import { Permit, User } from '@app/_models';
import * as moment from 'moment';
import _find from 'lodash/find';
import { AuthenticationService, CategoryService, FccService, FundService, MoneyToTextService, PermitService, SwAlertService } from '@app/_services';
import { LOCK_DAY_STATUS } from '@app/_constant';
import { DetailFundManageComponent } from './modal/detail-fund-manage/detail-fund-manage.component';
import { UserService } from '@app/_services/user.service';
import { BranchListFundManageComponent } from './modal/branch-list-fund-manage/branch-list-fund-manage.component';
import { WorkingDateService } from '@app/_services/working-date.service';

@Component({
  selector: 'app-actual-fund-manage',
  templateUrl: './actual-fund-manage.component.html',
  styleUrls: ['./actual-fund-manage.component.scss']
})
export class ActualFundManageComponent implements OnInit {
  public currentUser: User;
  public form: FormGroup;
  public isLoading: boolean = false;
  public dataList: any[] = [];
  public userList: any[] = [];
  public ccyList: any[] = [];
  public branchList: any[] = [];
  public denoBranchList: any[] = [];
  public dialogRef: any;
  public statusList: any = {};
  public status: string = 'KHOA_SO';

  public isShowBtnUnlock: boolean = false;
  public isShowBtnLock: boolean = false;
  public isShowBtnApproval: boolean = false;
  public isShowBtnChangeDate: boolean = false;
  public isShowBtnReject: boolean = false;

  public isLoadingUnlock: boolean = false;
  public isLoadingLock: boolean = false;
  public isLoadingApproval: boolean = false;
  public isLoadingChangeDate: boolean = false;
  public isLoadingReject: boolean = false;

  public isDisableBranchList: boolean = false;
  public isUserCUM: boolean = false;

  public isCurrentDate: boolean = true;
  public currentDate: Date = new Date();
  public workingDate: string;

  constructor(
    public moneyToTextService: MoneyToTextService,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _authenticationService: AuthenticationService,
    private _permitService: PermitService,
    private _fccService: FccService,
    private _fundService: FundService,
    private _userService: UserService,
    private _swAlertService: SwAlertService,
    private _workingDateService: WorkingDateService,
  ) {

    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this._workingDateService.onWorkingDate().subscribe(s => console.log(s));

    this.isShowBtnUnlock = this.currentUser.role.some(e => { return e == 'QC' || e == 'QC_CUM' || e == 'ADMIN' });
    this.isShowBtnLock = this.currentUser.role.some(e => { return e == 'QC' || e == 'QC_CUM' || e == 'ADMIN' });
    this.isShowBtnApproval = this.currentUser.role.some(e => { return e == 'KSV' || e == 'KSV_CUM'});
    this.isShowBtnReject = this.currentUser.role.some(e => { return e == 'KSV' || e == 'KSV_CUM'});
    this.isShowBtnChangeDate = this.currentUser.role.some(e => { return e == 'QC' || e == 'QC_CUM'});
  }

  async ngOnInit(): Promise<void> {
    this._formControl();
    this._getBranch();
    this._getStatus();
    this._getdenoBranchList();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      branch_code: [{ value: this.currentUser.positions.branch.code, disabled: false }],
      date: [{ value: moment().format("DD/MM/YYYY"), disabled: false }],
      user: [{ value: this.currentUser.username, disabled: true }],
    });

    this.f["branch_code"].valueChanges.subscribe(s => {
      this._getUser(s);
    });
  }

  private async _getBranch() {
    try {
      let request = {
        active_flag: 1
      }
      const res = (await this._categoryService.getBranch(request)).data;
      this.branchList = res.filter(f => f.code == this.currentUser.positions.branch.code || f.parent_code == this.currentUser.positions.branch.code);
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getUser(branchCode: string) {
    try {
      const request = {
        branch_id: branchCode,
        roles_fcc: ["QC"],
        active_flag: 1
      }
      const user = (await this._userService.getList(request)).data[0];
      this.f['user'].setValue('');
      if(user) {
        this.f["user"].setValue(user.user_name);
      }
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getdenoBranchList(is_check?: boolean) {
    try {
      this.isLoading = true;
      const res = await this._fundService.getDenoBranch(this._getFormRequest());
      this.denoBranchList = res.data.result;
      if (this.denoBranchList.length == 0 && is_check) {
        this._notificationService.error('Thông báo', "Không tìm thấy dữ liệu");
      }
      this.isLoading = false;
    } catch (error: any) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getStatus() {
    try {
      const res = await this._fundService.getStatusBranchId(this.f.branch_code.value)
      this.statusList = res.data
      this.status = res.data.status
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public async onUnlock() {
    this.isLoadingUnlock = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      `Bạn có chắc muốn mở sổ không?`,
      async () => {
        try {
          await this._fundService.updateStatus(this.f.branch_code.value);
          this._notificationService.success('Thành công', `Mở sổ thành công`);
          this.isLoadingUnlock = false;
          this.onSearch();
        } catch (error) {
          this.isLoadingUnlock = false;
          this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
        }
      },
      () => {
        this.isLoadingUnlock = false;
      }
    );
  }

  public async onLock() {
    this.isLoadingLock = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      `Bạn có chắc muốn khóa sổ không?`,
      async () => {
        try {
          await this._fundService.updateStatus(this.f.branch_code.value);
          this._notificationService.success('Thành công', `Khóa sổ thành công`);
          this.isLoadingLock = false;
          this.onSearch();
        } catch (error) {
          this.isLoadingLock = false;
          this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
        }
      },
      () => {
        this.isLoadingLock = false;
      }
    );
  }

  public async onChangeDate() {
    this.isLoadingChangeDate = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      `Bạn có chắc muốn chuyển ngày không?`,
      async () => {
        try {
          await this._fundService.transferDate(this.f.branch_code.value);
          this._notificationService.success('Thành công', 'Chuyển ngày thành công');
          this.isLoadingChangeDate = false;
          window.location.reload();
        } catch (error) {
          this.isLoadingChangeDate = false;
          this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
        }
      },
      () => {
        this.isLoadingChangeDate = false;
      }
    );
  }

  public onReject() {
    this.isLoadingReject = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      `Bạn có chắc muốn từ chối mở sổ không?`,
      async () => {
        try {
          await this._fundService.reject(this.f.branch_code.value);
          this._notificationService.success('Thành công', `Từ chối mở sổ thành công`);
          this.isLoadingReject = false;
          this.onSearch();
        } catch (error) {
          this.isLoadingReject = false;
          this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
        }
      },
      () => {
        this.isLoadingReject = false;
      }
    );
  }

  public async onApproval() {
    this.isLoadingApproval = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      `Bạn có chắc muốn duyệt mở sổ không?`,
      async () => {
        try {
          await this._fundService.opproveStatus(this.f.branch_code.value);
          this._notificationService.success('Thành công', `Duyệt mở sổ thành công`);
          this.isLoadingApproval = false;
          this.onSearch();
        } catch (error) {
          this.isLoadingApproval = false;
          this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
        }
      },
      () => {
        this.isLoadingApproval = false;
      }
    );
  }

  private _getFormRequest() {
    const request = {
      branch_id: this.f['branch_code'].value,
      user_id: this.f['user'].value,
      tran_date: moment(this.f["date"].value, "DD/MM/YYYY").format("YYYY-MM-DD")
    }
    return request;
  }

  public onSearch() {
    const curDate = moment(this.currentDate).format("YYYY-MM-DD");
    const selectedDate = moment(this.f["date"].value, "DD/MM/YYYY").format("YYYY-MM-DD");
    this.isCurrentDate = moment(curDate).isSame(selectedDate);

    this._getdenoBranchList(true),
    this._getStatus();
  }

  public resetFilter() {
    this._formControl();
  }

  public openForm(type: string, item: any) {
    switch (type) {
      case 'DETAIL':
        this.dialogRef = this.dialog.open(DetailFundManageComponent, {
          width: '70vw',
          data: { item },
        });
        this.dialogRef.afterClosed().subscribe((result) => { });
      case 'BRANCH':
        this.dialogRef = this.dialog.open(BranchListFundManageComponent, {
          width: '70vw',
          data: { branchList: this.branchList },
        });
        this.dialogRef.afterClosed().subscribe((result) => { });
    }

  }
  public renderFundStatus(status) {
    return _find(LOCK_DAY_STATUS, { 'id': status });
  }
}
