/**
 * ==========================================================================
 * exportTrades.js — Export de l'historique en PDF et Excel (Phase 10)
 * ==========================================================================
 * Utilise deux librairies chargées via CDN dans trades.html :
 *  - jsPDF + jspdf-autotable pour le PDF (tableau proprement mis en page)
 *  - SheetJS (xlsx) pour l'export Excel (.xlsx natif, pas juste un .csv)
 *
 * Les deux fonctions exportent exactement la liste de trades qu'on leur
 * passe (déjà filtrée/triée par listTrades.js) — jamais des données
 * masquées à l'utilisateur, pour rester cohérent avec ce qu'il voit.
 * ==========================================================================
 */

import { formatDate, formatSignedCurrency } from "../utils/formatter.js";

const EXPORT_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "pair", label: "Instrument" },
  { key: "direction", label: "Direction" },
  { key: "entry", label: "Entrée" },
  { key: "stopLoss", label: "Stop Loss" },
  { key: "takeProfit", label: "Take Profit" },
  { key: "lotSize", label: "Taille position" },
  { key: "profit", label: "Profit/Perte" },
  { key: "result", label: "Résultat" },
  { key: "smc", label: "Critères SMC" },
  { key: "notes", label: "Notes" }
];

function smcSummary(trade) {
  const labels = [];
  if (trade.bos) labels.push("BOS");
  if (trade.choch) labels.push("CHoCH");
  if (trade.fvg) labels.push("FVG");
  if (trade.orderBlock) labels.push("Order Block");
  if (trade.liquidityGrab) labels.push("Liquidity Grab");
  return labels.join(", ");
}

/** Convertit un trade Firestore en ligne de tableau plate, prête à exporter. */
function tradeToRow(trade, currency) {
  return {
    date: formatDate(trade.createdAt),
    pair: trade.pair || "—",
    direction: trade.direction || "—",
    entry: trade.entry ?? "",
    stopLoss: trade.stopLoss ?? "",
    takeProfit: trade.takeProfit ?? "",
    lotSize: trade.lotSize ?? "",
    profit: formatSignedCurrency(trade.profit, currency),
    result: trade.result || "—",
    smc: smcSummary(trade),
    notes: trade.notes || ""
  };
}

function timestampedFilename(extension) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `jtrader-historique-${stamp}.${extension}`;
}

/** Exporte les trades fournis en fichier Excel (.xlsx). */
export function exportTradesToExcel(trades, currency) {
  if (!window.XLSX) {
    throw new Error("La librairie Excel (SheetJS) n'a pas pu se charger.");
  }

  const rows = trades.map((t) => tradeToRow(t, currency));
  const worksheet = window.XLSX.utils.json_to_sheet(rows, {
    header: EXPORT_COLUMNS.map((c) => c.key)
  });

  // Renomme les en-têtes (clés techniques → libellés lisibles)
  const headerRow = EXPORT_COLUMNS.map((c) => c.label);
  window.XLSX.utils.sheet_add_aoa(worksheet, [headerRow], { origin: "A1" });

  // Largeur de colonnes approximative pour une lecture confortable
  worksheet["!cols"] = EXPORT_COLUMNS.map((c) => ({
    wch: c.key === "notes" ? 40 : c.key === "smc" ? 26 : 14
  }));

  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "Historique");
  window.XLSX.writeFile(workbook, timestampedFilename("xlsx"));
}

/** Exporte les trades fournis en fichier PDF (tableau paginé automatiquement). */
export function exportTradesToPDF(trades, currency) {
  if (!window.jspdf) {
    throw new Error("La librairie PDF (jsPDF) n'a pas pu se charger.");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text("JTrader — Historique des trades", 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")} · ${trades.length} trade${trades.length > 1 ? "s" : ""}`, 14, 21);

  const rows = trades.map((t) => {
    const row = tradeToRow(t, currency);
    return EXPORT_COLUMNS.map((c) => String(row[c.key]));
  });

  doc.autoTable({
    startY: 27,
    head: [EXPORT_COLUMNS.map((c) => c.label)],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didParseCell: (data) => {
      // Colore la colonne Résultat directement dans le PDF (WIN/LOSS)
      if (data.section === "body" && EXPORT_COLUMNS[data.column.index]?.key === "result") {
        data.cell.styles.textColor = data.cell.raw === "WIN" ? [22, 163, 74] : [220, 38, 38];
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  doc.save(timestampedFilename("pdf"));
}