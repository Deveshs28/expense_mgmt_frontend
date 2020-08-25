import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class RouteGuardService implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.isEmpty(this.cookieService.get('authToken'))) {
      this.router.navigate(['login']);
      return false;
    } else {
      return true;
    }
  }

  trim(x): String {
    let value = String(x);
    return value.replace(/^\s+|\s+$/gm, '');
  }

  isEmpty(value): Boolean {
    if (
      value === null ||
      value === undefined ||
      this.trim(value) === '' ||
      value.length === 0
    ) {
      return true;
    } else {
      return false;
    }
  }
}
