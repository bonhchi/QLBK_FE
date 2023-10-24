
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@app/_models/user';
import { AuthenticationService, CCYService, SealBagService, SwAlertService, MoneyToTextService } from '@app/_services';
import { SEALBAG_STATUS_CODE } from '@app/_constant/index';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageEvent } from '@angular/material/paginator';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { SealBagCloseComponent } from './dialog/seal-bag-close/seal-bag-close.component';
import { SealBagOpenComponent } from './dialog/seal-bag-open/seal-bag-open.component';
import { SealBagDetailComponent } from './dialog/seal-bag-detail/seal-bag-detail.component';
import { CategoryService } from '@app/_services/category.service';
import { List } from 'linq-typescript';
import { UtilService } from '@app/_services/util.service';

@Component({
  selector: 'app-seal-bag',
  templateUrl: './seal-bag.component.html',
  styleUrls: ['./seal-bag.component.scss']
})

export class SealBagComponent implements OnInit {
  public form: FormGroup;
  public statusList: any[] = [];
  public sealBagStatusCode: any = SEALBAG_STATUS_CODE;
  public ccyList: any = [];
  public sealBagList: any = [];
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  public loading = false;
  public role: any;
  public branchId: any;
  public model: any;
  public IsdateNow: any = false;
  public sealBagTypeList: any[] = [];
  public sealBagCode: any;
  public isEnableBNP = true;
  public isLoading = false;
  public currentUser: User;

  constructor(
    public dialog: MatDialog,
    public utilService: UtilService,
    public componentShareService: MoneyToTextService,
    private _sealBagService: SealBagService,
    private _formBuilder: FormBuilder,
    private _spinner: NgxSpinnerService,
    private _ccyService: CCYService,
    private _categoryService: CategoryService,
    private _authService: AuthenticationService,
    private _notificationService: NotificationService,
  ) {
    this.currentUser = this._authService.currentUserValue;
    this.branchId = this.currentUser.positions.branch.id;
  }

  async ngOnInit() {
    this._formControl();

    await this._getCcyList();
    await this._getSealBagTypeList();
    await this._getStatusList()

    this.onSearch();
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      branchId: [{ value: '', disabled: false }],
      sealBagCode: [{ value: '', disabled: false }],
      ccy: [{ value: '', disabled: false }],
      status: [{ value: '', disabled: false }],
      healTornCoin: [{ value: '', disabled: false }]
    });
  }

  public onSearch() {
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._getSealBagList()
  }

  private async _getCcyList() {
    try {
      const request = {
        active_flag: 1
      }
      this.ccyList = (await this._categoryService.getCcy(request)).data;
      this.ccyList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getSealBagTypeList() {
    try {
      const code = "BAO_NIEM_PHONG";
      this.sealBagTypeList = (await this._categoryService.getCategoryByCode(code)).data;
      this.sealBagTypeList.splice(0, 0, { code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getStatusList() {
    try {
      const code = "BAO_NIEM_PHONG";
      this.statusList = (await this._categoryService.getStatus(code)).data;
      this.statusList.splice(0, 0, { id: '', code: '', name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onClearForm() {
    this._formControl();
    this.onSearch();
  }

  public async openForm(type: string, item: any) {
    switch (type) {
      case 'OPEN':
        const dialogRefIteamOpenSealBag = this.dialog.open(SealBagOpenComponent, {
          width: '70%',
          data: { ccyList: this.ccyList, item: item }
        });
        dialogRefIteamOpenSealBag.afterClosed().subscribe(result => {
          if (result === 'update') {
            this._getSealBagList()
          }
        });
        break;

      case 'CLOSE':
        const dialogRefIteamCloseSealBag = this.dialog.open(SealBagCloseComponent, {
          width: '70%',
          data: { ccyList: this.ccyList, item: item }
        });
        dialogRefIteamCloseSealBag.afterClosed().subscribe(result => {
          if (result === 'update') {
            this._getSealBagList()
          }
        });
        break;

      case 'DETAIL':
        const dialogRefDetail = this.dialog.open(SealBagDetailComponent, {
          width: '70%',
          data: { ccyList: this.ccyList, item: item }
        });
        break;
      default:
        break;
    }
  }

  async sealbagDetail(sealbag_code: string) {
    try {
      const res = await this._sealBagService.sealbagDetail(sealbag_code)
      this.model = res.data.result;
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getSealBagList() {
    const sealBagCode = this.f.sealBagCode.value == null ? '' : this.f.sealBagCode.value;
    const ccy = this.f.ccy.value == null ? '' : this.f.ccy.value;
    const status = this.f.status.value == null ? '' : this.f.status.value;
    const healTornCoin = this.f.healTornCoin.value == null ? '' : this.f.healTornCoin.value;
    const request = {
      code: sealBagCode,
      ccy: ccy,
      status: status,
      type: healTornCoin,
      page_num: this.pageEvent.pageIndex,
      page_size: this.pageEvent.pageSize
    };

    try {
      this.isLoading = true;
      this._spinner.show();
      const res = await this._sealBagService.getSealbagList(request);
      this.sealBagList = res.data.result;
      this.pageEvent.length = res.data.count;
      this.isLoading = false;
      this._spinner.hide();
    } catch (error: any) {
      this.isLoading = false;
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public renderStatusClass(status: string) {
    const result = new List<any>(this.statusList).where(w => w.code == status).toArray()[0];
    return result;
  }

  public setPaginatorData(page) {
    this.pageEvent = page;
    this._getSealBagList()
  }
}


