require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const {isHoliday} = require("feiertagejs");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {getWeekNumber} = require("./deadline-deadline.functions");
// const {getEmailBodyOrderDayCustomer} = require("./email-order-customer");
// const {setOrderStudentBackend, getPriceStudent, getNameMenuDay} = require("./order-functions");
// const {getMenusForWeekplan} = require("./weekplan-functions");
// const {getIndexDayOrder} = require("./deadline-orderclass.functions");
// const mongoose = require("mongoose");
// const Settings = mongoose.model('Settings');
// const Customer = mongoose.model('Customer');
// const PermanentOrderStudent = mongoose.model('PermanentOrderStudent');
// const OrderStudent = mongoose.model('OrderStudent');
// const Vacation = mongoose.model('Vacation');
// const Menu = mongoose.model('Menu');
// const Weekplan = mongoose.model('Weekplan');
// const StudentNew = mongoose.model('StudentNew');
// const TenantParent = mongoose.model('Tenantparent');
// const {addOrder} = require('./place-order.controller');
// const getInvoiceDateOne = require('./date.functions').getInvoiceDateOne;
// const {studentHasNotPlacedOrderYet, getStudentById, getDayDeadlineOrder,isVacation} = require("./permanent-order.functions");
// const {sendSuccessEmail, sendCancellationEmail} = require("./email.functions");
// const {convertToSendGridFormat} = require("./sendfrid.controller");
// const {notifyAdmin} = require("./email-order-customer-weekly");


//Todo: findWeek and Year according to orderFrist
// async function processOrder(customerId,tenantId){
//   // let tenantId = '651c635eca2c3d25809ce4f5';
//   // let customerId = "6540b2117d2b64903bb4e3a2";
//   try {
//     const customer = await Customer.findOne({customerId: customerId})
//     customer.generalSettings.day = 1;
//     customer.generalSettings.time = "1970-01-01 15:49:00";
//     const dayDeadlineOrder = getDayDeadlineOrder(customer)
//     const weekNumber = getWeekNumber(new Date(dayDeadlineOrder)); // Implement this function based on your logic
//     const year = new Date(dayDeadlineOrder).getFullYear();
//     const settings = await Settings.findOne({tenantId: tenantId})
//     const menus = await Menu.find({tenantId: tenantId})
//     const weekplan = await Weekplan.findOne({tenantId: tenantId, year: year, week: weekNumber});
//     const weekplanEdited = getMenusForWeekplan(weekplan, settings, {year: year, week: weekNumber},menus);
//     const vacationCustomer = await Vacation.find({customerId: customerId})
//     const permanentOrderStudents = await PermanentOrderStudent.find({customerId: customerId});
//     const studentsCustomer = await StudentNew.find({customerId: customerId});
//     const orderStudents = await OrderStudent.find({customerId: customerId, dateOrder: dayDeadlineOrder});
//     const indexDay = getIndexDayOrder(dayDeadlineOrder);
//
//     for (let eachPermanentOrderStudent of permanentOrderStudents) {
//
//       let tenantStudent = await TenantParent.findOne({ userId: eachPermanentOrderStudent.userId });
//       let studentModel = getStudentById(eachPermanentOrderStudent.studentId, studentsCustomer);
//       if (!studentModel) {
//         continue;
//       }
//       if (!eachPermanentOrderStudent.daysOrder[indexDay].selected) {
//         continue;
//       }
//       if (!studentHasNotPlacedOrderYet(eachPermanentOrderStudent, orderStudents, indexDay)) {
//         continue;
//       }
//
//       const priceStudent = getPriceStudent(studentModel, customer, settings);
//
//       let mockReq = {
//         studentsCustomer: studentsCustomer,
//         year: year,
//         weekNumber: weekNumber,
//         menus: menus,
//         weekkplanDay: weekplanEdited.weekplan[indexDay],
//         nameStudent: studentModel.firstName + ' ' + studentModel.lastName,
//         dateOrderEdited: getInvoiceDateOne(dayDeadlineOrder),
//         arrayEmail: [settings.orderSettings.confirmationEmail],
//         nameCustomer: customer.contact.customer,
//         priceStudent: getPriceStudent(studentModel, customer, settings),
//         settings: settings,
//         eachPermanentOrderStudent: eachPermanentOrderStudent,
//         indexDay: indexDay,
//         tenantId: tenantId,
//         customerId: customerId,
//         _id: eachPermanentOrderStudent.userId,
//         tenantStudent: tenantStudent,
//       };
//
//       if (isHoliday(new Date(dayDeadlineOrder), customer.generalSettings.state) || isVacation(dayDeadlineOrder, vacationCustomer)) {
//         try {
//           await sendCancellationEmail(mockReq, 'Für den ausgewählten Tag ist ein Schließtag / Feiertag eingetragen. Sollte dies nicht korrekt sein, wenden Sie sich bitte an die Einrichtung');
//         } catch (emailError) {
//           console.error('Failed to send cancellation email:', emailError);
//         }
//         continue;
//       }
//
//       mockReq.body = setOrderStudentBackend(customer, dayDeadlineOrder, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent, menus);
//       // console.log('mockReq',mockReq.body)
//       try {
//         const response = await addOrder(mockReq, {});
//         if (!response.success) {
//           throw new Error(response.message);
//         }
//
//         try {
//           await sendSuccessEmail(mockReq, response);
//         } catch (emailError) {
//           console.error('Failed to send success email:', emailError);
//         }
//       } catch (error) {
//         // console.error('Failed to add order:', error.message); // Ensure error logging is detailed
//         try {
//           await sendCancellationEmail(mockReq, error.message);
//         } catch (emailError) {
//           console.error('Failed to send cancellation email:', emailError);
//         }
//       }
//     }
//
//
//     await sendEmailDailyConfirmation(weekplanEdited.weekplan[indexDay],settings,customer,studentsCustomer,dayDeadlineOrder)
//
//   } catch
//     (error) {
//     console.error('Failed to check deadlines and send order email:', error);
//     // Handle error appropriately
//   }
// }

