import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {MoneyAvailableComponent} from '@app/pages/money-available/money-available.component';
import { NotificationService } from '@app/_components/notification/_services/notification.service';
import { User } from '@app/_models';
import { AuthenticationService, FundService } from '@app/_services';
import { WorkingDateService } from '@app/_services/working-date.service';
import * as moment from 'moment';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  public dialogCheckRef: any;
  public currentUser: User;
  public dateTime: any;
  public workingDate: string;

  constructor(
    private _authenticationService: AuthenticationService,
    private _notificationService: NotificationService,
    private _fundService: FundService,
    private _workingDateService: WorkingDateService,
    public dialog: MatDialog,
    private _router: Router,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit(): void {
    this._getCurrentFundDate();
    this._getWorkingDate();
  }

  private async _getCurrentFundDate() {
    try {
      let date = (await this._fundService.getCurrentFundDate(this.currentUser.positions_fcc.branch_code)).data;
      this.dateTime = moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY')
    } catch (error: any) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  private async _getWorkingDate() {
    try {
      this.workingDate = await this._workingDateService.getWorkingDate()
      .pipe(first())
      .subscribe(
        (rs: any) => {
          this.workingDate = rs;
        },
        (error: any) => {
          this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
        }
      );
    } catch (error) {
      this._notificationService.error('Thông báo', (error.error?.message) ? error.error.message : error.message);
    }
  }

  public logout() {
    this._authenticationService.logout();
    this._workingDateService.clear();
    this._router.navigate(['login']);
  }

  public openModal() {
    this.dialogCheckRef = this.dialog.open(MoneyAvailableComponent, {
      width: '60%',
      // height: '500px',
      data: {'dateTime':this.dateTime} ,
    });
    // this.dialogCheckRef.afterClosed().subscribe((result) => { });
  }
}
