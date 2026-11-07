import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Receipt,
  Crown,
  AlertTriangle,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Cliente,
  Producto,
  Pedido,
  Factura,
  Gasto,
  Campaña,
  Configuracion,
} from '../types';

interface DashboardViewProps {
  clientes: Cliente[];
  productos: Producto[];
  pedidos: Pedido[];
  facturas: Factura[];
  gastos: Gasto[];
  campanas: Campaña[];
  config: Configuracion;
  onOpenAiCenter: () => void;
  onOpenReportModal?: () => void;
  setActiveTab: (tab: any) => void;
}

const COLORS = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  clientes,
  productos,
  pedidos,
  facturas,
  gastos,
  campanas,
  config,
  onOpenAiCenter,
  onOpenReportModal,
  setActiveTab,
}) => {
  // Financial Calculations
  const totalVentasUSD = facturas.reduce((sum, f) => sum + f.Importe, 0);
  const totalGastosUSD = gastos.reduce((sum, g) => sum + g.Importe, 0);
  const beneficioUSD = Number((totalVentasUSD - totalGastosUSD).toFixed(2));
  const totalVentasBS = totalVentasUSD * config.Tasa_BCV;

  const pedidosPendientes = pedidos.filter((p) => p.Estado === 'Pendiente');
  const facturasPendientes = facturas.filter((f) => f.Estado_Pago === 'Pendiente');
  const facturasVencidas = facturas.filter((f) => f.Estado_Pago === 'Vencida');
  const clientesVIP = clientes.filter((c) => c.Cliente_VIP === 'Sí');
  const productosBajoStock = productos.filter((p) => p.Stock_Actual <= p.Stock_Mínimo);

  // Chart Data Preparation: Ventas por Categoría
  const categoriaMap: Record<string, number> = {};
  productos.forEach((p) => {
    const totalProducto = p.Precio_Venta * (100 - p.Stock_Actual);
    categoriaMap[p.Categoría] = (categoriaMap[p.Categoría] || 0) + totalProducto;
  });

  const chartCategoriasData = Object.entries(categoriaMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  // Chart Data: ROI Campañas
  const chartCampanasData = campanas.map((c) => ({
    name: c.Canal,
    Inversión: c.Inversión,
    Ventas: c.Ventas_Generadas,
    ROI: c.ROI,
  }));

  // Chart Data: Financial Flow
  const chartFlowData = [
    { name: 'Ventas Totales', monto: totalVentasUSD },
    { name: 'Gastos Operativos', monto: totalGastosUSD },
    { name: 'Beneficio Neto', monto: Math.max(0, beneficioUSD) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & CEO Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> ERP SaaS
              </span>
              <span className="text-xs text-zinc-500 font-medium">Maracay, VZLA</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mt-2 tracking-tight">
              Overview General
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Resumen ejecutivo en tiempo real para Master Chefs. Tasa oficial BCV ajustada a{' '}
              <strong className="text-emerald-400 font-mono font-bold">
                {config.Tasa_BCV.toLocaleString('es-VE')} Bs/$
              </strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm px-5 py-3 rounded-full border border-zinc-700 transition-all active:scale-95 shadow-sm"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>REPORTE MENSUAL PDF</span>
              </button>
            )}

            <button
              onClick={onOpenAiCenter}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95 shrink-0"
            >
              <Brain className="w-4 h-4" />
              <span>ANALIZAR EMPRESA</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Ventas Totales */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Ventas Totales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-zinc-100">${totalVentasUSD.toFixed(0)}</div>
            <div className="text-[11px] text-emerald-400 font-mono font-medium mt-1">
              {totalVentasBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.
            </div>
          </div>
        </div>

        {/* KPI 2: Beneficio Estimado */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Beneficio Neto</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-blue-400">${beneficioUSD.toFixed(0)}</div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>Margen global</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pedidos Pendientes */}
        <button
          onClick={() => setActiveTab('pedidos')}
          className="bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/40 text-left rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Pedidos Pend.</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-zinc-100">{pedidosPendientes.length}</div>
            <div className="text-[11px] text-amber-400 font-medium mt-1">Ver despachos &rarr;</div>
          </div>
        </button>

        {/* KPI 4: Facturas Pendientes */}
        <button
          onClick={() => setActiveTab('facturacion')}
          className="bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 text-left rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Facturas Pend.</span>
            <Receipt className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-zinc-100">{facturasPendientes.length}</div>
            <div className="text-[11px] text-amber-400 font-medium mt-1">
              {facturasVencidas.length > 0 ? `${facturasVencidas.length} Vencidas` : 'Al día'}
            </div>
          </div>
        </button>

        {/* KPI 5: Clientes VIP */}
        <button
          onClick={() => setActiveTab('clientes')}
          className="bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/40 text-left rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Clientes VIP</span>
            <Crown className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-zinc-100">{clientesVIP.length}</div>
            <div className="text-[11px] text-blue-400 font-medium mt-1">Ver Cartera &rarr;</div>
          </div>
        </button>

        {/* KPI 6: Alertas Críticas */}
        <button
          onClick={() => setActiveTab('inventario')}
          className="bg-zinc-900/50 border border-zinc-800 hover:border-red-500/40 text-left rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-medium uppercase tracking-wider">Alertas Stock</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-red-400">{productosBajoStock.length}</div>
            <div className="text-[11px] text-red-400 font-medium mt-1">Reposición &rarr;</div>
          </div>
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Flujo Financiero */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Flujo Financiero ($ USD)</h3>
              <p className="text-xs text-zinc-500">Comparativa de ingresos vs costes operacionales</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              +{Math.round(((totalVentasUSD - totalGastosUSD) / (totalVentasUSD || 1)) * 100)}% Margen
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${val.toFixed(2)} USD`, 'Monto']}
                />
                <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                  {chartFlowData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: ROI por Campaña Publicitaria */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Rendimiento Publicitario (ROI %)</h3>
              <p className="text-xs text-zinc-500">Efectividad por canal de marketing</p>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              Email Marketing Líder
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCampanasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'ROI']}
                />
                <Bar dataKey="ROI" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock & Pending Actions Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Stock Crítico - Reposición Urgente en Maracay</h3>
          </div>
          <button
            onClick={() => setActiveTab('inventario')}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            Gestionar Inventario &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio Venta</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Stock Mínimo</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {productosBajoStock.map((prod) => (
                <tr key={prod.ID_Producto} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 font-semibold text-zinc-100">{prod.Nombre_Producto}</td>
                  <td className="p-3 text-zinc-400">{prod.Categoría}</td>
                  <td className="p-3 font-mono font-medium text-emerald-400">${prod.Precio_Venta.toFixed(2)}</td>
                  <td className="p-3 font-mono font-bold text-red-400">{prod.Stock_Actual} uds</td>
                  <td className="p-3 font-mono text-zinc-500">{prod.Stock_Mínimo} uds</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      Riesgo Rotura
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
