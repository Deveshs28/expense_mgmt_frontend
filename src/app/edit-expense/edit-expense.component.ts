import { Component, OnInit } from '@angular/core';
import { user } from '../users';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ExpenseApiService } from '../expense-api.service';
import { SocketService } from '../socket.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.css'],
})
export class EditExpenseComponent implements OnInit {
  public expenseName: string;
  public expenseAmount: string;
  public expenseUserList: user[] = [];
  public selectedUserId = '';
  public loading = false;
  public expenseId: string;
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
    this.expenseId = this._route.snapshot.paramMap.get('expenseId');
    this.fetchExpenseDetails();
    this.onExpenseAmountUpdated();
    this.onExpensePayeeUpdated();
    this.onExpenseDeleted();
  }

  fetchExpenseMembers() {
    this.loading = true;
    this.apiService.userListByExpense(this.expenseId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.length > 0) {
            if (this.expenseUserList.length > 0) {
              this.expenseUserList.splice(0, this.expenseUserList.length);
            }
            this.expenseUserList = apiResponse.data;
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

  fetchExpenseDetails() {
    this.loading = true;
    this.apiService.expenseDetail(this.expenseId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log('expenseDertail:', apiResponse);
        if (apiResponse.status === 200) {
          this.expenseName = apiResponse.data.expense.name;
          this.expenseAmount = apiResponse.data.expense.amount.toString();
          this.groupId = apiResponse.data.expense.groupId;
          this.fetchExpenseMembers();
        } else if (apiResponse.status === 204) {
          this.toastr.error(apiResponse.message);
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
        console.log('err.status1', err.status);
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

  updatePayee() {
    if (this.selectedUserId) {
      console.log(this.selectedUserId);
      let selectedUser: user;
      for (let user of this.expenseUserList) {
        if (user.userId === this.selectedUserId) {
          selectedUser = user;
          break;
        }
      }
      this.loading = true;
      this.apiService
        .updateExpensePayee(
          this.expenseId,
          selectedUser.userId,
          `${selectedUser.firstName} ${selectedUser.lastName}`
        )
        .subscribe(
          (apiResponse) => {
            this.loading = false;
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.socketService.expensePayeeUpdateSuccess(
                selectedUser.userId,
                this.groupId,
                this.expenseId
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
    } else {
      this.toastr.error('Select User to add');
    }
  }

  updateAmount() {
    if (this.expenseAmount) {
      this.loading = true;
      this.apiService
        .updateExpenseAmount(this.expenseId, this.expenseAmount)
        .subscribe(
          (apiResponse) => {
            this.loading = false;
            console.log(apiResponse);
            if (apiResponse.status === 200) {
              this.socketService.expenseAmountUpdateSuccess(
                this.groupId,
                this.expenseId,
                this.expenseAmount
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
    } else {
      this.toastr.error('Enter Amount to update');
    }
  }

  onExpenseAmountUpdated() {
    this.socketService.onExpenseAmountUpdated().subscribe((data) => {
      console.log('onExpenseAmountUpdated ', data);
      if (data.expenseId === this.expenseId) {
        this.toastr.success('Expense amount updated');
        this.fetchExpenseDetails();
      }
    });
  }

  onExpensePayeeUpdated() {
    this.socketService.onExpensePayeeUpdated().subscribe((data) => {
      console.log('onExpensePayeeUpdated ', data);
      if (data.expenseId === this.expenseId) {
        this.toastr.success('Expense payee updated');
        this.fetchExpenseDetails();
      }
    });
  }

  onExpenseDeleted() {
    this.socketService.onExpenseDeleted().subscribe((data) => {
      console.log('onExpenseDeleted ', data);
      if (data.expenseId === this.expenseId) {
        this.toastr.success('Expense deleted');
        this.router.navigate(['home']);
      }
    });
  }
}
