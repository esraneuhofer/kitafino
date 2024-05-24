import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {OrderHistoryTableInterface} from "./order-history.component";


export function downloadOrderHistoryCsv(orders: OrderHistoryTableInterface[], dateRange: ExportCsvDialogData) {
    const filteredOrders = filterAndSortOrderHistoryByDateRange(orders, dateRange);
    generateOrderHistoryXLS(filteredOrders, dateRange);
}
function filterAndSortOrderHistoryByDateRange(
    orders: OrderHistoryTableInterface[],
    dateRange: ExportCsvDialogData
): OrderHistoryTableInterface[] {
    const { firstDate, secondDate, withdrawOrCancel, depositsOrOrder } = dateRange;
    const startDate = new Date(firstDate);
    const endDate = new Date(secondDate);

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.dateOrderMenu);
        const isWithinDateRange = orderDate >= startDate && orderDate <= endDate;

        const isCancel = withdrawOrCancel && order.typeOrder === 'Stornierung';
        const isOrder = depositsOrOrder && order.typeOrder === 'Bestellung';

        return isWithinDateRange && (isCancel || isOrder);
    });

    return filteredOrders.sort((a, b) => new Date(a.dateOrderMenu).getTime() - new Date(b.dateOrderMenu).getTime());
}

function dateToExcelDate(date: Date): string {
    // Convert date to Excel date format (dd/mm/yyyy)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatCurrency(amount: number): string {
    if(isNaN(amount)) return String(0)
    // Format the amount as currency
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function generateOrderHistoryXLS(orders: OrderHistoryTableInterface[], dateRange: ExportCsvDialogData) {
    let xlsContent = `<table>
    <tr>
      <th>Datum Abgegeben</th>
      <th>Datum Essen</th>
      <th>Name Menu</th>
      <th>Preis</th>
      <th>Art</th>
    </tr>`;

    orders.forEach(order => {
        xlsContent += `<tr>
      <td>${dateToExcelDate(new Date(order.dateOrderMenu))}</td>
      <td>${dateToExcelDate(new Date(order.dateOrderMenu))}</td>
      <td>${order.nameMenu}</td>
      <td>${formatCurrency(order.price)}</td>
      <td>${order.typeOrder}</td>
    </tr>`;
    });

    xlsContent += `</table>`;

    const xlsBlob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(xlsBlob);
    a.download = `Bestellhistorie_${dateRange.firstDate}_to_${dateRange.secondDate}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

