export interface SchoolMessageInterface {
    message:string,
    heading:string,
    messageSeen:string[]; //All messages that have been seen by the user
    sentBy:string,
    createdAt:Date
}
