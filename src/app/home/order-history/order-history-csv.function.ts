import { ExportCsvDialogData } from "../../directives/export-csv-dialog/export-csv-dialog.component";
import { OrderAndCancelInterface, OrderHistoryTableInterface } from "./order-history.component";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { getInvoiceDateOne } from "../../functions/date.functions";
import { StudentInterface } from "../../classes/student.class";
import { EinrichtungInterface } from "../../classes/einrichtung.class";
import { getBase64ImageFromUrl } from "../but/but-request-pdf.function";
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
  if (isNaN(amount)) return String(0)
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

export function getXlsContent(orders: OrderAndCancelInterface[], dateRange: ExportCsvDialogData): string {
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

export function createPdfBufferBuT(
  orders: OrderAndCancelInterface[],
  dateRange: ExportCsvDialogData,
  student: StudentInterface,
  school: EinrichtungInterface
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Filter nur Bestellungen (keine Stornierungen)
    const filteredOrders = filterAndSortOrderHistoryByDateRange(orders, dateRange)
      .filter(order => order.typeOrder === 'Bestellung');

    getBase64ImageFromUrl('../../../assets/logo.png')
      .then(logoBase64 => {
        const tableBody: any = [
          [
            { text: 'Datum Bestellung', style: 'tableHeader' },
            { text: 'Datum Essen', style: 'tableHeader' },
            { text: 'Menu', style: 'tableHeader' },
            { text: 'Preis', style: 'tableHeader' }
          ]
        ];

        // Berechne Gesamtpreis
        let totalPrice = 0;
        filteredOrders.forEach(order => {
          totalPrice += order.priceOrder;
          tableBody.push([
            getInvoiceDateOne(new Date(order.datePlaced)),
            getInvoiceDateOne(new Date(order.dateOrder)),
            order.nameOrder,
            formatCurrency(order.priceOrder) + ' €'
          ]);
        });

        const docDefinition: any = {
          header: {
            columns: [
              { text: '' },
              { image: logoBase64, width: 90, alignment: 'right', margin: [0, 10, 10, 0] }
            ],
            margin: [0, 0, 0, 40]
          },
          content: [
            { text: 'Aufstellung Bestellung Essen', style: 'header' },
            '\n\n',
            {
              text: [
                'Verpflegungsteilnehmer/in: ',
                { text: `${student.firstName} ${student.lastName}`, bold: true }
              ],
              style: 'content'
            },
            '\n\n',
            {
              text: [
                'Es wurden für den Zeitraum vom ',
                { text: `${getInvoiceDateOne(new Date(dateRange.firstDate))}`, bold: true },
                ' bis ',
                { text: `${getInvoiceDateOne(new Date(dateRange.secondDate))}`, bold: true },
                ' folgende Bestellungen abgegeben:'
              ],
              style: 'content'
            },
            '\n\n',
            {
              table: {
                headerRows: 1,
                widths: ['20%', '20%', '40%', '20%'],
                body: tableBody
              },
              layout: 'lightHorizontalLines'
            },
            '\n',
            {
              text: [
                'Gesamtbetrag: ',
                { text: `${formatCurrency(totalPrice)} €`, bold: true }
              ],
              style: 'content',
              alignment: 'right'
            },
            '\n\n',
            {
              text: [
                'Das Essen wurde bestellt für die Einrichtung ',
                { text: school.nameEinrichtung, bold: true },
                ' von dem Caterer ',
                { text: school.nameCateringCompany, bold: true },
                '.'
              ],
              style: 'content'
            },
            '\n\n',
            {
              text: 'Die Abwicklung der Zahlungen für das Mittagessen des Caterers erfolgt über unsere Plattform und wurde bereits beglichen.',
              style: 'content'
            },
            '\n\n',
            {
              text: `Dieses Schreiben wurde am ${getInvoiceDateOne(new Date())} aus unserem System erstellt und ist auch ohne Unterschrift gültig.`,
              style: 'content'
            },
            '\n\n',
            { text: 'Mit freundlichen Grüßen', style: 'content' },
            '\n',
            { text: 'Esra Neuhofer\nGeschäftsführer', style: 'content' }
          ],
          footer: function (currentPage: any, pageCount: any) {
            return {
              columns: [
                {
                  text: 'Cateringexpert Software Solutions GmbH\nAdelheitstrasse 74\n65185 Wiesbaden',
                  style: 'documentFooterLeft'
                },
                {
                  text: 'Deutsche Bank\nIBAN: DE30 5107 0021 0980 5797 01\nBIC: DEUTDEFF510\nUSt-IdNr: DE366961599',
                  style: 'documentFooterCenter'
                },
                {
                  text: 'www.cateringexpert.de\ninfo@cateringexpert.de\nTel: 0611 - 94910991\n\nSeite ' + currentPage + ' von ' + pageCount,
                  style: 'documentFooterRight'
                }
              ]
            };
          },
          styles: {
            header: {
              fontSize: 16,
              bold: true,
              margin: [0, 60, 0, 20] as [number, number, number, number]
            },
            tableHeader: {
              bold: true,
              fontSize: 11,
              color: 'black',
              fillColor: '#f0f0f0'
            },
            content: {
              fontSize: 11,
              margin: [0, 0, 0, 5] as [number, number, number, number]
            },
            documentFooterLeft: {
              fontSize: 9,
              margin: [25, -15, 5, 5] as [number, number, number, number],
              alignment: 'left'
            },
            documentFooterCenter: {
              fontSize: 9,
              margin: [5, -15, 5, 5] as [number, number, number, number],
              alignment: 'center'
            },
            documentFooterRight: {
              fontSize: 9,
              margin: [5, -15, 25, 5] as [number, number, number, number],
              alignment: 'right'
            }
          },
          defaultStyle: {
            font: 'Roboto'
          }
        };

        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBlob((blob) => {
          resolve(blob);
        });
      })
      .catch(error => {
        console.error('Error loading logo: ', error);
        reject(error);
      });
  });
}
