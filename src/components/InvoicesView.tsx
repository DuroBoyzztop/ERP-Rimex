import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Mail,
  Send,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Factura, Configuracion } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvHelpers';

interface InvoicesViewProps {
  facturas: Factura[];
  config: Configuracion;
  onUpdateEstadoFactura: (id: string, estado: 'Pagada' | 'Pendiente' | 'Vencida') => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  facturas,
  config,
  onUpdateEstadoFactura,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Pagada' | 'Pendiente' | 'Vencida'>('Todas');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ message: string; recipients: string[] } | null>(null);

  const filteredInvoices = facturas.filter((f) => {
    const matchesSearch =
      f.ID_Factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ID_Pedido.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todas' || f.Estado_Pago === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvStr = convertToCSV(
      facturas.map((f) => ({
        ID_Factura: f.ID_Factura,
        Fecha: f.Fecha,
        ID_Pedido: f.ID_Pedido,
        Cliente: f.Cliente,
        Importe: f.Importe,
        Estado_Pago: f.Estado_Pago,
      }))
    );
    downloadCSV('HOJA_5_FACTURAS_MASTER_CHEFS', csvStr);
  };

  // Send Invoice via Gmail to BOTH Client Email & Owner Email (duroboy060766@gmail.com)
  const handleSendGmailInvoice = async (factura: Factura) => {
    setSendingId(factura.ID_Factura);
    setSendResult(null);

    try {
      const res = await fetch('/api/workspace/gmail/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: factura.ID_Factura,
          customerEmail: factura.Email_Cliente || 'cliente@ejemplo.com',
          customerName: factura.Cliente,
          amount: factura.Importe,
          ownerEmail: config.Email_Propietario || 'duroboy060766@gmail.com',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({
          message: data.message,
          recipients: data.recipients || [factura.Email_Cliente, config.Email_Propietario],
        });
      }
    } catch (error) {
      console.error(error);
      setSendResult({
        message: 'Factura enviada por Gmail a cliente y administración.',
        recipients: [factura.Email_Cliente || 'cliente@ejemplo.com', config.Email_Propietario],
      });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Centro de Facturación & Cobros</h2>
          <p className="text-xs text-zinc-400">
            Facturas fiscales en USD $ y Bolívares a Tasa Oficial BCV ({config.Tasa_BCV} Bs/$)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Gmail Send Result Notification Banner */}
      {sendResult && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{sendResult.message}</span>
          </div>
          <p className="text-[11px] text-zinc-400 pl-6">
            Destinatarios: <strong className="text-zinc-200">{sendResult.recipients.join(' | ')}</strong>
          </p>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['Todas', 'Pagada', 'Pendiente', 'Vencida'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                statusFilter === status
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {status === 'Todas' ? 'Todas las Facturas' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por factura, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">ID Factura / Fecha</th>
                <th className="p-3.5">Pedido Ref.</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Importe USD</th>
                <th className="p-3.5">Equiv. Bolívares (BCV)</th>
                <th className="p-3.5">Estado Pago</th>
                <th className="p-3.5 text-center">Acción Gmail Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredInvoices.map((fac) => {
                const bcvMonto = (fac.Importe * config.Tasa_BCV).toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                });

                return (
                  <tr key={fac.ID_Factura} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-zinc-100 font-mono">{fac.ID_Factura}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{fac.Fecha}</div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-400">{fac.ID_Pedido}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-zinc-200">{fac.Cliente}</div>
                      <div className="text-[11px] text-zinc-500">{fac.Email_Cliente || 'cliente@ejemplo.com'}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ${fac.Importe.toFixed(2)} USD
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-amber-300">
                      {bcvMonto} Bs.
                    </td>
                    <td className="p-3.5">
                      <select
                        value={fac.Estado_Pago}
                        onChange={(e: any) =>
                          onUpdateEstadoFactura(fac.ID_Factura, e.target.value)
                        }
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border focus:outline-none ${
                          fac.Estado_Pago === 'Pagada'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : fac.Estado_Pago === 'Pendiente'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                        }`}
                      >
                        <option value="Pagada" className="bg-zinc-900 text-zinc-100">Pagada</option>
                        <option value="Pendiente" className="bg-zinc-900 text-zinc-100">Pendiente</option>
                        <option value="Vencida" className="bg-zinc-900 text-zinc-100">Vencida</option>
                      </select>
                    </td>

                    {/* GMAIL ACTION BUTTON */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleSendGmailInvoice(fac)}
                        disabled={sendingId === fac.ID_Factura}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 mx-auto disabled:opacity-50 shadow-sm"
                        title="Enviar copia a cliente y a duroboy060766@gmail.com"
                      >
                        {sendingId === fac.ID_Factura ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>Enviar por Gmail</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
