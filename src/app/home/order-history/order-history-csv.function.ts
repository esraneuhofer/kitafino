import {ExportCsvDialogData} from "../../directives/export-csv-dialog/export-csv-dialog.component";
import {OrderAndCancelInterface, OrderHistoryTableInterface} from "./order-history.component";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {getInvoiceDateOne} from "../../functions/date.functions";
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


function filterAndSortOrderHistoryByDateRange(
    orders: OrderAndCancelInterface[],
    dateRange: ExportCsvDialogData
): OrderAndCancelInterface[] {
    const { firstDate, secondDate, withdrawOrCancel, depositsOrOrder } = dateRange;
    const startDate = new Date(firstDate);
    const endDate = new Date(secondDate);

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.dateOrder);
        const isWithinDateRange = orderDate >= startDate && orderDate <= endDate;

        const isCancel = withdrawOrCancel && order.typeOrder === 'Stornierung';
        const isOrder = depositsOrOrder && order.typeOrder === 'Bestellung';

        return isWithinDateRange && (isCancel || isOrder);
    });

    return filteredOrders.sort((a, b) => new Date(a.dateOrder).getTime() - new Date(b.dateOrder).getTime());
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

export function getXlsContent(orders: OrderAndCancelInterface[], dateRange: ExportCsvDialogData):string {
  const filteredOrders = filterAndSortOrderHistoryByDateRange(orders, dateRange);
  let xlsContent = `<table>
    <tr>
      <th>Datum Abgegeben</th>
      <th>Datum Essen</th>
      <th>Name Menu</th>
      <th>Preis</th>
      <th>Art</th>
    </tr>`;

  filteredOrders.forEach(order => {
    xlsContent += `<tr>
      <td>${dateToExcelDate(new Date(order.datePlaced))}</td>
      <td>${dateToExcelDate(new Date(order.dateOrder))}</td>
      <td>${order.nameOrder}</td>
      <td>${formatCurrency(order.priceOrder)}</td>
      <td>${order.typeOrder}</td>
    </tr>`;
  });

  xlsContent += `</table>`;
  return xlsContent;

}

export function createPdfBuffer(orders: OrderAndCancelInterface[], dateRange: ExportCsvDialogData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const filteredOrders = filterAndSortOrderHistoryByDateRange(orders, dateRange);

    const tableBody: any = [
      [
        { text: 'Datum Abgegeben', style: 'tableHeader' },
        { text: 'Datum Essen', style: 'tableHeader' },
        { text: 'Name Menu', style: 'tableHeader' },
        { text: 'Preis', style: 'tableHeader' },
        { text: 'Art', style: 'tableHeader' }
      ]
    ];

    filteredOrders.forEach(order => {
      tableBody.push([
        getInvoiceDateOne(new Date(order.datePlaced)),
        getInvoiceDateOne(new Date(order.dateOrder)),
        order.nameOrder,
        formatCurrency(order.priceOrder),
        order.typeOrder
      ]);
    });

    const docDefinition = {
      content: [
        { text: 'Order History', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['15%', '15%', '45%', '10%', '15%'],
            body: tableBody
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number] // Fix für die margin
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        font: 'Roboto' // Verwenden Sie eine definierte Schriftart
      }
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      resolve(blob);
    });
  });
}
