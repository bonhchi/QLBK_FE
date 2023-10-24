import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { AuthenticationService, CategoryService, MoneyToTextService } from '@app/_services';
import { ReportService } from '@app/_services/report.service';
import * as moment from 'moment';
import { List } from 'linq-typescript';
import { HOI_DONG_KIEM_KE, TIEN_GIA_MAU } from '@app/_constant';
import { User } from '@app/_models';

@Component({
  selector: 'app-report-create',
  templateUrl: './report-create.component.html',
  styleUrls: ['./report-create.component.scss']
})
export class ReportCreateComponent implements OnInit {
  public currentUser: User;

  public form: FormGroup;
  public sealBagForm: FormGroup;
  public formInventory: FormGroup;
  public formAsset: FormGroup;
  public formHandOver: FormGroup;

  public branch: any;
  public userList: any;
  public user_name: any;
  public branchCode: any;
  public isDisableBranch: any;
  public isDisableParentBranch: any;

  public branchList: any[] = [];
  public parentBranchList: any[] = [];
  public thong_tin_giao_dich: any[] = [];

  public thanh_phan_ban_giao: any = {};
  public otherAssetList?: any[] = [];
  public commissionerList?: any[] = [];
  public controlList?: any[] = [];
  public ccyList: any[] = [];
  public moneyList: any[] = [];
  public moneyFakeList: any[] = [];
  public moneySampleList: any[] = [];
  public totalAmount = 0;

  public isLoading = false;
  public numberCountHSTS = {
    minus: true,
    number: 0,
    sum: false,
    end: 10,
  };
  public numberCountACTQ = {
    minus: true,
    number: 0,
    sum: false,
    end: 10,
  };

  public hoi_dong_kiem_ke: any = {
    so_quyet_dinh: '',
    ngay_ban_hanh: '',
    ho_ten_hddk: '',
    chuc_vu: '',
    uy_vien: [],
    to_kiem_dem: []
  };

  public sealBagCheck: any;
  public controlCheck: any;
  public handOverCheck: any;
  public moneyCheck: any;
  public branchId: any;
  public assetId: any;
  public controlId: any;
  public commissionerId: any;

  public objectAsset: any = {
    ten_tai_san: '',
    so_luong: 0
  };

