
export interface EinrichtungInterface {
  _id?: string;
  startContract: Date;
  whoPayCharges: string
  contactPerson: string;
  amountPerOrder: number,
  hasEssensgeldEinrichtung: boolean,
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
  },
  paymentInformationEinrichtung: {
    creditorIban: string,
    creditorBic: string,
    creditorName: string,
  };

  billingAddressEinrichtung: { heading: string }[];
  emailBillingEinrichtung: string;
  contactPersonEinrichtung: string;
  nameCateringCompany: string;
  nameEinrichtung:string
}

export class SchoolClass implements EinrichtungInterface {
  startContract: Date = new Date();
  whoPayCharges: string = '';
  contactPerson: string = '';
  amountPerOrder: number = 0;

  billingCycle: string = '';
  tax: number = 0;
  hasEssensgeldEinrichtung: boolean = false;
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
    creditorBic: '',
    creditorName: '',
  }

  essensgeldEinrichtung: number = 0;
  paymentInformationEinrichtung = {
    creditorIban: '',
    creditorBic: '',
    creditorName: '',
  };
  billingAddressEinrichtung: { heading: string }[] = [{heading: ''}];
  emailBillingEinrichtung: string = '';
  contactPersonEinrichtung: string = '';
  nameCateringCompany:string= '';
  nameEinrichtung:string =  '';

  constructor(customerId: string, tenantId: string) {
    this.customerId = customerId;
    this.tenantId = tenantId;
    // Sie können hier weitere Initialisierungen hinzufügen, falls erforderlich.
  }
}
