import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, CategoryService, MoneyToTextService } from '@app/_services';
import { ReportService } from '@app/_services/report.service';
import { List } from 'linq-typescript';
import * as moment from 'moment';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent implements OnInit {
  public currentUser: User;

  public form: FormGroup;
  public sealBagForm: FormGroup;
  public formInventory: FormGroup;
  public formHandOver: FormGroup;

  public branch: any;
  public userList: any;
  public user_name: any;
  public branchData: any;
  public branchCode: any;
  public otherAsset: any;
  public fakeMoney: any;
  public counter: any;
  public member: any;
  public checker: any;
  public sampleMoney: any;
  public transfer: any;
  public sealbag_hsts_acqt: any;
  public branchId: any;
  public transactionInfo: any;
  public isDisableBranch: any;
  public isDisableParentBranch: any;

  public branchList: any[] = [];
  public parentBranchList: any[] = [];
  public totalAmount = 0;

  public isSealbagCheck = false;
  public isLoading = false;
  public isLoadingPDF = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _reportService: ReportService,
    public dialogRef: MatDialogRef<ReportDetailComponent>,
    public moneyToTextService: MoneyToTextService,
    private _authenticationService: AuthenticationService,
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
    const branchId = this.data.item.branch_id;
    this.branchData = this.data.branch_list.filter(item => item.code == branchId)[0]?.display_name;
    this.counter = this.data.item.data?.hoi_dong_kiem_ke;
    this.transfer = this.data.item.data?.thanh_phan_ban_giao;
    this.parentBranchList = this.data.parent_branch_list;
  }

  async ngOnInit() {
    this._formControl();
    this._formInventory();
    this._formHandOver();
    this.member = this.counter?.uy_vien;
    this.checker = this.counter?.to_kiem_dem;
    this.fakeMoney = this.data.item.data?.tien_gia;
    this.sampleMoney = this.data.item.data?.tien_mau;
    this.user_name = this.data.item.query_data?.user_name;
    this.otherAsset = this.data.item.data?.tai_san_khac;
    this.sealbag_hsts_acqt = this.data.item.data?.bnp_hsts_acqt;
    this.branch = this.data.branch_list.filter(item => item.code == this.branchCode)[0]?.code;
    if (this.isDisableBranch) {
      await this.form?.controls.branch_id.setValue(this.branch);
    }
    this.transactionInfo = this.data.item.data?.thong_tin_giao_dich;
  }

  get f() { return this.form.controls; }

  // Get API
  private _formControl() {
    this.form = this._formBuilder.group({
      created_date: [{ value: moment(this.data.item.maker_at).format('DD/MM/YYYY'), disabled: true }],
      branch_id: [{ value: this.branchData, disabled: true }],
      parent_id: [{ value: '', disabled: true }],
      user: [{ value: this.data.item.maker_id, disabled: true }],
    });
  }

  private _formInventory() {
    this.formInventory = this._formBuilder.group({
      date: [{ value: moment(this.counter?.ngay_ban_hanh).format('DD/MM/YYYY'), disabled: true }],
      position: [{ value: this.counter?.chuc_vu, disabled: true }],
      full_name: [{ value: this.counter?.ho_ten_hddk, disabled: true }],
      decision: [{ value: this.counter?.so_quyet_dinh, disabled: true }],
    });
  }

  private _formHandOver() {
    this.formHandOver = this._formBuilder.group({
      user_sender: [{ value: this.transfer?.ten_ben_giao, disabled: true }],
      position_sender: [{ value: this.transfer?.chuc_vu_ben_giao, disabled: true }],
      user_take: [{ value: this.transfer?.ten_ben_nhan, disabled: true }],
      position_take: [{ value: this.transfer?.chuc_vu_ben_nhan, disabled: true }],
    });
  }

  // Handle Events
  public totalSample(item: any, v: any) {
    item.total = item.price * (item.number_heal);
    v.balance = new List<any>(v.ccyList).sum(s => (s.price * (s.number_heal)));
  }

  public calTotalAmount(item: any, v: any) {
    item.total = item.price * (item.number_heal);
    v.balance = new List<any>(v.ccyList).sum(s => (s.price * (s.number_heal)));
  }

  public getValue(report_id) {
    return this.data.type.filter(item => item.code === report_id)[0]?.name;
  }

  // Handle Submits
  public async onPDFPrint() {
    const id = this.data.item.id;
    const report_id = this.data.item.report_id;
    const user = this.data.item.maker_id;
    try {
      this.isLoadingPDF = true;
      await this._reportService.print(report_id, id, 'pdf', user).then(
        (result: Blob) => {
          this.isLoadingPDF = false;
          const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = this.data.item.report_id + '.pdf';
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error => {
          this.isLoadingPDF = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoadingPDF = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public async onExcelExport() {
    const id = this.data.item.id;
    const report_id = this.data.item.report_id;
    const user = this.data.item.maker_id;
    try {
      this.isLoading = true;
      await this._reportService.print(report_id, id, 'xlsx', user).then(
        (result: Blob) => {
          this.isLoading = false;
          const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = this.data.item.report_id + '.xlsx';
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error => {
          this.isLoading = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoading = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}
