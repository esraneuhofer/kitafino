import {TenantStudentInterface} from "../../classes/tenant.class";
import {CustomerInterface} from "../../classes/customer.class";
import {StudentInterface} from "../../classes/student.class";
import {SettingInterfaceNew} from "../../classes/setting.class";

function getEinrichtungsobject(customer: CustomerInterface): string {
  const name = customer.contact.customer ? customer.contact.customer : '';
  const street = customer.contact.street ? customer.contact.street : '';
  const zip = customer.contact.zipcode ? customer.contact.zipcode : '';
  const phone = customer.contact.phone ? customer.contact.phone : '';
  const email = customer.contact.email ? customer.contact.email : '';
  return `${name} <br> ${street} <br> ${zip}  <br> ${phone} <br> ${email}`;
}
export function getEmailBodyRegistrationStudent(customer: CustomerInterface,
                                                student: StudentInterface,
                                                tenant: TenantStudentInterface): any {
  const einrichtungObject = getEinrichtungsobject(customer);
  const nameStudent = student.firstName + ' ' + student.lastName;
  return {
    from: 'Cateringexprt <noreply@cateringexpert.de>', // sender address
    to: tenant.email, // list of receivers
    subject: 'Bestellbestätigung✔', // Subject line
    html: "<div style=\"font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; margin: 0 auto; max-width: 600px; padding: 20px; color: #333;\">\n" +
      "  <div style=\"background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 0.25rem;\">\n" +
      "    <div style=\"padding: 20px;\">\n" +
      "      <h5 style=\"font-size: 1.25rem; font-weight: 500; margin-top: 0;\">Anmeldung Erfolgreich</h5>\n" +
      "      <p>\n" +
      "        Hiermit bestätigen wir Ihnen die Anmeldung des Verpflegungsteilnehmer/in: <strong> " + nameStudent  + "</strong> für die Einrichtung:  <br><br>\n" +
      "        <strong>"+ einrichtungObject  + "</strong> <br><br>\n" +
      "        Anbei finden Sie ebenfalls eine PDF Datei mit einer Übersicht über die Anwendung und Funktionsweisen.<br><br>\n" +
      "\n" +
      "        Für Rückfragen stehen wir Ihnen gerne zur Verfügung. <br>\n" +
      "        Besuchen Sie uns auf unserer Webseite unter <a href=\"https://cateringexpert.de/hilfecenter\" style=\"color: #007bff; text-decoration: none;\">https://cateringexpert.de/hilfecenter</a> <br>\n" +
      "        oder schreiben Sie uns eine E-Mail an <a href=\"mailto:support@cateringexpert.de\" style=\"color: #007bff; text-decoration: none;\">support@cateringexpert.de</a>. <br><br> Wir melden uns zeitnah zurück. <br><br>\n" +
      "\n" +
      "        Mit freundlichen Grüßen <br>\n" +
      "        Ihr Catering Expert Team\n" +
      "      </p>\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>"
  }
}
