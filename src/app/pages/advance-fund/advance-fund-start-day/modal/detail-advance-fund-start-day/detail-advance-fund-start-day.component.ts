import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { AdvanceFundService, AuthenticationService, MoneyToTextService, PermitService, SwAlertService } from '@app/_services';
import { CategoryService } from '@app/_services/category.service';
import { List } from 'linq-typescript';
import Swal from 'sweetalert2';
import _find from 'lodash/find';
import { Permit, User } from '@app/_models';
import { ADVANCE_FUND_STATUS, TYPE_ROLE_RESERVE_FUND } from '@app/_constant';
import { UserService } from '@app/_services/user.service';

@Component({
  selector: 'app-detail-advance-fund-start-day',
  templateUrl: './detail-advance-fund-start-day.component.html',
  styleUrls: ['./detail-advance-fund-start-day.component.scss']
})
export class DetailAdvanceFundStartDayComponent implements OnInit {
  form: FormGroup;
  public currentUser: User;
  public isLoading = false;
  public isLoadingAdd = false;
  public isConfrimLoading = false;
  public isApproveLoading = false;
  public isPrintLoading = false;
  public statementTypeList: any[] = [];
  public ccyList: any[] = [];
  public availableFundsList: any = [];
  public totalAmount = 0;
  public totalMoney = 0;
  public fundDetail: any = {};
  public type = '';
  public userList: any[] = [];
  public sealBagCheck: any = [];
  public sealbags: any = [];
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
  constructor(
    public dialogRef: MatDialogRef<DetailAdvanceFundStartDayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public moneyToTextService: MoneyToTextService,
    private _formBuilder: FormBuilder,
    private _notificationService: NotificationService,
    private _categoryService: CategoryService,
    private _advanceFundService: AdvanceFundService,
    private _notifierService: SwAlertService,
    private _permitService: PermitService,
    private _authenticationService: AuthenticationService,
    private _userService: UserService,
  ) {
    this.type_role = TYPE_ROLE_RESERVE_FUND;
    this.fundDetail = data.item;
    this.ccyList = data.ccyList;
    this.type = data.type,
      this.availableFundsList = data.item.def_price_detail_data;
    this.sealbags = data.item.sealbags;
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permit = this._permitService.getPermitByUser();
    this.branchId = this.currentUser.positions.branch.id;
  }

  ngOnInit(): void {
    this._getCategoryByCode();
    this._formControl();
    this._setFormControl();
    this._fetchUserRole();
    this._sum();
  }

  get f() {
    return this.form.controls;
  }

  private _formControl() {
    this.form = this._formBuilder.group({
      tran_type: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: false }],
      user_id: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      amount: [{ value: 0, disabled: false }],
      content: [{ value: '', disabled: false }],
    });
  }

  private _setFormControl() {
    this.f['tran_type'].setValue(this.fundDetail.tran_type);
    this.f['role'].setValue(this.fundDetail.role_func_id);
    this.f['user_id'].setValue(this.fundDetail.till_vault_id);
    this.f['ccy'].setValue(this.fundDetail.ccy);
    this.f['amount'].setValue(this.fundDetail.balance);
    this.f['content'].setValue(this.fundDetail.description);
    this.form.disable();

  }

  private async _getCategoryByCode() {
    try {
      const code = 'UNG_QUY_DAU_NGAY';
      this.statementTypeList = (await this._categoryService.getCategoryByCode(code)).data;
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
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

  private _sum() {
    this.totalAmount = new List<any>(this.availableFundsList).sum(s => (s.price * (s.number_heal + s.number_coin)));
    const sumSealBag = new List<any>(this.sealbags).sum(s => s.balance);
    this.totalMoney = this.totalAmount + sumSealBag;
  }

  public onApprove() {
    const id = this.fundDetail.id;
    this.isApproveLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc duyệt ứng quỹ đầu ngày  không?`,
      async () => {
        try {
          this.isApproveLoading = false;
          await this._advanceFundService.advanceFundApprove(id);
          this._notificationService.success('Thành công', 'Phê duyệt Ứng quỹ đầu ngày');
          this.closeFormDialog('DETAIL');
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
    this.isConfrimLoading = true;
    this._notifierService.withConfirmation(
      'Thông báo',
      `Bạn có chắc gửi duyệt ứng quỹ đầu ngày  không?`,
      async () => {
        try {
          this.isConfrimLoading = false;
          await this._advanceFundService.advanceFundSend(id);
          this._notificationService.success('Thành công', 'Gửi duyệt Ứng quỹ đầu ngày');
          this.closeFormDialog('DETAIL');
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
          this._notificationService.success('Thành công', 'Từ chối Ứng quỹ đầu ngày');
          this.closeFormDialog('DETAIL');
        } catch (error: any) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
    });
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
  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}

