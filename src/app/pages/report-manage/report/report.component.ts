import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService } from '@app/_services';
import { ReportService } from '@app/_services/report.service';
import { UserService } from '@app/_services/user.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  public currentUser: User;

  public branchId: any;
  public branchCode: any;
  public userList: any = [];
  public reportType: any = [];
  public branchList: any = [];
  public parentBranchList: any = [];

  constructor(
    private _userService: UserService,
    private _reportService: ReportService,
    private _categoryService: CategoryService,
    private _authenticationService: AuthenticationService,
    private _notificationService: NotificationService,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
    this.branchId = this.currentUser.positions.branch.id;
    this.branchCode = this.currentUser.positions.branch.code;
   }

  ngOnInit(): void {
    this._getBranch();
    this._getUserList();
    this._getReportType();
    this._getParentBranch();
  }

  // branch
  private async _getBranch() {
    const request = {
      rank: 3
    };
    try {
      this.branchList = (await this._categoryService.getBranch(request)).data;
      this.branchList.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }


  // parent branch
  private async _getParentBranch() {
    const request = {
      rank: 2
    };
    try {
      this.parentBranchList = (await this._categoryService.getBranch(request)).data;
      this.parentBranchList.splice(0, 0, { code: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  private async _getUserList() {
    const request = {
      roles_fcc: [''],
      branch_id: this.branchId
    };
    try {
      this.userList = (await this._userService.getList(request)).data;
      this.userList.splice(0, 0, { id: '', user_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getReportType() {
    const request = {
      active_flag: 1
    };
    try {
      this.reportType = (await this._reportService.getReportType(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }
}
