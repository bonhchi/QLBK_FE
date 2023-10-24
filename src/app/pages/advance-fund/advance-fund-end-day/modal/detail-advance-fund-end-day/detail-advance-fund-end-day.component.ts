
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { AdvanceFundService, AuthenticationService, MoneyToTextService, PermitService, SwAlertService } from '@app/_services';
import { List } from 'linq-typescript';
import Swal from 'sweetalert2';
import _find from 'lodash/find';
import { Permit, User } from '@app/_models';
import { ADVANCE_FUND_STATUS, TYPE_ROLE_RESERVE_FUND } from '@app/_constant';
import { UserService } from '@app/_services/user.service';

@Component({
  selector: 'app-detail-advance-fund-end-day',
  templateUrl: './detail-advance-fund-end-day.component.html',
  styleUrls: ['./detail-advance-fund-end-day.component.scss']
})
export class DetailAdvanceFundEndDayComponent implements OnInit {
  form: FormGroup;
  public currentUser: User;
  public isLoading = false;
  public isLoadingAdd = false;
  public isSendLoading = false;
  public isPrintLoading = false;
  public isApproveLoading = false;

  public totalAmount = 0;
  public totalMoney = 0;

  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public availableFundsList: any = [];
  public fundDetail: any = {};
  public type = '';
  public userList: any[] = [];
  public sealbags: any = [];
  public userRoleList: any[] = [];
  public type_role: any = [];
  public permit: Permit = {
    is_query: false,
    is_add: false,
    is_delete: false,
    is_send_approve: false,
    is_upload: false,
    is_approve: false,
    is_approve_upload: false,
    is_edit: false,
    is_print: false,
    is_export: false,
    is_reject: false,
  };
  public branchId: any;
  public role:any;
  constructor(
    public dialogRef: MatDialogRef<DetailAdvanceFundEndDayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _advanceFundService: AdvanceFundService,
    private _notifierService: SwAlertService,
    private _permitService: PermitService,
    private _authenticationService: AuthenticationService,
    private _userService: UserService,
  ) {
    this.type_role = TYPE_ROLE_RESERVE_FUND;
    this.fundDetail = data.item;
    this.ccyList = data.ccyList;
    this.statementTypeList = data.transaction_type;
    this.availableFundsList = data.item.def_price_detail_data;
    this.sealbags = data.item.sealbags;
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
    this.branchId = this.currentUser.positions.branch.id;
    this.role = this.currentUser.role.every(e => { return e == "GDV" });
  }

  ngOnInit(): void {
    this._formControl();
    this._setFormControl();
    this._sum();
    this._fetchUserRole();
  }

