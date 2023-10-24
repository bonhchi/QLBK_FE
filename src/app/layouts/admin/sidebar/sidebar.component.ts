import { Component, OnInit } from '@angular/core';

import { User } from '@app/_models';
import { AuthenticationService } from '@app/_services';
import { JWT_TOKEN ,REFRESH_TOKEN, CURRENT_USER, ORG_MENU, MENU } from '@app/_constant';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public currentUser: User;
  public menus: any[] = [];

  constructor(
    private _authenticationService: AuthenticationService,
  ) {
    this._authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.menus = JSON.parse(localStorage.getItem(MENU)!);
  }

  ngAfterViewInit() {
    const sidebar = document.getElementsByClassName('sidebar')[0];
    sidebar?.addEventListener('show.bs.collapse', function (this: HTMLElement, ev: Event) {
      this.querySelector('.collapse.show')?.classList.remove('show');
    });
  }

  mouseEnter(event: Event) {
    if(document.body.classList.contains('sidebar-icon-only')) {
      (event.target as HTMLElement).classList.add('hover-open');
    }      
  }

  mouseLeave(event: Event) {
    if(document.body.classList.contains('sidebar-icon-only')) {
      (event.target as HTMLElement).classList.remove('hover-open');
    }    
  }
}
