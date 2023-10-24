import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import _remove from 'lodash/remove';
import _find from 'lodash/find';
import { PageEvent } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
// import {TransferCustomerService } from '@app/_services';
import {SealbagBranchComponent} from './sealbag-branch/sealbag-branch.component'
import {SealbagLimitComponent} from './sealbag-limit/sealbag-limit.component'
@Component({
  selector: 'app-sealbag-manager',
  templateUrl: './sealbag-manager.component.html',
  styleUrls: ['./sealbag-manager.component.scss']
})
export class SealbagManagerComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

}
