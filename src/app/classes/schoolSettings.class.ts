
export interface SchoolSettingsInterface {
  _id?: string;
  whoPayCharges: 'school' | 'parent' |  'caterer'
  contactPerson: string;
  amountPerOrder: number,
  essensgeldEinrichtung: number,
  billingCycle: string,
  tax: number,
  billingAddress: { heading: string }[],
  emailBilling: string,
  kundennummer: string,
  tenantId: string;
  customerId: string,
  emailCatering: string,
  emailSchool: string,
  projectId: string,
  paymentInformation: {
    creditorIban: string,
    creditorBic: string,
    creditorName: string,
  }

}
export class SchoolSettingsClass implements SchoolSettingsInterface {
  whoPayCharges:'school' | 'parent' |  'caterer'  = 'school';
  contactPerson: string = '';
  amountPerOrder: number = 0;
  essensgeldEinrichtung: number = 0;
  billingCycle: string = '';
  tax: number = 0;
  billingAddress: { heading: string }[] = [{heading: ''}];
  emailBilling: string = '';
  kundennummer: string = '';
  tenantId: string = '';
  customerId: string = '';
  emailCatering: string = '';
  emailSchool: string = '';
  projectId: string = '';
  paymentInformation = {
    creditorIban: '',
    creditorBic:  '',
    creditorName:  '',
  }

  constructor(customerId:string,tenantId:string) {
    this.customerId = customerId;
    this.tenantId = tenantId;
    // Sie können hier weitere Initialisierungen hinzufügen, falls erforderlich.
  }
}
