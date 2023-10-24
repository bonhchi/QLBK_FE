import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { SealBagService, SwAlertService, SealBagLimitService } from '@app/_services';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { SealbagBranchDetailComponent } from './sealbag-branch-detail/sealbag-branch-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '@app/_services/category.service';
@Component({
  selector: 'app-sealbag-branch',
  templateUrl: './sealbag-branch.component.html',
  styleUrls: ['./sealbag-branch.component.scss']
})
export class SealbagBranchComponent implements OnInit {
  form: FormGroup;
  public sealBagBranch: any[] = [];
  public limitArray: any[] = [];
  public totalRow: number = 0;
  public pageEvent: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0
  };
  listArray: any[] = []
  constructor(
    private _sealBagService: SealBagService,
    private _notificationService: NotificationService,
    private _formBuilder: FormBuilder,
    private _spinner: NgxSpinnerService,
    private _swAlertService: SwAlertService,
    private _limitService: SealBagLimitService,
    private _categoryService: CategoryService,
    public dialog: MatDialog,
  ) {

  }
  ngOnInit(): void {
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 10;
    this._formControl();
    this._getBranch()
    this._getData()

  }
  get f() {
    return this.form.controls;
  }

 private _formControl() {
    this.form = this._formBuilder.group({
      branch_id: [{ value: '', disabled: false }],
    })
  }


  private async _getBranch() {
    try {
      this.sealBagBranch = (await this._categoryService.getBranch("")).data;
      this.sealBagBranch.splice(0, 0, { id: '', display_name: 'Tất cả' });
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getData() {
    try {
      this._spinner.show();
      const param = { ...this.form.value };
      param.branch_id = this.form.value.branch_id == null ? '' : this.form.value.branch_id;
      param.pageNum = this.pageEvent.pageIndex;
      param.pageSize = this.pageEvent.pageSize;
      const res = await this._sealBagService.getListSealBagPagination(param)
      this.limitArray = res.data.body;
      this.totalRow = res.data.total_count;
      this._spinner.hide();
    } catch (error) {
      this._spinner.hide();
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public onBranch() {
    this._getData();
  }

  public  handleAddUpdate(branch_id) {
      this._swAlertService.withConfirmation(
        'Thông báo',
        'Bạn có chắc muốn tạo BNP tự đông không?', async () => {
          this._spinner.show();
          try {
            const res = await this._limitService.InsertUpdateBranchLimit(branch_id)
            if(res.code == 200){
              this._notificationService.success('Thành công', 'Bạn đã tạo BNP thành công' );
              this._spinner.hide();
              this._getData()
            }
          } catch (error : any) {
            this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
            this._spinner.hide();
          }
    
        },() => {

        }
      )
  }

 public onLimitBranch(item): void {
    const dialogRef = this.dialog.open(SealbagBranchDetailComponent, {
      width: '75%',
      maxWidth: '100%',
      data: { item }
    });
    dialogRef.afterClosed().subscribe(result => { });
  }


  public setPaginatorData(page) {
    this.pageEvent = page;
    this._getData();
  }

}
