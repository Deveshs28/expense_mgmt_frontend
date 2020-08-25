import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExpenseApiService } from '../expense-api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css'],
})
export class UpdatePasswordComponent implements OnInit {
  public password: string;
  public userId: string;
  public loading = false;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private apiService: ExpenseApiService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.userId = this._route.snapshot.paramMap.get('userId');
  }

  public updatePassword() {
    if (!this.password) {
      this.toastr.warning('Enter password');
    } else {
      this.loading = true;
      this.apiService.updatePassword(this.userId, this.password).subscribe(
        (response) => {
          this.loading = false;
          console.log(response);
          if (response.status === 200) {
            this.toastr.success('Password updated successfully');
            this.router.navigate(['/home'], { queryParams: { userId: '' } });
          } else if (response.status === 401) {
            this.router.navigate([
              '/serverError',
              `${response.status}`,
              `${response.message}`,
            ]);
            this.apiService.clearLoginData();
          } else {
            this.toastr.error(response.message);
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
  }
}
