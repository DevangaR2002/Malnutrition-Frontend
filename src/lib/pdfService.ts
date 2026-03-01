import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PredictionResponse } from "./types";

export async function generatePredictionPDF(data: PredictionResponse) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  const addText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10,
  ) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * (fontSize / 2.5);
  };

  pdf.setFillColor(16, 185, 129);
  pdf.rect(margin, yPos, 8, 8, "F");
  pdf.setTextColor(16, 185, 129);
  pdf.setFontSize(18);
  pdf.setFont("", "bold");
  pdf.text("MalnutriAid", margin + 10, yPos + 6);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Malnutrition Risk Analysis Platform", margin + 10, yPos + 11);

  yPos += 20;

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(16);
  pdf.setFont("", "bold");
  pdf.text("Clinical Assessment Report", margin, yPos);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setFont("", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Subject ID: #${data.id}`, margin, yPos);
  pdf.text(
    `Generated: ${new Date(data.created_at).toLocaleString()}`,
    pageWidth - margin - 50,
    yPos,
  );
  yPos += 10;

  pdf.setDrawColor(239, 68, 68);
  pdf.setLineWidth(2);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 35);

  const riskLevel = data.risk_level;
  const isHighRisk = riskLevel.toLowerCase().includes("high");
  const fillColor = isHighRisk ? [254, 242, 242] : [236, 253, 245];
  pdf.setFillColor(...(fillColor as [number, number, number]));
  pdf.setDrawColor(
    ...((isHighRisk ? [254, 202, 202] : [167, 243, 208]) as unknown as [
      number,
      number,
      number,
    ]),
  );
  pdf.roundedRect(margin + 50, yPos + 5, 30, 6, 2, 2, "FD");
  pdf.setFontSize(8);
  const textColor = isHighRisk ? [185, 28, 28] : [4, 120, 87];
  pdf.setTextColor(...(textColor as [number, number, number]));
  pdf.setFont("", "bold");
  pdf.text(riskLevel.toUpperCase(), margin + 52, yPos + 9);

  pdf.setFontSize(24);
  pdf.setTextColor(220, 38, 38);
  pdf.setFont("", "bold");
  const riskPct = (data.risk_probability * 100).toFixed(1) + "%";
  pdf.text(riskPct, margin + 5, yPos + 20);

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("", "normal");
  pdf.text("RISK PROBABILITY", margin + 5, yPos + 25);

  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont("", "bold");
  pdf.text("Malnutrition Detected", margin + 50, yPos + 17);

  pdf.setFontSize(9);
  pdf.setFont("", "normal");
  pdf.setTextColor(71, 85, 105);
  yPos = addText(
    "The model has identified a high probability of acute malnutrition based on current clinical indicators and household data.",
    margin + 50,
    yPos + 22,
    pageWidth - 2 * margin - 50,
    9,
  );

  yPos += 20;

  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont("", "bold");
  pdf.text("Model Confidence:", margin, yPos);
  pdf.setFont("", "normal");
  pdf.text(data.confidence, margin + 40, yPos);
  yPos += 7;

  if (data.input_summary) {
    pdf.setFont("", "bold");
    pdf.text("Child Information:", margin, yPos);
    yPos += 5;
    pdf.setFont("", "normal");
    pdf.setFontSize(9);

    if (data.input_summary.age_months) {
      pdf.text(
        `Age: ${data.input_summary.age_months} months`,
        margin + 5,
        yPos,
      );
      yPos += 5;
    }
    if (data.input_summary.gender) {
      pdf.text(`Gender: ${data.input_summary.gender}`, margin + 5, yPos);
      yPos += 5;
    }
    if (data.input_summary.height_cm) {
      pdf.text(`Height: ${data.input_summary.height_cm} cm`, margin + 5, yPos);
      yPos += 5;
    }
    if (data.input_summary.weight_kg) {
      pdf.text(`Weight: ${data.input_summary.weight_kg} kg`, margin + 5, yPos);
      yPos += 7;
    }
  }

  if (data.xai_text) {
    pdf.setFontSize(12);
    pdf.setFont("", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Why this result? (XAI)", margin, yPos);
    yPos += 6;

    pdf.setFontSize(9);
    pdf.setFont("", "normal");
    pdf.setTextColor(71, 85, 105);
    yPos = addText(data.xai_text, margin, yPos, pageWidth - 2 * margin, 9);
    yPos += 5;
  }

  if (data.xai?.top_factors && data.xai.top_factors.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont("", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text("Top Contributing Factors:", margin, yPos);
    yPos += 6;

    data.xai.top_factors.slice(0, 5).forEach((factor) => {
      const label = factor.feature.replace(/_/g, " ");
      const impact = (factor.impact * 100).toFixed(1);
      const isPositive = factor.impact > 0;

      pdf.setFontSize(9);
      pdf.setFont("", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text(`• ${label}`, margin + 2, yPos);

      pdf.setFont("", "bold");
      const textColor = isPositive ? [220, 38, 38] : [5, 150, 105];
      pdf.setTextColor(...(textColor as [number, number, number]));
      pdf.text(
        `${isPositive ? "+" : ""}${impact}% ${isPositive ? "Impact" : "Protective"}`,
        pageWidth - margin - 40,
        yPos,
      );

      yPos += 5;
    });
    yPos += 3;
  }

  if (yPos > pageHeight - 80) {
    pdf.addPage();
    yPos = margin;
  }

  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  pdf.setFontSize(12);
  pdf.setFont("", "bold");
  pdf.setTextColor(15, 23, 42);
  pdf.text("Required Actions & Recommendations", margin, yPos);
  yPos += 8;

  data.recommendations.forEach((rec, index) => {
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }

    const category = rec.category.toLowerCase();
    let priority = "SUPPORTIVE";
    let badgeColor: [number, number, number] = [236, 253, 245]; // emerald-50

    if (
      category.includes("immediate") ||
      category.includes("clinical") ||
      category.includes("high")
    ) {
      priority = "HIGH PRIORITY";
      badgeColor = [254, 242, 242]; // rose-50
    } else if (category.includes("nutrition") || category.includes("feeding")) {
      priority = "MEDIUM PRIORITY";
      badgeColor = [254, 243, 199]; // amber-50
    }

    pdf.setFillColor(...(badgeColor as [number, number, number]));
    pdf.roundedRect(margin, yPos - 1, pageWidth - 2 * margin, 8, 1, 1, "F");

    pdf.setFontSize(10);
    pdf.setFont("", "bold");
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${index + 1}. ${rec.category}`, margin + 2, yPos + 4);

    pdf.setFontSize(7);
    pdf.setFont("", "bold");
    pdf.text(priority, pageWidth - margin - 30, yPos + 4);

    yPos += 10;

    pdf.setFontSize(9);
    pdf.setFont("", "normal");
    pdf.setTextColor(51, 65, 85);
    yPos = addText(
      rec.recommendation,
      margin + 2,
      yPos,
      pageWidth - 2 * margin - 4,
      9,
    );

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("", "italic");
    yPos = addText(
      `Source: ${rec.source}`,
      margin + 2,
      yPos + 2,
      pageWidth - 2 * margin - 4,
      8,
    );

    yPos += 6;
  });

  yPos = pageHeight - 20;
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont("", "normal");
  pdf.text(
    "© 2024 MalnutriAid - Professional Clinical Use Only",
    margin,
    yPos,
  );
  pdf.text(
    "Aligned with WHO Child Growth Standards (2013)",
    pageWidth - margin - 70,
    yPos,
  );

  const filename = `malnutrition-risk-report-${data.id}-${Date.now()}.pdf`;
  pdf.save(filename);
}

export async function generatePDFFromHTML(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;

  pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
}
