
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

