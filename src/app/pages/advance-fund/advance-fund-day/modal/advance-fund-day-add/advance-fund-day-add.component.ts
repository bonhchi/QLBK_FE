import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import _find from "lodash/find";
import _remove from "lodash/remove";
import { NotificationService } from "@app/_components/notification/_services/notification.service";
import {
  AdvanceFundService,
  AuthenticationService,
  AuthService,
  CategoryService,
  FccService,
  MoneyToTextService,
} from "@app/_services";
import { User } from "@app/_models";
import { List } from "linq-typescript";
import { UtilService } from "@app/_services/util.service";
import { UserService } from "@app/_services/user.service";
@Component({
  selector: "app-advance-fund-day-add",
  templateUrl: "./advance-fund-day-add.component.html",
  styleUrls: ["./advance-fund-day-add.component.scss"],
})
export class AdvanceFundDayAddComponent implements OnInit {
  public form: FormGroup;
  public isLoading: boolean = false;
  public submitted: boolean = false;
  public ccy: any[] = [];
  public moneys: any[] = [];
  public userList: any[] = [];
  public availableFundsList: any[] = [];
  public isLoadingDelete: boolean = false;
  public totalStatement_money = 0;
  public isCalcFund = false;
  public currentUser: User;
  public totalAmount = 0;
  public branchId: any;
  public role: any;
  constructor(
    private _notificationService: NotificationService,
    private _autoNumber: UtilService,
    private _categoryService: CategoryService,
    private _advanceFundService: AdvanceFundService,
    private _authenticationService: AuthenticationService,
    private _userService: UserService,
    private formBuilder: FormBuilder,
    public moneyToTextService: MoneyToTextService,
    public dialogRef: MatDialogRef<AdvanceFundDayAddComponent>,

    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this._authenticationService.currentUser.subscribe((user) => (this.currentUser = user));
    this.data.transaction_roles = this.removeDumpFile(this.data.transaction_roles);
    this.data.transaction_types = this.removeDumpFile(this.data.transaction_types);
    this.data.users = this.removeDumpFile(this.data.users);
    this.branchId = this.currentUser.positions.branch.id;
    this.role = this.currentUser.role.every(e => { return e == "GDV" });
  }

  ngOnInit(): void {
    this._formControl();
    this._getCcy();
    this._getManagerTypeCcyList();
    this._fetchUserRole();
  }

  public removeDumpFile(origin) {
    _remove(origin, function (n) {
      return n.id == "";
    });
    return origin;
  }

  get f() { return this.form.controls; }

  private _formControl() {
    this.form = this.formBuilder.group({
      type: [{ value: this.data.transaction_types[0].type, disabled: false }],
      amount: [{ value: "", disabled: false }, Validators.required],
      user: [{ value: "", disabled: false }, Validators.required],
      role: [{ value: this.data.transaction_roles[0].id, disabled: false }],
      ccy: [{ value: "VND", disabled: false }],
      user_position: [{ value: "", disabled: true }],
      user_name: [{ value: "", disabled: true }],
      note: [{ value: `${this.currentUser?.username.toUpperCase()} UNG QUY TU `, disabled: false }],
    });
  }

