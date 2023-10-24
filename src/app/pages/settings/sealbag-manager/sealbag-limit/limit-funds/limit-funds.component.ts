import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddLimitFundsComponent } from './modal/add-limit-funds/add-limit-funds.component';
import { EditLimitFundsComponent } from './modal/edit-limit-funds/edit-limit-funds.component';
import { DetailLimitFundsComponent } from './modal/detail-limit-funds/detail-limit-funds.component';
@Component({
  selector: 'app-limit-funds',
  templateUrl: './limit-funds.component.html',
  styleUrls: ['./limit-funds.component.scss']

})
export class LimitFundsComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
  }

  public openForm(type, data) {
    switch (type) {
      case 'Add':
        const dialogRefAdd = this.dialog.open(AddLimitFundsComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefAdd.afterClosed().subscribe(result => {
        });
        break;
      case 'Edit':
        const dialogRefEdit = this.dialog.open(EditLimitFundsComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefEdit.afterClosed().subscribe(result => {
        });
        break;
      case 'Detail':
        const dialogRefDetail = this.dialog.open(DetailLimitFundsComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefDetail.afterClosed().subscribe(result => {
        });
        break;

      default:
        break;
    }
  }

}
