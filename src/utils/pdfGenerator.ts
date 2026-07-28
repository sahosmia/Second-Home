import { jsPDF } from 'jspdf';
import { MessCalculationSummary } from './calculations';
import { CostCategory, Member } from '../types';

export function generateMessPDF(
  messName: string,
  selectedMonth: string,
  summary: MessCalculationSummary,
  categories?: CostCategory[],
  members?: Member[]
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
  doc.text(`Tk. ${summary.totalBazaar.toFixed(2)}`, 25, currentY + 17);
  doc.text(`${summary.totalMeals.toFixed(1)}`, 85, currentY + 17);
  doc.text(`Tk. ${summary.currentMealRate.toFixed(4)}`, 145, currentY + 17);

  // 3. Calculation Table
  currentY += 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Detailed Settlement Ledger (Page 1 of 2)', 15, currentY);

  currentY += 6;
  // Table Header Background
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(15, currentY, 180, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Member Name', 18, currentY + 5.5);
  doc.text('Bazaar (Tk.)', 65, currentY + 5.5);
  doc.text('Meals', 92, currentY + 5.5);
  doc.text('Meal Exp (Tk.)', 112, currentY + 5.5);
  doc.text('Adjust (Tk.)', 137, currentY + 5.5);
  doc.text('Total Exp (Tk.)', 160, currentY + 5.5);
  doc.text('Balance (Tk.)', 182, currentY + 5.5);

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
  currentY += 12;
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

  // 5. Footer on Page 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('Page 1 of 2  |  Second Home - Mess Engine v1.3 Report.', 15, 282);


  // ==================== PAGE 2: DETAILED AUDIT TRAIL ====================
  doc.addPage();
  
  // Page 2 header
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DETAILED AUDIT TRAIL & LEDGER METRICS', 15, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(167, 243, 208); // Emerald 200
  doc.text(`Mess: ${messName.toUpperCase()}  |  Period: ${monthName.toUpperCase()}`, 15, 18);

  let page2Y = 38;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('1. Configured Expense Categories & Allocations', 15, page2Y);

  page2Y += 6;
  // Draw Table Header for Categories
  doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.rect(15, page2Y, 180, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Expense Name', 18, page2Y + 4.5);
  doc.text('Type', 65, page2Y + 4.5);
  doc.text('Split Mode', 85, page2Y + 4.5);
  doc.text('Occurrence', 115, page2Y + 4.5);
  doc.text('Total Value (Tk.)', 145, page2Y + 4.5);
  doc.text('Share Details', 170, page2Y + 4.5);

  page2Y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  if (categories && categories.length > 0) {
    categories.forEach((cat, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, page2Y, 180, 7, 'F');
      }
      doc.setDrawColor(240, 240, 240);
      doc.line(15, page2Y + 7, 195, page2Y + 7);

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.name, 18, page2Y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.text(cat.type, 65, page2Y + 4.5);
      doc.text(cat.splitType === 'EQUAL' ? 'Equal Split' : 'Individual', 85, page2Y + 4.5);
      doc.text(cat.occurrence || 'REGULAR', 115, page2Y + 4.5);

      // Calculate total amount for this expense category
      let totalAmt = 0;
      if (cat.splitType === 'EQUAL') {
        totalAmt = cat.totalLumpSum || 0;
      } else {
        totalAmt = members ? members.reduce((sum, m) => {
          const costInput = m.customCosts?.find((cc) => cc.categoryId === cat.id);
          return sum + (costInput ? costInput.amount : 0);
        }, 0) : 0;
      }
      doc.text(`Tk. ${totalAmt.toFixed(2)}`, 145, page2Y + 4.5);

      // Share Details
      if (cat.splitType === 'EQUAL') {
        const excludedCount = cat.excludedMemberIds?.length || 0;
        const totalCount = members ? members.length : 0;
        const activeCount = totalCount - excludedCount;
        const perShare = activeCount > 0 ? totalAmt / activeCount : 0;
        doc.text(`Tk. ${perShare.toFixed(1)} ea (${activeCount} active)`, 170, page2Y + 4.5);
      } else {
        doc.text('Custom Individual Split', 170, page2Y + 4.5);
      }

      page2Y += 7;
    });
  } else {
    doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
    doc.text('No custom expenses configured.', 20, page2Y + 5);
    page2Y += 7;
  }

  page2Y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('2. Step-by-Step Member Settlement Equations', 15, page2Y);

  page2Y += 6;
  if (summary.results && summary.results.length > 0) {
    summary.results.forEach((row) => {
      // Check if we need a new page for long lists of members
      if (page2Y > 255) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(161, 161, 170);
        doc.text('Second Home - Mess Engine v1.3 Report.', 15, 282);
        doc.addPage();
        
        // Page header on extra page
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('MEMBER SETTLEMENT DETAILS (CONTINUED)', 15, 10);
        
        page2Y = 25;
      }

      doc.setFillColor(lightGrey[0], lightGrey[1], lightGrey[2]);
      doc.roundedRect(15, page2Y, 180, 16, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(row.member.name.toUpperCase(), 18, page2Y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);

      // Construct calculation equation details
      const totalDeposits = row.member.bazaarAmount + row.totalMinus;
      const totalExpenses = row.mealExpense + row.totalPlus;
      const equationText = `Ledger: Paid (Bazaar Tk. ${row.member.bazaarAmount.toFixed(1)} + Rebates Tk. ${row.totalMinus.toFixed(1)}) - Cost (Meals Tk. ${row.mealExpense.toFixed(1)} + Charges Tk. ${row.totalPlus.toFixed(1)})`;
      doc.text(equationText, 18, page2Y + 11.5);

      // Final balance text on the right
      doc.setFont('helvetica', 'bold');
      if (row.finalBalance > 0) {
        doc.setTextColor(16, 122, 89); // Green
        doc.text(`Tk. ${totalDeposits.toFixed(1)} - Tk. ${totalExpenses.toFixed(1)} = Receives Tk. ${row.finalBalance.toFixed(1)}`, 105, page2Y + 5);
      } else if (row.finalBalance < 0) {
        doc.setTextColor(185, 28, 28); // Red
        doc.text(`Tk. ${totalDeposits.toFixed(1)} - Tk. ${totalExpenses.toFixed(1)} = Owes Tk. ${Math.abs(row.finalBalance).toFixed(1)}`, 105, page2Y + 5);
      } else {
        doc.setTextColor(darkGrey[0], darkGrey[1], darkGrey[2]);
        doc.text(`Tk. ${totalDeposits.toFixed(1)} - Tk. ${totalExpenses.toFixed(1)} = Settled (0.00)`, 105, page2Y + 5);
      }

      page2Y += 19;
    });
  }

  // Footer on Page 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(161, 161, 170); // Zinc 400
  doc.text('Page 2 of 2  |  Second Home - Mess Engine v1.3 Report.', 15, 282);

  // Show the summary of PDF version in a new tab instead of direct forced auto-download
  if (typeof window !== 'undefined') {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
