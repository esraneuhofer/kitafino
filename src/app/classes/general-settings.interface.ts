export interface GeneralSettingsInterface {
  subGroupSettingTenant: boolean; // Decides if the tenant has the ability to set subgroups if false the subgroups are set by the Customer/Einrichtung
  showOrderDaily: boolean; // Decides if the tenant chooses each day for the order with input:Date or per week with selectField
  isDeadlineDaily: boolean; // Decides if the tenant has a daily deadline for the order
  isDeadlineWeekly: boolean; // Decides if the tenant has a weekly deadline for the order
  deadlineWeekly: {
    weeks: string;
    day: string;
    time: Date;
  };
  deadlineDaily: {
    day: number;
    time: Date;
  };
  cancelOrderDaily: {
    day: number;
    time: Date;
  };
}
