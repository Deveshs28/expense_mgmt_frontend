import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css'],
})
export class ServerErrorComponent implements OnInit {
  public errorCode;
  public errorMessage;

  constructor(private _route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.errorCode = this._route.snapshot.paramMap.get('errorCode');
    this.errorMessage = this._route.snapshot.paramMap.get('message');
  }
}
