import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Receipt,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  Factura,
  Gasto,
  CompraProveedor,
  Pedido,
  Configuracion,
} from '../types';
import { generateMonthlyPDFReport } from '../utils/pdfGenerator';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  facturas: Factura[];
  gastos: Gasto[];
  comprasProveedores: CompraProveedor[];
  pedidos: Pedido[];
  config: Configuracion;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
};

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  facturas,
  gastos,
  comprasProveedores,
  pedidos,
  config,
}) => {
  // Find all available months in dataset
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    facturas.forEach((f) => f.Fecha && set.add(f.Fecha.slice(0, 7)));
    gastos.forEach((g) => g.Fecha && set.add(g.Fecha.slice(0, 7)));
    comprasProveedores.forEach((c) => c.Fecha && set.add(c.Fecha.slice(0, 7)));
    pedidos.forEach((p) => p.Fecha && set.add(p.Fecha.slice(0, 7)));

    // Ensure at least default 2026-07 exists
    set.add('2026-07');
    set.add('2026-06');
    set.add('2026-08');

    return Array.from(set).sort().reverse();
  }, [facturas, gastos, comprasProveedores, pedidos]);

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');
  const [includeConversionBs, setIncludeConversionBs] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Month label format e.g. "Julio 2026"
  const formattedMonthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const mName = MONTH_NAMES[month] || month;
    return `${mName} ${year}`;
  }, [selectedMonth]);

  // Calculations for preview
  const monthlyFacturas = useMemo(
    () => facturas.filter((f) => f.Fecha?.startsWith(selectedMonth)),
    [facturas, selectedMonth]
  );
  const monthlyGastos = useMemo(
    () => gastos.filter((g) => g.Fecha?.startsWith(selectedMonth)),
    [gastos, selectedMonth]
  );
  const monthlyCompras = useMemo(
    () => comprasProveedores.filter((c) => c.Fecha?.startsWith(selectedMonth)),
    [comprasProveedores, selectedMonth]
  );
  const monthlyPedidos = useMemo(
    () => pedidos.filter((p) => p.Fecha?.startsWith(selectedMonth)),
    [pedidos, selectedMonth]
  );

  const totalVentasUSD = useMemo(
    () => monthlyFacturas.reduce((sum, f) => sum + f.Importe, 0),
    [monthlyFacturas]
  );
  const totalGastosUSD = useMemo(
    () => monthlyGastos.reduce((sum, g) => sum + g.Importe, 0),
    [monthlyGastos]
  );
  const totalComprasUSD = useMemo(
    () => monthlyCompras.reduce((sum, c) => sum + c.Importe, 0),
    [monthlyCompras]
  );
  const totalEgresosUSD = totalGastosUSD + totalComprasUSD;
  const balanceNetoUSD = Number((totalVentasUSD - totalEgresosUSD).toFixed(2));
  const margenNeto =
    totalVentasUSD > 0
      ? ((balanceNetoUSD / totalVentasUSD) * 100).toFixed(1)
      : '0.0';

  const tasaBCV = config.Tasa_BCV || 742.22;
  const totalVentasBS = totalVentasUSD * tasaBCV;
  const totalEgresosBS = totalEgresosUSD * tasaBCV;
  const balanceNetoBS = balanceNetoUSD * tasaBCV;

  const handleDownloadPDF = () => {
    const result = generateMonthlyPDFReport({
      monthYear: selectedMonth,
      monthName: formattedMonthLabel,
      facturas,
      gastos,
      comprasProveedores,
      pedidos,
      config,
      notes: customNotes.trim() || undefined,
      includeConversionBs,
    });

    if (result.success) {
      setDownloadSuccess(`Reporte "${result.filename}" generado y descargado con éxito.`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c0e14] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                  Generador de Reportes Mensuales en PDF
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Oficial BCV
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Resumen ejecutivo de ventas, egresos y balance neto en USD y Bolívares
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Controls Bar: Month Picker & Quick Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <label className="text-xs font-semibold text-zinc-300">
                Seleccionar Mes del Reporte:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                {availableMonths.map((m) => {
                  const [y, mon] = m.split('-');
                  return (
                    <option key={m} value={m}>
                      {MONTH_NAMES[mon] || mon} {y}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeConversionBs}
                  onChange={(e) => setIncludeConversionBs(e.target.checked)}
                  className="rounded border-zinc-700 text-blue-600 focus:ring-blue-500 bg-zinc-900"
                />
                <span>Incluir Tasa BCV ({tasaBCV} Bs/$)</span>
              </label>
            </div>
          </div>

          {/* Success Download Notice */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* KPI Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Ventas Totales */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Ventas Facturadas
                </span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                ${totalVentasUSD.toFixed(2)} USD
              </div>
              {includeConversionBs && (
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  {totalVentasBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
                </div>
              )}
              <div className="text-[10px] text-zinc-500 mt-2">
                {monthlyFacturas.length} Facturas registradas
              </div>
            </div>

            {/* 2. Total Egresos */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Gastos + Compras
                </span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400">
                ${totalEgresosUSD.toFixed(2)} USD
              </div>
              {includeConversionBs && (
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  {totalEgresosBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
                </div>
              )}
              <div className="text-[10px] text-zinc-500 mt-2">
                Gastos: ${totalGastosUSD.toFixed(0)} | Compras: ${totalComprasUSD.toFixed(0)}
              </div>
            </div>

            {/* 3. Balance Neto */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  Balance Neto
                </span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono ${
                  balanceNetoUSD >= 0 ? 'text-blue-400' : 'text-rose-400'
                }`}
              >
                {balanceNetoUSD >= 0 ? '+' : ''}${balanceNetoUSD.toFixed(2)} USD
              </div>
              {includeConversionBs && (
                <div className="text-[11px] text-zinc-400 font-mono mt-1">
                  {balanceNetoBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
                </div>
              )}
              <div className="text-[10px] text-zinc-400 mt-2">
                Margen Operativo: <strong className="text-zinc-200">{margenNeto}%</strong>
              </div>
            </div>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="border border-zinc-800 rounded-xl bg-zinc-950 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Vista Previa del Documento PDF · {formattedMonthLabel}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500">
                {config.Nombre_Empresa} · Maracay, VZLA
              </span>
            </div>

            {/* Mini Tables Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Facturas Preview */}
              <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/80">
                <div className="flex items-center justify-between font-bold text-zinc-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-blue-400" />
                    Ventas del Período
                  </span>
                  <span className="text-emerald-400 font-mono">${totalVentasUSD.toFixed(2)}</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {monthlyFacturas.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic">No hay facturas en este mes.</p>
                  ) : (
                    monthlyFacturas.map((f) => (
                      <div
                        key={f.ID_Factura}
                        className="flex items-center justify-between text-[11px] text-zinc-300 py-0.5 border-b border-zinc-800/40"
                      >
                        <span className="truncate max-w-[160px]">{f.Cliente}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400">${f.Importe.toFixed(2)}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                              f.Estado_Pago === 'Pagada'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : f.Estado_Pago === 'Pendiente'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {f.Estado_Pago}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Gastos Preview */}
              <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/80">
                <div className="flex items-center justify-between font-bold text-zinc-200 mb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    Gastos Operativos
                  </span>
                  <span className="text-rose-400 font-mono">${totalGastosUSD.toFixed(2)}</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {monthlyGastos.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 italic">No hay gastos en este mes.</p>
                  ) : (
                    monthlyGastos.map((g) => (
                      <div
                        key={g.ID_Gasto}
                        className="flex items-center justify-between text-[11px] text-zinc-300 py-0.5 border-b border-zinc-800/40"
                      >
                        <span className="truncate max-w-[180px]">
                          <strong className="text-zinc-400">{g.Categoría}:</strong> {g.Descripción}
                        </span>
                        <span className="font-mono text-rose-400">${g.Importe.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Custom Notes Field */}
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Observaciones personalizadas de Gerencia (opcional para el pie del PDF):
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ejemplo: Balance positivo con incremento del 18% en ventas de repostería. Despachos coordinados mediante Google Calendar."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 text-center sm:text-left">
            Genera un PDF vectorizado listo para imprimir o enviar a socios y contabilidad.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-xl text-xs font-semibold transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF Mensual</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
