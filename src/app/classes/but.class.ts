import {StudentInterface, StudentInterfaceId} from "./student.class";

export interface ButDocumentInterface {
  _id?: string;
  nameStudent: string;
  name: string;
  base64: string;
  dateUploaded: Date;
  studentId: string;
  tenantId: string;
  userId: string;
  customerId: string;
  username: string;
  processed: boolean;
}

export interface ButStudentInterface {
  ausgestelltAm: Date | null;
  dateConfirmed:Date | null;
  butFrom:  string;  // Erlaubt sowohl Date als auch string
  butTo:  string;    // Erlaubt sowohl Date als auch string
  butAmountTotal: number;
  customerId: string;
  studentId: string;
  tenantId: string;
  userId: string;
  paybackAmount: number;
  zahlungMonatBut: number;
  processed: boolean;
  butDaysPerWeek: number;
}


export class ButStudent implements ButStudentInterface {
  ausgestelltAm: Date | null = null;
  dateConfirmed:Date | null;
  butFrom: string;
  butTo: string;
  butAmountTotal: number;
  studentId: string;
  tenantId: string;
  userId: string;
  customerId: string;
  paybackAmount: number;
  zahlungMonatBut: number = 0;
  processed: boolean = false;
  butDaysPerWeek: number =1;


  constructor(student: StudentInterface) {
    this.dateConfirmed = null;
    this.butFrom ='';
    this.butTo = '';
    this.butAmountTotal = 0;
    this.studentId = student._id || '';
    this.tenantId = student.tenantId || '';
    this.userId = student.userId || ''
    this.customerId = student.customerId;
    this.paybackAmount = 0;

  }
}