  get f() {
    return this.form.controls;
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_type: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: false }],
      user_id: [{ value: '', disabled: false }],
      full_name: [{ value: '', disabled: false }],
      position: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      amount: [{ value: 0, disabled: false }],
      content: [{ value: '', disabled: false }],
    });
  }

  private _setFormControl() {
    this.f['tran_type'].setValue(this.fundDetail.tran_type);
    this.f['role'].setValue(this.fundDetail.role_func_id);
    this.f['user_id'].setValue(this.fundDetail.till_vault_id);
    this.f['full_name'].setValue('chưa có thông tin');
    this.f['position'].setValue('chưa có thông tin');
    this.f['ccy'].setValue(this.fundDetail.ccy);
    this.f['amount'].setValue(this.fundDetail.balance);
    this.f['content'].setValue(this.fundDetail.description);
    this.form.disable();
  }

  private _sum() {
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_coin)));
    if (this.sealbags) {
      const sumSealBag = new List<any>(this.sealbags).sum(s => s.balance);
      this.totalMoney = this.totalAmount + sumSealBag;
    }
  }

  private async _fetchUserRole() {
    const param = {
      roles_fcc: [''],
      branch_id: this.branchId,
    };
    try {
      this.userList = (await this._userService.getList(param)).data;
    } catch (error: any) {
      this._notificationService.error(
        'Thông báo',
        error.error?.message ? error.error.message : error.message
      );
    }
  }


  public onApprove() {
    const id = this.fundDetail.id;
    this.isApproveLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc duyệt  Hoàn quỹ cuối ngày  không?`,
      async () => {
        try {
          await this._advanceFundService.advanceFundApprove(id);
          this._notificationService.success('Thành công', 'Phê duyệt Hoàn quỹ cuối ngày');
          this.closeFormDialog('DETAIL');
          this.isApproveLoading = false;
        } catch (error: any) {
          this.isApproveLoading = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => {
        this.isApproveLoading = false;
      }
    );
  }

  public onSend() {
    const id = this.fundDetail.id;
    this.isSendLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc gửi duyệt Hoàn quỹ cuối ngày?`,
      async () => {
        try {
          await this._advanceFundService.advanceFundSend(id);
          this._notificationService.success('Thành công', 'Gửi duyệt Hoàn quỹ cuối ngày');
          this.closeFormDialog('DETAIL');
          this.isSendLoading = false;
        } catch (error: any) {
          this.isSendLoading = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => {
        this.isSendLoading = false;
      }
    );
  }
  public onCancel() {
    Swal.fire({
      title: 'Từ chối giao dịch này',
      inputPlaceholder: 'Nhập lý do',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.value) {
        const id = this.fundDetail.id;
        const param = {
          description: result.value
        };
        try {
          await this._advanceFundService.advanceFundCancel(id, param);
          this._notificationService.success('Thành công', 'Từ chối Hoàn quỹ cuối ngày');
          this.closeFormDialog('DETAIL');
        } catch (error: any) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
    });
  }

  public checkAction(status) {
    if (status == 'PHE_DUYET' && this.permit.is_approve && this.currentUser.username.toUpperCase() == this.fundDetail.till_vault_id && this.fundDetail.status == 'CHO_DUYET') {
      return true;
    }
    if (status == 'GUI_DUYET' && this.fundDetail.status == 'KHOI_TAO' && this.currentUser.username.toUpperCase() == this.fundDetail.maker_id) {
      return true;
    }
    if (status == 'DA_HUY' && this.permit.is_approve && this.currentUser.username.toUpperCase() == this.fundDetail.till_vault_id && this.fundDetail.status == 'CHO_DUYET') {
      return true;
    }
  }
  public renderDataAdvanceStatus(status) {
    return _find(ADVANCE_FUND_STATUS, { 'code': status });
  }

  public async onPrint() {
    try {
      this.isPrintLoading = true;
      await this._advanceFundService.advanceFundPrint(this.data.item.id).then(
        (result: Blob) => {
          this.isPrintLoading = false;
          // const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          // const url = window.URL.createObjectURL(blob);
          // // window.open(url, '_blank');
          // const link = document.createElement('a');
          // const fileName = this.data.item.code + '.pdf';
          // link.href = url;
          // link.setAttribute('download', fileName);
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);
          const blob = new Blob([result], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error => {
          this.isPrintLoading = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isPrintLoading = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public handleCheck() {
    if (this.role && this.f.ccy.value === "VND") {
      return false
    }
    return true
  }

  public handleColspan() {
    if (this.role && this.f.ccy.value === "VND") {
      return 2
    }
    if (this.role == false && this.f.ccy.value === "VND") {
      return 3
    }
    if (this.role && this.f.ccy.value !== "VND") {
      return 2
    }
    if (this.role == false && this.f.ccy.value !== "VND") {
      return 2
    }
    return
  }

  public handleColspanTotal(){
    if (this.role && this.f.ccy.value === "VND") {
      return 4
    }
    if (this.role == false && this.f.ccy.value === "VND") {
      return 5
    }
    if (this.role && this.f.ccy.value !== "VND") {
      return 4
    }
    if (this.role == false && this.f.ccy.value !== "VND") {
      return 4
    }
    return
  }

  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}

