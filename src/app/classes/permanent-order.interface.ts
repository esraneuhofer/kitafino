import {OrderInterfaceStudentDaySafe} from "./order_student_safe.class";
import {dayArray} from "./weekplan.interface";

export interface PermanentOrderInterface {
  userId:string;
  _id?:string;
  studentId:string;
  customerId: string;
  daysOrder:DaysOrderPermanentInterface[]
}
interface DaysOrderPermanentInterface{
  selected:boolean,menuId:string,typeSpecial:string
}
export class PermanentOrderClass implements PermanentOrderInterface {
  userId:string;
  _id?:string;
  studentId:string;
  customerId: string;
  daysOrder:DaysOrderPermanentInterface[] = []

  constructor(userId:string, studentId:string, customerId: string) {
    this.userId = userId;
    this.studentId = studentId;
    this.customerId = customerId;
    dayArray.forEach((day:any) => {
      this.daysOrder.push({selected:false,menuId:'',typeSpecial:''});
    })
  }
}
