import { Component, OnInit, ViewChild } from '@angular/core';
import { VacationService, VacationStudent } from '../../service/vacation.service';
import { OrderService } from '../../service/order.service';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { OrderInterfaceStudentSave } from '../../classes/order_student_safe.class';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vacation-parent',
  templateUrl: './vacation-parent.component.html',
  styleUrls: ['./vacation-parent.component.scss']
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

  constructor(
    private vacationService: VacationService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.initializeData();
  }

  async initializeData(): Promise<void> {
    try {
      this.pageLoaded = false;
      await Promise.all([
        this.loadVacations(),
        this.loadFutureOrders()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      this.pageLoaded = true;
    }
  }
  
async loadVacations(): Promise<void> {
  try {
    this.vacations = await firstValueFrom(this.vacationService.getAllVacations());
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error('Failed to load vacations: ' + errorMessage);
  }
}

  async loadFutureOrders(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    this.futureOrders = await firstValueFrom(
      this.orderService.getFutureOrders({ date: today })
    );
  }

/**
 * Prüft, ob Bestellungen innerhalb eines Urlaubszeitraums liegen
 * @param startDate Anfangsdatum des Urlaubs
 * @param endDate Enddatum des Urlaubs (optional, falls nur ein Tag)
 * @returns Array von OrderInterfaceStudentSave Objekten, die im Zeitraum liegen
 */
checkForOrderConflicts(startDate: Date, endDate: Date | null): OrderInterfaceStudentSave[] {
  if (!this.futureOrders || this.futureOrders.length === 0) {
    return [];
  }

  // Wenn kein Enddatum angegeben ist, setze das Enddatum auf das Startdatum
  const vacationEndDate = endDate || startDate;
  
  // Normalisiere die Datumsformate: Entferne Zeit und konvertiere zu ISO-String (YYYY-MM-DD)
  const vacationStartStr = this.formatDateToString(startDate);
  const vacationEndStr = this.formatDateToString(vacationEndDate);
  
  // Finde alle Bestellungen, die im Urlaubszeitraum liegen
  return this.futureOrders.filter(order => {
    // Normalisiere das Bestelldatum
    const orderDateStr = this.formatDateToString(new Date(order.dateOrder));
    
    // Prüfe, ob das Bestelldatum im Urlaubszeitraum liegt
    return orderDateStr >= vacationStartStr && orderDateStr <= vacationEndStr;
  });
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

  // Validiere, dass das Startdatum in der Zukunft liegt
  if (startDateObj < tomorrow) {
    this.toastr.error( this.translate.instant('ERROR_VACATION_START_DATE_FUTURE'));
    return;
  }

  // Validiere das Enddatum, falls vorhanden
  if (endDateObj) {
    // Prüfe, ob das Enddatum in der Zukunft liegt
    if (endDateObj < tomorrow) {
      console.error('End date must be at least one day in the future');
      this.toastr.error(this.translate.instant('ERROR_VACATION_END_DATE_FUTURE'));
      return;
    }
    
    // Prüfe, ob das Startdatum vor oder gleich dem Enddatum ist
    if (startDateObj > endDateObj) {
      this.toastr.error(this.translate.instant('ERROR_VACATION_START_DATE_BEFORE_END_DATE'));
      console.error('Start date must be before or equal to end date');
      return;
    }
  }

  // Prüfe auf Bestellkonflikte im Urlaubszeitraum
  const conflictingOrders = this.checkForOrderConflicts(startDateObj, endDateObj);
  if (conflictingOrders.length > 0) {
    this.toastr.error(this.translate.instant('ERROR_VACATION_CONFLICTING_ORDERS'));
    console.error('There are orders placed during the vacation period:', conflictingOrders);
    return;
  }

  this.submittingRequest = true;

  this.vacationService.addVacation(this.startDate, this.endDate || null)
  .pipe(finalize(() => this.submittingRequest = false))
  .subscribe({
    next: (newVacation) => {
      // Füge den neuen Urlaub direkt zur Urlaubsliste hinzu
      this.vacations.unshift(newVacation);
      this.toastr.success(this.translate.instant('SUCCESS_VACATION_ADDED'));
      
      // Formularfelder zurücksetzen
      this.startDate = '';
      this.endDate = '';
      
      // Formularvalidierungsstatus zurücksetzen
      if (this.vacationForm) {
        this.vacationForm.resetForm();
      }
    },
    error: (error) => {
      this.toastr.error(this.translate.instant('ERROR_VACATION_ADD_FAILED'));
      console.error('Error adding vacation:', error);
    }
  });
}



deleteVacation(vacation:VacationStudent): void {
  this.submittingRequest = true;
  
  this.vacationService.deleteVacation(vacation._id || '')
    .pipe(finalize(() => this.submittingRequest = false))
    .subscribe({
      next: (successMessage) => {
      
        this.vacationService.getAllVacations().subscribe((vacations) => {
          this.vacations = vacations;
        this.toastr.success(this.translate.instant('SUCCESS_VACATION_DELETED'));

        });
        // Bei Erfolg den Urlaub aus der Liste entfernen
      },
      error: (error) => {
        this.toastr.error(this.translate.instant('ERROR_VACATION_DELETE_FAILED'));
        console.error('Error deleting vacation:', error);
      }
    });
}

}
