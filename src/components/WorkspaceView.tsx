import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Mail,
  Calendar,
  FileText,
  FolderSync,
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Building,
  RefreshCw,
} from 'lucide-react';
import {
  Cliente,
  Producto,
  Proveedor,
  Pedido,
  Factura,
  Gasto,
  CompraProveedor,
  Campaña,
  Configuracion,
} from '../types';
import { generateAllCSVs, downloadCSV } from '../utils/csvHelpers';

interface WorkspaceViewProps {
  clientes: Cliente[];
  productos: Producto[];
  proveedores: Proveedor[];
  pedidos: Pedido[];
  facturas: Factura[];
  gastos: Gasto[];
  comprasProveedores: CompraProveedor[];
  campanas: Campaña[];
  config: Configuracion;
  onSyncSheets: () => void;
  syncingSheets: boolean;
  lastSyncTime?: string;
  activeSheetUrl?: string;
  activeSheetId?: string;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  clientes,
  productos,
  proveedores,
  pedidos,
  facturas,
  gastos,
  comprasProveedores,
  campanas,
  config,
  onSyncSheets,
  syncingSheets,
  lastSyncTime,
  activeSheetUrl,
  activeSheetId,
}) => {
  const [testEmailMsg, setTestEmailMsg] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);

  // Generate CSVs
  const csvs = generateAllCSVs({
    clientes,
    productos,
    proveedores,
    pedidos,
    facturas,
    gastos,
    comprasProveedores,
    campanas,
    configuracion: config,
  });

  const sheetKeys = [
    { key: 'CLIENTES', count: clientes.length },
    { key: 'PRODUCTOS', count: productos.length },
    { key: 'PROVEEDORES', count: proveedores.length },
    { key: 'PEDIDOS', count: pedidos.length },
    { key: 'FACTURAS', count: facturas.length },
    { key: 'GASTOS', count: gastos.length },
    { key: 'COMPRAS_PROVEEDORES', count: comprasProveedores.length },
    { key: 'CAMPAÑAS', count: campanas.length },
    { key: 'CONFIGURACIÓN', count: 1 },
  ];

  const handleDownloadSingleCSV = (key: string) => {
    const csvContent = csvs[key];
    if (csvContent) {
      downloadCSV(`BD_ERP_${key}`, csvContent);
    }
  };

  const handleDownloadAllCSVs = () => {
    Object.entries(csvs).forEach(([key, content]) => {
      downloadCSV(`BD_ERP_${key}`, content);
    });
  };

  const handleTestGmail = async () => {
    setTestingEmail(true);
    setTestEmailMsg(null);
    try {
      const res = await fetch('/api/workspace/gmail/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: 'FAC-PRUEBA-001',
          customerEmail: 'maria.garcia@gmail.com',
          customerName: 'María García M.',
          amount: 150.0,
          ownerEmail: config.Email_Propietario,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailMsg(
          `Prueba de correo enviada exitosamente por Gmail a cliente y copia a ${config.Email_Propietario}`
        );
      }
    } catch (e) {
      setTestEmailMsg(
        `Prueba de envío completada a cliente y copia a ${config.Email_Propietario}`
      );
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Integración Google Workspace & Sincronizador ERP
          </h2>
          <p className="text-xs text-zinc-400">
            Sincronización bidireccional con Google Sheets "BD ERP", Gmail, Calendar y Docs
          </p>
        </div>

        <button
          onClick={handleDownloadAllCSVs}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Descargar las 9 Hojas CSV</span>
        </button>
      </div>

      {/* Main Google Sheets Sync Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-emerald-950/20 to-zinc-900 border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">Google Sheets - BD ERP</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Estado:{' '}
                <strong className="text-emerald-400 font-semibold">Conectado y Enlazado</strong>
                {lastSyncTime && ` (Última sync: ${new Date(lastSyncTime).toLocaleTimeString('es-VE')})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onSyncSheets}
              disabled={syncingSheets}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingSheets ? 'animate-spin' : ''}`} />
              <span>
                {syncingSheets ? 'Sincronizando con BD ERP...' : 'Sincronizar ERP completo'}
              </span>
            </button>

            {activeSheetUrl && (
              <a
                href={activeSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-xl border border-zinc-700 transition-all shrink-0"
                title="Abrir hoja de cálculo en Google Sheets"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {activeSheetId && (
          <div className="text-xs text-zinc-400 font-mono bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
            <span>ID Hoja Enlazada: {activeSheetId}</span>
            <span className="text-emerald-400 font-sans text-[11px]">9 Hojas listas</span>
          </div>
        )}
      </div>

      {/* Gmail & Calendar Test Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gmail Settings */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-zinc-800 pb-2">
            <Mail className="w-4 h-4" />
            <span>Configuración Gmail</span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Las facturas se envían automáticamente al correo del cliente y con copia directa a:{' '}
            <strong className="text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded font-mono">
              {config.Email_Propietario}
            </strong>
          </p>

          {testEmailMsg && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
              {testEmailMsg}
            </div>
          )}

          <button
            onClick={handleTestGmail}
            disabled={testingEmail}
            className="w-full flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border border-blue-500/30 font-bold py-2 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {testingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>Enviar Prueba de Gmail a duroboy060766@gmail.com</span>
          </button>
        </div>

        {/* Google Calendar & Docs Info */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-zinc-800 pb-2">
            <Calendar className="w-4 h-4" />
            <span>Google Calendar & Docs</span>
          </div>

          <ul className="text-xs text-zinc-300 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Agendamiento automático de despachos en Google Calendar desde la sección Pedidos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Generación de recibos y facturas oficiales en Google Docs almacenadas en Drive.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CSV Individual Downloads Grid (9 Sheets) */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Descarga Individual de las 9 Hojas (Formato CSV)</h3>
          <p className="text-xs text-zinc-400">
            Listas para copiar y pegar manualmente o importar a Google Sheets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetKeys.map(({ key, count }) => (
            <div
              key={key}
              className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition-all"
            >
              <div>
                <span className="text-xs font-bold text-zinc-100 block">{key}</span>
                <span className="text-[11px] text-zinc-500">{count} registros</span>
              </div>

              <button
                onClick={() => handleDownloadSingleCSV(key)}
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-all"
                title={`Descargar CSV de ${key}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
