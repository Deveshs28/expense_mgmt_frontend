import { Component, OnInit } from '@angular/core';
import { user } from '../users';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ExpenseApiService } from '../expense-api.service';
import { SocketService } from '../socket.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-expense',
  templateUrl: './create-expense.component.html',
  styleUrls: ['./create-expense.component.css'],
})
export class CreateExpenseComponent implements OnInit {
  public expenseTitle: string;
  public expenseAmount: string;
  public allUserList: user[] = [];
  public selectedUserId = '';
  public loading = false;
  public groupId: string;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: ExpenseApiService,
    private location: Location,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.groupId = this._route.snapshot.paramMap.get('groupId');
    this.fetchGroupUsers();
  }

  fetchGroupUsers() {
    this.loading = true;
    this.apiService.userListByGroup(this.groupId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.length > 0) {
            if (this.allUserList.length > 0) {
              this.allUserList.splice(0, this.allUserList.length);
            }
            this.allUserList = apiResponse.data;
          }
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

  createExpense() {
    if (!this.expenseTitle) {
      this.toastr.warning('Enter Expense Name');
    } else if (!this.expenseAmount) {
      this.toastr.warning('Enter expense amount');
    } else if (!this.selectedUserId) {
      this.toastr.warning('Select user who paid amount');
    } else {
      this.loading = true;
      this.apiService
        .createExpense(
          this.expenseTitle,
          this.expenseAmount,
          this.groupId,
          this.selectedUserId
        )
        .subscribe(
          (apiResponse) => {
            this.loading = false;
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.socketService.expenseCreatedSuccess(
                apiResponse.data.expenseId,
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
