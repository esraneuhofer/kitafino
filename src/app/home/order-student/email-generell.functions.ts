import {EmailOrderInterface} from "./email-order.function";

export function getBodyEmailGenerell(
  objectData:EmailOrderInterface,
  arrayEmail:string[],
  titleOrder:string,
  typeOrder:string,
  orderTime:string,
  emailBody:string,
  emailBodyEdit?:string):any{
  return {
    from: objectData.settings.tenantSettings.contact.companyName + '<noreply@cateringexpert.de>', // sender address
      replyTo: objectData.settings.orderSettings.confirmationEmail,
    to: arrayEmail, // list of receivers
    subject: 'Bestellbestätigung✔', // Subject line
    html: '<head>\n' +
  '  <meta charset="UTF-8">\n' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '  <style>\n' +
  'table{\n' +
  '  border: 2px solid lightgray;\n' +
  '}\n' +
  '.container {\n' +
  '  max-width: 650px; /* or whatever maximum width you want */\n' +
  '  margin: 25px auto;\n' +
  '  padding: 0 15px; /* Some padding to ensure content doesn\'t touch the edges on small screens */\n' +
  '}\n' +
  '\n' +
  '.row {\n' +
  '  display: flex;\n' +
  '  flex-wrap: wrap; /* Allows columns to wrap on smaller screens */\n' +
  '  margin-left: -15px;\n' +
  '  margin-right: -15px;\n' +
  '}\n' +
  '\n' +
  '.col-10, .offset-1 {\n' +
  '  flex-basis: 0;\n' +
  '  flex-grow: 1;\n' +
  '  max-width: 100%;\n' +
  '  padding-left: 15px;\n' +
  '  padding-right: 15px;\n' +
  '}\n' +
  '\n' +
  '.col-10 {\n' +
  '  flex: 0 0 83.33333%; /* 10/12 = 83.33333% */\n' +
  '}\n' +
  '\n' +
  '.offset-1 {\n' +
  '  margin-left: 8.33333%; /* 1/12 = 8.33333% */\n' +
  '}\n' +
  '/* Border for the entire table */\n' +
  '.table-bordered {\n' +
  '  border: 1px solid #dee2e6;\n' +
  '}\n' +
  '\n' +
  '/* Borders for the table cells */\n' +
  '.table-bordered th,\n' +
  '.table-bordered td {\n' +
  '  border: 1px solid black;\n' +
  '  border-collapse: collapse;\n' +
  '}\n' +
  '\n' +
  '/* For tables that have a <tbody>, <thead>, or <tfoot> element */\n' +
  '.table-bordered thead th,\n' +
  '.table-bordered thead td {\n' +
  '  border-bottom-width: 2px;\n' +
  '}\n' +
  '\n' +
  '.table_calender_week{\n' +
  '  text-align: center;\n' +
  '  margin-bottom: 10px;\n' +
  '}\n' +
  '\n' +
  '.table {\n' +
  '  width: 100%;\n' +
  '  border-collapse: collapse;\n' +
  '}\n' +
  '.date_day{\n' +
  '  background-color: white;\n' +
  '  text-align: center;\n' +
  '}\n' +
  '.groupName{\n' +
  '  background-color: #B2C9F0;\n' +
  '  text-align: center;\n' +
  '}\n' +
  'th{\n' +
  '  padding: 5px;\n' +
  '}\n' +
  'td{\n' +
  '  padding: 5px;\n' +
  '}\n' +
  'tr td:first-child {\n' +
  '  width: 70%;\n' +
  '}\n' +
  '\n' +
  'tr td:last-child {\n' +
  '  width: 30%;\n' +
  '}\n' +
  '  </style>\n' +
  '</head><body>' +
  '<div style="font-size:1.3em;width: 100vm;height: 100vh;padding:50px 75px 50px 75px; background:#EDEDED">' +

  '<div class="container">\n' +
  '<div style="background:white; border:1px solid lightgray; padding:50px">' +
  '  <div class="row">\n' +
  '    <div class="col-10 offset-1">' +
      '<span style="font-size: 0.9em">' + titleOrder + '</span> <br><br>' +
  emailBody +
  // editedBody +
  '<div style="margin-top: 15px;font-size:0.7em;">Datum:' + orderTime + ' | ' + typeOrder + ' vom Kunden aufgegeben</div>' +
  '</div>' +
  '</div>' +
  '    </div>\n' +
  '    </div>\n' +
  '  </div>' +
  '</body>'
  };
}
