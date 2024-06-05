import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  setLanguage(body: { lang: string }): Observable<any> {
    const url = `${this.apiUrl}/setLanguage`;
    console.log(`API Base URL: ${this.apiUrl}`);
    console.log(`Sending POST request to ${url} with body:`, body);
    return this.http.post<any>(url, body, { withCredentials: true })
      .pipe(
        map(response => {
          console.log('Response:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Request failed with error:', error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred
      console.error('Client-side error:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError('Something went wrong; please try again later.');
  }
}
