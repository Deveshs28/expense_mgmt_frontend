import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { ExpenseApiService } from '../expense-api.service';
import { SocketService } from '../socket.service';
import { user } from '../users';
import { Location } from '@angular/common';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css'],
})
export class ExpenseDetailComponent implements OnInit {
  public expenseName: string;
  public expenseAmount: string;
  public expenseCreateDate: string;
  public payeeName: string;
  public groupUserList: user[] = [];
  public members = [];
  public expensesHistoryList = [];
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
    this.onUserAddedInExpense();
    this.onUserAddedInGroup();
    this.onUserRemovedFromExpense();
    this.onExpenseAmountUpdated();
    this.onExpensePayeeUpdated();
    this.onExpenseDeleted();
  }

  fetchGroupUsers(groupId) {
    this.loading = true;
    this.apiService.userListByGroup(groupId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.length > 0) {
            if (this.groupUserList.length > 0) {
              this.groupUserList.splice(0, this.groupUserList.length);
            }
            this.groupUserList = apiResponse.data;
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
          this.expenseCreateDate = apiResponse.data.expense.createdOn;
          if (apiResponse.data.membersList.length > 0) {
            this.members.splice(0, this.members.length);
            let count = apiResponse.data.membersList.length;
            let amountPending =
              Math.round(
                (apiResponse.data.expense.amount / count + Number.EPSILON) * 100
              ) / 100;
            const tempMemberList = [];
            for (let user of apiResponse.data.membersList) {
              if (user.userId !== apiResponse.data.expense.paidByUserId) {
                const obje = {
                  name: `${user.firstName} ${user.lastName}`,
                  pendingAmount: `Rs. ${amountPending.toString()}`,
                  isPayee: false,
                  userId: user.userId,
                };
                tempMemberList.push(obje);
              } else {
                this.payeeName = `${user.firstName} ${user.lastName}`;
                const obje = {
                  name: `${user.firstName} ${user.lastName}`,
                  pendingAmount: 'Paid Bill',
                  isPayee: true,
                  userId: user.userId,
                };
                tempMemberList.push(obje);
              }
            }
            this.members = tempMemberList;
          }
          if (apiResponse.data.expenseHistory.length > 0) {
            this.expensesHistoryList.splice(0, this.expensesHistoryList.length);
            this.expensesHistoryList = apiResponse.data.expenseHistory;
          }
          this.groupId = apiResponse.data.expense.groupId;
          this.fetchGroupUsers(apiResponse.data.expense.groupId);
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

  addMember() {
    if (this.selectedUserId) {
      console.log(this.selectedUserId);
      let isUserMember = false;
      for (let user of this.members) {
        if (user.userId === this.selectedUserId) {
          isUserMember = true;
          break;
        }
      }
      if (isUserMember) {
        this.toastr.error('User already expense member');
      } else {
        let selectedUser: user;
        for (let user of this.groupUserList) {
          if (user.userId === this.selectedUserId) {
            selectedUser = user;
            break;
          }
        }
        this.loading = true;
        this.apiService
          .addUserInExpense(
            this.expenseId,
            selectedUser.userId,
            `${selectedUser.firstName} ${selectedUser.lastName}`
          )
          .subscribe(
            (apiResponse) => {
              this.loading = false;
              console.log(apiResponse);
              if (apiResponse.status === 200) {
                this.socketService.userAddedInExpenseSuccess(
                  selectedUser.userId,
                  this.groupId,
                  this.expenseId
                );
                this.toastr.success(apiResponse.message);
                this.fetchExpenseDetails();
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
    } else {
      this.toastr.error('Select User to add');
    }
  }

  editExpense() {
    this.router.navigate(['edit', this.expenseId]);
  }

  deleteExpense() {
    if (this.expenseId) {
      this.loading = true;
      this.apiService.deleteExpense(this.expenseId).subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.toastr.success(apiResponse.message);
            this.location.back();
            this.socketService.expenseDeleteSuccess(
              this.groupId,
              this.expenseId
            );
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
      this.toastr.error('Expense not found');
    }
  }

  removeUser(index) {
    this.loading = true;
    let user = this.members[index];
    this.apiService
      .removeUserFromExpense(this.expenseId, user.userId, `${user.name}`)
      .subscribe(
        (apiResponse) => {
          this.loading = false;
          console.log(apiResponse);
          if (apiResponse.status === 200) {
            this.socketService.userRemovedFromExpenseSuccess(
              user.userId,
              this.groupId,
              this.expenseId
            );
            this.toastr.success(apiResponse.message);
            this.fetchExpenseDetails();
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

  onUserAddedInExpense() {
    this.socketService.onUserAddedInExpense().subscribe((data) => {
      console.log('onUserAddedInExpense ', data);
      if (data.expenseId === this.expenseId) {
        this.toastr.info(`New member added in expense`);
        this.fetchExpenseDetails();
      }
    });
  }

  onUserAddedInGroup() {
    this.socketService.onUserAddedInGroup().subscribe((data) => {
      console.log('onUserAddedInGroup ', data);
      if (data.groupId === this.groupId) {
        this.fetchGroupUsers(this.groupId);
      }
    });
  }

  onUserRemovedFromExpense() {
    this.socketService.onUserRemovedFromExpense().subscribe((data) => {
      console.log('onUserRemovedFromExpense ', data);
      if (data.expenseId === this.expenseId) {
        this.toastr.success('A user is removed from this expense');
        this.fetchExpenseDetails();
      }
      if (data.userId === this.cookieService.get('userId')) {
        this.toastr.success('You have been removed from expense');
      }
    });
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
        this.location.back();
      }
    });
  }
}
