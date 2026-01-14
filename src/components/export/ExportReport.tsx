import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface Calculation {
  id: string;
  timestamp: Date;
  pipeGrade: string;
  outerDiameter: number;
  innerDiameter: number;
  weight: number;
  burst: number;
  collapse: number;
  drilling?: DrillingCalc;
  running?: RunningCalc;
  hydraulics?: HydraulicsCalc;
  connections?: ConnectionCalc;
}

interface DrillingCalc {
  torque: number;
  hookLoad: number;
  drillingForce: number;
  maxRPM: number;
  axialLoad: number;
  mechanicalSpeed: number;
  wob: number;
  bitTorque?: number;
}

interface RunningCalc {
  runningLoad: number;
  buoyantWeight: number;
  dragForce: number;
  maxRunningSpeed: number;
  pressureAtBottom: number;
  velocityAnnulus: number;
}

interface HydraulicsCalc {
  flowRate: number;
  pressureLossPipe: number;
  pressureLossAnnulus: number;
  totalPressureLoss: number;
  criticalVelocity: number;
  annulusVelocity: number;
  cleaningEfficiency: number;
}

interface ConnectionCalc {
  maxTorqueConnection: number;
  torqueSafetyFactor: number;
  maxAxialLoad: number;
  axialSafetyFactor: number;
  connectionType: string;
}

interface ExportReportProps {
  calculation: Calculation;
  projectName?: string;
  wellName?: string;
  depth?: string;
  mudWeight?: string;
  wallThickness?: string;
  bitType?: string;
}

