import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NOTIFICATION } from '@app/_constant';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, MoneyToTextService, WarehouseImportExportService, SwAlertService } from '@app/_services/';
import { List } from 'linq-typescript';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { UtilService } from '@app/_services/util.service';
@Component({
  selector: 'app-import-export-detail',
  templateUrl: './import-export-detail.component.html',
  styleUrls: ['./import-export-detail.component.scss'],
})
export class ImportExportDetailComponent implements OnInit {
  public form: FormGroup;
  public currentUser: User;

  public submitted = false;
  public isLoading = false;
  public isSendLoading = false;
  public isDelLoading = false;
  public isApproveLoading = false;
  public isRefuseLoading = false;
  public isRevertLoading = false;
  public isLoadingPrintWord = false;
  public isLoadingPrintPDF = false;

  public totalAmount: any;
  public dialogCheckRef: any;
  public transType: any = [];
  public moneyList: any = [];
  public sealbagList: any = [];

  constructor(
    public dialog: MatDialog,
    public utilService: UtilService,
    public moneyToText: MoneyToTextService,
    public dialogRef: MatDialogRef<ImportExportDetailComponent>,
    private formBuilder: FormBuilder,
    private _swAlertService: SwAlertService,
    private _notificationService: NotificationService,
    private _authenticationService: AuthenticationService,
    private _warehouseImportExportService: WarehouseImportExportService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currentUser = this._authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.transType = this.data.transType;
    this.moneyList = this.data.item.def_price_detail;
    this.sealbagList = this.data.item?.sealbags;
    this.totalAmount = new List<any>(this.data.item.def_price_detail).sum(s => s.price * (s.number_heal + s.number_torn + s.number_coin));
    this._formControl();
  }

  get f() { return this.form.controls; }

  // Handle Events
  private _formControl() {
    this.form = this.formBuilder.group({
      transaction_code: [{ value: this.data.item.code, disabled: true }],
      transaction_type: [{ value: this.data.item.tran_type, disabled: true }],
      transaction_date: [{ value: moment(this.data.item.maker_at).format('DD/MM/YYYY'), disabled: true }],
      transaction_ccy: [{ value: this.data.item.ccy, disabled: true }],
      user_name: [{ value: this.data.item.maker_id, disabled: true }],
      transaction_content: [{ value: this.data.item.description, disabled: true }],
    });
  }

  public onRevert() {
    Swal.fire({
      title: 'Bạn muốn hoàn duyệt giao dịch này',
      inputPlaceholder: 'Nhập lý do',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: '#1825aa',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.value) {
        try {
          await this._warehouseImportExportService.send_revert(this.data.item.id, result.value);
          this._notificationService.success(NOTIFICATION, 'Nội dung đã được gửi thành công!');
          this.closeFormDialog('detail');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
    });
  }

  public async onSend() {
    this.isSendLoading = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Anh/Chị có muốn gửi duyệt dữ liệu này không?',
      async () => {
        try {
          await this._warehouseImportExportService.send(this.data.item.id);
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được gửi duyệt thành công!');
          this.isSendLoading = false;
          this.closeFormDialog('detail');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
          this.isSendLoading = false;
        }
      },
      () => {
        this.isSendLoading = false;
      }
    );
  }

  public onApprove() {
    this.isApproveLoading = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Anh/Chị có muốn phê duyệt dữ liệu này không?',
      async () => {
        try {
          await this._warehouseImportExportService.approve(this.data.item.id);
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được phê duyệt thành công!');
          this.isApproveLoading = false;
          this.closeFormDialog('detail');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
          this.isApproveLoading = false;
        }
      },
      () => {
        this.isApproveLoading = false;
      }
    );
  }

  public onCancel() {
    Swal.fire({
      title: 'Bạn đồng ý không duyệt giao dịch này',
      inputPlaceholder: 'Nhập lý do',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: '#1825aa',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.value) {
        try {
          const request = { description: result.value };
          await this._warehouseImportExportService.cancel(this.data.item.id, request);
          this._notificationService.success(NOTIFICATION, 'Nội dung đã được gửi thành công!');
          this.closeFormDialog('detail');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      }
    });
  }

  public async onPrintPDF() {
    try {
      this.isLoadingPrintPDF = true;
      await this._warehouseImportExportService.print(this.data.item.id, 'pdf').then(
        (result: Blob) => {
          this.isLoadingPrintPDF = false;
          // const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          // const url = window.URL.createObjectURL(blob);
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
          this.isLoadingPrintPDF = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoadingPrintPDF = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public async onPrintWord() {
    try {
      this.isLoadingPrintWord = true;
      await this._warehouseImportExportService.print(this.data.item.id, 'doc').then(
        (result: Blob) => {
          this.isLoadingPrintWord = false;
          const blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = this.data.item.code + '.doc';
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error => {
          this.isLoadingPrintWord = false;
          this._notificationService.error('Thông báo', (error.error.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this.isLoadingPrintWord = false;
      this._notificationService.error('Thông báo', error.error?.message ? error.error.message : error.message);
    }
  }

  public async onDelete() {
    this.isDelLoading = true;
    this._swAlertService.withConfirmation(
      NOTIFICATION,
      'Bạn có muốn hủy dữ liệu này không?',
      async () => {
        try {
          await this._warehouseImportExportService.delete(this.data.item.id);
          this._notificationService.success(NOTIFICATION, 'Dữ liệu đã được hủy thành công!');
          this.isDelLoading = false;
          this.closeFormDialog('detail');
        } catch (error) {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
          this.isDelLoading = false;
        }
      },
      () => {
        this.isDelLoading = false;
      }
    );
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
