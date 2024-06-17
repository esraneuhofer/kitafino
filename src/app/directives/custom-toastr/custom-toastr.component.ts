import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrMessage, ToastingService} from 'src/app/service/toastr.service';

@Component({
  selector: 'app-custom-toastr',
  templateUrl: './custom-toastr.component.html',
  styleUrls: ['./custom-toastr.component.scss']
})
export class CustomToastrComponent implements OnInit {
  message: ToastrMessage | null = null;
  toastrSubscription: Subscription;

  constructor(private toastrService: ToastingService) {
    this.toastrSubscription = this.toastrService.toastrState.subscribe((message:any) => {
      this.message = message;
      setTimeout(() => {
        this.message = null;
      }, 3000); // Notification will disappear after 3 seconds
    });
  }

  ngOnInit(): void {}

  close() {
    this.message = null;
  }
}