  private async _getManagerTypeCcyList() {
    let till_vault_id =
      this.f.type.value == "UNG_QUY_TRONG_NGAY"
        ? this.f.user.value
        : this.currentUser.username;
    try {
      const request = {
        ccy: this.form.value.ccy,
        till_vault_id: till_vault_id,
      };

      const res = (await this._categoryService.getManagerType(request)).data;
      this.availableFundsList = res.map((m) => {
        m.total = 0;
        return m;
      });
    } catch (error) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public changeUserId() {
    let till_vault_id = this.f.user.value;
    if (this.f.type.value == "UNG_QUY_TRONG_NGAY") {
      this._getManagerTypeCcyList();
      this.f['note'].setValue(`${this.currentUser?.username.toUpperCase()} UNG QUY TU ${till_vault_id != null ? till_vault_id.toUpperCase() : ''}`);
    }
    if (this.f.type.value == "HOAN_QUY_TRONG_NGAY") {
      this.f['note'].setValue(`${this.currentUser?.username.toUpperCase()} HOAN QUY VE ${till_vault_id != null ? till_vault_id.toUpperCase() : ''}`);
    }
  }

  public onChangeCcy() {
    this._getManagerTypeCcyList();
  }

  private async _fetchUserRole() {
    const param = {
      roles_fcc: [""],
      branch_id: this.branchId,
    };
    try {
      const res = (await this._userService.getList(param)).data;
      this.userList = res.filter(item => item.role_fcc != null)
    } catch (error: any) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public handleChangeTranType(e) {
    let till_vault_id = this.f.user.value;
    this._getManagerTypeCcyList();
    if (e.type == "UNG_QUY_TRONG_NGAY") {
      this.f['note'].setValue(`${this.currentUser?.username.toUpperCase()} UNG QUY TU ${till_vault_id != null ? till_vault_id.toUpperCase() : ''}`);
    }
    if (e.type == "HOAN_QUY_TRONG_NGAY") {
      this.f['note'].setValue(`${this.currentUser?.username.toUpperCase()} HOAN QUY VE ${till_vault_id != null ? till_vault_id.toUpperCase() : ''}`);
    }
  }

  private async _getCcy() {
    try {
      const request = {
        ccy: this.form.value.ccy,
      };
      const res = (await this._categoryService.getManagerType(request)).data;
      this.moneys = res.map((m) => {
        m.total = 0;
        return m;
      });
    } catch (error) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public async autoNumber() {
    try {
      const res = await this._autoNumber.autoStatement(
        this.f.amount.value,
        this.availableFundsList
      );
      this._sum();
    } catch (error: any) {
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public async onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    if (this.f.amount.value == 0) {
      this._notificationService.error(
        "Thông báo",
        "Số tiền phải lớn hơn 0, Không thể Ứng/Hoàn quỹ"
      );
      return;
    }
    if (this.totalAmount != this.f.amount.value) {
      this._notificationService.error(
        "Thông báo",
        "Số tiền và tổng cộng phải bằng nhau"
      );
      this.f["amount"].setValue(0);
      return;
    }

    if (
      new List<any>(this.availableFundsList).any(
        (item) =>
          item.number_heal > 0 && item.available_number_heal < item.number_heal
      ) ||
      new List<any>(this.availableFundsList).any(
        (item) =>
          item.number_torn > 0 && item.available_number_torn < item.number_torn
      ) ||
      new List<any>(this.availableFundsList).any(
        (item) =>
          item.number_coin > 0 && item.available_number_coin < item.number_coin
      )
    ) {
      return;
    }

    try {
      this.isCalcFund = true;
      this.isLoading = true;
      var request = {
        ccy: this.f.ccy.value,
        tran_type: this.f.type.value,
        till_vault_id: this.f.user.value,
        balance: this.f.amount.value * 1,
        description: this.f.note.value,
        role_func_id: this.f.role.value,
        def_price_detail: this.availableFundsList,
        sealbags: [],
      };
      this.isLoading = true
      const res = await this._advanceFundService.create(request);
      this._notificationService.success("Thành công", "Tạo thành công");
      this.isLoading = false
      this.closeFormDialog("add");
    } catch (error: any) {
      this.isLoading = false
      this._notificationService.error(
        "Thông báo",
        error.error?.message ? error.error.message : error.message
      );
    }
  }

  public calTotalAmount(item: any) {
    item.total =
      item.price * (item.number_heal + item.number_torn + item.number_coin);
    this._sum();
  }

  private _sum() {
    this.totalAmount = new List<any>(this.availableFundsList).sum(
      (s) => s.price * (s.number_heal + s.number_torn + s.number_coin)
    );
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
      return 6
    }
    if (this.role == false && this.f.ccy.value === "VND") {
      return 8
    }
    if (this.role && this.f.ccy.value !== "VND") {
      return 6
    }
    if (this.role == false && this.f.ccy.value !== "VND") {
      return 6
    }
    return
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
}
