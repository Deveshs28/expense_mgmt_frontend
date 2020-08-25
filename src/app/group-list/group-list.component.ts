import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../socket.service';
import { ExpenseApiService } from '../expense-api.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
})
export class GroupListComponent implements OnInit {
  public groups = [];
  public page = 0;
  public pageSize = 10;
  public loading = false;
  public totalGroupCount = 0;
  public pageCount = 0;

  constructor(
    private _route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private expenseApi: ExpenseApiService,
    private socketService: SocketService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.showPageData(this.page);
    this.OnUserAddedToGroupCreated();
    this.onUserAddedInGroup();
  }

  showPageData(pageNumber) {
    this.loading = true;
    this.page = pageNumber + 1;
    this.expenseApi.groupList(this.page, this.pageSize).subscribe(
      (apiResponse) => {
        this.loading = false;
        console.log(apiResponse);
        if (apiResponse.status === 200) {
          if (apiResponse.data.groupList.length > 0) {
            this.groups.splice(0, this.groups.length);
            this.groups = apiResponse.data.groupList;
            this.totalGroupCount = apiResponse.data.count;
            this.pageCount = Math.ceil(this.totalGroupCount / this.pageSize);
          } else {
            this.toastr.error(apiResponse.message);
          }
        } else if (apiResponse.status === 204) {
          this.page = this.page - 1;
          this.groups = [];
          this.toastr.error(apiResponse.message);
        } else if (apiResponse.status === 401) {
          this.router.navigate([
            '/serverError',
            `${apiResponse.status}`,
            `${apiResponse.message}`,
          ]);
          this.expenseApi.clearLoginData();
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
          this.expenseApi.clearLoginData();
        } else {
          this.toastr.error(err.error.message);
        }
      }
    );
  }

  groupDetail(groupId) {
    this.router.navigate(['/detail', groupId]);
  }

  OnUserAddedToGroupCreated() {
    this.socketService.OnUserAddedToGroupCreated().subscribe((data) => {
      console.log('OnUserAddedToGroupCreated ', data);
      if (data.userId === this.cookieService.get('userId')) {
        this.toastr.info(`You have been added in Group ${data.name}`);
        this.page = 0;
        this.showPageData(this.page);
      }
    });
  }

  onUserAddedInGroup() {
    this.socketService.onUserAddedInGroup().subscribe((data) => {
      console.log('onUserAddedInGroup ', data);
      if (data.userId === this.cookieService.get('userId')) {
        this.toastr.success('You have been added in new group');
        this.page = 0;
        this.showPageData(this.page);
      }
    });
  }
}
