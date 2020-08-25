import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseApiService {
  // private url = 'http://api.epril-dev.co.in/api/v1/expenseManagementSystem';
  private url = 'http://localhost:3000/api/v1/expenseManagementSystem';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private socketService: SocketService
  ) {}

  public register(data): Observable<any> {
    return this.http
      .post(`${this.url}/signup`, data)
      .pipe(catchError(this.handleError));
  }

  public loginUser(email, password): Observable<any> {
    const params = { email: email, password: password };
    return this.http
      .post(`${this.url}/login`, params)
      .pipe(catchError(this.handleError));
  }

  public logoutUser(): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let userId = this.cookieService.get('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .post(`${this.url}/logout/${userId}`, null, options)
      .pipe(catchError(this.handleError));
  }

  public forgotPassword(email): Observable<any> {
    let data = {
      email: email,
    };
    return this.http
      .post(`${this.url}/forgot-password`, data)
      .pipe(catchError(this.handleError));
  }

  public updatePassword(userId, password): Observable<any> {
    let data = {
      password: password,
    };
    return this.http
      .post(`${this.url}/update-password/${userId}`, data)
      .pipe(catchError(this.handleError));
  }

  public userList(): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/user/list`, options)
      .pipe(catchError(this.handleError));
  }

  public createGroup(data): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/group/create`, data, options)
      .pipe(catchError(this.handleError));
  }

  public groupList(page, recordCount): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let userId = this.cookieService.get('userId');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/group/list/${userId}/${page}/${recordCount}`, options)
      .pipe(catchError(this.handleError));
  }

  public addUserInGroup(userId, groupId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .put(`${this.url}/group/addUser/${userId}/${groupId}`, null, options)
      .pipe(catchError(this.handleError));
  }

  public userListByGroup(groupId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/group/userListByGroupId/${groupId}`, options)
      .pipe(catchError(this.handleError));
  }

  public groupDetail(groupId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/group/detail/${groupId}`, options)
      .pipe(catchError(this.handleError));
  }

  public createExpense(name, amount, groupId, paidByUserId): Observable<any> {
    const userObj = this.getUserInfoFromLocalStorage();
    let data = {
      name: name,
      amount: amount,
      groupId: groupId,
      paidByUserId: paidByUserId,
      createdByName: `${userObj.firstName} ${userObj.lastName}`,
      createdById: this.cookieService.get('userId'),
    };

    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/expense/create`, data, options)
      .pipe(catchError(this.handleError));
  }

  public expenseDetail(expenseId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/expense/detail/${expenseId}`, options)
      .pipe(catchError(this.handleError));
  }

  public addUserInExpense(expenseId, userId, userName): Observable<any> {
    const userObj = this.getUserInfoFromLocalStorage();
    let data = {
      userId: userId,
      userName: userName,
      addedByUser: `${userObj.firstName} ${userObj.lastName}`,
    };

    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .put(`${this.url}/expense/addUser/${expenseId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public deleteExpense(expenseId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .post(`${this.url}/expense/delete/${expenseId}`, null, options)
      .pipe(catchError(this.handleError));
  }

  public updateExpenseAmount(expenseId, amount): Observable<any> {
    const userObj = this.getUserInfoFromLocalStorage();
    let data = {
      amount: amount,
      updatedByName: `${userObj.firstName} ${userObj.lastName}`,
    };

    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .put(`${this.url}/expense/updateAmount/${expenseId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public updateExpensePayee(
    expenseId,
    paidByUserId,
    paidByUsername
  ): Observable<any> {
    const userObj = this.getUserInfoFromLocalStorage();
    let data = {
      paidByUserId: paidByUserId,
      paidByUsername: paidByUsername,
      updatedByName: `${userObj.firstName} ${userObj.lastName}`,
    };

    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .put(`${this.url}/expense/updatePayee/${expenseId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public removeUserFromExpense(expenseId, userId, userName): Observable<any> {
    const userObj = this.getUserInfoFromLocalStorage();
    let data = {
      userId: userId,
      userName: userName,
      updatedByName: `${userObj.firstName} ${userObj.lastName}`,
    };

    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };

    return this.http
      .put(`${this.url}/expense/removeUser/${expenseId}`, data, options)
      .pipe(catchError(this.handleError));
  }

  public userListByExpense(expenseId): Observable<any> {
    let authToken = this.cookieService.get('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      authToken: authToken,
    });
    let options = { headers: headers };
    return this.http
      .get(`${this.url}/expense/userListByExpense/${expenseId}`, options)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    return throwError(error);
  }

  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  };

  public removeUserInfoFromLocalStorage = () => {
    localStorage.removeItem('userInfo');
  };

  public clearLoginData() {
    const data = {
      userId: this.cookieService.get('userId'),
    };
    this.socketService.disconnectedSocket(data);
    if (this.cookieService.check('authToken'))
      this.cookieService.delete('authToken', '/');
    if (this.cookieService.check('userId'))
      this.cookieService.delete('userId', '/');

    if (this.cookieService.check('userType')) {
      if (this.cookieService.check('userType'))
        this.cookieService.delete('userType', '/');
      this.removeUserInfoFromLocalStorage();
    }
  }
}