// async function processOrder(customerId, tenantId) {
//   let weekplanEdited;
//   let dayDeadlineOrder;
//   let settings;
//   let customer;
//   let studentsCustomer;
//   let indexDay;
//
//   try {
//     customer = await Customer.findOne({ customerId: customerId });
//     // customer.generalSettings.day = 1;
//     // customer.generalSettings.time = "1970-01-01 15:49:00";
//     dayDeadlineOrder = getDayDeadlineOrder(customer);
//     const weekNumber = getWeekNumber(new Date(dayDeadlineOrder));
//     const year = new Date(dayDeadlineOrder).getFullYear();
//     settings = await Settings.findOne({ tenantId: tenantId });
//     const menus = await Menu.find({ tenantId: tenantId });
//     const weekplan = await Weekplan.findOne({ tenantId: tenantId, year: year, week: weekNumber });
//     weekplanEdited = getMenusForWeekplan(weekplan, settings, { year: year, week: weekNumber }, menus);
//     const vacationCustomer = await Vacation.find({ customerId: customerId });
//     const permanentOrderStudents = await PermanentOrderStudent.find({ customerId: customerId });
//     studentsCustomer = await StudentNew.find({ customerId: customerId });
//     const orderStudents = await OrderStudent.find({ customerId: customerId, dateOrder: dayDeadlineOrder });
//     indexDay = getIndexDayOrder(dayDeadlineOrder);
//
//     let bulkOperations = [[]];
//     let emailPromises = [];
//     let batchIndex = 0;
//
//     for (let eachPermanentOrderStudent of permanentOrderStudents) {
//       let tenantStudent = await TenantParent.findOne({ userId: eachPermanentOrderStudent.userId });
//       let studentModel = getStudentById(eachPermanentOrderStudent.studentId, studentsCustomer);
//       if (!studentModel) {
//         continue;
//       }
//       if (!eachPermanentOrderStudent.daysOrder[indexDay].selected) {
//         continue;
//       }
//       if (!studentHasNotPlacedOrderYet(eachPermanentOrderStudent, orderStudents, indexDay)) {
//         continue;
//       }
//
//       const priceStudent = getPriceStudent(studentModel, customer, settings);
//
//       let mockReq = {
//         studentsCustomer: studentsCustomer,
//         year: year,
//         weekNumber: weekNumber,
//         menus: menus,
//         weekkplanDay: weekplanEdited.weekplan[indexDay],
//         nameStudent: studentModel.firstName + ' ' + studentModel.lastName,
//         dateOrderEdited: getInvoiceDateOne(dayDeadlineOrder),
//         arrayEmail: [settings.orderSettings.confirmationEmail],
//         nameCustomer: customer.contact.customer,
//         priceStudent: getPriceStudent(studentModel, customer, settings),
//         settings: settings,
//         eachPermanentOrderStudent: eachPermanentOrderStudent,
//         indexDay: indexDay,
//         tenantId: tenantId,
//         customerId: customerId,
//         _id: eachPermanentOrderStudent.userId,
//         tenantStudent: tenantStudent,
//       };
//
//       if (isHoliday(new Date(dayDeadlineOrder), customer.generalSettings.state) || isVacation(dayDeadlineOrder, vacationCustomer)) {
//         emailPromises.push(
//           sendCancellationEmail(mockReq, 'Für den ausgewählten Tag ist ein Schließtag / Feiertag eingetragen. Sollte dies nicht korrekt sein, wenden Sie sich bitte an die Einrichtung')
//             .catch(emailError => {
//               console.error('Failed to send cancellation email:', emailError);
//               notifyAdmin(emailError, customer.contact.email, customerId);
//             })
//         );
//         continue;
//       }
//
//       mockReq.body = setOrderStudentBackend(customer, dayDeadlineOrder, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent, menus);
//
//       if (!bulkOperations[batchIndex]) {
//         bulkOperations[batchIndex] = [];
//       }
//
//       bulkOperations[batchIndex].push({
//         insertOne: {
//           document: mockReq.body
//         }
//       });
//
//       if (bulkOperations[batchIndex].length >= 100) {
//         batchIndex++;
//       }
//
//       try {
//         const response = await addOrder(mockReq, {});
//         if (!response.success) {
//           throw new Error(response.message);
//         }
//
//         emailPromises.push(
//           sendSuccessEmail(mockReq, response)
//             .catch(emailError => {
//               console.error('Failed to send success email:', emailError);
//               notifyAdmin(emailError, customer.contact.email, customerId);
//             })
//         );
//       } catch (error) {
//         console.error('Failed to add order:', error);
//         emailPromises.push(
//           sendCancellationEmail(mockReq, error.message)
//             .catch(emailError => {
//               console.error('Failed to send cancellation email:', emailError);
//               notifyAdmin(emailError, customer.contact.email, customerId);
//             })
//         );
//       }
//     }
//
//     // Write all bulk operations
//     for (const bulkOperation of bulkOperations) {
//       if (bulkOperation.length > 0) {
//         await OrderStudent.bulkWrite(bulkOperation);
//       }
//     }
//
//     // Wait for all email promises to resolve
//     await Promise.all(emailPromises);
//   } catch (error) {
//     console.error('Failed to check deadlines and send order email:', error);
//     notifyAdmin(error, customer.contact.email, customerId);
//   } finally {
//     try {
//       await sendEmailDailyConfirmation(weekplanEdited.weekplan[indexDay], settings, customer, studentsCustomer, dayDeadlineOrder);
//     } catch (confirmationError) {
//       console.error('Failed to send daily confirmation email:', confirmationError);
//       notifyAdmin(confirmationError, customer.contact.email, customerId);
//     }
//   }
// }








