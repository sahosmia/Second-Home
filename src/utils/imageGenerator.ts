import { MessCalculationSummary } from './calculations';

export function generateMessImage(
  messName: string,
  selectedMonth: string,
  summary: MessCalculationSummary
) {
  if (typeof window === 'undefined') return;

  const dateObj = new Date(selectedMonth + '-01');
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Dynamically calculate canvas dimensions based on member count
  const totalMembers = summary.results.length;
  const cardWidth = 800;
  const headerHeight = 130;
  const kpisHeight = 110;
  const tableHeaderHeight = 50;
  const rowHeight = 45;
  const gapHeight = 25;
  const footerHeight = 100;

  const cardHeight = headerHeight + kpisHeight + tableHeaderHeight + (totalMembers * rowHeight) + (gapHeight * 3) + footerHeight;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = cardWidth;
  canvas.height = cardHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Enable font smoothing and high quality rendering
  ctx.imageSmoothingEnabled = true;

  // 1. Background (Dark Theme: Zinc 950)
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // Decorative header gradient
  const grad = ctx.createLinearGradient(0, 0, cardWidth, 0);
  grad.addColorStop(0, '#059669'); // Emerald 600
  grad.addColorStop(1, '#0d9488'); // Teal 600
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cardWidth, 10);

  // 2. Header
  // Brand title
  ctx.fillStyle = '#10b981'; // Emerald 500
  ctx.font = '900 13px sans-serif';
  ctx.fillText('SECOND HOME — MESS ENGINE', 40, 45);

  // Mess Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(messName.toUpperCase(), 40, 80);

  // Month Period Banner
  ctx.fillStyle = '#a7f3d0'; // Emerald 200
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(`STATEMENT PERIOD: ${monthName.toUpperCase()}`, 40, 110);

  // Export Date (Top-Right)
  ctx.fillStyle = '#71717a'; // Zinc 500
  ctx.font = '600 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, cardWidth - 40, 45);
  ctx.textAlign = 'left';

  let currentY = headerHeight + gapHeight;

  // 3. Overview KPIs Container (Zebra background with rounded-corners simulation)
  ctx.fillStyle = '#18181b'; // Zinc 900
  ctx.beginPath();
  ctx.roundRect?.(40, currentY, cardWidth - 80, kpisHeight, 12);
  ctx.fill();

  // Draw 3 columns
  const colWidth = (cardWidth - 80) / 3;

  // Total Bazaar KPI
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a1a1aa'; // Zinc 400
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('TOTAL MESS BAZAAR', 40 + colWidth / 2, currentY + 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px sans-serif';
  ctx.fillText(`৳${summary.totalBazaar.toFixed(0)}`, 40 + colWidth / 2, currentY + 70);

  // Total Meals KPI
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('TOTAL MESS MEALS', 40 + colWidth * 1.5, currentY + 35);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px sans-serif';
  ctx.fillText(`${summary.totalMeals.toFixed(1)}`, 40 + colWidth * 1.5, currentY + 70);

  // Meal Rate KPI
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('CURRENT MEAL RATE', 40 + colWidth * 2.5, currentY + 35);
  ctx.fillStyle = '#34d399'; // Emerald 400
  ctx.font = '900 22px sans-serif';
  ctx.fillText(`৳${summary.currentMealRate.toFixed(3)}`, 40 + colWidth * 2.5, currentY + 70);

  // Draw vertical dividers inside KPIs box
  ctx.strokeStyle = '#27272a'; // Zinc 800
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40 + colWidth, currentY + 20);
  ctx.lineTo(40 + colWidth, currentY + kpisHeight - 20);
  ctx.moveTo(40 + colWidth * 2, currentY + 20);
  ctx.lineTo(40 + colWidth * 2, currentY + kpisHeight - 20);
  ctx.stroke();

  ctx.textAlign = 'left';
  currentY += kpisHeight + gapHeight;

  // 4. Detailed Settlement Table
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Detailed Settlement Ledger', 40, currentY);

  currentY += 15;

  // Draw table header background
  ctx.fillStyle = '#27272a'; // Zinc 800
  ctx.fillRect(40, currentY, cardWidth - 80, tableHeaderHeight);

  // Table header labels
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Member Name', 60, currentY + 30);
  ctx.fillText('Bazaar Paid', 230, currentY + 30);
  ctx.fillText('Meals', 340, currentY + 30);
  ctx.fillText('Meal Exp', 430, currentY + 30);
  ctx.fillText('Adjustments', 525, currentY + 30);
  ctx.fillText('Total Cost', 625, currentY + 30);
  ctx.fillText('Balance', 710, currentY + 30);

  currentY += tableHeaderHeight;

  // Draw member rows
  summary.results.forEach((row, idx) => {
    // Zebra striping
    ctx.fillStyle = idx % 2 === 0 ? '#18181b' : '#09090b';
    ctx.fillRect(40, currentY, cardWidth - 80, rowHeight);

    // Subtle divider border
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, currentY + rowHeight);
    ctx.lineTo(cardWidth - 40, currentY + rowHeight);
    ctx.stroke();

    // Member Name (Bold and white)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(row.member.name, 60, currentY + 26);

    // Numeric metrics
    ctx.font = '600 12px sans-serif';
    ctx.fillStyle = '#d4d4d8'; // Zinc 300
    ctx.fillText(`৳${row.member.bazaarAmount.toFixed(0)}`, 230, currentY + 26);
    ctx.fillText(`${row.member.totalMeals.toFixed(1)}`, 340, currentY + 26);
    ctx.fillText(`৳${row.mealExpense.toFixed(0)}`, 430, currentY + 26);

    // Net adjustments (PLUS/MINUS)
    const adjSign = row.netAdjustment >= 0 ? '+' : '-';
    ctx.fillText(`${adjSign}৳${Math.abs(row.netAdjustment).toFixed(0)}`, 525, currentY + 26);
    ctx.fillText(`৳${row.totalPersonalExpense.toFixed(0)}`, 625, currentY + 26);

    // Final balance column (colored emerald for Receives, rose for Owes)
    const isOwed = row.finalBalance > 0;
    const isOwes = row.finalBalance < 0;
    if (isOwed) {
      ctx.fillStyle = '#10b981'; // Emerald 500
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`+৳${row.finalBalance.toFixed(1)}`, 710, currentY + 26);
    } else if (isOwes) {
      ctx.fillStyle = '#f43f5e'; // Rose 500
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`-৳${Math.abs(row.finalBalance).toFixed(1)}`, 710, currentY + 26);
    } else {
      ctx.fillStyle = '#a1a1aa'; // Zinc 400
      ctx.font = '600 13px sans-serif';
      ctx.fillText('৳0.00', 710, currentY + 26);
    }

    currentY += rowHeight;
  });

  currentY += gapHeight;

  // 5. Image Footer / Info section
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, currentY);
  ctx.lineTo(cardWidth - 40, currentY);
  ctx.stroke();

  currentY += 25;

  // Attribution & Help text
  ctx.fillStyle = '#71717a'; // Zinc 500
  ctx.font = '600 11px sans-serif';
  ctx.fillText('Need help? Contact us:', 40, currentY);

  ctx.fillStyle = '#10b981'; // Emerald 500
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('https://www.linkedin.com/in/sahosmia/', 170, currentY);
  ctx.fillText('https://www.facebook.com/sahosridoy', 420, currentY);

  ctx.fillStyle = '#71717a';
  ctx.font = '600 10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Powered by Second Home v1.3 Mess Engine', cardWidth - 40, currentY);

  // Trigger download of image
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${messName.toLowerCase().replace(/\s+/g, '_')}_summary_${selectedMonth}.png`;
  link.href = dataUrl;
  link.click();
}
