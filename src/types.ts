export interface Cliente {
  ID_Cliente: string;
  Nombre: string;
  Apellidos: string;
  Email: string;
  Teléfono: string;
  Fecha_Alta: string;
  Ciudad: string;
  Cliente_VIP: 'Sí' | 'No';
  Última_Compra: string;
  Total_Gastado: number;
}

export interface Producto {
  ID_Producto: string;
  Nombre_Producto: string;
  Categoría: string;
  Precio_Venta: number;
  Coste_Producción: number;
  Margen: number; // Percentage, e.g., 45%
  Stock_Actual: number;
  Stock_Mínimo: number;
}

export interface Proveedor {
  ID_Proveedor: string;
  Empresa: string;
  Producto_Principal: string;
  Contacto: string;
  Email: string;
  Teléfono: string;
  Ciudad: string;
  Coste_Medio: number;
  Último_Pedido: string;
  Valoracion?: number; // 1 to 5 stars
}

export interface Pedido {
  ID_Pedido: string;
  Fecha: string;
  ID_Cliente: string;
  Nombre_Cliente?: string;
  ID_Producto: string;
  Nombre_Producto?: string;
  Cantidad: number;
  Importe_Total: number;
  Estado: 'Entregado' | 'Pendiente' | 'Cancelado';
  Fecha_Entrega_Estimada?: string;
  Notas?: string;
  Calendar_Synced?: boolean;
  Calendar_Event_Id?: string;
  Calendar_Html_Link?: string;
  Calendar_Sync_Time?: string;
}

export interface Factura {
  ID_Factura: string;
  Fecha: string;
  ID_Pedido: string;
  Cliente: string;
  Email_Cliente?: string;
  Importe: number;
  Estado_Pago: 'Pagada' | 'Pendiente' | 'Vencida';
  Fecha_Vencimiento?: string;
}

export interface Gasto {
  ID_Gasto: string;
  Fecha: string;
  Categoría: 'Alquiler' | 'Electricidad' | 'Marketing' | 'Ingredientes' | 'Transporte' | 'Software' | 'Personal';
  Descripción: string;
  Importe: number;
}

export interface CompraProveedor {
  ID_Compra: string;
  Fecha: string;
  ID_Proveedor: string;
  Nombre_Proveedor?: string;
  Concepto: string;
  Importe: number;
}

export interface Campaña {
  ID_Campaña: string;
  Canal: 'Instagram' | 'Facebook' | 'Google Ads' | 'Email Marketing';
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Inversión: number;
  Ventas_Generadas: number;
  ROI: number; // percentage, e.g. 240%
}

export interface Configuracion {
  Impuesto_IVA: number; // e.g. 16
  Tasa_BCV: number; // e.g. 742.22
  Nombre_Empresa: string;
  Ubicacion: string;
  Email_Propietario: string;
  Anos_Operando: number;
}

export interface AIInsight {
  category: 'Rentabilidad' | 'Inventario' | 'Proveedores' | 'Clientes' | 'Marketing' | 'Oportunidad';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  metric?: string;
  actionableStep?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  insights: AIInsight[];
  financialHealthScore: number;
  recommendations: string[];
}

export interface WorkspaceStatus {
  connected: boolean;
  userEmail: string;
  sheetId?: string;
  sheetUrl?: string;
  lastSync?: string;
  scopesAuthorized: string[];
}
