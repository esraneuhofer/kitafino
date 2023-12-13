import {StudentInterface} from "../classes/student.class";

export function getStudentNameById(studentId:string,students:StudentInterface[]){
  let student = students.find(student => student._id === studentId)
  if(student){
    return student.firstName + ' ' + student.lastName
  }
  return 'Student nicht gefunden'
}
