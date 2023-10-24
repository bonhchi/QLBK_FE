import { Component, OnInit, Inject } from '@angular/core';
import {  FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MoneyToTextService } from '@app/_services';
import * as moment from 'moment';


@Component({
  selector: 'app-detail-fund-manage',
  templateUrl: './detail-fund-manage.component.html',
  styleUrls: ['./detail-fund-manage.component.scss']
})
export class DetailFundManageComponent implements OnInit {
  public branchList: any[] = [];
  public form: FormGroup;
  public detail: any = {}
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DetailFundManageComponent>,
    public moneyToTextService: MoneyToTextService,
  ) {
    this.detail = this.data.item
  }

  ngOnInit(): void {

  }

  public closeFormDialog(key: String) {
    this.dialogRef.close(close);
  }
}
