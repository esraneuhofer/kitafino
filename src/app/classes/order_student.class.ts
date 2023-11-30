import {CustomerInterface} from "./customer.class";
import {SettingInterfaceNew} from "./setting.class";
import {MealtypesWeekplan, WeekplanDayInterface} from "./weekplan.interface";
import {StudentInterface} from "./student.class";
import {
  getAllergensPerMealOrderOverviewMenuO,
  getSpecialOrdersPossibleMenu,
  getSpecialOrdersSubGroup,
  OrderModelSingleDay,
  OrderSubDetailNew, setOrderSplitEach,
  SpecialFoodOrderInterface
} from "./order.class";

export interface OrderInterfaceStudent {
  studentId: (string | undefined)
  _id?: string;
  kw: number;
  year: number;
  order: OrderInterfaceStudentDay;
  customerId: string;
}

export interface OrderInterfaceStudentDay {
  comment?: string;
  order: OrderSubDetailNew[];
  specialFoodOrder?: SpecialFoodOrderInterface[];
}


export class OrderClassStudent implements OrderInterfaceStudent {
  studentId: (string | undefined);
  kw: number;
  year: number;
  order: OrderInterfaceStudentDay;
  customerId: string;

  constructor(customer: CustomerInterface,
              query: { week: number, year: number },
              settings: SettingInterfaceNew,
              selectedWeek: WeekplanDayInterface,
              studentModel: (StudentInterface | null)) {
    this.order = new OrderModelSingleDayStudent(customer, settings, selectedWeek)
    this.customerId = customer.customerId;
    this.kw = query.week;
    this.year = query.year;
    if (studentModel) {
      this.studentId = studentModel._id;
    }
  }

}

class OrderModelSingleDayStudent implements OrderInterfaceStudentDay {
  comment = '';
  order: OrderSubDetailNew[] = [];
  specialFoodOrder: SpecialFoodOrderInterface[] = [];

  constructor(customer: CustomerInterface,
              settings: SettingInterfaceNew,
              selectedWeek: WeekplanDayInterface) {
    selectedWeek.mealTypesDay.forEach(eachSpecial => {
      let order: OrderSubDetailNew = setOrderSplitEach(eachSpecial, customer, settings, selectedWeek);
      if (order) {
        this.order.push(order);
      }
    });
    this.specialFoodOrder = getSpecialOrdersSubGroup(settings, customer)

  }
}