  public objectControl: any = {
    ten_to_kiem_dem: '',
    chuc_vu: ''
  };
  public objectCommissioner = {
    ten_uy_vien: '',
    chuc_vu: ''
  };
  public isCode = false;
  public submitted = false;
  public submittedControl = false;
  public submitCommissioner = false;
  public isShowSealBag = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    private _categoryService: CategoryService,
    private _notificationService: NotificationService,
    private _report: ReportService,
    public dialogRef: MatDialogRef<ReportCreateComponent>,
    public moneyToTextService: MoneyToTextService,
    private _authenticationService: AuthenticationService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.branchId = this.currentUser.positions.branch.id;
    this.branchList = this.data.branch_list;
    this.userList = this.data.user_list;
    this.parentBranchList = this.data.parent_branch_list;
    this.branchCode = this.currentUser.positions.branch.code;
    this.isDisableParentBranch = this.currentUser.role.some(e => e == 'OTHER_USER' || e == 'ADMIN');
    this.isDisableBranch = this.currentUser.role.some(e => e == 'QC' || e == 'QP' || e == 'KSV' || e == 'GDV');
    this.isShowSealBag = this.currentUser.role.some(e => e == 'QP_CUM');
    this.moneyCheck = TIEN_GIA_MAU.includes(this.data.report_type);
    this.sealBagCheck = this.data.report_type == '01_KIEM_KE_QUY_GIUA_GIO_DOT_XUAT_THQ' || this.data.report_type == '02_KIEM_KE_QUY_CUOI_NGAY_TRUOC_HQ' || this.data.report_type == '03_KIEM_KE_QUY_CUOI_NGAY_SAU_HQ';
    this.controlCheck = HOI_DONG_KIEM_KE.includes(this.data.report_type);
    this.handOverCheck = this.data.report_type == '09_BB_KIEM_KE_BAN_GIAO_TAI_SAN_DVTQ';
  }

  async ngOnInit() {
    this._formControl();
    this._formAsset();
    this._formControlSealBag();
    this._formInventory();
    this._formHandOver();
    if (this.moneyCheck) {
      await this._getCcy();
    }
    this._getMoneyFake();
    this._getMoneySample();
    this.user_name = this.f.user.value;
    this.branch = this.data.branch_list.filter(item => item.code == this.branchCode)[0]?.code;
    if (this.isDisableBranch) {
      await this.form?.controls.branch_id.setValue(this.branch);
    }
    this.onSearch();
  }
  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this._formBuilder.group({
      created_date: [{ value: moment(new Date()).format('DD/MM/YYYY'), disabled: false }],
      branch_id: [{ value: '', disabled: !this.isDisableBranch }],
      parent_id: [{ value: '', disabled: !this.isDisableParentBranch }],
      user: [{ value: this.isDisableParentBranch ? null : this.currentUser.username.toUpperCase(), disabled: !this.isDisableParentBranch }],
    });
  }

  private _formControlSealBag() {
    this.sealBagForm = this._formBuilder.group({
      hsts_pledge_amount: [{ value: this.numberCountHSTS.number, disabled: true }],
      acqt_amount: [{ value: this.numberCountACTQ.number, disabled: true }],
    });
  }

  private _formInventory() {
    this.formInventory = this._formBuilder.group({
      date: [{ value: moment(new Date()).format('DD/MM/YYYY'), disabled: false }],
      position: [{ value: '', disabled: false }],
      full_name: [{ value: '', disabled: false }],
      decision: [{ value: '', disabled: false }],
      name_commissioner: [{ value: '', disabled: false }, Validators.required],
      position_commissioner: [{ value: '', disabled: false }, Validators.required],
      name_control: [{ value: '', disabled: false }, Validators.required],
      position_control: [{ value: '', disabled: false }, Validators.required],
    });
  }
  private _formAsset() {
    this.formAsset = this._formBuilder.group({
      asset_name: [{ value: '', disabled: false }, Validators.required],
      asset_amount: [{ value: 0, disabled: false }, Validators.required],
    });
  }
  private _formHandOver() {
    this.formHandOver = this._formBuilder.group({
      user_sender: [{ value: '', disabled: false }],
      position_sender: [{ value: '', disabled: false }],
      user_take: [{ value: '', disabled: false }],
      position_take: [{ value: '', disabled: false }],

    });
  }

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
    this.f.branch_id.setValue(currentFilter);
  }

  private async _getCcy() {
    try {
      const request = { active_flag: 1 };
      this.ccyList = (await this._categoryService.getCcy(request)).data;
      this.moneyList = this.ccyList.map(item => item.name);
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  // Hội đồng kiểm kê
  public addCommissioner() {
    this.submitCommissioner = true;
    if (this.formInventory.controls['name_commissioner'].invalid || this.formInventory.controls['position_commissioner'].invalid) {
      return;
    }
    const data = {
      id: Date.now(),
      ten_uy_vien: this.formInventory.value.name_commissioner,
      chuc_vu: this.formInventory.value.position_commissioner
    };
    this.commissionerList.push(data);
    this.formInventory.controls['name_commissioner'].setValue('');
    this.formInventory.controls['position_commissioner'].setValue('');

  }

  public deleteCommissioner(id) {
    const data = [...this.commissionerList];
    this.commissionerList = data.filter(item => item.id != id);
  }

  public editCommissioner(v) {
    this.objectCommissioner = {
      ten_uy_vien: v.ten_uy_vien,
      chuc_vu: v.chuc_vu
    };
    this.commissionerId = v.id;
    this.formInventory.controls['name_commissioner'].setValue(v.ten_uy_vien);
    this.formInventory.controls['position_commissioner'].setValue(v.chuc_vu);
  }

  public onUpdateCommissioner() {
    this.submitCommissioner = true;
    if (this.formInventory.controls['name_commissioner'].invalid || this.formInventory.controls['position_commissioner'].invalid) {
      return;
    }
    const data = [...this.commissionerList];
    const idxFound = data.findIndex(item => item.id == this.commissionerId);
    this.commissionerList[idxFound].ten_uy_vien = this.formInventory.value.name_commissioner;
    this.commissionerList[idxFound].chuc_vu = this.formInventory.value.position_commissioner;
    this.formInventory.controls['name_commissioner'].setValue('');
    this.formInventory.controls['position_commissioner'].setValue('');
    this.objectCommissioner = {
      ten_uy_vien: '',
      chuc_vu: ''
    };
  }

  public onDeleteCommissioner() {
    this.objectCommissioner = {
      ten_uy_vien: '',
      chuc_vu: ''
    };
    this.formInventory.controls['name_commissioner'].setValue('');
    this.formInventory.controls['position_commissioner'].setValue('');
  }
  // ---------
  public addcontrol() {
    this.submittedControl = true;
    if (this.formInventory.controls['name_control'].invalid || this.formInventory.controls['position_control'].invalid) {
      return;
    }
    const data = {
      id: Date.now(),
      ten_to_kiem_dem: this.formInventory.value.name_control,
      chuc_vu: this.formInventory.value.position_control
    };
    this.controlList.push(data);
    this.formInventory.controls['name_control'].setValue('');
    this.formInventory.controls['position_control'].setValue('');

  }

  public deletecontrol(id) {
    const data = [...this.controlList];
    this.controlList = data.filter(item => item.id != id);
  }

  public editControl(v) {

    this.objectControl = {
      ten_to_kiem_dem: v.ten_to_kiem_dem,
      chuc_vu: v.chuc_vu
    };
    this.controlId = v.id;
    this.formInventory.controls['name_control'].setValue(v.ten_to_kiem_dem);
    this.formInventory.controls['position_control'].setValue(v.chuc_vu);
  }

  public onUpdateControl() {
    this.submittedControl = true;
    if (this.formInventory.controls['name_control'].invalid || this.formInventory.controls['position_control'].invalid) {
      return;
    }
    const data = [...this.controlList];
    const idxFound = data.findIndex(item => item.id == this.controlId);
    this.controlList[idxFound].ten_to_kiem_dem = this.formInventory.value.name_control;
    this.controlList[idxFound].chuc_vu = this.formInventory.value.position_control;
    this.formInventory.controls['name_control'].setValue('');
    this.formInventory.controls['position_control'].setValue('');
    this.objectControl = {
      ten_to_kiem_dem: '',
      chuc_vu: ''
    };
  }

  public onDeleteControl() {
    this.objectControl = {
      ten_to_kiem_dem: '',
      chuc_vu: ''
    };
    this.formInventory.controls['name_control'].setValue('');
    this.formInventory.controls['position_control'].setValue('');
  }

  // -----------


  // Tiền giả
  private async _getMoneyFake() {
    this.moneyFakeList = this.moneyList.map((item) => {
      return ({
        ccy: item,
        balance: 0,
        ccyList: []
      });
    });
    try {
      this.moneyFakeList.map(async (item) => {
        item.ccyList = (await this._categoryService.getManagerType({ 'Ccy': item.ccy })).data.map(m => { m.total = 0; return m; });
        item.balance = new List<any>(item.ccyList).sum(s => (s.price * (s.number_heal)));
        return item;
      });
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }


  public calTotalAmount(item: any, v: any) {
    item.total = item.price * (item.number_heal);
    v.balance = new List<any>(v.ccyList).sum(s => (s.price * (s.number_heal)));
  }

  // Tiền mẫu
  private async _getMoneySample() {
    this.moneySampleList = this.moneyList.map((item) => {
      return ({
        ccy: item,
        balance: 0,
        ccyList: []
      });
    });
    try {
      this.moneySampleList.map(async (item) => {
        item.ccyList = (await this._categoryService.getManagerType({ 'Ccy': item.ccy })).data.map(m => { m.total = 0; return m; });
        item.balance = new List<any>(item.ccyList).sum(s => (s.price * (s.number_heal)));
        return item;
      });
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public totalSample(item: any, v: any) {
    item.total = item.price * (item.number_heal);
    v.balance = new List<any>(v.ccyList).sum(s => (s.price * (s.number_heal)));
  }


  public async onSearch() {
    // let query_data = {
    //   ngay_tao: "2022-09-20",
    //   ma_don_vi_cap_cha: "000",
    //   ma_don_vi: "104",
    //   user_name: "HONGNT1"
    // };
    const query_data = {
      ngay_tao: moment(this.f['created_date'].value, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      // ma_don_vi_cap_cha: "000",
      ma_don_vi: this.f.branch_id.value,
      user_name: this.f.user.value
    };


    try {
      const res = await this._report.getReportQuery(this.data.report_type, JSON.stringify(query_data));
      this.thong_tin_giao_dich = res.data.thong_tin_giao_dich;

      this.user_name = this.f.user.value;
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
      this.thong_tin_giao_dich = [];
    }
  }

  // Tài sản khác
  public addOtherAsset() {
    this.submitted = true;
    if (this.formAsset.invalid) {
      return;
    }
    const data = {
      id: Date.now(),
      ten_tai_san: this.formAsset.value.asset_name,
      so_luong: this.formAsset.value.asset_amount
    };
    this.otherAssetList.push(data);
    this.formAsset.reset();
  }

  public handleDelete(id) {
    const data = [...this.otherAssetList];
    this.otherAssetList = data.filter(item => item.id != id);
  }

  public editOtherAsset(v) {
    this.objectAsset = {
      ten_tai_san: v.ten_tai_san,
      so_luong: v.so_luong
    };
    this.assetId = v.id;
    this.formAsset.controls['asset_name'].setValue(v.ten_tai_san);
    this.formAsset.controls['asset_amount'].setValue(v.so_luong);
  }

  public onUpdate() {
    this.submitted = true;
    if (this.formAsset.invalid) {
      return;
    }
    const data = [...this.otherAssetList];
    const idxFound = data.findIndex(item => item.id == this.assetId);
    this.otherAssetList[idxFound].ten_tai_san = this.formAsset.value.asset_name;
    this.otherAssetList[idxFound].so_luong = this.formAsset.value.asset_amount;
    this.formAsset.reset();
    this.objectAsset = {
      ten_tai_san: '',
      so_luong: 0
    };
  }

  public onDelete() {
    this.objectAsset = {
      ten_tai_san: '',
      so_luong: 0
    };
    this.formAsset.reset();
  }
  // -----------

  public async onSave() {
    const query_data = {
      // ngay_tao: "2022-09-20",
      // ma_don_vi_cap_cha: "000",
      // ma_don_vi: "104",
      // user_name: "HONGNT1"
      ngay_tao: moment(this.f['created_date'].value, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      // ma_don_vi_cap_cha: "000",
      ma_don_vi: this.f.branch_id.value,
      user_name: this.f.user.value
    };


    this.hoi_dong_kiem_ke = {
      so_quyet_dinh: this.formInventory.value.decision,
      ngay_ban_hanh: moment(this.formInventory.controls['date'].value, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      ho_ten_hddk: this.formInventory.value.full_name,
      chuc_vu: this.formInventory.value.position,
      uy_vien: this.commissionerList,
      to_kiem_dem: this.controlList,
    };

    this.thanh_phan_ban_giao = {
      ten_ben_giao: this.formHandOver.value.user_sender,
      chuc_vu_ben_giao: this.formHandOver.value.position_sender,
      ten_ben_nhan: this.formHandOver.value.user_take,
      chuc_vu_ben_nhan: this.formHandOver.value.position_take,
    };


    const param = {
      query_data: query_data,
      data: {
        thong_tin_giao_dich: this.thong_tin_giao_dich,
        hoi_dong_kiem_ke: this.controlCheck ? this.hoi_dong_kiem_ke : null,
        thanh_phan_ban_giao: this.handOverCheck ? this.thanh_phan_ban_giao : null,
        bnp_hsts_acqt: {
          hsts: this.sealBagForm.value.hsts_pledge_amount,
          acqt: this.sealBagForm.value.acqt_amount
        },
        tai_san_khac: this.otherAssetList,
        tien_gia: this.moneyCheck ? this.moneyFakeList : null,
        tien_mau: this.moneyCheck ? this.moneySampleList : null,
      }
    };
    // return
    try {
      const res = await this._report.create(this.data.report_type, param);
      this._notificationService.success('Thành công', 'Tạo thành công');
      this.closeFormDialog(close);
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public changeFormCountHSTS(type) {
    const data = this.numberCountHSTS;
    if (type == 'next') {
      data.number += 1;
      this.sealBagForm.value.hsts_pledge_amount = data.number;
      if (data.number > 1) {
        data.minus = false;
      }
    }
    if (type == 'prev') {
      data.number -= 1;
      this.sealBagForm.value.hsts_pledge_amount = data.number;
      if (data.number == 1) {
        data.minus = true;
      }
    }
    if (data.number < data.end) {
      data.sum = false;
    }
  }

  public changeFormCountACQT(type) {
    const data = this.numberCountACTQ;
    if (type == 'next') {
      data.number += 1;
      this.sealBagForm.value.acqt_amount = data.number;
      if (data.number > 1) {
        data.minus = false;
      }
    }
    if (type == 'prev') {
      data.number -= 1;
      this.sealBagForm.value.acqt_amount = data.number;
      if (data.number == 1) {
        data.minus = true;
      }
    }
  }

  public onClearForm() {

  }
  
  public closeFormDialog(close) {
    this.dialogRef.close(close);
  }
}

