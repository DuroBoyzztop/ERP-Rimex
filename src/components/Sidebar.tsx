import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Boxes,
  Truck,
  ClipboardList,
  Receipt,
  Brain,
  FolderSync,
  Building2,
  ChevronRight,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'clientes'
  | 'productos'
  | 'inventario'
  | 'proveedores'
  | 'pedidos'
  | 'facturacion'
  | 'ai-center'
  | 'workspace';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingOrdersCount: number;
  pendingInvoicesCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount,
  pendingInvoicesCount,
  lowStockCount,
}) => {
  const navItems: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'productos', label: 'Productos', icon: ShoppingBag },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: Boxes,
      badge: lowStockCount,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: ClipboardList,
      badge: pendingOrdersCount,
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'facturacion',
      label: 'Facturación',
      icon: Receipt,
      badge: pendingInvoicesCount,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'ai-center',
      label: 'Centro IA CEO',
      icon: Brain,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    { id: 'workspace', label: 'Google Workspace', icon: FolderSync },
  ];

  return (
    <aside className="w-full lg:w-56 bg-[#0c0c0e] border-r border-zinc-800 p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Navigation Section Label */}
        <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          Módulos ERP SaaS
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        item.badgeColor || 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Enterprise Info Box */}
      <div className="mt-8 p-4 border-t border-zinc-800 bg-zinc-900/20 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-zinc-200">Master Chefs</span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Conectado a Google Sheets BD ERP. Maracay, VZLA.
        </p>
      </div>
    </aside>
  );
};
