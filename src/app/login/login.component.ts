import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User, UserFactory } from '../user';
import { LocalStorageService } from 'angular-2-local-storage';
import { AlertsService } from '../alerts.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  user: User;

  constructor(
    protected authenticationService: AuthenticationService,
    protected formBuilder: FormBuilder,
    protected localStorage: LocalStorageService,
    protected userFactory: UserFactory,
    protected alertsService: AlertsService,
    protected userService: UserService,
    protected router: Router
  ) {}

  /** Retrieves the User data from the local storage */
  retrieveUser(): User {
    if (this.localStorage.get('user')) {
      const user: any = JSON.parse(this.localStorage.get('user'));
      return this.userFactory.create(user.email, user.password);
    }
    return null;
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: [ this.user ? this.user.email : '', Validators.email],
      password: [ this.user ? this.user.password : '', Validators.required],
      storeUser: [ this.user ]
    });
  }

  /**
   * Performs the login action for the User calling the relevant services
   */
  login( email: string, password: string ): void {
    this.authenticationService.authenticate(email, password)
      .subscribe(
        (user: User) => {
          if ( this.loginForm.get('storeUser').value ) {
            this.localStorage.set('user', JSON.stringify({ email: email, password: password }));
          } else {
            this.localStorage.remove('user');
          }
          this.authenticationService.setUser(user);
          this.userService.getActivity(user).subscribe(
            (d) => {
              user.activity = d;
          });
          this.router.navigate(['welcome']);
        },
        (error) => {
          this.loginForm.reset();
          this.alertsService.clear();
          this.alertsService.notify('Invalid email or password');
        }
      );
  }

  authenticate(): void {
    this.login( this.loginForm.get('email').value, this.loginForm.get('password').value );
  }

  ngOnInit() {
    this.alertsService.clear();
    this.user = this.retrieveUser();
    this.createForm();
  }

}
