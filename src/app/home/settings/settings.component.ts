import {Component, OnInit} from '@angular/core';
import {TenantServiceStudent} from "../../service/tenant.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TenantStudentInterface} from "../../classes/tenant.class";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit{

  tenantModel: TenantStudentInterface | null = null;
  submittingRequest = false;

  constructor(private tenantService: TenantServiceStudent,

              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.tenantService.getTenantInformation().subscribe((tenant:TenantStudentInterface) => {
      this.tenantModel = tenant;
    })
  }
  editPersonalInformation(){

  }
}
