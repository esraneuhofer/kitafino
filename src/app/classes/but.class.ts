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
  dateConfirmed:string | null;
  butFrom: string;
  butTo: string;
  butAmount: number;
  studentId: string;
  tenantId: string;
  userId: string;
}

export class ButStudent implements ButStudentInterface {
  dateConfirmed:string | null;
  butFrom: string;
  butTo: string;
  butAmount: number;
  studentId: string;
  tenantId: string;
  userId: string;
  customerId: string;

  constructor(student: StudentInterface) {
    this.dateConfirmed = null;
    this.butFrom = '';
    this.butTo = '';
    this.butAmount = 0;
    this.studentId = student._id || '';
    this.tenantId = student.tenantId || '';
    this.userId = student.userId || ''
    this.customerId = student.customerId;
  }
}

