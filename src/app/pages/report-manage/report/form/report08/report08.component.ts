import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService } from '@app/_services';
import { ReportService } from '@app/_services/report.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportCreateComponent } from '../modal/report-create/report-create.component';
import { ReportDetailComponent } from '../modal/report-detail/report-detail.component';

@Component({
  selector: 'app-report08',
  templateUrl: './report08.component.html',
  styleUrls: ['./report08.component.scss']
})
export class Report08Component implements OnInit {
  @Input() branchList: any[] = [];
  @Input() userList: any[] = [];
  @Input() reportType: any[] = [];
  @Input() parentBranchList: any[] = [];

  public form: FormGroup;
  public currentUser: User;

  public isLoading = false;
  public branch: any;
  public branchId: any;
  public branchCode: any;
  public isDisableBranch: any;
  public isDisableParentBranch: any;
  public dialogCheckRef: any;

  public reportList: any = [];

  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };

  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _spinner: NgxSpinnerService,
    private _reportService: ReportService,
    private _categoryService: CategoryService,
    private _authenticationService: AuthenticationService,
    private _notificationService: NotificationService,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
    this.branchId = this.currentUser.positions.branch.id;
    this.branchCode = this.currentUser.positions.branch.code;
    this.isDisableParentBranch = this.currentUser.role.some(e =>  {return e == 'OTHER_USER' || e == 'ADMIN'});
    this.isDisableBranch = this.currentUser.role.some(e =>  {return e == 'QC' || e == 'QP' || e == 'KSV' || e == 'GDV'});
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.branch = changes.branchList?.currentValue.filter(item => item.code == this.branchCode)[0]?.code;
    if (this.isDisableBranch) {
      this.form?.controls.report_branch.setValue(this.branch);
    }
  }

  ngOnInit(): void {
    this._formControl();
    // this._getReportList();
  }

  public get f () { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      report_date: [{value: moment(new Date()).format('DD/MM/YYYY'), disabled: false}],
      report_parent_branch: [{ value: '', disabled: !this.isDisableParentBranch}],
      report_branch: [{ value: '', disabled: !this.isDisableBranch}],
      report_user: [{ value: this.isDisableParentBranch ? null : this.currentUser.username.toUpperCase(), disabled: !this.isDisableParentBranch }],
    });
  }

  // Get API
  private async _getReportList() {
    const report_id = '08_BB_KIEM_KE_QUY_TAI_SAN_KHAC_BBGN';
    try {
      this.isLoading = true;
      this._spinner.show();
      const res = (await this._reportService.getReportList(report_id, this.getFormRequest())).data;
      this.reportList = res.result;
      this.pageEvent.length = res.count;
      this.isLoading = false;
      this._spinner.hide();
    } catch (error) {
      this.isLoading = false;
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public getFormRequest() {
    const request = {
      report_id: '08_BB_KIEM_KE_QUY_TAI_SAN_KHAC_BBGN',
      tran_date: '',
      branch_id: this.f.report_branch.value,
      user_id: this.currentUser.username.toUpperCase(),
      tran_type: '',
      page_num: this.pageEvent.pageIndex,
      page_size: this.pageEvent.pageSize
    };
    if (this.f.report_date.value) {
      request.tran_date = moment(this.f.report_date.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    return request;
  }

  // Handle Events
  public async onChangeParent(e) {
    const request = {
      parent_id: e.id,
      rank: 3
    };
    try {
      this.branchList = (await this._categoryService.getBranch(request)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
    const branchFilter = this.branchList.filter(item => item.parent_id == e.id);
    const currentFilter = branchFilter.filter(item => item.code == this.branchCode)[0]?.code;
    this.f.report_branch.setValue(currentFilter);
  }

  public getBranchValue(code) {
    return this.branchList.filter(item => item.code == code)[0]?.display_name;
  };

  public getTypeValue(code) {
    return this.reportType.filter(item => item.code == code)[0]?.name;
  };

  setPaginatorData(page: any): void {
    this.pageEvent = page;
    this._getReportList();
  }

  // Handle Submits
  public openModal(type: string, code: any, item: any) {
    if (type == 'Add') {
      this.dialogCheckRef = this.dialog.open(ReportCreateComponent, {
        width: '70%',
        data: {
          report_type: '08_BB_KIEM_KE_QUY_TAI_SAN_KHAC_BBGN',
          report_type_list: code,
          branch_list: this.branchList,
          parent_branch_list: this.parentBranchList,
          user_list: this.userList,
        }
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        this._getReportList();
      });
    } else if (type == 'View') {
      this.dialogCheckRef = this.dialog.open(ReportDetailComponent, {
        width: '70%',
        data: {
          item,
          type: this.reportType,
          branch_list: this.branchList,
          parent_branch_list: this.parentBranchList,
        }
      });
      this.dialogCheckRef.afterClosed().subscribe((result) => {
        // this._getReportList();
      });
    }
  }

  public onSubmit() {
    this._getReportList();
  }

  public onClearForm() {
    this._formControl();
  }
}
