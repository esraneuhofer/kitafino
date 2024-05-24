import {AccountChargeInterface} from "../../classes/charge.class";
import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";

export function createXmlFile (charges: AccountChargeInterface[], dateRange: ExportCsvDialogData)  {
    let array = filterAndSortCharges(charges, dateRange);
    generateXLS(array, dateRange);
}
function filterAndSortCharges(
    charges: AccountChargeInterface[],
    dateRange: ExportCsvDialogData
): AccountChargeInterface[] {
    const { firstDate, secondDate, withdrawOrCancel, depositsOrOrder } = dateRange;
    const startDate = new Date(firstDate);
    const endDate = new Date(secondDate);

    const filteredCharges = charges.filter(charge => {
        const chargeDate = new Date(charge.date);
        const isWithinDateRange = chargeDate >= startDate && chargeDate <= endDate;

        const isWithdraw = withdrawOrCancel && charge.typeCharge === 'withdraw';
        const isDeposit = depositsOrOrder && charge.typeCharge === 'deposit';

        return isWithinDateRange && (isWithdraw || isDeposit);
    });

    return filteredCharges.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function dateToExcelDate(date: Date): string {
    // Convert date to Excel date format (dd/mm/yyyy)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatCurrency(amount: number): string {
    // Format the amount as currency
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function generateXLS(charges: AccountChargeInterface[], dateRange: { firstDate: string; secondDate: string }) {
    let xlsContent = `<table>
    <tr>
      <th>Datum Abbuchung</th>
      <th>IBAN</th>
      <th>Betrag</th>
      <th>Referenz</th>
      <th>Datum Bestätigt</th>
      <th>Art Buchung</th>
    </tr>`;

    charges.forEach(charge => {
        xlsContent += `<tr>
      <td>${dateToExcelDate(new Date(charge.date))}</td>
      <td>${charge.iban ?? ''}</td>
      <td>${formatCurrency(charge.amount)}</td>
      <td>${charge.reference}</td>
      <td>${charge.dateApproved ? dateToExcelDate(new Date(charge.dateApproved)) : ''}</td>
      <td>${charge.typeCharge === 'withdraw' ? 'Abbuchung' : 'Einzahlung'}</td>
    </tr>`;
    });

    xlsContent += `</table>`;

    const xlsBlob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(xlsBlob);
    a.download = `Kontobewegung_${dateRange.firstDate}_to_${dateRange.secondDate}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
