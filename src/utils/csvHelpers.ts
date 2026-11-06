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

export function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        const stringVal = String(value).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateAllCSVs(state: {
  clientes: Cliente[];
  productos: Producto[];
  proveedores: Proveedor[];
  pedidos: Pedido[];
  facturas: Factura[];
  gastos: Gasto[];
  comprasProveedores: CompraProveedor[];
  campanas: Campaña[];
  configuracion: Configuracion;
}): Record<string, string> {
  const {
    clientes,
    productos,
    proveedores,
    pedidos,
    facturas,
    gastos,
    comprasProveedores,
    campanas,
    configuracion,
  } = state;

  return {
    CLIENTES: convertToCSV(
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
    ),
    PRODUCTOS: convertToCSV(
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
    ),
    PROVEEDORES: convertToCSV(
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
    ),
    PEDIDOS: convertToCSV(
      pedidos.map((pd) => ({
        ID_Pedido: pd.ID_Pedido,
        Fecha: pd.Fecha,
        ID_Cliente: pd.ID_Cliente,
        ID_Producto: pd.ID_Producto,
        Cantidad: pd.Cantidad,
        Importe_Total: pd.Importe_Total,
        Estado: pd.Estado,
      }))
    ),
    FACTURAS: convertToCSV(
      facturas.map((f) => ({
        ID_Factura: f.ID_Factura,
        Fecha: f.Fecha,
        ID_Pedido: f.ID_Pedido,
        Cliente: f.Cliente,
        Importe: f.Importe,
        Estado_Pago: f.Estado_Pago,
      }))
    ),
    GASTOS: convertToCSV(
      gastos.map((g) => ({
        ID_Gasto: g.ID_Gasto,
        Fecha: g.Fecha,
        Categoría: g.Categoría,
        Descripción: g.Descripción,
        Importe: g.Importe,
      }))
    ),
    COMPRAS_PROVEEDORES: convertToCSV(
      comprasProveedores.map((cp) => ({
        ID_Compra: cp.ID_Compra,
        Fecha: cp.Fecha,
        ID_Proveedor: cp.ID_Proveedor,
        Concepto: cp.Concepto,
        Importe: cp.Importe,
      }))
    ),
    CAMPAÑAS: convertToCSV(
      campanas.map((cmp) => ({
        ID_Campaña: cmp.ID_Campaña,
        Canal: cmp.Canal,
        Fecha_Inicio: cmp.Fecha_Inicio,
        Fecha_Fin: cmp.Fecha_Fin,
        Inversión: cmp.Inversión,
        Ventas_Generadas: cmp.Ventas_Generadas,
        ROI: `${cmp.ROI}%`,
      }))
    ),
    CONFIGURACIÓN: convertToCSV([
      {
        'Impuesto % IVA': `${configuracion.Impuesto_IVA}%`,
        'Tasa Cambiaria BCV [$] a [Bs]': configuracion.Tasa_BCV,
        'Empresa': configuracion.Nombre_Empresa,
        'Ubicación': configuracion.Ubicacion,
      },
    ]),
  };
}
