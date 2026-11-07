import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Factura, Gasto, CompraProveedor, Pedido, Configuracion } from '../types';

export interface ReportDataOptions {
  monthYear: string; // e.g. "2026-07"
  monthName: string; // e.g. "Julio 2026"
  facturas: Factura[];
  gastos: Gasto[];
  comprasProveedores: CompraProveedor[];
  pedidos: Pedido[];
  config: Configuracion;
  notes?: string;
  includeConversionBs?: boolean;
}

export function generateMonthlyPDFReport(options: ReportDataOptions) {
  const {
    monthYear,
    monthName,
    facturas,
    gastos,
    comprasProveedores,
    pedidos,
    config,
    notes,
    includeConversionBs = true,
  } = options;

  // 1. Filter data for the specific month
  const monthlyFacturas = facturas.filter((f) => f.Fecha.startsWith(monthYear));
  const monthlyGastos = gastos.filter((g) => g.Fecha.startsWith(monthYear));
  const monthlyCompras = comprasProveedores.filter((c) => c.Fecha.startsWith(monthYear));
  const monthlyPedidos = pedidos.filter((p) => p.Fecha.startsWith(monthYear));

  // 2. Compute Totals
  const totalVentasUSD = monthlyFacturas.reduce((sum, f) => sum + f.Importe, 0);
  const totalFacturasPagadasUSD = monthlyFacturas
    .filter((f) => f.Estado_Pago === 'Pagada')
    .reduce((sum, f) => sum + f.Importe, 0);
  const totalFacturasPendientesUSD = monthlyFacturas
    .filter((f) => f.Estado_Pago === 'Pendiente')
    .reduce((sum, f) => sum + f.Importe, 0);
  const totalFacturasVencidasUSD = monthlyFacturas
    .filter((f) => f.Estado_Pago === 'Vencida')
    .reduce((sum, f) => sum + f.Importe, 0);

  const totalGastosUSD = monthlyGastos.reduce((sum, g) => sum + g.Importe, 0);
  const totalComprasUSD = monthlyCompras.reduce((sum, c) => sum + c.Importe, 0);
  const totalEgresosUSD = totalGastosUSD + totalComprasUSD;

  const balanceNetoUSD = Number((totalVentasUSD - totalEgresosUSD).toFixed(2));
  const margenNeto = totalVentasUSD > 0 ? ((balanceNetoUSD / totalVentasUSD) * 100).toFixed(1) : '0.0';

  const tasaBCV = config.Tasa_BCV || 742.22;
  const totalVentasBS = totalVentasUSD * tasaBCV;
  const totalEgresosBS = totalEgresosUSD * tasaBCV;
  const balanceNetoBS = balanceNetoUSD * tasaBCV;

  // 3. Create jsPDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Primary Colors (Navy & Slate Theme)
  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep blue
  const accentColor: [number, number, number] = [2, 132, 199]; // Cyan blue
  const textColor: [number, number, number] = [39, 39, 42]; // Zinc dark
  const successColor: [number, number, number] = [16, 185, 129];
  const warningColor: [number, number, number] = [245, 158, 11];

  let currentY = 16;

  // Header Banner Background
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, pageWidth - margin * 2, 28, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MASTER CHEFS · DULCE CAPRICHO', margin + 6, currentY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('REPORTE FINANCIERO MENSUAL · RESUMEN EJECUTIVO', margin + 6, currentY + 16);
  doc.text(`${config.Ubicacion || 'Maracay, Estado Aragua, Venezuela'}`, margin + 6, currentY + 22);

  // Period on the right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(monthName.toUpperCase(), pageWidth - margin - 6, currentY + 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Tasa Oficial BCV: ${tasaBCV.toLocaleString('es-VE')} Bs/$`, pageWidth - margin - 6, currentY + 17, { align: 'right' });
  doc.text(`Emisión: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - margin - 6, currentY + 22, { align: 'right' });

  currentY += 34;

  // Summary Metrics Box (Ventas, Gastos, Balance Neto)
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'FD');

  const colWidth = (pageWidth - margin * 2) / 3;

  // Column 1: Ventas Totales
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(113, 113, 122);
  doc.text('VENTAS TOTALES (FACTURADO)', margin + 6, currentY + 8);
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Emerald green
  doc.text(`$${totalVentasUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 6, currentY + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 82, 91);
  doc.text(`Equiv: ${totalVentasBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs. | ${monthlyFacturas.length} Facturas`, margin + 6, currentY + 22);

  // Column 2: Total Gastos & Compras
  const col2X = margin + colWidth + 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(113, 113, 122);
  doc.text('TOTAL EGRESOS (GASTOS + COMPRAS)', col2X, currentY + 8);
  doc.setFontSize(14);
  doc.setTextColor(239, 68, 68); // Red
  doc.text(`$${totalEgresosUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, col2X, currentY + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 82, 91);
  doc.text(`Gastos: $${totalGastosUSD.toFixed(0)} | Compras: $${totalComprasUSD.toFixed(0)}`, col2X, currentY + 22);

  // Column 3: Balance Neto
  const col3X = margin + colWidth * 2 + 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(113, 113, 122);
  doc.text('BALANCE NETO OPERATIVO', col3X, currentY + 8);
  doc.setFontSize(14);
  const isProfit = balanceNetoUSD >= 0;
  doc.setTextColor(isProfit ? 37 : 220, isProfit ? 99 : 38, isProfit ? 235 : 38);
  doc.text(
    `${isProfit ? '+' : ''}$${balanceNetoUSD.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    col3X,
    currentY + 16
  );
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 82, 91);
  doc.text(`Margen: ${margenNeto}% | ${balanceNetoBS.toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.`, col3X, currentY + 22);

  currentY += 34;

  // Section 1: Desglose de Ventas y Cobros
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('1. Resumen de Ventas y Estado de Cobros', margin, currentY);
  currentY += 3;

  const facturasTableBody = monthlyFacturas.map((f) => [
    f.ID_Factura,
    f.Fecha,
    f.Cliente,
    f.ID_Pedido,
    `$${f.Importe.toFixed(2)}`,
    includeConversionBs ? `${(f.Importe * tasaBCV).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.` : '-',
    f.Estado_Pago,
  ]);

  if (facturasTableBody.length === 0) {
    facturasTableBody.push(['-', '-', 'Sin facturas registradas en este período', '-', '$0.00', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['ID Factura', 'Fecha', 'Cliente', 'Pedido Ref.', 'Monto USD', 'Equiv. BCV', 'Estado']],
    body: facturasTableBody,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
      5: { halign: 'right' },
      6: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === 'body') {
        const val = data.cell.raw;
        if (val === 'Pagada') data.cell.styles.textColor = [16, 185, 129];
        else if (val === 'Pendiente') data.cell.styles.textColor = [245, 158, 11];
        else if (val === 'Vencida') data.cell.styles.textColor = [239, 68, 68];
      }
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // Section 2: Gastos Operativos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('2. Desglose de Gastos Operativos', margin, currentY);
  currentY += 3;

  const gastosTableBody = monthlyGastos.map((g) => [
    g.ID_Gasto,
    g.Fecha,
    g.Categoría,
    g.Descripción,
    `$${g.Importe.toFixed(2)}`,
    includeConversionBs ? `${(g.Importe * tasaBCV).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.` : '-',
  ]);

  if (gastosTableBody.length === 0) {
    gastosTableBody.push(['-', '-', '-', 'Sin gastos operacionales registrados en este período', '$0.00', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['ID Gasto', 'Fecha', 'Categoría', 'Descripción', 'Monto USD', 'Equiv. BCV']],
    body: gastosTableBody,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold', textColor: [239, 68, 68] },
      5: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // Check if we need a new page for Purchases and Notes
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  // Section 3: Compras a Proveedores
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('3. Compras de Materia Prima e Insumos (Proveedores)', margin, currentY);
  currentY += 3;

  const comprasTableBody = monthlyCompras.map((c) => [
    c.ID_Compra,
    c.Fecha,
    c.Nombre_Proveedor || c.ID_Proveedor,
    c.Concepto,
    `$${c.Importe.toFixed(2)}`,
    includeConversionBs ? `${(c.Importe * tasaBCV).toLocaleString('es-VE', { maximumFractionDigits: 0 })} Bs.` : '-',
  ]);

  if (comprasTableBody.length === 0) {
    comprasTableBody.push(['-', '-', 'Sin compras registradas este mes', '-', '$0.00', '-']);
  }

  autoTable(doc, {
    startY: currentY,
    head: [['ID Compra', 'Fecha', 'Proveedor', 'Concepto / Insumo', 'Monto USD', 'Equiv. BCV']],
    body: comprasTableBody,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { halign: 'right', fontStyle: 'bold', textColor: [239, 68, 68] },
      5: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Observaciones & Firmas
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('OBSERVACIONES DE GERENCIA & NOTA FISCAL:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(82, 82, 91);
  const defaultNote =
    notes ||
    `Reporte oficial generado por el ERP Master Chefs - Dulce Capricho en Maracay, Estado Aragua. Todos los importes en Bolívares han sido convertidos conforme a la tasa oficial del Banco Central de Venezuela (BCV: ${tasaBCV} Bs/$). Los registros de pedidos y despachos se sincronizan en Google Sheets y Google Calendar.`;
  const splitNotes = doc.splitTextToSize(defaultNote, pageWidth - margin * 2 - 8);
  doc.text(splitNotes, margin + 4, currentY + 12);

  // Footer / Signatures
  const footerY = pageHeight - 16;
  doc.setFontSize(7);
  doc.setTextColor(161, 161, 170);
  doc.text(
    'Master Chefs · Dulce Capricho C.A. — Sistema Integrado ERP & Google Workspace — Maracay, Venezuela',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Page numbering on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(161, 161, 170);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text(`Reporte Mensual: ${monthName}`, margin, pageHeight - 8);
  }

  // Save the PDF
  const filename = `Reporte_Mensual_${monthYear}_Master_Chefs.pdf`;
  doc.save(filename);

  return { success: true, filename, totalPages, balanceNetoUSD, totalVentasUSD, totalEgresosUSD };
}