// async function sendEmailDailyConfirmation(weekplanDay, settings, customer, studentsCustomer, dayDeadlineOrder) {
//   try {
//     console.log("dayDeadlineOrder",dayDeadlineOrder)
//     // Retrieve all orders
//     const allOrders = await OrderStudent.find({ customerId: customer.customerId, dateOrder: dayDeadlineOrder });
//     // Generate the email body for the customer
//     const emailBodyCustomerDay = getEmailBodyOrderDayCustomer(weekplanDay, allOrders, settings, customer, studentsCustomer, dayDeadlineOrder);
//
//     // Check if email body is defined
//     if (!emailBodyCustomerDay) {
//       console.log("No email to send, skipping...");
//       return; // Exit the function if email body is null
//     }
//
//     // Send the email
//     await sgMail.send(convertToSendGridFormat(emailBodyCustomerDay));
//
//     console.log("Email sent successfully");
//   } catch (error) {
//     // Log the error and handle it appropriately
//     console.error("Failed to send daily confirmation email:", error);
//
//     // Depending on your application's needs, you might also want to throw the error,
//     // return it, or handle it in another specific way
//     throw error; // This re-throws the caught error if you want to handle it further up the chain
//   }
// }
//
// const testingDaily = async (req, res) => {
//   try {
//     let tenantIdString = '651c635eca2c3d25809ce4f5';
//     let customerIdString = "6540b2117d2b64903bb4e3b3";
//
//     // Convert strings to ObjectId
//     const customerId = new mongoose.Types.ObjectId(customerIdString);
//     const tenantId = new mongoose.Types.ObjectId(tenantIdString);
//
//     // Call the processOrderWeekly function
//     await processOrder(customerId, tenantId);
//
//     res.status(200).send({ message: 'Daily Tested succesfully' });
//   } catch (error) {
//     console.error('Error in testing function:', error); // Log the error for debugging
//     res.status(500).send({ error: 'Failed to edit parent tenant' });
//   }
// };
//
// module.exports = {
//   processOrder,
//   testingDaily
// };
