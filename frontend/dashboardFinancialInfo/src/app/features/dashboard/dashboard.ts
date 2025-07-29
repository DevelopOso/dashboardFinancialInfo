import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { Transaction, MockTransactionsService} from '../../core/mock';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, NgChartsConfiguration],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalDisponible = 0;
  ingresos = 0;
  egresos = 0;

  constructor(private mockService: MockTransactionsService) {}

  barChartType = 'bar';
  barChartLabels = ['Ingresos', 'Egresos'];
  barChartData = {
    labels: this.barChartLabels,
    datasets: [
      {
        label: 'Montos (COP)',
        data: [0, 0], // Se actualiza en ngOnInit
        backgroundColor: ['#16a34a', '#dc2626'], // verde, rojo
      },
    ]
  };

  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  ngOnInit(): void {
    this.mockService.getTransactions().subscribe((data: Transaction[]) => {
      this.transactions = data;
      this.ingresos = data
        .filter((t: Transaction) => t.monto > 0)
        .reduce((acc: number, t: Transaction) => acc + t.monto, 0);
      this.egresos = data
        .filter((t: Transaction) => t.monto < 0)
        .reduce((acc: number, t: Transaction) => acc + t.monto, 0);
      this.totalDisponible = this.ingresos + this.egresos;
      this.barChartData.datasets[0].data = [this.ingresos, Math.abs(this.egresos)];
    });
  }



}
