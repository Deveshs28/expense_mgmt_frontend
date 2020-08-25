import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { NgpSortModule } from 'ngp-sort-pipe';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { GroupListComponent } from './group-list/group-list.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { CreateExpenseComponent } from './create-expense/create-expense.component';
import { RouteGuardService } from './route-guard.service';

import { RouterModule } from '@angular/router';
import { EditExpenseComponent } from './edit-expense/edit-expense.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { ExpenseApiService } from './expense-api.service';
import { CookieService } from 'ngx-cookie-service';
import { SocketService } from './socket.service';
import { RegisteredAuthGuardService } from './registered-auth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ServerErrorComponent,
    UserProfileComponent,
    LoadingBarComponent,
    NotFoundComponent,
    UpdatePasswordComponent,
    GroupListComponent,
    CreateGroupComponent,
    CreateExpenseComponent,
    EditExpenseComponent,
    ExpenseDetailComponent,
    GroupDetailComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgpSortModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 2000,
      preventDuplicates: true,
    }),
    RouterModule.forRoot([
      {
        path: 'login',
        canActivate: [RegisteredAuthGuardService],
        component: LoginComponent,
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'registration',
        canActivate: [RegisteredAuthGuardService],
        component: SignupComponent,
      },
      {
        path: 'home',
        canActivate: [RouteGuardService],
        component: GroupListComponent,
      },
      {
        path: 'create',
        canActivate: [RouteGuardService],
        component: CreateGroupComponent,
      },
      {
        path: 'detail/:groupId',
        canActivate: [RouteGuardService],
        component: GroupDetailComponent,
      },
      {
        path: 'create/expense/:groupId',
        canActivate: [RouteGuardService],
        component: CreateExpenseComponent,
      },
      {
        path: 'edit/:expenseId',
        canActivate: [RouteGuardService],
        component: EditExpenseComponent,
      },
      {
        path: 'expenseDetail/:expenseId',
        canActivate: [RouteGuardService],
        component: ExpenseDetailComponent,
      },
      {
        path: 'profile',
        canActivate: [RouteGuardService],
        component: UserProfileComponent,
      },
      {
        path: 'updatePassword/:userId',
        component: UpdatePasswordComponent,
      },
      {
        path: 'serverError/:errorCode/:message',
        component: ServerErrorComponent,
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ]),
  ],
  providers: [
    ExpenseApiService,
    CookieService,
    SocketService,
    RouteGuardService,
    RegisteredAuthGuardService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
