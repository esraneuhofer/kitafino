import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {OrderInterfaceStudent, OrderSubDetailNew} from "../../../classes/order_student.class";
import {SettingInterfaceNew} from "../../../classes/setting.class";
import {Allergene} from "../../../classes/allergenes.interface";

@Component({
  selector: 'app-order-allergene-dialog',
  templateUrl: './order-allergene-dialog.component.html',
  styleUrls: ['./order-allergene-dialog.component.scss']
})
export class OrderAllergeneDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data:{settings:SettingInterfaceNew,menu:OrderSubDetailNew}) { }
  orderModelCopy: { nameMeal:string,allergenes:Allergene[]}[] = [];
  ngOnInit() {

    this.orderModelCopy = [];
    if(!this.data.menu ||!this.data.menu.allergensPerMeal)return;

    this.data.menu.allergensPerMeal.forEach((eachMeal,index) =>{
      if(eachMeal.nameMeal === 'Platzhalter Gericht')return;
      this.orderModelCopy.push({nameMeal:eachMeal.nameMeal,allergenes:[]})
      eachMeal.allergenes.forEach(eachAllergene =>{
        if (!this.orderModelCopy[index].allergenes.some(a => a.name_allergene === eachAllergene.name_allergene)) {
          this.orderModelCopy[index].allergenes.push(eachAllergene);
        }
      })
    })
  }
}
