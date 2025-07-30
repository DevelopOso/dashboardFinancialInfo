import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { NgClass } from '@angular/common';
import { Transaction, MockTransactionsService } from '../../core/mock';
import { BaseChartDirective } from 'ng2-charts';
import { PLATFORM_ID } from '@angular/core';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgClass, CurrencyPipe, BaseChartDirective, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalDisponible = 0;
  ingresos = 0;
  egresos = 0;
  isBrowser = false;
  form: FormGroup;

  constructor(
    private mockService: MockTransactionsService,
    private fb: FormBuilder
  ) {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
    this.form = this.fb.group({
      fecha: [new Date().toISOString().slice(0, 10), Validators.required],
      categoria: ['', Validators.required],
      monto: [null, [Validators.required, Validators.pattern('^-?\\d+(\\.\\d{1,2})?$')]],
      tipo: ['ingreso', Validators.required]
    });
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

  editIndex: number | null = null;
  editMovimiento: Transaction = { fecha: '', categoria: '', monto: 0 };
  showDeleteModal = false;
  deleteIndex: number | null = null;
  loading = false;
  toastMsg = '';


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

  agregarMovimiento() {
    if (this.form.invalid) return;
    const { fecha, categoria, monto, tipo } = this.form.value;
    const valor = tipo === 'egreso' ? -Math.abs(monto) : Math.abs(monto);

    const nuevo: Transaction = {
      fecha,
      categoria,
      monto: valor
    };

    // Actualiza en memoria
    this.transactions = [nuevo, ...this.transactions];
    // Recalcula ingresos, egresos y total
    this.ingresos = this.transactions.filter(t => t.monto > 0).reduce((acc, t) => acc + t.monto, 0);
    this.egresos = this.transactions.filter(t => t.monto < 0).reduce((acc, t) => acc + t.monto, 0);
    this.totalDisponible = this.ingresos + this.egresos;
    this.barChartData.datasets[0].data = [this.ingresos, Math.abs(this.egresos)];

    this.form.reset({
      fecha: new Date().toISOString().slice(0, 10),
      categoria: '',
      monto: null,
      tipo: 'ingreso'
    });
  }

  guardarEdicion(i: number) {
    // Validaciones básicas
    if (!this.editMovimiento.fecha || !this.editMovimiento.categoria || this.editMovimiento.monto === null || isNaN(this.editMovimiento.monto)) {
      this.mostrarToast('Datos inválidos');
      return;
    }
    // Actualiza el movimiento
    this.transactions[i] = { ...this.editMovimiento };
    this.recalcularResumen();
    this.editIndex = null;
    this.mostrarToast('Movimiento actualizado');
  }

  confirmarEliminar(i: number) {
    this.showDeleteModal = true;
    this.deleteIndex = i;
  }
  iniciarEdicion(i: number) {
    this.editIndex = i;
    this.editMovimiento = { ...this.transactions[i] };
  }

  cancelarEdicion() {
    this.editIndex = null;
    this.editMovimiento = { fecha: '', categoria: '', monto: 0 };
  }

  cancelarEliminar() {
    this.showDeleteModal = false;
    this.deleteIndex = null;
  }

  eliminarMovimiento() {
    if (this.deleteIndex === null) return;
    this.loading = true;
    this.transactions.splice(this.deleteIndex!, 1);
    this.recalcularResumen();
    this.showDeleteModal = false;
    this.loading = false;
    this.deleteIndex = null;
    this.mostrarToast('Movimiento eliminado');
    this.recalcularResumen();
  }

  mostrarToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 2000);
  }

  recalcularResumen() {
    this.ingresos = this.transactions.filter(t => t.monto > 0).reduce((acc, t) => acc + t.monto, 0);
    this.egresos = this.transactions.filter(t => t.monto < 0).reduce((acc, t) => acc + t.monto, 0);
    this.totalDisponible = this.ingresos + this.egresos;
    this.barChartData = {
      ...this.barChartData,
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: [this.ingresos, Math.abs(this.egresos)]
        }
      ]
    };
  }

}
