import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from '../socket.service';
import { ExpenseApiService } from '../expense-api.service';
import { user } from '../users';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css'],
})
export class CreateGroupComponent implements OnInit {
  public groupTitle: string;
  public loading = false;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: ExpenseApiService,
    private location: Location,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {}

  public createGroup() {
    if (!this.groupTitle) {
      this.toastr.warning('Enter Group Title');
    } else {
      const userObj = this.apiService.getUserInfoFromLocalStorage();
      const data = {
        name: this.groupTitle,
        createdByName: `${userObj.firstName} ${userObj.lastName}`,
        createdById: this.cookieService.get('userId'),
      };
      this.loading = true;

      this.apiService.createGroup(data).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.socketService.groupCreatedSuccess(
              apiResponse.data.groupId,
              apiResponse.data.name,
              apiResponse.data.userList
            );
            this.toastr.success(apiResponse.message);
            this.location.back();
          } else if (apiResponse.status === 401) {
            this.router.navigate([
              '/serverError',
              `${apiResponse.status}`,
              `${apiResponse.message}`,
            ]);
            this.apiService.clearLoginData();
          } else {
            this.toastr.error(apiResponse.message);
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
          } else if (err.status === 401) {
            this.router.navigate([
              '/serverError',
              `${err.status}`,
              `${err.error.message}`,
            ]);
            this.apiService.clearLoginData();
          } else {
            this.toastr.error(err.error.message);
          }
        }
      );
    }
  }
}
