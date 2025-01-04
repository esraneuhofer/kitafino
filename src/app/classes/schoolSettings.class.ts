
export interface SchoolSettingsInterface {
  isTest:boolean;
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
  kundennummerCatering: string,
  tenantId: string;
  customerId: string,
  emailCatering: string,
  emailSchool: string,
  projectId: string,
  paymentInformation: {
    creditorIban: string,
    creditorBic: string,
    creditorName: string,
    umsatzsteuerId?: string,
    steuernummer?: string,
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
  nameEinrichtung: string;
  streetCaterer: string;
  cityCaterer: string;
  zipcodeCaterer: string;
  streetCustomer: string;
  cityCustomer: string;
  zipcodeCustomer: string;

}
