import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from '../socket.service';
import { ExpenseApiService } from '../expense-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public emailId: string;
  public password: string;
  public loading = false;
  public forgotPasswordEmail: string;
  public showForgotPasswordDialog = false;
  public emailPattern = '[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}';

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: ExpenseApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {}

  public loginUser = () => {
    if (!this.emailId) {
      this.toastr.warning('Enter email');
    } else if (!this.password) {
      this.toastr.warning('Enter password');
    } else {
      this.loading = true;
      this.apiService.loginUser(this.emailId, this.password).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log('resp: ', apiResponse);
          if (apiResponse.status === 200) {
            this.socketService.setUser(apiResponse.data.authToken);
            this.toastr.success('Login Successfull');
            let authToken = apiResponse.data.authToken;
            let userObj = apiResponse.data.userDetails;
            this.cookieService.set('authToken', authToken);
            this.cookieService.set('userId', userObj.userId);
            this.cookieService.set('userType', userObj.userType);
            this.apiService.setUserInfoInLocalStorage(userObj);
            this.router.navigate(['/home']);
          } else {
            this.toastr.error('Error while login');
          }
        },
        (err) => {
          this.loading = false;
          if (err.status === 404 || err.status === 500) {
            this.router.navigate([
              '/serverError',
              `${err.status}`,
              `${err.error.message}`,
            ]);
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  };

  public showForgotPassword = () => {
    this.showForgotPasswordDialog = true;
  };

  public processForgotPassword = () => {
    if (!this.forgotPasswordEmail) {
      this.toastr.warning('Enter email');
    } else {
      this.loading = true;
      this.apiService.forgotPassword(this.forgotPasswordEmail).subscribe(
        (apiResponse) => {
          this.loading = false;
          this.showForgotPasswordDialog = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.toastr.success(apiResponse.data.message);
          } else {
            this.toastr.error(
              'Error while sending request for forgot password'
            );
          }
        },
        (err) => {
          this.loading = false;
          this.showForgotPasswordDialog = false;
          if (err.status === 404 || err.status === 500) {
            this.router.navigate([
              '/serverError',
              `${err.status}`,
              `${err.error.message}`,
            ]);
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  };

  public hideForgotPasswordDialog = () => {
    this.showForgotPasswordDialog = false;
  };
}
