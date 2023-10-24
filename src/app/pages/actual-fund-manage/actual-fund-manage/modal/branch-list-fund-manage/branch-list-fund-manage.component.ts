import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LOCK_DAY_STATUS } from '@app/_constant';
import _clone from 'lodash/clone';
import _find from 'lodash/find';

@Component({
  selector: 'app-branch-list-fund-manage',
  templateUrl: './branch-list-fund-manage.component.html',
  styleUrls: ['./branch-list-fund-manage.component.scss']
})
export class BranchListFundManageComponent implements OnInit {
  public isLoading: boolean = false;
  public dataList: any[] = [];
  public dataOrgList: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BranchListFundManageComponent>,
  ) {
    this.dataList = _clone(data.branchList);
    this.dataOrgList = _clone(data.branchList);
  }

  ngOnInit(): void {
  }

  public onFilter(item: any) {
    if(item) {
      this.dataList = this.dataOrgList.filter(f => f.code == item.code);
    } else {
      this.dataList = this.dataOrgList;
    }    
  }

  public renderFundStatus(status) {
    return _find(LOCK_DAY_STATUS, { 'id': status });
  }

  public closeFormDialog(close: any) {
    this.dialogRef.close(close);
  }
}
