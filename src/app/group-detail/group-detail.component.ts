import { Component, OnInit } from '@angular/core';
import { user } from '../users';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from '../socket.service';
import { ExpenseApiService } from '../expense-api.service';
import { takeLast } from 'rxjs/operators';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css'],
})
export class GroupDetailComponent implements OnInit {
  public groupName: string;
  public allUserList: user[] = [];
  public members = [];
  public expensesList = [];
  public selectedUserId = '';
  public loading = false;
  public groupId: string;
  public expenseDivisionList = [];

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private apiService: ExpenseApiService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.groupId = this._route.snapshot.paramMap.get('groupId');
    this.fetchGroupDetails();
    this.fetchAllUsers();
    this.newUserAddedOnSystem();
    this.OnExpenseAddedInGroup();
    this.onUserAddedInExpense();
    this.onUserAddedInGroup();
    this.onUserRemovedFromExpense();
    this.onExpenseAmountUpdated();
    this.onExpensePayeeUpdated();
    this.onExpenseDeleted();
  }

  fetchGroupDetails() {
    this.loading = true;
    this.apiService.groupDetail(this.groupId).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log('groupDertail:', apiResponse);
        if (apiResponse.status === 200) {
          this.groupName = apiResponse.data.group.name;
          if (apiResponse.data.membersList.length > 0) {
            this.members.splice(0, this.members.length);
            this.members = apiResponse.data.membersList;
          }
          if (apiResponse.data.expenseList.length > 0) {
            this.expensesList.splice(0, this.expensesList.length);
            this.expensesList = apiResponse.data.expenseList;
          }
          this.processEachExpense();
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

  processEachExpense() {
    if (this.expensesList.length > 0) {
      if (this.members.length > 0) {
        this.expenseDivisionList.splice(0, this.expenseDivisionList.length);
        for (let groupMember of this.members) {
          //Group member list
          const groupMemberId = groupMember.userId; // Group member Id
          const groupMemberName = `${groupMember.firstName} ${groupMember.lastName}`;
          let takeMap = new Map();
          let giveMap = new Map();
          for (let expense of this.expensesList) {
            if (expense.userList.includes(groupMemberId)) {
              const expenseAmount = expense.amount;
              if (expenseAmount > 0) {
                const amountPerPerson =
                  Math.round(
                    (expenseAmount / expense.userList.length + Number.EPSILON) *
                      100
                  ) / 100;
                if (groupMemberId === expense.paidByUserId) {
                  //Current group member is payee for expense
                  //create object of take
                  for (let expenseMem of expense.userList) {
                    if (groupMemberId !== expenseMem) {
                      if (takeMap.has(expenseMem)) {
                        let amt =
                          Math.round(
                            (takeMap.get(expenseMem) +
                              amountPerPerson +
                              Number.EPSILON) *
                              100
                          ) / 100;
                        takeMap.set(expenseMem, amt);
                      } else {
                        takeMap.set(expenseMem, amountPerPerson);
                      }
                    }
                  }
                } else {
                  //Current group member is not payee for expense
                  //create object for give
                  if (giveMap.has(expense.paidByUserId)) {
                    let amt =
                      giveMap.get(expense.paidByUserId) + amountPerPerson;
                    giveMap.set(expense.paidByUserId, amt);
                  } else {
                    giveMap.set(expense.paidByUserId, amountPerPerson);
                  }
                }
              }
            }
          }
          //calculate final amt for each group member
          let giveList = [];
          let fiMap = new Map();
          for (let member of this.members) {
            if (groupMemberId !== member.userId) {
              if (takeMap.has(member.userId)) {
                if (giveMap.has(member.userId)) {
                  if (giveMap.get(member.userId) > takeMap.get(member.userId)) {
                    fiMap.set(
                      `${member.firstName} ${member.lastName}`,
                      giveMap.get(member.userId) - takeMap.get(member.userId)
                    );
                    const obR = {
                      name: `${member.firstName} ${member.lastName}`,
                      amount:
                        Math.round(
                          (giveMap.get(member.userId) -
                            takeMap.get(member.userId) +
                            Number.EPSILON) *
                            100
                        ) / 100,
                    };
                    giveList.push(obR);
                  }
                }
              } else {
                if (giveMap.has(member.userId)) {
                  fiMap.set(
                    `${member.firstName} ${member.lastName}`,
                    giveMap.get(member.userId)
                  );
                  const obR = {
                    name: `${member.firstName} ${member.lastName}`,
                    amount:
                      Math.round(
                        (giveMap.get(member.userId) + Number.EPSILON) * 100
                      ) / 100,
                  };
                  giveList.push(obR);
                }
              }
            }
          }
          const nR = {
            userId: groupMemberId,
            name: groupMemberName,
            giveAmountList: giveList,
          };
          this.expenseDivisionList.push(nR);
        }
      }
    }
  }

  fetchAllUsers() {
    this.loading = true;
    this.apiService.userList().subscribe(
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
        this.toastr.error('User already group member');
      } else {
        let selectedUser: user;
        for (let user of this.allUserList) {
          if (user.userId === this.selectedUserId) {
            selectedUser = user;
            break;
          }
        }
        this.loading = true;
        this.apiService
          .addUserInGroup(selectedUser.userId, this.groupId)
          .subscribe(
            (apiResponse) => {
              this.loading = false;
              console.log(apiResponse);
              if (apiResponse.status === 200) {
                this.socketService.userAddedInGroupSuccess(
                  selectedUser.userId,
                  this.groupId
                );
                this.toastr.success(apiResponse.message);
                this.fetchGroupDetails();
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

  addExpense() {
    this.router.navigate(['/create/expense', this.groupId]);
  }

  expenseDetail(expenseId) {
    this.router.navigate(['expenseDetail', expenseId]);
  }

  newUserAddedOnSystem() {
    this.socketService.newUserAddedOnSystem().subscribe((data) => {
      console.log('newUserAddedOnSystem ');
      this.fetchAllUsers();
    });
  }

  OnExpenseAddedInGroup() {
    this.socketService.OnExpenseAddedInGroup().subscribe((data) => {
      if (data.groupId === this.groupId) {
        this.toastr.success(`${data.name} expense added in group`);
        this.fetchGroupDetails();
      }
    });
  }

  onUserAddedInExpense() {
    this.socketService.onUserAddedInExpense().subscribe((data) => {
      console.log('onUserAddedInExpense ', data);
      if (data.groupId === this.groupId) {
        this.fetchGroupDetails();
      }
    });
  }

  onUserAddedInGroup() {
    this.socketService.onUserAddedInGroup().subscribe((data) => {
      console.log('onUserAddedInGroup ', data);
      if (data.groupId === this.groupId) {
        this.toastr.success('New user added in group');
        this.fetchGroupDetails();
      }
    });
  }

  onUserRemovedFromExpense() {
    this.socketService.onUserRemovedFromExpense().subscribe((data) => {
      console.log('onUserRemovedFromExpense ', data);
      if (data.groupId === this.groupId) {
        this.fetchGroupDetails();
      }
    });
  }

  onExpenseAmountUpdated() {
    this.socketService.onExpenseAmountUpdated().subscribe((data) => {
      console.log('onExpenseAmountUpdated ', data);
      if (data.groupId === this.groupId) {
        this.fetchGroupDetails();
      }
    });
  }

  onExpensePayeeUpdated() {
    this.socketService.onExpensePayeeUpdated().subscribe((data) => {
      console.log('onExpensePayeeUpdated ', data);
      if (data.groupId === this.groupId) {
        this.toastr.success('Expense payee updated');
        this.fetchGroupDetails();
      }
    });
  }

  onExpenseDeleted() {
    this.socketService.onExpenseDeleted().subscribe((data) => {
      console.log('onExpenseDeleted ', data);
      if (data.groupId === this.groupId) {
        this.toastr.success('Expense deleted from group');
        this.fetchGroupDetails();
      }
    });
  }
}
