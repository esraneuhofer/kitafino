export interface EinrichtungInterface {
  isTest: boolean;
  _id?: string;
  startContract: string;
  whoPayCharges: string
  contactPerson: string;
  amountPerOrder: number,
  hasEssensgeldEinrichtung: boolean,
  essensgeldEinrichtung: number,
  billingCycle: string,
  tax: number,
  billingAddress: { heading: string }[],
  vertragspartnerTraeger?: string,
  isVertragspartnerTraeger?: boolean,
  emailBilling: string,
  kundennummer: string,
  kundennummerCatering: string,
  tenantId: string;
  customerId: string,
  emailCatering: string,
  emailSchool: string,
  projectId: string,
  emailBillingBut: string,
  paymentInformation: {
    isEinzug: boolean,

    creditorIban: string,
    creditorBic: string,
    creditorName: string,
    umsatzsteuerId?: string,
    dateEinzugSigned?: string,
    mandateReference?: string,
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
  phoneCaterer: string;
  streetCaterer: string;
  cityCaterer: string;
  zipcodeCaterer: string;
  streetCustomer: string;
  cityCustomer: string;
  zipcodeCustomer: string;
  nameBillingBut: string;
  addressBillingBut: string;
  zipBillingBut: string;
  cityBillingBut: string;

}


