import { jsPDF } from 'jspdf';
import { MessCalculationSummary } from './calculations';

export function generateMessPDF(
  messName: string,
  selectedMonth: string,
  summary: MessCalculationSummary
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette
  const secondaryColor = [30, 41, 59]; // Zinc 800
  const lightGrey = [244, 244, 245]; // Zinc 100
  const darkGrey = [63, 63, 70]; // Zinc 600

  // 1. Document Title / Header
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(messName.toUpperCase(), 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(167, 243, 208); // Emerald 200
  doc.text('Monthly Bachelor Mess Expense Ledger', 15, 25);

  // Month and Date
  const dateObj = new Date(selectedMonth + '-01');
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATEMENT PERIOD: ${monthName.toUpperCase()}`, 130, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 130, 25);

  // 2. Overview / KPIs
  let currentY = 50;
  doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
  doc.roundedRect(15, currentY, 180, 24, 3, 3, 'F');

  // KPI Labels & Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.text('TOTAL MESS BAZAAR', 25, currentY + 8);
  doc.text('TOTAL MESS MEALS', 85, currentY + 8);
  doc.text('CURRENT MEAL RATE', 145, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`$${summary.totalBazaar.toFixed(2)}`, 25, currentY + 17);
  doc.text(`${summary.totalMeals.toFixed(1)}`, 85, currentY + 17);
  doc.text(`$${summary.currentMealRate.toFixed(4)}`, 145, currentY + 17);

  // 3. Calculation Table
  currentY += 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Detailed Settlement Ledger', 15, currentY);

  currentY += 6;
  // Table Header Background
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(15, currentY, 180, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Member Name', 18, currentY + 5.5);
  doc.text('Bazaar ($)', 65, currentY + 5.5);
  doc.text('Meals', 92, currentY + 5.5);
  doc.text('Meal Exp ($)', 112, currentY + 5.5);
  doc.text('Adjust ($)', 137, currentY + 5.5);
  doc.text('Total Exp ($)', 160, currentY + 5.5);
  doc.text('Balance ($)', 182, currentY + 5.5);

  // Table Body Rows
  currentY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (summary.results.length === 0) {
    doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
    doc.text('No members added yet.', 15 + 5, currentY + 6);
  } else {
    summary.results.forEach((row, idx) => {
      // Zebra striping
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, currentY, 180, 8, 'F');
      }

      // Draw subtle row bottom border
      doc.setDrawColor(228, 228, 231);
      doc.line(15, currentY + 8, 195, currentY + 8);

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(row.member.name, 18, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.text(row.member.bazaarAmount.toFixed(2), 65, currentY + 5.5);
      doc.text(row.member.totalMeals.toFixed(1), 92, currentY + 5.5);
      doc.text(row.mealExpense.toFixed(2), 112, currentY + 5.5);

      const adjSign = row.netAdjustment >= 0 ? '+' : '-';
      doc.text(`${adjSign}${Math.abs(row.netAdjustment).toFixed(2)}`, 137, currentY + 5.5);
      doc.text(row.totalPersonalExpense.toFixed(2), 160, currentY + 5.5);

      // Color balance column based on owes / receives
      const isOwed = row.finalBalance > 0;
      const isOwes = row.finalBalance < 0;
      if (isOwed) {
        doc.setTextColor(16, 122, 89); // Deep green
        doc.setFont('helvetica', 'bold');
        doc.text(`+${row.finalBalance.toFixed(2)}`, 182, currentY + 5.5);
      } else if (isOwes) {
        doc.setTextColor(185, 28, 28); // Deep red
        doc.setFont('helvetica', 'bold');
        doc.text(`-${Math.abs(row.finalBalance).toFixed(2)}`, 182, currentY + 5.5);
      } else {
        doc.setTextColor(113, 113, 122);
        doc.setFont('helvetica', 'normal');
        doc.text('0.00', 182, currentY + 5.5);
      }

      currentY += 8;
    });
  }

  // 4. Print Summary / Information Box
  currentY += 15;
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, currentY, 180, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Calculation Formula & Business Logic:', 20, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
  doc.text('1. Meal Rate = Total Bazaar / Total Meals.  2. Personal Expense = (Meals * Meal Rate) + Adjustments (PLUS - MINUS).', 20, currentY + 11);
  doc.text('3. Final Balance = Bazaar Contribution - Personal Expense. Positive balance receives money, negative owes money.', 20, currentY + 15);

  // 5. Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('This is a client-side generated report. No database or external servers are utilized, ensuring absolute data privacy.', 15, 280);

  // Save the PDF
  const formattedName = messName.toLowerCase().replace(/\s+/g, '-');
  doc.save(`${formattedName}-${selectedMonth}-summary.pdf`);
}
