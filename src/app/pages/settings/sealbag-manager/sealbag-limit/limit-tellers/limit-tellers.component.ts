import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddLimitTellersComponent } from './modal/add-limit-tellers/add-limit-tellers.component';
import { EditLimitTellersComponent } from './modal/edit-limit-tellers/edit-limit-tellers.component';
@Component({
  selector: 'app-limit-tellers',
  templateUrl: './limit-tellers.component.html',
  styleUrls: ['./limit-tellers.component.scss']
})
export class LimitTellersComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
  }

  public openForm(type, data) {
    switch (type) {
      case 'Add':
        const dialogRefAdd = this.dialog.open(AddLimitTellersComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefAdd.afterClosed().subscribe(result => {
        });
        break;
      case 'Edit':
        const dialogRefEdit = this.dialog.open(EditLimitTellersComponent, {
          width: '550px',
          data: { type: type }
        });
        dialogRefEdit.afterClosed().subscribe(result => {
        });
        break;

      default:
        break;
    }
  }
}
