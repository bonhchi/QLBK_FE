import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { MoneyToTextService } from '@app/_services/money-to-text.service';
import _find from 'lodash/find';
import { ADVANCE_FUND_STATUS, TYPE_ROLE_RESERVE_FUND } from '@app/_constant/index';
import { SwAlertService } from '@app/_services/sw-alert.service';
import Swal from 'sweetalert2';
import { AdvanceFundService, AuthenticationService, PermitService } from '@app/_services';
import { Permit, User } from '@app/_models';
import { UserService } from '@app/_services/user.service';

@Component({
  selector: 'app-advance-fun-day-detail',
  templateUrl: './advance-fun-day-detail.component.html',
  styleUrls: ['./advance-fun-day-detail.component.scss']
})
export class AdvanceFunDayDetailComponent implements OnInit {
  public permit: Permit;
  public form: FormGroup;
  public currentUser: User;
  public isLoading = false;
  public submitted = false;
  public ccy: any[] = [];
  public type_role: any = [];
  public isConfrimLoading = false;
  public isApproveLoading = false;
  public isPrintLoading = false;
  public isLoadingDelete = false;
  public totalStatement_money = 0;
  public userList: any[] = [];
  public branchId: any;
  public role:any;

  constructor(
    private _notificationService: NotificationService,
    private _notifierService: SwAlertService,
    private _advanceFundService: AdvanceFundService,
    private _permitService: PermitService,
    private formBuilder: FormBuilder,
    public moneyToText: MoneyToTextService,
    public dialogRef: MatDialogRef<AdvanceFunDayDetailComponent>,
    private _authenticationService: AuthenticationService,
    private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.type_role = TYPE_ROLE_RESERVE_FUND;
    this.permit = this._permitService.getPermitByUser();
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.branchId = this.currentUser.positions.branch.id;
    this.role = this.currentUser.role.every(e => { return e == "GDV" });
  }

  ngOnInit(): void {
    this._formControl();
    this._fetchUserRole();
  }

  get f() { return this.form.controls; }
  _formControl() {
    this.form = this.formBuilder.group({
      transaction_type: [{ value: this.data.item.tran_type, disabled: true }],
      role: [{ value: this.data.item.role_func_id, disabled: true }],
      ccy: [{ value: this.data.item.ccy, disabled: true }],
      amount: [{ value: this.data.item.balance, disabled: true }],
      user_position: [{ value: 'Chưa có thông tin', disabled: true }],
      user_name: [{ value: 'Chưa có thông tin', disabled: true }],
      till_vault_id: [{ value: this.data.item.till_vault_id, disabled: true }],
      description: [{ value: this.data.item.description, disabled: true }],
    });
  }

  private async _fetchUserRole() {
    const param = {
      roles_fcc: [""],
      branch_id: this.branchId,
    };
    try {
      this.userList = (await this._userService.getList(param)).data;
    } catch (error: any) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
  }

  public closeFormDialog(close: String) {
    this.dialogRef.close(close);
  }

  public calculatorTotal(statement_money) {
    let total = 0;
    statement_money.map((money) => {
      total += money.total;
    });
    return total;
  }

  public renderDataAdvanceStatus(status) {
    return _find(ADVANCE_FUND_STATUS, { 'code': status });
  }

  public confirmTransation() {
    this.isConfrimLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc gửi duyệt Ứng/Hoàn quỹ này không?`,
      async () => {
        try {
          this.isConfrimLoading = false;
          await this._advanceFundService.advanceFundSend(this.data.item.id);
          this._notificationService.success('Thành công', 'Gửi duyệt Ứng/Hoàn quỹ');
          this.closeFormDialog('detail');
        } catch (error: any) {
          this.isConfrimLoading = false;
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      },
      () => {
        this.isConfrimLoading = false;
      }
    );
  }

  public approveTransation() {
    this.isApproveLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc duyệt Ứng/Hoàn quỹ này không?`,
      async () => {
        try {
          this.isApproveLoading = false;
          await this._advanceFundService.advanceFundApprove(this.data.item.id);
          this._notificationService.success('Thành công', 'Phê duyệt Ứng/Hoàn quỹ');
          this.closeFormDialog('detail');
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

  public checkAction(status) {
    if (status == 'PHE_DUYET' && this.permit.is_approve && this.currentUser.username.toUpperCase() == this.data.item.till_vault_id && this.data.item.status == 'CHO_DUYET') {
      return true;
    }
    if (status == 'GUI_DUYET' && this.data.item.status == 'KHOI_TAO' && this.currentUser.username.toUpperCase() == this.data.item.maker_id) {
      return true;
    }
    if (status == 'DA_HUY' && this.permit.is_approve && this.currentUser.username.toUpperCase() == this.data.item.till_vault_id && this.data.item.status == 'CHO_DUYET') {
      return true;
    }
  }

  public refuseTransation() {
    Swal.fire({
      title: 'Từ chối giao dịch này',
      inputPlaceholder: 'Nhập lý do',
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.value) {
        try {
          await this._advanceFundService.advanceFundCancel(this.data.item.id, { 'description': result.value });
          this._notificationService.success('Thành công', 'Từ chối Ứng/Hoàn quỹ ');
          this.closeFormDialog('detail');
        } catch (error: any) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
    });
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

  public async printTransation() {
    try {
      this.isPrintLoading = true;
      await this._advanceFundService.advanceFundPrint(this.data.item.id).then(
        (result: Blob) => {
          this.isPrintLoading = false;
          // const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          // const url = window.URL.createObjectURL(blob);
          // window.open(url, '_blank');
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
}
