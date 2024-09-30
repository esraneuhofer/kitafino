
export interface SchoolMessageInterface {
  customerId:string,
  createdAt:Date,
  message:string,
  messageSeen:string[]; //All messages that have been seen by the user
  sentBy:'school'|'master' | 'caterer',
  validTill:string,
  _id?:string,
  messageId:string
}
