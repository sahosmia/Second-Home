import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MessCalculationSummary } from './calculations';
import { CostCategory, Member } from '../types';
import { Language, getTranslation } from './translations';

type RGB = [number, number, number];
type Align = 'left' | 'center' | 'right';

const MM_PER_PT = 0.3527777778;

// jsPDF's built-in fonts can't shape Bengali script (no conjunct/matra reordering),
// so any Bangla text is instead drawn on an offscreen <canvas> — where the browser's
// own text engine shapes it correctly — and embedded into the PDF as an image.
// Plain English/numeric text keeps using jsPDF's fast, crisp native vector text.
function hasBangla(text: string): boolean {
  return /[ঀ-৿]/.test(text);
}

interface BnImage {
  dataUrl: string;
  wMm: number;
  hMm: number;
  baselineFromTopMm: number;
  alias: string;
}

const bnImageCache = new Map<string, BnImage>();

function renderBnImage(text: string, fontSizePt: number, bold: boolean, color: RGB, bg: RGB): BnImage | null {
  if (typeof document === 'undefined' || !text) return null;
  const colorHex = `rgb(${color[0]},${color[1]},${color[2]})`;
  const bgHex = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
  const cacheKey = `${text}|${fontSizePt}|${bold}|${colorHex}|${bgHex}`;
  const cached = bnImageCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Supersample proportionally to the target font size, not a fixed resolution —
  // a fixed high resolution (e.g. 120px) made long sentences at small font sizes
  // render as multi-thousand-pixel-wide canvases, ballooning the PDF to tens of MB.
  const RENDER_PX = Math.max(24, Math.round(fontSizePt * 6));
  const fontFamily = `'Noto Sans Bengali', 'Hind Siliguri', 'Nirmala UI', 'Kohinoor Bangla', sans-serif`;
  ctx.font = `${bold ? '700' : '400'} ${RENDER_PX}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || RENDER_PX * 0.8;
  const descent = metrics.actualBoundingBoxDescent || RENDER_PX * 0.25;
  const padding = RENDER_PX * 0.08;
  const widthPx = Math.max(1, Math.ceil(metrics.width + padding * 2));
  const heightPx = Math.max(1, Math.ceil(ascent + descent + padding * 2));

  canvas.width = widthPx;
  canvas.height = heightPx;
  // Resizing the canvas resets context state, so font/fill must be re-applied.
  // Painting a fully opaque background (matching the PDF content behind this
  // image) avoids an alpha channel entirely — a transparent PNG forces jsPDF to
  // embed a separate soft-mask image, which inflated a 2-page report to ~40MB.
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, widthPx, heightPx);
  ctx.font = `${bold ? '700' : '400'} ${RENDER_PX}px ${fontFamily}`;
  ctx.fillStyle = colorHex;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, padding, ascent + padding);

  const targetHeightMm = fontSizePt * MM_PER_PT * 1.15;
  const scale = targetHeightMm / heightPx;
  // JPEG here, not PNG: jsPDF embeds JPEG's DCT-compressed bytes as-is (PDF's
  // native DCTDecode filter), but for PNG it fully decodes to raw pixels and
  // re-compresses with its own (much less efficient) Flate encoder — that
  // decode-and-reflate round trip was inflating this report by roughly 10x.
  // The opaque solid background behind every glyph makes JPEG's lossy
  // compression a non-issue for crispness at this text size.
  const result: BnImage = {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    wMm: widthPx * scale,
    hMm: heightPx * scale,
    baselineFromTopMm: (ascent + padding) * scale,
    alias: cacheKey,
  };
  bnImageCache.set(cacheKey, result);
  return result;
}

/** Drop-in replacement for doc.text() that transparently renders Bangla as a shaped image. `bg` must match the fill directly behind the text (no alpha channel is used). */
function smartText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts: { align?: Align; fontSize: number; bold?: boolean; color: RGB; bg: RGB }
) {
  const { align = 'left', fontSize, bold = false, color, bg } = opts;
  if (!hasBangla(text)) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.text(text, x, y, { align });
    return;
  }
  const img = renderBnImage(text, fontSize, bold, color, bg);
  if (!img) return;
  let xLeft = x;
  if (align === 'right') xLeft = x - img.wMm;
  else if (align === 'center') xLeft = x - img.wMm / 2;
  // Passing a stable alias lets jsPDF reuse one embedded XObject for repeated
  // identical strings (e.g. "Regular"/"Equal Split" repeating down a column)
  // instead of re-embedding the same PNG bytes for every occurrence.
  doc.addImage(img.dataUrl, 'JPEG', xLeft, y - img.baselineFromTopMm, img.wMm, img.hMm, img.alias);
}

/** Draws one autoTable cell's (possibly multi-line) content, switching per line between native text and a shaped Bangla image. */
function drawTableCellContent(doc: jsPDF, rawText: string, cellX: number, cellY: number, cellW: number, cellH: number, align: Align, fontSizePt: number, bold: boolean, color: RGB, bg: RGB) {
  const lines = rawText.split('\n').filter((l) => l.length > 0);
  if (lines.length === 0) return;
  const lineHeightMm = fontSizePt * MM_PER_PT * 1.15;
  const totalHeight = lines.length * lineHeightMm;
  const firstBaselineY = cellY + (cellH - totalHeight) / 2 + lineHeightMm * 0.8;
  const padMm = 1.2;
  const xPos = align === 'right' ? cellX + cellW - padMm : align === 'center' ? cellX + cellW / 2 : cellX + padMm;

  lines.forEach((line, i) => {
    smartText(doc, line, xPos, firstBaselineY + i * lineHeightMm, { align, fontSize: fontSizePt, bold, color, bg });
  });
}

export function generateMessPDF(
  messName: string,
  selectedMonth: string,
  summary: MessCalculationSummary,
  categories: CostCategory[] = [],
  members: Member[] = [],
  language: Language = 'en'
) {
  const t = (key: Parameters<typeof getTranslation>[1], replacements?: Record<string, string | number>) =>
    getTranslation(language, key, replacements);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const PAGE_W = 297;
  const MARGIN = 12;
  const USABLE_W = PAGE_W - MARGIN * 2;

  // Color Palette
  const secondaryColor: RGB = [30, 41, 59]; // Zinc 800
  const lightGrey: RGB = [244, 244, 245]; // Zinc 100
  const darkGrey: RGB = [63, 63, 70]; // Zinc 600
  const white: RGB = [255, 255, 255];
  const green: RGB = [16, 122, 89];
  const red: RGB = [185, 28, 28];

  const dateObj = new Date(selectedMonth + '-01');
  const monthName = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });
  const reportRef = `${messName.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'MESS'}-${selectedMonth}`;
  const generatedOn = new Date().toLocaleDateString();

  // Reusable banner drawn at the top of every page it's called on (landscape width)
  const drawBanner = (subtitle: string) => {
    doc.setFillColor(...secondaryColor);
    doc.rect(0, 0, PAGE_W, 22, 'F');

    smartText(doc, messName.toUpperCase(), MARGIN, 10, { fontSize: 15, bold: true, color: white, bg: secondaryColor });
    smartText(doc, subtitle, MARGIN, 17, { fontSize: 8, color: [167, 243, 208], bg: secondaryColor });
    smartText(doc, `${t('pdfPeriodLabel')}: ${monthName.toUpperCase()}`, PAGE_W - MARGIN, 10, { align: 'right', fontSize: 9, bold: true, color: white, bg: secondaryColor });
    smartText(doc, `${t('pdfRefLabel')}: ${reportRef}  |  ${t('pdfGeneratedLabel')}: ${generatedOn}`, PAGE_W - MARGIN, 17, { align: 'right', fontSize: 7, color: [212, 212, 216], bg: secondaryColor });
  };

  drawBanner(t('pdfReportSubtitle'));

  // ==================== KPI STRIP ====================
  let y = 30;
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(...lightGrey);
  doc.roundedRect(MARGIN, y, USABLE_W, 16, 2, 2, 'F');

  const kpis: [string, string][] = [
    [t('totalBazaar').toUpperCase(), `Tk. ${summary.totalBazaar.toFixed(0)}`],
    [t('totalMeals').toUpperCase(), `${summary.totalMeals.toFixed(1)}`],
    [t('mealRate').toUpperCase(), `Tk. ${summary.currentMealRate.toFixed(2)}`],
    [t('totalExpenses').toUpperCase(), `Tk. ${summary.totalExpenses.toFixed(0)}`],
  ];
  const kpiW = USABLE_W / kpis.length;
  kpis.forEach(([label, value], i) => {
    const cx = MARGIN + kpiW * i + kpiW / 2;
    smartText(doc, label, cx, y + 6, { align: 'center', fontSize: 7, bold: true, color: darkGrey, bg: lightGrey });
    smartText(doc, value, cx, y + 13, { align: 'center', fontSize: 12, bold: true, color: secondaryColor, bg: lightGrey });
  });

  y += 22;

  // ==================== ONE-SHEET SETTLEMENT SPREADSHEET ====================
  smartText(doc, t('pdfSheetHeading'), MARGIN, y, { fontSize: 10, bold: true, color: secondaryColor, bg: white });
  y += 4;

  const head: string[] = [t('pdfColMember'), t('pdfColBazaar'), t('pdfColMeals'), t('pdfColMealCost')];
  categories.forEach((cat) => {
    head.push(`${cat.name}\n${cat.type === 'PLUS' ? t('pdfBillSuffix') : t('pdfCreditSuffix')}`);
  });
  head.push(t('pdfColTotalExpense'), t('pdfColBalance'));

  const receivesLabel = t('receives');
  const owesLabel = t('owes');
  const evenLabel = t('settleZero');

  const body: string[][] = summary.results.map((r) => {
    const row: string[] = [
      r.member.name,
      (r.member.bazaarAmount || 0).toFixed(0),
      (r.member.totalMeals || 0).toFixed(1),
      r.mealExpense.toFixed(0),
    ];
    categories.forEach((cat) => {
      const adj = r.adjustments.find((a) => a.categoryId === cat.id);
      const cellText = adj?.isExcluded ? '—' : (adj ? adj.amount.toFixed(0) : '0');
      row.push(cellText);
    });
    const balanceText =
      r.finalBalance > 0.005 ? `+${r.finalBalance.toFixed(0)} (${receivesLabel})` :
      r.finalBalance < -0.005 ? `-${Math.abs(r.finalBalance).toFixed(0)} (${owesLabel})` :
      `0 (${evenLabel})`;
    row.push(r.totalPersonalExpense.toFixed(0), balanceText);
    return row;
  });

  // Bottom TOTALS row — the classic Excel habit of summing every column
  const sumCategory = (catId: string) =>
    summary.results.reduce((s, r) => s + (r.adjustments.find((a) => a.categoryId === catId)?.amount || 0), 0);
  const totalBalance = summary.results.reduce((s, r) => s + r.finalBalance, 0);
  const totalsRow: string[] = [
    t('pdfTotalRowLabel'),
    summary.totalBazaar.toFixed(0),
    summary.totalMeals.toFixed(1),
    summary.results.reduce((s, r) => s + r.mealExpense, 0).toFixed(0),
    ...categories.map((cat) => sumCategory(cat.id).toFixed(0)),
    summary.results.reduce((s, r) => s + r.totalPersonalExpense, 0).toFixed(0),
    `${totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(0)}`,
  ];

  const fixedCols = [
    { key: 'name', width: 32 },
    { key: 'bazaar', width: 20 },
    { key: 'meals', width: 14 },
    { key: 'mealCost', width: 22 },
  ];
  const tailCols = [
    { key: 'totalExp', width: 24 },
    { key: 'balance', width: 28 },
  ];
  const fixedWidth = [...fixedCols, ...tailCols].reduce((s, c) => s + c.width, 0);

  // Category columns get an even share of whatever's left. If there are enough
  // categories that this would squeeze them below a readable minimum, shrink the
  // fixed columns proportionally instead — the table must always total USABLE_W
  // exactly, or autoTable overflows the page.
  const MIN_CAT_WIDTH = 14;
  let catColWidth = categories.length > 0 ? (USABLE_W - fixedWidth) / categories.length : 0;
  let fixedScale = 1;
  if (categories.length > 0 && catColWidth < MIN_CAT_WIDTH) {
    catColWidth = MIN_CAT_WIDTH;
    const remainingForFixed = USABLE_W - MIN_CAT_WIDTH * categories.length;
    fixedScale = Math.max(0.55, remainingForFixed / fixedWidth);
  }
  const scaledFixed = fixedCols.map((c) => ({ ...c, width: c.width * fixedScale }));
  const scaledTail = tailCols.map((c) => ({ ...c, width: c.width * fixedScale }));

  const columnStyles: Record<number, { cellWidth: number; halign: Align }> = {
    0: { cellWidth: scaledFixed[0].width, halign: 'left' },
    1: { cellWidth: scaledFixed[1].width, halign: 'right' },
    2: { cellWidth: scaledFixed[2].width, halign: 'center' },
    3: { cellWidth: scaledFixed[3].width, halign: 'right' },
  };
  categories.forEach((_, i) => {
    columnStyles[4 + i] = { cellWidth: catColWidth, halign: 'right' };
  });
  const totalExpIdx = 4 + categories.length;
  columnStyles[totalExpIdx] = { cellWidth: scaledTail[0].width, halign: 'right' };
  columnStyles[totalExpIdx + 1] = { cellWidth: scaledTail[1].width, halign: 'right' };

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, top: 24 },
    head: [head],
    body: summary.results.length > 0 ? body : [],
    foot: summary.results.length > 0 ? [totalsRow] : undefined,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      lineColor: [220, 220, 224],
      lineWidth: 0.15,
      textColor: darkGrey,
      valign: 'middle',
    },
    headStyles: {
      fillColor: secondaryColor,
      textColor: white,
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
    },
    footStyles: {
      fillColor: lightGrey,
      textColor: secondaryColor,
      fontStyle: 'bold',
      fontSize: 7,
    },
    alternateRowStyles: { fillColor: [250, 250, 251] },
    columnStyles,
    showHead: 'everyPage',
    showFoot: 'lastPage',
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const isBalanceCol = data.column.index === totalExpIdx + 1;
      if (isBalanceCol) {
        const text = String(data.cell.raw ?? '');
        if (text.includes(receivesLabel)) data.cell.styles.textColor = green;
        else if (text.includes(owesLabel)) data.cell.styles.textColor = red;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    willDrawCell: (data) => {
      if (hasBangla(String(data.cell.raw ?? ''))) {
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      const raw = String(data.cell.raw ?? '');
      if (!hasBangla(raw)) return;
      const isBalanceCol = data.section === 'body' && data.column.index === totalExpIdx + 1;
      let color: RGB = darkGrey;
      let bg: RGB = white;
      let bold = false;
      if (data.section === 'head') { color = white; bg = secondaryColor; bold = true; }
      else if (data.section === 'foot') { color = secondaryColor; bg = lightGrey; bold = true; }
      else if (isBalanceCol) {
        bold = true;
        color = raw.includes(receivesLabel) ? green : raw.includes(owesLabel) ? red : darkGrey;
      }
      const align = (data.cell.styles.halign as Align) || 'left';
      const fontSize = data.cell.styles.fontSize || 7;
      drawTableCellContent(doc, raw, data.cell.x, data.cell.y, data.cell.width, data.cell.height, align, fontSize, bold, color, bg);
    },
    didDrawPage: () => {
      drawBanner(`${t('pdfReportSubtitle')} (${language === 'bn' ? '...' : 'continued'})`);
    },
  });

  if (summary.results.length === 0) {
    smartText(doc, t('pdfNoMembersRow'), MARGIN, y + 12, { fontSize: 9, color: darkGrey, bg: white });
  }

  const afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y + 10;

  // Legend / how-to-read footnote
  let footY = afterTableY + 6;
  if (footY > 185) {
    drawBanner(t('pdfReportSubtitle'));
    footY = 30;
  }
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, footY, USABLE_W, 16, 2, 2, 'FD');
  smartText(doc, t('pdfHowToReadHeading'), MARGIN + 4, footY + 6, { fontSize: 8, bold: true, color: secondaryColor, bg: white });
  smartText(doc, t('pdfHowToReadBody'), MARGIN + 4, footY + 11.5, { fontSize: 7.5, color: darkGrey, bg: white });

  // ==================== PAGE 2 (PORTRAIT): CATEGORY DETAILS, NOTES & RECONCILIATION ====================
  doc.addPage('a4', 'portrait');
  const P_W = 210;
  const P_MARGIN = 15;
  const P_USABLE_W = P_W - P_MARGIN * 2;

  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, P_W, 24, 'F');
  smartText(doc, t('pdfPage2Title'), P_MARGIN, 11, { fontSize: 13, bold: true, color: white, bg: secondaryColor });
  smartText(doc, `${messName.toUpperCase()}  |  ${t('pdfPeriodLabel')}: ${monthName.toUpperCase()}  |  ${t('pdfRefLabel')}: ${reportRef}`, P_MARGIN, 18, { fontSize: 8.5, color: [167, 243, 208], bg: secondaryColor });

  let p2Y = 32;
  smartText(doc, t('pdfCategoriesHeading'), P_MARGIN, p2Y, { fontSize: 10, bold: true, color: secondaryColor, bg: white });
  p2Y += 4;

  const catHead = [t('pdfColCategory'), t('pdfColType'), t('pdfColSplitMode'), t('pdfColOccurrence'), t('pdfColTotal'), t('pdfColNote')];
  const catBody = categories.map((cat) => {
    let totalAmt = 0;
    if (cat.splitType === 'EQUAL') {
      totalAmt = cat.totalLumpSum || 0;
    } else {
      totalAmt = members.reduce((sum, m) => {
        const costInput = m.customCosts?.find((cc) => cc.categoryId === cat.id);
        return sum + (costInput ? costInput.amount : 0);
      }, 0);
    }
    return [
      cat.name,
      t(cat.type === 'PLUS' ? 'plusShort' : 'minusShort'),
      t(cat.splitType === 'EQUAL' ? 'equalSplitLabel' : 'individualSplitLabel'),
      t(cat.occurrence === 'ONE_TIME' ? 'occurrenceOneTime' : 'occurrenceRegular').split(' ')[0],
      totalAmt.toFixed(0),
      cat.note || '—',
    ];
  });

  autoTable(doc, {
    startY: p2Y,
    margin: { left: P_MARGIN, right: P_MARGIN },
    head: [catHead],
    body: catBody.length > 0 ? catBody : [[t('pdfNoCategoriesRow'), '', '', '', '', '']],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: darkGrey, lineColor: [220, 220, 224], lineWidth: 0.15 },
    headStyles: { fillColor: secondaryColor, textColor: white, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: lightGrey },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 26 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: P_USABLE_W - 28 - 26 - 30 - 20 - 20 },
    },
    willDrawCell: (data) => {
      if (hasBangla(String(data.cell.raw ?? ''))) {
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      const raw = String(data.cell.raw ?? '');
      if (!hasBangla(raw)) return;
      const color: RGB = data.section === 'head' ? white : darkGrey;
      const bg: RGB = data.section === 'head' ? secondaryColor : data.row.index % 2 === 1 ? lightGrey : white;
      const align = (data.cell.styles.halign as Align) || 'left';
      const fontSize = data.cell.styles.fontSize || 7.5;
      drawTableCellContent(doc, raw, data.cell.x, data.cell.y, data.cell.width, data.cell.height, align, fontSize, data.section === 'head', color, bg);
    },
  });

  const afterCatY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? p2Y + 10;

  // ==================== COMMUNITY-WIDE RECONCILIATION SUMMARY ====================
  // Note: "total to receive" and "total to owe" are NOT expected to be equal — every
  // PLUS category (rent, wifi, gas...) is money still owed to whoever covers those
  // bills, on top of the bazaar pool. The real identity that must hold is:
  //   (total still owed) - (total to receive back) == (bills/rent due beyond bazaar)
  const totalToReceive = summary.results.reduce((sum, r) => sum + (r.finalBalance > 0 ? r.finalBalance : 0), 0);
  const totalToOwe = summary.results.reduce((sum, r) => sum + (r.finalBalance < 0 ? Math.abs(r.finalBalance) : 0), 0);
  const billsDueBeyondBazaar = summary.totalExpenses - summary.totalBazaar;
  const reconciliationHeight = 40;
  let reconY = afterCatY + 8;
  if (reconY + reconciliationHeight > 280) {
    doc.addPage('a4', 'portrait');
    reconY = 20;
  }

  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(...lightGrey);
  doc.roundedRect(P_MARGIN, reconY, P_USABLE_W, reconciliationHeight, 3, 3, 'FD');

  smartText(doc, t('pdfReconciliationHeading'), P_MARGIN + 5, reconY + 7, { fontSize: 9.5, bold: true, color: secondaryColor, bg: lightGrey });
  smartText(doc, `${t('pdfReceiveBackLabel')}: Tk. ${totalToReceive.toFixed(2)}`, P_MARGIN + 5, reconY + 14, { fontSize: 8, color: darkGrey, bg: lightGrey });
  smartText(doc, `${t('pdfStillPayLabel')}: Tk. ${totalToOwe.toFixed(2)}`, P_MARGIN + 5, reconY + 20, { fontSize: 8, color: darkGrey, bg: lightGrey });
  smartText(doc, `${t('pdfBillsDueLabel')}: Tk. ${billsDueBeyondBazaar.toFixed(2)}`, P_MARGIN + 5, reconY + 26, { fontSize: 8, color: darkGrey, bg: lightGrey });

  const expectedGap = totalToOwe - totalToReceive;
  const mismatch = Math.abs(expectedGap - billsDueBeyondBazaar);
  if (mismatch < 0.5) {
    smartText(doc, t('pdfCheckedOk'), P_MARGIN + 5, reconY + 33, { fontSize: 8, bold: true, color: green, bg: lightGrey });
  } else {
    smartText(doc, t('pdfMismatchWarning', { amount: mismatch.toFixed(2) }), P_MARGIN + 5, reconY + 33, { fontSize: 8, bold: true, color: red, bg: lightGrey });
  }

  // ==================== DYNAMIC PAGE NUMBER FOOTERS (every page, any orientation) ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(161, 161, 170);
    doc.text(`Page ${i} of ${totalPages}  |  Second Home - Mess Engine Report  |  Ref: ${reportRef}`, MARGIN, pageHeight - 6);
  }

  // Show the summary of PDF version in a new tab instead of direct forced auto-download
  if (typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
