

export interface VacationsSubgroupInterface {
  _id?:string;
  customerId:string;
  subgroupId:string;
  tenantId:string;
  vacation:
    {
      vacationStart:Date;
      vacationEnd:Date
    },
    createdAt?:Date;
}
