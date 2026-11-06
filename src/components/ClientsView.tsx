import React, { useState } from 'react';
import {
  Search,
  Filter,
  Crown,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  Download,
  ShoppingBag,
} from 'lucide-react';
import { Cliente, Pedido } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvHelpers';

interface ClientsViewProps {
  clientes: Cliente[];
  pedidos: Pedido[];
  onAddCliente: (cliente: Cliente) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clientes,
  pedidos,
  onAddCliente,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vipFilter, setVipFilter] = useState<'Todos' | 'VIP' | 'Normal'>('Todos');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [newNombre, setNewNombre] = useState('');
  const [newApellidos, setNewApellidos] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newCiudad, setNewCiudad] = useState('Maracay');
  const [newVip, setNewVip] = useState<'Sí' | 'No'>('No');

  // Filter logic
  const filteredClientes = clientes.filter((c) => {
    const matchesSearch =
      c.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.Apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.Ciudad.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVip =
      vipFilter === 'Todos' ||
      (vipFilter === 'VIP' && c.Cliente_VIP === 'Sí') ||
      (vipFilter === 'Normal' && c.Cliente_VIP === 'No');

    return matchesSearch && matchesVip;
  });

  const handleExportCSV = () => {
    const csvStr = convertToCSV(
      clientes.map((c) => ({
        ID_Cliente: c.ID_Cliente,
        Nombre: c.Nombre,
        Apellidos: c.Apellidos,
        Email: c.Email,
        Teléfono: c.Teléfono,
        Fecha_Alta: c.Fecha_Alta,
        Ciudad: c.Ciudad,
        Cliente_VIP: c.Cliente_VIP,
        Última_Compra: c.Última_Compra,
        Total_Gastado: c.Total_Gastado,
      }))
    );
    downloadCSV('HOJA_1_CLIENTES_MASTER_CHEFS', csvStr);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre || !newEmail) return;

    const newCliente: Cliente = {
      ID_Cliente: `CLI-${String(clientes.length + 1).padStart(3, '0')}`,
      Nombre: newNombre,
      Apellidos: newApellidos,
      Email: newEmail,
      Teléfono: newTelefono || '+58 412-0000000',
      Fecha_Alta: new Date().toISOString().split('T')[0],
      Ciudad: newCiudad,
      Cliente_VIP: newVip,
      Última_Compra: new Date().toISOString().split('T')[0],
      Total_Gastado: 0,
    };

    onAddCliente(newCliente);
    setShowAddModal(false);
    setNewNombre('');
    setNewApellidos('');
    setNewEmail('');
    setNewTelefono('');
  };

  // Customer specific order history
  const clientePedidos = selectedCliente
    ? pedidos.filter((p) => p.ID_Cliente === selectedCliente.ID_Cliente)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Directorio de Clientes</h2>
          <p className="text-xs text-zinc-400">
            Gestión de cartera de clientes en Maracay, Valencia y Caracas
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
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={vipFilter}
            onChange={(e: any) => setVipFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
          >
            <option value="Todos">Todos los Clientes</option>
            <option value="VIP">Solo Clientes VIP</option>
            <option value="Normal">Clientes Estándar</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">ID / Cliente</th>
                <th className="p-3.5">Contacto</th>
                <th className="p-3.5">Ciudad</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Última Compra</th>
                <th className="p-3.5 text-right">Total Gastado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredClientes.map((cliente) => (
                <tr key={cliente.ID_Cliente} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-zinc-100">
                      {cliente.Nombre} {cliente.Apellidos}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">{cliente.ID_Cliente}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-zinc-300">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span>{cliente.Email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500 text-[11px] mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{cliente.Teléfono}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {cliente.Ciudad}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {cliente.Cliente_VIP === 'Sí' ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-max">
                        <Crown className="w-3 h-3" /> VIP
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800 text-zinc-400">
                        Estándar
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-zinc-400 font-mono">{cliente.Última_Compra}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                    ${cliente.Total_Gastado.toFixed(2)} USD
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedCliente(cliente)}
                      className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition-all"
                    >
                      Ficha Cliente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-md bg-[#09090b] border-l border-zinc-800 p-6 h-full overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-100">Ficha de Cliente</h3>
                  {selectedCliente.Cliente_VIP === 'Sí' && (
                    <Crown className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <button
                  onClick={() => setSelectedCliente(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info Overview */}
              <div className="mt-5 space-y-4">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
                  <h4 className="text-base font-bold text-zinc-100">
                    {selectedCliente.Nombre} {selectedCliente.Apellidos}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    ID: {selectedCliente.ID_Cliente}
                  </p>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Email:</span>
                      <span className="font-medium text-blue-400">{selectedCliente.Email}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Teléfono:</span>
                      <span>{selectedCliente.Teléfono}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Ciudad:</span>
                      <span>{selectedCliente.Ciudad}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Fecha de Alta:</span>
                      <span>{selectedCliente.Fecha_Alta}</span>
                    </div>
                  </div>
                </div>

                {/* Financial KPI */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl">
                    <span className="text-[11px] text-zinc-500">Total Gastado</span>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                      ${selectedCliente.Total_Gastado.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-xl">
                    <span className="text-[11px] text-zinc-500">Última Compra</span>
                    <div className="text-xs font-bold text-zinc-200 mt-2 font-mono">
                      {selectedCliente.Última_Compra}
                    </div>
                  </div>
                </div>

                {/* History of Orders */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    Historial de Pedidos ({clientePedidos.length})
                  </h4>

                  {clientePedidos.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No hay pedidos recientes registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {clientePedidos.map((ped) => (
                        <div
                          key={ped.ID_Pedido}
                          className="bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-zinc-100">{ped.ID_Pedido}</span>
                            <p className="text-zinc-400 text-[11px]">{ped.Nombre_Producto}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400">${ped.Importe_Total.toFixed(2)}</span>
                            <p className="text-[10px] text-zinc-500">{ped.Estado}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCliente(null)}
              className="w-full mt-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2.5 rounded-xl text-xs transition-all"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-100">Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Apellidos</label>
                <input
                  type="text"
                  value={newApellidos}
                  onChange={(e) => setNewApellidos(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="+58 412..."
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Ciudad</label>
                  <select
                    value={newCiudad}
                    onChange={(e) => setNewCiudad(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Maracay">Maracay</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Turmero">Turmero</option>
                    <option value="Cagua">Cagua</option>
                    <option value="Caracas">Caracas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Estatus VIP</label>
                <select
                  value={newVip}
                  onChange={(e: any) => setNewVip(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="No">No - Estándar</option>
                  <option value="Sí">Sí - Cliente VIP</option>
                </select>
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
