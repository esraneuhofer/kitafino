import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VacationStudent {
  _id?: string;
  userId: string;
  vacation: {
    vacationStart: Date;
    vacationEnd: Date | null;
  }
}

@Injectable({
  providedIn: 'root'
})
export class VacationService {
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all vacations for the current user
   */
  getAllVacations(): Observable<VacationStudent[]> {
    return this.http.get<VacationStudent[]>(`${this.apiBaseUrl}/getAllVacationParentByUserId`);
  }

  /**
   * Add a new vacation
   * @param startDate Vacation start date
   * @param endDate Vacation end date (optional)
   */
  addVacation(startDate: string, endDate: string | null): Observable<VacationStudent> {
    return this.http.post<VacationStudent>(`${this.apiBaseUrl}/addVacation`, { startDate, endDate });
  }

  /**
   * Delete a vacation
   * @param id Vacation ID to delete
   */
  deleteVacation(id: string): Observable<string> {
    return this.http.post<string>(`${this.apiBaseUrl}/deleteVacation`, { id });
  }
}