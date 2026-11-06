import React from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  RefreshCw,
  ShoppingBag,
  Download,
} from 'lucide-react';
import { Producto, Configuracion } from '../types';

interface InventoryViewProps {
  productos: Producto[];
  config: Configuracion;
  onUpdateProducto: (producto: Producto) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  productos,
  config,
  onUpdateProducto,
}) => {
  const stockCritico = productos.filter((p) => p.Stock_Actual <= p.Stock_Mínimo);
  const stockNormal = productos.filter((p) => p.Stock_Actual > p.Stock_Mínimo);

  const valorTotalUSD = productos.reduce(
    (sum, p) => sum + p.Stock_Actual * p.Coste_Producción,
    0
  );
  const valorTotalBS = valorTotalUSD * config.Tasa_BCV;

  const handleQuickReorder = (p: Producto) => {
    const reordered: Producto = {
      ...p,
      Stock_Actual: p.Stock_Actual + 30, // Reponer 30 unidades
    };
    onUpdateProducto(reordered);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Gestión Logística e Inventario</h2>
          <p className="text-xs text-zinc-400">
            Control de rotación de insumos, stock de seguridad y valoración en Maracay
          </p>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Valor Total Inventario ($)</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-mono font-bold text-zinc-100">${valorTotalUSD.toFixed(2)} USD</div>
            <div className="text-[11px] text-emerald-400 font-mono font-medium mt-0.5">
              {valorTotalBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs. (BCV)
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Alertas de Rotura</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-red-400">{stockCritico.length} Ítems Críticos</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Por debajo del stock mínimo</div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Ítems con Stock Ok</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-emerald-400">{stockNormal.length} Ítems</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Abastecimiento adecuado</div>
          </div>
        </div>
      </div>

      {/* Critical Stock Reposition Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-zinc-100">Productos con Necesidad de Reposición Urgente</h3>
          </div>
        </div>

        {stockCritico.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            ¡Excelente! Todo el catálogo cuenta con niveles de stock por encima del mínimo de seguridad.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Stock Actual</th>
                  <th className="p-3.5">Mínimo Requerido</th>
                  <th className="p-3.5">Faltante Est.</th>
                  <th className="p-3.5 text-center">Acción Logística</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stockCritico.map((prod) => {
                  const faltante = Math.max(1, prod.Stock_Mínimo - prod.Stock_Actual + 20);
                  return (
                    <tr key={prod.ID_Producto} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-zinc-100">{prod.Nombre_Producto}</td>
                      <td className="p-3.5 text-zinc-400">{prod.Categoría}</td>
                      <td className="p-3.5 font-bold text-red-400 font-mono">{prod.Stock_Actual} uds</td>
                      <td className="p-3.5 text-zinc-400 font-mono">{prod.Stock_Mínimo} uds</td>
                      <td className="p-3.5 text-amber-300 font-bold font-mono">+{faltante} uds</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleQuickReorder(prod)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 mx-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reponer +30 Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Logistics Inventory Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-100 mb-4">Inventario Completo de Productos</h3>

        <div className="overflow-x-auto border border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Valoración ($)</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Stock Mínimo</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {productos.map((p) => (
                <tr key={p.ID_Producto} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 font-semibold text-zinc-100">{p.Nombre_Producto}</td>
                  <td className="p-3 text-zinc-400">{p.Categoría}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    ${(p.Stock_Actual * p.Coste_Producción).toFixed(2)}
                  </td>
                  <td className="p-3 font-bold text-zinc-100 font-mono">{p.Stock_Actual} uds</td>
                  <td className="p-3 text-zinc-400 font-mono">{p.Stock_Mínimo} uds</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleQuickReorder(p)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-lg text-[11px] font-medium transition-all"
                    >
                      Sumar Insumos
                    </button>
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
