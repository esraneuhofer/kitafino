import { Component, OnInit, ViewChild } from '@angular/core';
import {
  VacationService,
  VacationStudent,
} from '../../service/vacation.service';
import { OrderService } from '../../service/order.service';
import { catchError, finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { OrderInterfaceStudentSave } from '../../classes/order_student_safe.class';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { StudentInterface } from '../../classes/student.class';
import { StudentService } from '../../service/student.service';
import { normalizeToBerlinDate } from '../../functions/date.functions';
import { addDayFromDate } from '../order-student/order.functions';

function setStudentNamesWithVactions(
  vacations: VacationStudent[],
  registeredStudents: StudentInterface[]
): VacationStudent[] {
  const vacationsWithNames = vacations.map((vacation) => {
    const matchingStudent = registeredStudents.find(
      (student) => student._id === vacation.studentId
    );

    if (matchingStudent) {
      return {
        ...vacation,
        firstNameStudent: matchingStudent.firstName,
        lastNameStudent: matchingStudent.lastName,
      };
    } else {
      return {
        ...vacation,
        firstNameStudent: 'Nicht gefunden', // Consider using a translated string or handling this case differently
        lastNameStudent: 'Nicht gefunden', // Consider using a translated string or handling this case differently
      };
    }
  });

  // Sort the vacations by vacationStart date in ascending order
  return vacationsWithNames.sort((a, b) => {
    const dateA = new Date(a.vacation.vacationStart).getTime();
    const dateB = new Date(b.vacation.vacationStart).getTime();
    return dateA - dateB;
  });
}

@Component({
  selector: 'app-vacation-parent',
  templateUrl: './vacation-parent.component.html',
  styleUrls: ['./vacation-parent.component.scss'],
})
export class VacationParentComponent implements OnInit {
  @ViewChild('vacationForm') vacationForm?: NgForm; // Added ? to make it optional

  page: number = 1;
  pageSize: number = 5;
  startDate: string = '';
  endDate: string = '';
  submittingRequest: boolean = false;
  pageLoaded: boolean = false;
  vacations: VacationStudent[] = [];
  futureOrders: OrderInterfaceStudentSave[] = [];
  selectedStudentId: string | null = null;
  registeredStudents: StudentInterface[] = [];
  textBanner: string = '';
  constructor(
    private vacationService: VacationService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private orderService: OrderService,
    private studentService: StudentService
  ) {
    this.textBanner = translate.instant('NO_STUDENT_REGISTERED_BANNER_TEXT');
  }

  ngOnInit(): void {
    this.initializeData();
  }

  initializeData(): void {
    this.pageLoaded = false;

    forkJoin({
      vacations: this.vacationService.getAllVacationsParent().pipe(
        catchError((error) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to load vacations:', errorMessage);
          return of([]);
        })
      ),
      futureOrders: this.orderService
        .getFutureOrders({
          date: new Date().toISOString().split('T')[0],
        })
        .pipe(
          catchError((error) => {
            console.error('Failed to load future orders:', error);
            return of([]);
          })
        ),
      registeredStudents: this.studentService.getRegisteredStudentsUser().pipe(
        catchError((error) => {
          console.error('Failed to load registered students:', error);
          return of([]);
        })
      ),
    })
      .pipe(
        finalize(() => {
          this.pageLoaded = true;
        })
      )
      .subscribe({
        next: (results) => {
          this.registeredStudents = results.registeredStudents;
          this.vacations = results.vacations;
          this.futureOrders = results.futureOrders;
          if (this.registeredStudents.length === 1) {
            this.selectedStudentId = this.registeredStudents[0]._id || null;
          }
          // Add first name and last name to each vacation based on studentId
          this.vacations = setStudentNamesWithVactions(
            this.vacations,
            this.registeredStudents
          );
        },
        error: (error) => {
          console.error('Error initializing data:', error);
          this.pageLoaded = true;
        },
      });
  }

  setStudent(studentId: string | null) {
    this.selectedStudentId = studentId;
  }

  /**
   * Prüft, ob Bestellungen innerhalb eines Urlaubszeitraums liegen
   * @param startDate Anfangsdatum des Urlaubs
   * @param endDate Enddatum des Urlaubs (optional, falls nur ein Tag)
   * @returns Array von OrderInterfaceStudentSave Objekten, die im Zeitraum liegen
   */
  checkForOrderConflicts(
    startDate: Date,
    endDate: Date | null,
    selectedStudentId: string
  ): OrderInterfaceStudentSave[] {
    if (!this.futureOrders || this.futureOrders.length === 0) {
      return [];
    }

    // Wenn kein Enddatum angegeben ist, setze das Enddatum auf das Startdatum
    const vacationEndDate = endDate || startDate;

    // Normalisiere die Datumsformate: Entferne Zeit und konvertiere zu ISO-String (YYYY-MM-DD)
    const vacationStartStr = this.formatDateToString(startDate);
    const vacationEndStr = this.formatDateToString(vacationEndDate);

    // Finde alle Bestellungen, die im Urlaubszeitraum liegen
    let filteredOrders = this.futureOrders.filter((order) => {
      // Normalisiere das Bestelldatum
      const orderDateStr = this.formatDateToString(new Date(order.dateOrder));

      // Prüfe, ob das Bestelldatum im Urlaubszeitraum liegt
      return orderDateStr >= vacationStartStr && orderDateStr <= vacationEndStr;
    });

    // Wenn ein bestimmter Student ausgewählt wurde (nicht 'all'), filtere auch nach der Studenten-ID
    if (selectedStudentId !== 'all') {
      filteredOrders = filteredOrders.filter(
        (order) => order.studentId === selectedStudentId
      );
    }

    return filteredOrders;
  }

  /**
   * Hilfsfunktion zum Formatieren eines Datums in YYYY-MM-DD Format
   */
  private formatDateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Erweiterung der addVacation Methode, die die Konfliktprüfung nutzt
   */
  addVacation(): void {
    if (!this.startDate) {
      // Handle validation error
      return;
    }

    // Konvertiere String-Daten zu Date-Objekten
    const startDateObj = new Date(this.startDate);
    const endDateObj = this.endDate ? new Date(this.endDate) : null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (this.registeredStudents.length === 1) {
      this.selectedStudentId = this.registeredStudents[0]._id || null;
    }
    if (this.registeredStudents.length > 1 && !this.selectedStudentId) {
      this.toastr.error(
        this.translate.instant('ORDER_STUDENT_PLEASE_SELECT_STUDENT')
      );
      return;
    }

    // Validiere, dass das Startdatum in der Zukunft liegt
    if (startDateObj < tomorrow) {
      this.toastr.error(
        this.translate.instant('ERROR_VACATION_START_DATE_FUTURE')
      );
      return;
    }

    // Validiere das Enddatum, falls vorhanden
    if (endDateObj) {
      // Prüfe, ob das Enddatum in der Zukunft liegt
      if (endDateObj < tomorrow) {
        console.error('End date must be at least one day in the future');
        this.toastr.error(
          this.translate.instant('ERROR_VACATION_END_DATE_FUTURE')
        );
        return;
      }

      // Prüfe, ob das Startdatum vor oder gleich dem Enddatum ist
      if (startDateObj > endDateObj) {
        this.toastr.error(
          this.translate.instant('ERROR_VACATION_START_DATE_BEFORE_END_DATE')
        );
        console.error('Start date must be before or equal to end date');
        return;
      }
    }

    if (!this.selectedStudentId) {
      return;
    }

    // Prüfe auf Bestellkonflikte im Urlaubszeitraum
    const conflictingOrders = this.checkForOrderConflicts(
      startDateObj,
      endDateObj,
      this.selectedStudentId
    );
    if (conflictingOrders.length > 0) {
      this.toastr.error(
        this.translate.instant('ERROR_VACATION_CONFLICTING_ORDERS')
      );
      console.error(
        'There are orders placed during the vacation period:',
        conflictingOrders
      );
      return;
    }

    this.submittingRequest = true;
    let promisesVacation = [];
    if (
      this.registeredStudents.length > 1 &&
      this.selectedStudentId === 'all'
    ) {
      this.registeredStudents.forEach((student) => {
        promisesVacation.push(
          this.vacationService.addVacation(
            this.startDate,
            this.endDate || null,
            student._id || ''
          )
        );
      });
    } else {
      promisesVacation.push(
        this.vacationService.addVacation(
          this.startDate,
          this.endDate || null,
          this.selectedStudentId
        )
      );
    }
    forkJoin(promisesVacation)
      .pipe(finalize(() => (this.submittingRequest = false)))
      .subscribe({
        next: (newVacation) => {
          this.vacationService
            .getAllVacationsParent()
            .subscribe((vacations) => {
              this.vacations = setStudentNamesWithVactions(
                vacations,
                this.registeredStudents
              );
              this.toastr.success(
                this.translate.instant('SUCCESS_VACATION_ADDED')
              );

              // Formularfelder zurücksetzen
             

              // Formularvalidierungsstatus zurücksetzen
              if (this.vacationForm) {
                this.vacationForm.resetForm();
              }
              setTimeout(() => {
                this.startDate = ''
                this.endDate = ''
                this.selectedStudentId = null;
              }, 0);
            });
        },
        error: (error) => {
          this.toastr.error(
            this.translate.instant('ERROR_VACATION_ADD_FAILED')
          );
          console.error('Error adding vacation:', error);
        },
      });
  }



  deleteVacation(vacation: VacationStudent): void {
    this.submittingRequest = true;

    this.vacationService
      .deleteVacation(vacation._id || '')
      .pipe(finalize(() => (this.submittingRequest = false)))
      .subscribe({
        next: (successMessage) => {
          this.vacationService
            .getAllVacationsParent()
            .subscribe((vacations) => {
              this.vacations = setStudentNamesWithVactions(
                vacations,
                this.registeredStudents
              );

              this.toastr.success(
                this.translate.instant('SUCCESS_VACATION_DELETED')
              );
            });
          // Bei Erfolg den Urlaub aus der Liste entfernen
        },
        error: (error) => {
          this.toastr.error(this.translate.instant('UNEXPECTED_ERROR'));
          console.error('Error deleting vacation:', error);
        },
      });
  }
}
