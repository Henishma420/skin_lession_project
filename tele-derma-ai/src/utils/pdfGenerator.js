import { jsPDF } from 'jspdf';

// Safe helper to convert image URL to base64
const getBase64ImageFromUrl = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to load image as base64 for PDF:', error);
    return null;
  }
};

export const generateReportPDF = async (report) => {
  const doc = new jsPDF();
  let y = 20;

  // 1. Clinical Branding Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 210, 255); // Cyan Accent
  doc.text('TELE-DERMA AI', 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(112, 128, 144); // Slate Gray
  doc.text('CLINICAL SKIN ANALYSIS REPORT', 105, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(0, 210, 255);
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  y += 8;

  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 140, 141);
  doc.text(`Report ID: ${report.id}`, 15, y);
  doc.text(`Generated Date: ${report.generatedDate}`, 195, y, { align: 'right' });
  y += 10;

  // 2. Patient Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 15, 25);
  doc.text('PATIENT INFORMATION', 15, y);
  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Patient Name: ${report.patientName || 'Not provided'}`, 15, y);
  doc.text(`Scan Date: ${report.scanDate}`, 195, y, { align: 'right' });
  y += 6;
  doc.text(`Age: ${report.age || 'Not provided'}`, 15, y);
  doc.text(`Gender: ${report.gender || 'Not provided'}`, 105, y);
  doc.text(`Patient ID: ${report.patientId || 'Not provided'}`, 195, y, { align: 'right' });
  y += 12;

  // 3. Skin Image Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALYZED SKIN IMAGE', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  // Try to load analyzed image, else draw placeholder
  const base64 = await getBase64ImageFromUrl(report.imageUrl);
  if (base64) {
    try {
      doc.addImage(base64, 'JPEG', 15, y, 55, 45);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 140, 141);
      doc.text('Clinical Skin Image', 78, y + 15);
      doc.text('Image used for AI-assisted analysis.', 78, y + 21);
      doc.text('Disclaimer: Images are for educational purposes only.', 78, y + 27);
      y += 53;
    } catch (err) {
      doc.rect(15, y, 55, 45);
      doc.text('Analyzed Skin Image Placeholder', 20, y + 23);
      y += 53;
    }
  } else {
    doc.rect(15, y, 55, 45);
    doc.text('Analyzed Skin Image', 25, y + 20);
    doc.text('Placeholder', 32, y + 26);
    y += 53;
  }
  y += 5;

  // 4. AI Analysis Results
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 15, 25);
  doc.text('AI ANALYSIS', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Predicted Condition:', 15, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.predictedCondition}`, 65, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Confidence Score:', 15, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.confidence.toFixed(1)}%`, 65, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Risk Classification:', 15, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.riskLevel?.toUpperCase()} RISK`, 65, y);
  y += 12;

  // 5. AI Assessment Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('AI ASSESSMENT SUMMARY', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(report.aiSummary, 180);
  doc.text(summaryLines, 15, y);
  y += (summaryLines.length * 5) + 10;

  // Check if we need page break (A4 is 297mm high)
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  // 6. Reported Symptoms
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTED SYMPTOMS', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (report.symptoms && report.symptoms.length > 0) {
    report.symptoms.forEach(sym => {
      doc.text(`• ${sym}`, 15, y);
      y += 5;
    });
  } else {
    doc.text('No symptoms were reported.', 15, y);
    y += 5;
  }
  y += 10;

  // 7. ABCDE Assessment (if High Risk / Melanoma-related)
  const isMelanoma = report.predictedCondition?.toLowerCase().includes('melanoma');
  if (isMelanoma || report.riskLevel === 'High') {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ABCDE ASSESSMENT', 15, y);
    y += 4;
    doc.line(15, y, 195, y);
    y += 8;

    doc.setFontSize(10);
    const abcde = report.abcdeAssessment || {};
    
    doc.setFont('helvetica', 'bold');
    doc.text('A – Asymmetry:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(abcde.asymmetry || 'Not provided', 48, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('B – Border:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(abcde.border || 'Not provided', 48, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('C – Color:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(abcde.color || 'Not provided', 48, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('D – Diameter:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(abcde.diameter || 'Not provided', 48, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('E – Evolution:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(abcde.evolution || 'Not provided', 48, y);
    y += 12;
  }

  if (y > 210) {
    doc.addPage();
    y = 20;
  }

  // 8. Recommended Next Steps
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMMENDED NEXT STEPS', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (report.recommendations && report.recommendations.length > 0) {
    report.recommendations.forEach(rec => {
      doc.text(`• ${rec}`, 15, y);
      y += 5;
    });
  } else {
    doc.text('• Consider evaluation by a qualified dermatologist.', 15, y);
    y += 5;
  }
  y += 10;

  if (y > 210) {
    doc.addPage();
    y = 20;
  }

  // 9. Dermatologist Review
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DERMATOLOGIST CLINICAL REVIEW', 15, y);
  y += 4;
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  const rev = report.dermatologistReview || {};
  doc.setFont('helvetica', 'bold');
  doc.text(`Review Status: ${rev.status === 'Reviewed' ? 'Reviewed' : 'Pending Review'}`, 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  if (rev.status === 'Reviewed') {
    doc.text(`Reviewed By: ${rev.doctorName || 'Dermatologist'}`, 15, y);
    doc.text(`Review Date: ${rev.reviewDate || 'Not provided'}`, 195, y, { align: 'right' });
    y += 6;
    doc.text(`Clinical Opinion: ${rev.clinicalOpinion || 'Not provided'}`, 15, y);
    y += 6;
    if (rev.prescription) {
      doc.setFont('helvetica', 'bold');
      doc.text('Prescription details:', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${rev.prescription}`, 60, y);
      y += 6;
    }
  } else {
    doc.text('Pending Dermatologist Review - queued for clinical sign-off.', 15, y);
    y += 6;
  }
  y += 15;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // 10. Medical Disclaimer Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'oblique');
  doc.setTextColor(127, 140, 141);
  const disclaimerText = 'Medical Disclaimer: This report is generated using AI-assisted analysis for educational and screening support. It is not a confirmed medical diagnosis and does not replace evaluation, diagnosis, or treatment by a qualified healthcare professional.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, 180);
  doc.text(disclaimerLines, 15, y);
  y += 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 210, 255);
  doc.text('Tele-Derma AI - Clinical Decision Support System', 105, y, { align: 'center' });

  // Save the PDF
  doc.save(`Tele-Derma-Report-${report.id}.pdf`);
};
