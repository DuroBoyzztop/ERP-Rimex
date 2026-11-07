import React from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Globe,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Configuracion } from '../types';

interface HeaderProps {
  config: Configuracion;
  onOpenAiCenter: () => void;
  onOpenReportModal: () => void;
  onSyncSheets: () => void;
  syncingSheets: boolean;
  lastSyncTime?: string;
  activeSheetUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenAiCenter,
  onOpenReportModal,
  onSyncSheets,
  syncingSheets,
  lastSyncTime,
  activeSheetUrl,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Location */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic text-white text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              MC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-zinc-100 tracking-tight">
                  Master Chefs
                </h1>
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded text-[10px] font-semibold uppercase tracking-wider">
                  Maracay, VZLA
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Dulce Capricho · Estado Aragua</span>
              </p>
            </div>
          </div>
        </div>

        {/* BCV Exchange Rate & Google Sheets Sync */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full sm:w-auto">
          {/* BCV Rate Pill */}
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-1.5 shadow-inner">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-xs">
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider block sm:inline mr-1">Tasa BCV:</span>
              <span className="font-mono font-bold text-emerald-400">
                1 $ = {config.Tasa_BCV.toLocaleString('es-VE')} Bs.
              </span>
            </div>
          </div>

          {/* Sync Sheets Button */}
          <button
            onClick={onSyncSheets}
            disabled={syncingSheets}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Sincronizar ERP completo con Google Sheets (BD ERP)"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${syncingSheets ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">
              {syncingSheets ? 'Sincronizando...' : 'Sincronizar BD ERP'}
            </span>
            <span className="md:hidden">Sync BD</span>
          </button>

          {/* Monthly PDF Report Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/70 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Generar y descargar reporte financiero mensual en PDF"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Reporte PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Sheet Link */}
          {activeSheetUrl && (
            <a
              href={activeSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-emerald-400 underline hidden xl:inline"
            >
              Ver BD ERP
            </a>
          )}

          {/* MAIN AI BUTTON */}
          <button
            onClick={onOpenAiCenter}
            className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200 active:scale-95 overflow-hidden"
          >
            <Brain className="w-4 h-4 text-white" />
            <span className="tracking-wide uppercase">ANALIZAR EMPRESA</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
