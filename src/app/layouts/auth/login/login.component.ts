import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '@_services/authentication.service';
import { AlertService } from '@_components/alert/_services/alert.service';
import axios from 'axios';
import { environment } from '@environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public returnUrl!: string;
  public submitted: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private _authenticationService: AuthenticationService,
    private _alertService: AlertService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {
    // redirect to home if already logged in
    if (this._authenticationService.currentUserValue) {
      this._router.navigate(['/']);
    }

    this.loginForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
  }

  public get f() { return this.loginForm.controls; }

  public onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this._authenticationService.login(this.f['username'].value, this.f['password'].value)
      .pipe(first())
      .subscribe(
        (rs: any) => {
          this.isLoading = false;
          this._router.navigate([this.returnUrl]);

          // axios.defaults.baseURL = environment.apiUrl;
          // if (this._authenticationService.currentUserValue) {
          //   axios.defaults.headers.common['Authorization'] = `Bearer ${this._authenticationService.getJwtToken()}`;
          //   axios.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
          // } else {
          //   axios.defaults.headers.common['Authorization'] = "";
          // }
        },
        (error: any) => {
          this.isLoading = false;
          this._alertService.error(error.error.message);
        }
      )
  }
}
