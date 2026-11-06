import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { SuppliersView } from './components/SuppliersView';
import { OrdersView } from './components/OrdersView';
import { InvoicesView } from './components/InvoicesView';
import { WorkspaceView } from './components/WorkspaceView';
import { AiCenterModal } from './components/AiCenterModal';
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
} from './types';
import {
  INITIAL_CONFIG,
  INITIAL_CLIENTES,
  INITIAL_PRODUCTOS,
  INITIAL_PROVEEDORES,
  INITIAL_PEDIDOS,
  INITIAL_FACTURAS,
  INITIAL_GASTOS,
  INITIAL_COMPRAS_PROVEEDORES,
  INITIAL_CAMPANAS,
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAiCenterOpen, setIsAiCenterOpen] = useState(false);

  // ERP State
  const [config, setConfig] = useState<Configuracion>(INITIAL_CONFIG);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTOS);
  const [proveedores, setProveedores] = useState<Proveedor[]>(INITIAL_PROVEEDORES);
  const [pedidos, setPedidos] = useState<Pedido[]>(INITIAL_PEDIDOS);
  const [facturas, setFacturas] = useState<Factura[]>(INITIAL_FACTURAS);
  const [gastos, setGastos] = useState<Gasto[]>(INITIAL_GASTOS);
  const [comprasProveedores, setComprasProveedores] = useState<CompraProveedor[]>(INITIAL_COMPRAS_PROVEEDORES);
  const [campanas, setCampanas] = useState<Campaña[]>(INITIAL_CAMPANAS);

  // Workspace Sync State
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  const [activeSheetUrl, setActiveSheetUrl] = useState<string | undefined>();
  const [activeSheetId, setActiveSheetId] = useState<string | undefined>();

  // Sync state from server on startup
  useEffect(() => {
    fetch('/api/erp/state')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          const d = resData.data;
          if (d.clientes) setClientes(d.clientes);
          if (d.productos) setProductos(d.productos);
          if (d.proveedores) setProveedores(d.proveedores);
          if (d.pedidos) setPedidos(d.pedidos);
          if (d.facturas) setFacturas(d.facturas);
          if (d.gastos) setGastos(d.gastos);
          if (d.comprasProveedores) setComprasProveedores(d.comprasProveedores);
          if (d.campanas) setCampanas(d.campanas);
          if (d.activeSheetUrl) setActiveSheetUrl(d.activeSheetUrl);
          if (d.activeSheetId) setActiveSheetId(d.activeSheetId);
          if (d.lastSyncTime) setLastSyncTime(d.lastSyncTime);
        }
      })
      .catch((err) => console.log('Using local client state initializers.', err));
  }, []);

  // Google Sheets Full ERP Sync
  const handleSyncSheets = async () => {
    setSyncingSheets(true);
    try {
      const res = await fetch('/api/workspace/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetIdCustom: activeSheetId }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSyncTime(data.lastSync);
        if (data.sheetUrl) setActiveSheetUrl(data.sheetUrl);
        if (data.sheetId) setActiveSheetId(data.sheetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingSheets(false);
    }
  };

  // State Handlers
  const handleAddCliente = (cliente: Cliente) => {
    setClientes((prev) => [cliente, ...prev]);
    fetch('/api/erp/cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    }).catch(console.error);
  };

  const handleAddProducto = (producto: Producto) => {
    setProductos((prev) => [producto, ...prev]);
    fetch('/api/erp/producto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto),
    }).catch(console.error);
  };

  const handleUpdateProducto = (updated: Producto) => {
    setProductos((prev) =>
      prev.map((p) => (p.ID_Producto === updated.ID_Producto ? updated : p))
    );
    fetch(`/api/erp/producto/${updated.ID_Producto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(console.error);
  };

  const handleAddProveedor = (prov: Proveedor) => {
    setProveedores((prev) => [prov, ...prev]);
  };

  const handleAddPedido = (pedido: Pedido) => {
    setPedidos((prev) => [pedido, ...prev]);

    // Auto-create matching invoice
    const totalConIva = Number(
      (pedido.Importe_Total * (1 + config.Impuesto_IVA / 100)).toFixed(2)
    );
    const newFactura: Factura = {
      ID_Factura: `FAC-2026-${String(facturas.length + 1).padStart(3, '0')}`,
      Fecha: pedido.Fecha,
      ID_Pedido: pedido.ID_Pedido,
      Cliente: pedido.Nombre_Cliente || 'Cliente ERP',
      Email_Cliente: 'cliente@ejemplo.com',
      Importe: totalConIva,
      Estado_Pago: 'Pendiente',
      Fecha_Vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    };

    setFacturas((prev) => [newFactura, ...prev]);

    fetch('/api/erp/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    }).catch(console.error);
  };

  const handleUpdateEstadoPedido = (
    id: string,
    estado: 'Entregado' | 'Pendiente' | 'Cancelado'
  ) => {
    setPedidos((prev) =>
      prev.map((p) => (p.ID_Pedido === id ? { ...p, Estado: estado } : p))
    );
    fetch(`/api/erp/pedido/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Estado: estado }),
    }).catch(console.error);
  };

  const handleUpdateEstadoFactura = (
    id: string,
    estado: 'Pagada' | 'Pendiente' | 'Vencida'
  ) => {
    setFacturas((prev) =>
      prev.map((f) => (f.ID_Factura === id ? { ...f, Estado_Pago: estado } : f))
    );
    fetch(`/api/erp/factura/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Estado_Pago: estado }),
    }).catch(console.error);
  };

  // Helper counters for badges
  const pendingOrdersCount = pedidos.filter((p) => p.Estado === 'Pendiente').length;
  const pendingInvoicesCount = facturas.filter((f) => f.Estado_Pago === 'Pendiente').length;
  const lowStockCount = productos.filter((p) => p.Stock_Actual <= p.Stock_Mínimo).length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        config={config}
        onOpenAiCenter={() => setIsAiCenterOpen(true)}
        onSyncSheets={handleSyncSheets}
        syncingSheets={syncingSheets}
        lastSyncTime={lastSyncTime}
        activeSheetUrl={activeSheetUrl}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab === 'ai-center' ? 'dashboard' : activeTab}
          setActiveTab={(tab) => {
            if (tab === 'ai-center') {
              setIsAiCenterOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          pendingOrdersCount={pendingOrdersCount}
          pendingInvoicesCount={pendingInvoicesCount}
          lowStockCount={lowStockCount}
        />

        {/* View Container */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              clientes={clientes}
              productos={productos}
              pedidos={pedidos}
              facturas={facturas}
              gastos={gastos}
              campanas={campanas}
              config={config}
              onOpenAiCenter={() => setIsAiCenterOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsView
              clientes={clientes}
              pedidos={pedidos}
              onAddCliente={handleAddCliente}
            />
          )}

          {activeTab === 'productos' && (
            <ProductsView
              productos={productos}
              onAddProducto={handleAddProducto}
              onUpdateProducto={handleUpdateProducto}
            />
          )}

          {activeTab === 'inventario' && (
            <InventoryView
              productos={productos}
              config={config}
              onUpdateProducto={handleUpdateProducto}
            />
          )}

          {activeTab === 'proveedores' && (
            <SuppliersView
              proveedores={proveedores}
              onAddProveedor={handleAddProveedor}
            />
          )}

          {activeTab === 'pedidos' && (
            <OrdersView
              pedidos={pedidos}
              clientes={clientes}
              productos={productos}
              onAddPedido={handleAddPedido}
              onUpdateEstadoPedido={handleUpdateEstadoPedido}
            />
          )}

          {activeTab === 'facturacion' && (
            <InvoicesView
              facturas={facturas}
              config={config}
              onUpdateEstadoFactura={handleUpdateEstadoFactura}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              clientes={clientes}
              productos={productos}
              proveedores={proveedores}
              pedidos={pedidos}
              facturas={facturas}
              gastos={gastos}
              comprasProveedores={comprasProveedores}
              campanas={campanas}
              config={config}
              onSyncSheets={handleSyncSheets}
              syncingSheets={syncingSheets}
              lastSyncTime={lastSyncTime}
              activeSheetUrl={activeSheetUrl}
              activeSheetId={activeSheetId}
            />
          )}
        </main>
      </div>

      {/* Primary CEO AI Modal */}
      <AiCenterModal
        isOpen={isAiCenterOpen}
        onClose={() => setIsAiCenterOpen(false)}
      />
    </div>
  );
}
