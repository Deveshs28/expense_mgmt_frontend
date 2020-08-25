import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  // private url = 'http://api.epril-dev.co.in';
  private url = 'http://localhost:3000';

  private socket;

  constructor(public http: HttpClient) {
    this.socket = io(this.url);
  }

  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      });
    });
  };

  public disconnectedSocket = (data) => {
    this.socket.emit('disconnect', data);
  };

  public setUser = (authToken) => {
    this.socket.emit('set-user', authToken);
  };

  public userCreated = () => {
    const data = {
      message: 'New user added on system',
    };
    this.socket.emit('user-created', data);
  };

  public newUserAddedOnSystem = () => {
    return Observable.create((observer) => {
      this.socket.on('new-user-registered', (data) => {
        console.log('new-user-registered');
        observer.next(data);
      });
    });
  };

  public groupCreatedSuccess = (groupId, name, userList) => {
    const data = {
      groupId: groupId,
      name: name,
      userList: userList,
    };
    this.socket.emit('group-created-success', data);
  };

  public OnUserAddedToGroupCreated = () => {
    return Observable.create((observer) => {
      this.socket.on('added-to-group', (data) => {
        // const groupInfo = {
        // groupId: data.groupId,
        // name: data.name,
        // userId: res,
        // };
        observer.next(data);
      });
    });
  };

  public expenseCreatedSuccess = (expenseId, groupId, name, userList) => {
    const data = {
      groupId: groupId,
      name: name,
      userList: userList,
      expenseId: expenseId,
    };
    this.socket.emit('expense-created-success', data);
  };

  public OnExpenseAddedInGroup = () => {
    return Observable.create((observer) => {
      this.socket.on('expense-added-to-group', (data) => {
        // expenseId: data.expenseId,
        //     groupId: data.groupId,
        //     name: data.name,
        observer.next(data);
      });
    });
  };

  public userAddedInGroupSuccess = (userId, groupId) => {
    const data = {
      groupId: groupId,
      userId: userId,
    };
    this.socket.emit('user-added-group-success', data);
  };

  public onUserAddedInGroup = () => {
    return Observable.create((observer) => {
      this.socket.on('user-added-in-group', (data) => {
        // userId: data.userId,
        // groupId: data.groupId,
        observer.next(data);
      });
    });
  };

  public userAddedInExpenseSuccess = (userId, groupId, expenseId) => {
    const data = {
      userId: userId,
      expenseId: expenseId,
      groupId: groupId,
    };
    this.socket.emit('user-added-expense-success', data);
  };

  public onUserAddedInExpense = () => {
    return Observable.create((observer) => {
      this.socket.on('user-added-in-expense', (data) => {
        // userId: data.userId,
        // expenseId: data.expenseId,
        // groupId: data.groupId,
        observer.next(data);
      });
    });
  };

  public userRemovedFromExpenseSuccess = (userId, groupId, expenseId) => {
    const data = {
      userId: userId,
      expenseId: expenseId,
      groupId: groupId,
    };
    this.socket.emit('user-removed-from-expense-success', data);
  };

  public onUserRemovedFromExpense = () => {
    return Observable.create((observer) => {
      this.socket.on('user-removed-from-expense', (data) => {
        // userId: data.userId,
        // expenseId: data.expenseId,
        // groupId: data.groupId,
        observer.next(data);
      });
    });
  };

  public expensePayeeUpdateSuccess = (paidByUserId, groupId, expenseId) => {
    const data = {
      paidByUserId: paidByUserId,
      expenseId: expenseId,
      groupId: groupId,
    };
    this.socket.emit('expense-payee-update-success', data);
  };

  public onExpensePayeeUpdated = () => {
    return Observable.create((observer) => {
      this.socket.on('expense-payee-updated', (data) => {
        // paidByUserId: data.paidByUserId,
        // expenseId: data.expenseId,
        // groupId: data.groupId,
        observer.next(data);
      });
    });
  };

  public expenseAmountUpdateSuccess = (groupId, expenseId, amount) => {
    const data = {
      expenseId: expenseId,
      groupId: groupId,
      amount: amount,
    };
    this.socket.emit('expense-amount-update-success', data);
  };

  public onExpenseAmountUpdated = () => {
    return Observable.create((observer) => {
      this.socket.on('expense-amount-updated', (data) => {
        // expenseId: data.expenseId,
        // groupId: data.groupId,
        // amount: data.amount,
        observer.next(data);
      });
    });
  };

  public expenseDeleteSuccess = (groupId, expenseId) => {
    const data = {
      expenseId: expenseId,
      groupId: groupId,
    };
    this.socket.emit('expense-delete-success', data);
  };

  public onExpenseDeleted = () => {
    return Observable.create((observer) => {
      this.socket.on('expense-deleted', (data) => {
        // expenseId: data.expenseId,
        // groupId: data.groupId,
        observer.next(data);
      });
    });
  };
}