export default function ExportReport({ 
  calculation, 
  projectName = 'Расчет обсадной колонны',
  wellName = '-',
  depth = '0',
  mudWeight = '0',
  wallThickness = '0',
  bitType = 'PDC'
}: ExportReportProps) {

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(projectName, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Дата: ${calculation.timestamp.toLocaleString('ru-RU')}`, 14, 30);
    doc.text(`Скважина: ${wellName}`, 14, 36);
    
    const basicData = [
      ['Параметр', 'Значение'],
      ['Марка стали', calculation.pipeGrade],
      ['Наружный диаметр', `${calculation.outerDiameter.toFixed(1)} мм`],
      ['Внутренний диаметр', `${calculation.innerDiameter.toFixed(1)} мм`],
      ['Толщина стенки', `${wallThickness} мм`],
      ['Вес трубы', `${calculation.weight.toFixed(2)} кг/м`],
      ['Глубина', `${depth} м`],
      ['Плотность раствора', `${mudWeight} кг/м³`],
      ['Предел разрыва (Burst)', `${(calculation.burst / 1000).toFixed(1)} МПа`],
      ['Предел смятия (Collapse)', `${(calculation.collapse / 1000).toFixed(1)} МПа`],
    ];

    autoTable(doc, {
      startY: 42,
      head: [basicData[0]],
      body: basicData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 'auto' }
      }
    });

    let currentY = (doc as any).lastAutoTable.finalY + 10;

    if (calculation.drilling) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('РАСЧЕТ БУРЕНИЯ', 14, currentY);
      currentY += 6;

      const drillingData = [
        ['Параметр', 'Значение'],
        ['Крутящий момент на поверхности', `${calculation.drilling.torque.toFixed(2)} кН·м`],
        ['Крутящий момент на долоте', `${(calculation.drilling.bitTorque || 0).toFixed(2)} кН·м`],
        ['Нагрузка на крюк', `${calculation.drilling.hookLoad.toFixed(1)} кН`],
        ['Осевая нагрузка', `${calculation.drilling.axialLoad.toFixed(1)} кН`],
        ['Вес на долото (WOB)', `${calculation.drilling.wob.toFixed(1)} кН`],
        ['Макс. обороты', `${calculation.drilling.maxRPM.toFixed(0)} об/мин`],
        ['Механическая скорость', `${calculation.drilling.mechanicalSpeed.toFixed(2)} м/ч`],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [drillingData[0]],
        body: drillingData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 'auto' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (calculation.running) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('РАСЧЕТ СПУСКА', 14, currentY);
      currentY += 6;

      const runningData = [
        ['Параметр', 'Значение'],
        ['Нагрузка при спуске', `${calculation.running.runningLoad.toFixed(1)} кН`],
        ['Вес в растворе', `${calculation.running.buoyantWeight.toFixed(1)} кН`],
        ['Сила трения', `${calculation.running.dragForce.toFixed(1)} кН`],
        ['Скорость спуска', `${calculation.running.maxRunningSpeed.toFixed(2)} м/мин`],
        ['Давление на забое', `${calculation.running.pressureAtBottom.toFixed(2)} МПа`],
        ['Скорость в затрубье', `${calculation.running.velocityAnnulus.toFixed(2)} м/с`],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [runningData[0]],
        body: runningData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 'auto' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (calculation.hydraulics) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ГИДРАВЛИЧЕСКИЙ РАСЧЕТ', 14, currentY);
      currentY += 6;

      const hydraulicsData = [
        ['Параметр', 'Значение'],
        ['Расход раствора', `${calculation.hydraulics.flowRate.toFixed(1)} л/с`],
        ['Потери в трубах', `${calculation.hydraulics.pressureLossPipe.toFixed(2)} МПа`],
        ['Потери в затрубье', `${calculation.hydraulics.pressureLossAnnulus.toFixed(2)} МПа`],
        ['Общие потери', `${calculation.hydraulics.totalPressureLoss.toFixed(2)} МПа`],
        ['Критическая скорость', `${calculation.hydraulics.criticalVelocity.toFixed(2)} м/с`],
        ['Скорость в затрубье', `${calculation.hydraulics.annulusVelocity.toFixed(2)} м/с`],
        ['Эффективность очистки', `${calculation.hydraulics.cleaningEfficiency.toFixed(0)}%`],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [hydraulicsData[0]],
        body: hydraulicsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 'auto' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    if (calculation.connections) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('ПРОЧНОСТЬ СОЕДИНЕНИЙ', 14, currentY);
      currentY += 6;

      const connectionsData = [
        ['Параметр', 'Значение'],
        ['Тип резьбы', calculation.connections.connectionType],
        ['Макс. момент резьбы', `${calculation.connections.maxTorqueConnection.toFixed(2)} кН·м`],
        ['Запас по моменту', `${calculation.connections.torqueSafetyFactor.toFixed(2)}`],
        ['Макс. осевая нагрузка', `${calculation.connections.maxAxialLoad.toFixed(1)} кН`],
        ['Запас по нагрузке', `${calculation.connections.axialSafetyFactor.toFixed(2)}`],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [connectionsData[0]],
        body: connectionsData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { cellWidth: 'auto' }
        }
      });
    }

    doc.setFontSize(8);
    doc.setTextColor(128);
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Страница ${i} из ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${projectName}_${calculation.timestamp.toLocaleDateString('ru-RU')}.pdf`);
  };

  const exportToWord = async () => {
    const sections = [];

    sections.push(
      new Paragraph({
        text: projectName,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Дата: ${calculation.timestamp.toLocaleString('ru-RU')}`, break: 1 }),
          new TextRun({ text: `Скважина: ${wellName}`, break: 1 }),
          new TextRun({ text: `Тип долота: ${bitType}`, break: 1 }),
        ],
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: 'ОСНОВНЫЕ ПАРАМЕТРЫ',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 }
      })
    );

    const basicTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Параметр', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Значение', bold: true })] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Марка стали')] }),
            new TableCell({ children: [new Paragraph(calculation.pipeGrade)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Наружный диаметр')] }),
            new TableCell({ children: [new Paragraph(`${calculation.outerDiameter.toFixed(1)} мм`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Внутренний диаметр')] }),
            new TableCell({ children: [new Paragraph(`${calculation.innerDiameter.toFixed(1)} мм`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Толщина стенки')] }),
            new TableCell({ children: [new Paragraph(`${wallThickness} мм`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Вес трубы')] }),
            new TableCell({ children: [new Paragraph(`${calculation.weight.toFixed(2)} кг/м`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Глубина')] }),
            new TableCell({ children: [new Paragraph(`${depth} м`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Плотность раствора')] }),
            new TableCell({ children: [new Paragraph(`${mudWeight} кг/м³`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Предел разрыва (Burst)')] }),
            new TableCell({ children: [new Paragraph(`${(calculation.burst / 1000).toFixed(1)} МПа`)] }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Предел смятия (Collapse)')] }),
            new TableCell({ children: [new Paragraph(`${(calculation.collapse / 1000).toFixed(1)} МПа`)] }),
          ]
        }),
      ]
    });

    sections.push(basicTable);

    if (calculation.drilling) {
      sections.push(
        new Paragraph({
          text: 'РАСЧЕТ БУРЕНИЯ',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const drillingTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Параметр', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Значение', bold: true })] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Крутящий момент на поверхности')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.torque.toFixed(2)} кН·м`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Крутящий момент на долоте')] }),
              new TableCell({ children: [new Paragraph(`${(calculation.drilling.bitTorque || 0).toFixed(2)} кН·м`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Нагрузка на крюк')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.hookLoad.toFixed(1)} кН`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Осевая нагрузка')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.axialLoad.toFixed(1)} кН`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Вес на долото (WOB)')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.wob.toFixed(1)} кН`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Макс. обороты')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.maxRPM.toFixed(0)} об/мин`)] }),
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('Механическая скорость')] }),
              new TableCell({ children: [new Paragraph(`${calculation.drilling.mechanicalSpeed.toFixed(2)} м/ч`)] }),
            ]
          }),
        ]
      });

      sections.push(drillingTable);
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    const { Packer } = await import('docx');
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${projectName}_${calculation.timestamp.toLocaleDateString('ru-RU')}.docx`);
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Icon name="FileText" size={16} />
        Экспорт в PDF
      </Button>
      <Button
        onClick={exportToWord}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Icon name="FileDown" size={16} />
        Экспорт в Word
      </Button>
    </div>
  );
}