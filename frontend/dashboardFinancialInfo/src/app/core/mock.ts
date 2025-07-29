import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { fecha: '2024-04-12', categoria: 'Alimentación', monto: 1500 },
  { fecha: '2024-04-11', categoria: 'Transporte', monto: -1200 },
  { fecha: '2024-04-10', categoria: 'Salud', monto: -800 },
  { fecha: '2024-04-09', categoria: 'Entretenimiento', monto: -1000 },
];

export interface Transaction {
  fecha: string;
  categoria: string;
  monto: number;
}


@Injectable({
  providedIn: 'root',
})
export class MockTransactionsService {
  constructor() {}

  getTransactions(): Observable<Transaction[]> {
    return of(MOCK_TRANSACTIONS);
  }
}
