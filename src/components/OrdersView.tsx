import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  X,
  User,
  ShoppingBag,
} from 'lucide-react';
import { Pedido, Cliente, Producto } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvHelpers';

interface OrdersViewProps {
  pedidos: Pedido[];
  clientes: Cliente[];
  productos: Producto[];
  onAddPedido: (pedido: Pedido) => void;
  onUpdateEstadoPedido: (id: string, estado: 'Entregado' | 'Pendiente' | 'Cancelado') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  pedidos,
  clientes,
  productos,
  onAddPedido,
  onUpdateEstadoPedido,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Entregado' | 'Pendiente' | 'Cancelado'>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // Loading & notification states for Google Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    url?: string;
    type: 'success' | 'error';
  } | null>(null);

  // New Order Form state
  const [selectedClienteId, setSelectedClienteId] = useState(clientes[0]?.ID_Cliente || '');
  const [selectedProductoId, setSelectedProductoId] = useState(productos[0]?.ID_Producto || '');
  const [cantidad, setCantidad] = useState(5);
  const [notas, setNotas] = useState('');

  const filteredOrders = pedidos.filter((p) => {
    const matchesSearch =
      p.ID_Pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.Nombre_Cliente && p.Nombre_Cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.Nombre_Producto && p.Nombre_Producto.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Todos' || p.Estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvStr = convertToCSV(
      pedidos.map((pd) => ({
        ID_Pedido: pd.ID_Pedido,
        Fecha: pd.Fecha,
        ID_Cliente: pd.ID_Cliente,
        ID_Producto: pd.ID_Producto,
        Cantidad: pd.Cantidad,
        Importe_Total: pd.Importe_Total,
        Estado: pd.Estado,
      }))
    );
    downloadCSV('HOJA_4_PEDIDOS_MASTER_CHEFS', csvStr);
  };

  // Google Calendar Integration Trigger
  const handleScheduleCalendar = async (pedido: Pedido) => {
    setActionLoading(`cal-${pedido.ID_Pedido}`);
    setActionMessage(null);
    try {
      const res = await fetch('/api/workspace/calendar/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pedido.ID_Pedido,
          date: pedido.Fecha_Entrega_Estimada || pedido.Fecha,
          customerName: pedido.Nombre_Cliente || 'Cliente ERP',
          notes: pedido.Notas,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          text: `📅 Evento de entrega agendado en Google Calendar para ${pedido.ID_Pedido}!`,
          url: data.htmlLink,
          type: 'success',
        });
      }
    } catch (error) {
      console.error(error);
      setActionMessage({
        text: 'Error al agendar evento en Google Calendar.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Google Doc Receipt Generator Trigger
  const handleGenerateDocReceipt = async (pedido: Pedido) => {
    setActionLoading(`doc-${pedido.ID_Pedido}`);
    setActionMessage(null);
    try {
      const res = await fetch('/api/workspace/docs/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: pedido.ID_Pedido,
          customerName: pedido.Nombre_Cliente || 'Cliente VIP',
          items: `${pedido.Cantidad}x ${pedido.Nombre_Producto || 'Producto Master Chefs'}`,
          amount: pedido.Importe_Total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          text: `📄 Recibo Google Doc generado exitosamente para ${pedido.ID_Pedido}!`,
          url: data.htmlLink,
          type: 'success',
        });
      }
    } catch (error) {
      console.error(error);
      setActionMessage({
        text: 'Error al generar recibo en Google Docs.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const clienteObj = clientes.find((c) => c.ID_Cliente === selectedClienteId);
    const prodObj = productos.find((p) => p.ID_Producto === selectedProductoId);

    if (!clienteObj || !prodObj) return;

    const importeTotal = Number((prodObj.Precio_Venta * cantidad).toFixed(2));

    const newPedido: Pedido = {
      ID_Pedido: `PED-${1000 + pedidos.length + 1}`,
      Fecha: new Date().toISOString().split('T')[0],
      ID_Cliente: clienteObj.ID_Cliente,
      Nombre_Cliente: `${clienteObj.Nombre} ${clienteObj.Apellidos}`,
      ID_Producto: prodObj.ID_Producto,
      Nombre_Producto: prodObj.Nombre_Producto,
      Cantidad: cantidad,
      Importe_Total: importeTotal,
      Estado: 'Pendiente',
      Fecha_Entrega_Estimada: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      Notas: notas,
    };

    onAddPedido(newPedido);
    setShowAddModal(false);
    setNotas('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Gestión de Pedidos & Entregas</h2>
          <p className="text-xs text-zinc-400">
            Control de despachos, entregas agendadas y recibos digitales Google Workspace
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>

      {/* Action Status Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          {actionMessage.url && (
            <a
              href={actionMessage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-bold underline hover:text-white"
            >
              <span>Abrir en Google Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['Todos', 'Pendiente', 'Entregado', 'Cancelado'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                statusFilter === status
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {status === 'Todos' ? 'Todos los Pedidos' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar pedido, cliente, producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">ID / Fecha</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Producto & Cantidad</th>
                <th className="p-3.5">Importe Total</th>
                <th className="p-3.5">Estado Despacho</th>
                <th className="p-3.5 text-center">Acciones Google Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((pedido) => (
                <tr key={pedido.ID_Pedido} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-zinc-100 font-mono">{pedido.ID_Pedido}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{pedido.Fecha}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-zinc-200">
                      {pedido.Nombre_Cliente || pedido.ID_Cliente}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-blue-300 font-medium">
                      {pedido.Cantidad}x {pedido.Nombre_Producto || pedido.ID_Producto}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ${pedido.Importe_Total.toFixed(2)} USD
                  </td>
                  <td className="p-3.5">
                    <select
                      value={pedido.Estado}
                      onChange={(e: any) =>
                        onUpdateEstadoPedido(pedido.ID_Pedido, e.target.value)
                      }
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border focus:outline-none ${
                        pedido.Estado === 'Entregado'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : pedido.Estado === 'Pendiente'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                          : 'bg-red-500/10 text-red-300 border-red-500/20'
                      }`}
                    >
                      <option value="Pendiente" className="bg-zinc-900 text-zinc-100">Pendiente</option>
                      <option value="Entregado" className="bg-zinc-900 text-zinc-100">Entregado</option>
                      <option value="Cancelado" className="bg-zinc-900 text-zinc-100">Cancelado</option>
                    </select>
                  </td>

                  {/* GOOGLE WORKSPACE ACTIONS */}
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      {/* 1. Google Calendar Button */}
                      <button
                        onClick={() => handleScheduleCalendar(pedido)}
                        disabled={actionLoading === `cal-${pedido.ID_Pedido}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[11px] font-medium transition-all active:scale-95 disabled:opacity-50"
                        title="Agendar entrega en Google Calendar"
                      >
                        {actionLoading === `cal-${pedido.ID_Pedido}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CalendarIcon className="w-3.5 h-3.5" />
                        )}
                        <span>Calendar</span>
                      </button>

                      {/* 2. Google Doc Receipt Button */}
                      <button
                        onClick={() => handleGenerateDocReceipt(pedido)}
                        disabled={actionLoading === `doc-${pedido.ID_Pedido}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-lg text-[11px] font-medium transition-all active:scale-95 disabled:opacity-50"
                        title="Generar recibo en Google Doc"
                      >
                        {actionLoading === `doc-${pedido.ID_Pedido}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span>Recibo Doc</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-100">Crear Nuevo Pedido</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Cliente *</label>
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {clientes.map((c) => (
                    <option key={c.ID_Cliente} value={c.ID_Cliente}>
                      {c.Nombre} {c.Apellidos} ({c.Ciudad}) {c.Cliente_VIP === 'Sí' ? '⭐ VIP' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Producto *</label>
                <select
                  value={selectedProductoId}
                  onChange={(e) => setSelectedProductoId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {productos.map((p) => (
                    <option key={p.ID_Producto} value={p.ID_Producto}>
                      {p.Nombre_Producto} - ${p.Precio_Venta.toFixed(2)} USD (Stock: {p.Stock_Actual})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Notas de Despacho</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones para entrega en Maracay..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
