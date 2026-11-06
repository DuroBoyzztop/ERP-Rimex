import React, { useState } from 'react';
import {
  Plus,
  Search,
  Package,
  Layers,
  Percent,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
} from 'lucide-react';
import { Producto } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvHelpers';

interface ProductsViewProps {
  productos: Producto[];
  onAddProducto: (producto: Producto) => void;
  onUpdateProducto: (producto: Producto) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  productos,
  onAddProducto,
  onUpdateProducto,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProd, setEditingProd] = useState<Producto | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Bollería');
  const [precioVenta, setPrecioVenta] = useState<number>(3.0);
  const [costeProduccion, setCosteProduccion] = useState<number>(1.0);
  const [stockActual, setStockActual] = useState<number>(50);
  const [stockMinimo, setStockMinimo] = useState<number>(20);

  const categories = ['Todas', ...Array.from(new Set(productos.map((p) => p.Categoría)))];

  const filteredProducts = productos.filter((p) => {
    const matchesSearch =
      p.Nombre_Producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Categoría.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || p.Categoría === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportCSV = () => {
    const csvStr = convertToCSV(
      productos.map((p) => ({
        ID_Producto: p.ID_Producto,
        Nombre_Producto: p.Nombre_Producto,
        Categoría: p.Categoría,
        Precio_Venta: p.Precio_Venta,
        Coste_Producción: p.Coste_Producción,
        Margen: `${p.Margen}%`,
        Stock_Actual: p.Stock_Actual,
        Stock_Mínimo: p.Stock_Mínimo,
      }))
    );
    downloadCSV('HOJA_2_PRODUCTOS_MASTER_CHEFS', csvStr);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const marginPercent = Math.round(
      ((precioVenta - costeProduccion) / (precioVenta || 1)) * 100
    );

    if (editingProd) {
      const updated: Producto = {
        ...editingProd,
        Nombre_Producto: nombre,
        Categoría: categoria,
        Precio_Venta: precioVenta,
        Coste_Producción: costeProduccion,
        Margen: marginPercent,
        Stock_Actual: stockActual,
        Stock_Mínimo: stockMinimo,
      };
      onUpdateProducto(updated);
      setEditingProd(null);
    } else {
      const newProd: Producto = {
        ID_Producto: `PROD-${String(productos.length + 1).padStart(3, '0')}`,
        Nombre_Producto: nombre,
        Categoría: categoria,
        Precio_Venta: precioVenta,
        Coste_Producción: costeProduccion,
        Margen: marginPercent,
        Stock_Actual: stockActual,
        Stock_Mínimo: stockMinimo,
      };
      onAddProducto(newProd);
      setShowAddModal(false);
    }

    resetForm();
  };

  const startEdit = (prod: Producto) => {
    setEditingProd(prod);
    setNombre(prod.Nombre_Producto);
    setCategoria(prod.Categoría);
    setPrecioVenta(prod.Precio_Venta);
    setCosteProduccion(prod.Coste_Producción);
    setStockActual(prod.Stock_Actual);
    setStockMinimo(prod.Stock_Mínimo);
  };

  const resetForm = () => {
    setNombre('');
    setPrecioVenta(3.0);
    setCosteProduccion(1.0);
    setStockActual(50);
    setStockMinimo(20);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Catálogo de Productos & Repostería</h2>
          <p className="text-xs text-zinc-400">
            Control de precios, margen bruto y existencias en tienda Master Chefs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar producto, categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
          <Layers className="w-4 h-4 text-zinc-500 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg shrink-0 transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Producto / ID</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5">Coste Prod.</th>
                <th className="p-3.5">Margen</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Estado Stock</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.map((prod) => {
                // Stock indicator logic
                let stockStatus = 'normal';
                if (prod.Stock_Actual <= prod.Stock_Mínimo) {
                  stockStatus = 'critical';
                } else if (prod.Stock_Actual <= prod.Stock_Mínimo * 1.5) {
                  stockStatus = 'warning';
                }

                return (
                  <tr key={prod.ID_Producto} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-zinc-100">{prod.Nombre_Producto}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{prod.ID_Producto}</div>
                    </td>
                    <td className="p-3.5 text-zinc-400">{prod.Categoría}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">${prod.Precio_Venta.toFixed(2)}</td>
                    <td className="p-3.5 font-mono font-medium text-zinc-300">${prod.Coste_Producción.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {prod.Margen}%
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-zinc-100">{prod.Stock_Actual} uds</td>
                    <td className="p-3.5">
                      {stockStatus === 'critical' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-max">
                          <AlertCircle className="w-3 h-3" /> Crítico (&le; {prod.Stock_Mínimo})
                        </span>
                      )}
                      {stockStatus === 'warning' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" /> Moderado
                        </span>
                      )}
                      {stockStatus === 'normal' && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Suficiente
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => startEdit(prod)}
                        className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                        title="Editar Producto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProd) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-100">
                {editingProd ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProd(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Croissant de Avellana"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Bollería">Bollería</option>
                  <option value="Tartas & Pasteles">Tartas & Pasteles</option>
                  <option value="Repostería">Repostería</option>
                  <option value="Especialidades">Especialidades</option>
                  <option value="Salados">Salados</option>
                  <option value="Tradicional">Tradicional</option>
                  <option value="Gourmet">Gourmet</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Coste Producción ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={costeProduccion}
                    onChange={(e) => setCosteProduccion(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    required
                    value={stockActual}
                    onChange={(e) => setStockActual(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProd(null);
                  }}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
