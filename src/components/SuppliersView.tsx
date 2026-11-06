import React, { useState } from 'react';
import {
  Truck,
  Search,
  Mail,
  Phone,
  MapPin,
  Star,
  Plus,
  Download,
  X,
} from 'lucide-react';
import { Proveedor } from '../types';
import { convertToCSV, downloadCSV } from '../utils/csvHelpers';

interface SuppliersViewProps {
  proveedores: Proveedor[];
  onAddProveedor: (proveedor: Proveedor) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  proveedores,
  onAddProveedor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [empresa, setEmpresa] = useState('');
  const [productoPrincipal, setProductoPrincipal] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('Maracay');
  const [costeMedio, setCosteMedio] = useState<number>(400);

  const filteredSuppliers = proveedores.filter(
    (p) =>
      p.Empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Producto_Principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csvStr = convertToCSV(
      proveedores.map((pr) => ({
        ID_Proveedor: pr.ID_Proveedor,
        Empresa: pr.Empresa,
        Producto_Principal: pr.Producto_Principal,
        Contacto: pr.Contacto,
        Email: pr.Email,
        Teléfono: pr.Teléfono,
        Ciudad: pr.Ciudad,
        Coste_Medio: pr.Coste_Medio,
        Último_Pedido: pr.Último_Pedido,
      }))
    );
    downloadCSV('HOJA_3_PROVEEDORES_MASTER_CHEFS', csvStr);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !email) return;

    const newSupplier: Proveedor = {
      ID_Proveedor: `PROV-${String(proveedores.length + 1).padStart(3, '0')}`,
      Empresa: empresa,
      Producto_Principal: productoPrincipal || 'Insumos Generales de Pastelería',
      Contacto: contacto || 'Representante de Ventas',
      Email: email,
      Teléfono: telefono || '+58 243-5550000',
      Ciudad: ciudad,
      Coste_Medio: costeMedio,
      Último_Pedido: new Date().toISOString().split('T')[0],
      Valoracion: 4.5,
    };

    onAddProveedor(newSupplier);
    setShowAddModal(false);
    setEmpresa('');
    setEmail('');
    setProductoPrincipal('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Directorio de Proveedores & Insumos</h2>
          <p className="text-xs text-zinc-400">
            Proveedores clave de harinas, manteca, cacao y empaques en Venezuela
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
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar empresa, insumo, ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Empresa / ID</th>
                <th className="p-3.5">Producto Principal</th>
                <th className="p-3.5">Contacto</th>
                <th className="p-3.5">Ciudad</th>
                <th className="p-3.5">Coste Medio</th>
                <th className="p-3.5">Último Pedido</th>
                <th className="p-3.5">Valoración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredSuppliers.map((prov) => (
                <tr key={prov.ID_Proveedor} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-zinc-100">{prov.Empresa}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{prov.ID_Proveedor}</div>
                  </td>
                  <td className="p-3.5 text-blue-300 font-medium">{prov.Producto_Principal}</td>
                  <td className="p-3.5">
                    <div className="text-zinc-200 font-medium">{prov.Contacto}</div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span>{prov.Email}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {prov.Ciudad}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ${prov.Coste_Medio.toFixed(2)} USD
                  </td>
                  <td className="p-3.5 font-mono text-zinc-400">{prov.Último_Pedido}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{prov.Valoracion || 4.5}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Supplier */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-zinc-100">Registrar Proveedor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Nombre Empresa *</label>
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej: Molinos Maracay C.A."
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Producto Principal</label>
                <input
                  type="text"
                  value={productoPrincipal}
                  onChange={(e) => setProductoPrincipal(e.target.value)}
                  placeholder="Ej: Harina de Trigo Especial"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Contacto</label>
                  <input
                    type="text"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="Nombre representante"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Coste Medio ($)</label>
                  <input
                    type="number"
                    value={costeMedio}
                    onChange={(e) => setCosteMedio(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
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
