import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { NgClass } from '@angular/common';
import { Transaction, MockTransactionsService } from '../../core/mock';
import { BaseChartDirective } from 'ng2-charts';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, BaseChartDirective],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalDisponible = 0;
  ingresos = 0;
  egresos = 0;
  isBrowser = false;

  constructor(private mockService: MockTransactionsService) {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  barChartType = 'bar';
  barChartLabels = ['Ingresos', 'Egresos'];
  barChartData = {
    labels: this.barChartLabels,
    datasets: [
      {
        label: 'Montos (COP)',
        data: [0, 0],
        backgroundColor: ['#16a34a', '#dc2626'],
      },
    ]
  };

  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    }
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
