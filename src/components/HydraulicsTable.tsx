import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { HydraulicsResult } from './HydraulicsCalculator';

interface HydraulicsTableProps {
  hydraulics: HydraulicsResult;
  pipeID: number;
  pipeOD: number;
  holeID: number;
  depth: number;
}

export default function HydraulicsTable({ 
  hydraulics, 
  pipeID, 
  pipeOD, 
  holeID, 
  depth 
}: HydraulicsTableProps) {
  const annularClearance = (holeID - pipeOD) / 2;
  const nozzleTotalArea = hydraulics.nozzles.reduce(
    (sum, n) => sum + Math.PI * Math.pow(n.diameter / 2, 2), 0
  );

  const parameters = [
    {
      category: 'Геометрия',
      items: [
        { name: 'Внутренний диаметр трубы', value: pipeID.toFixed(1), unit: 'мм' },
        { name: 'Наружный диаметр трубы', value: pipeOD.toFixed(1), unit: 'мм' },
        { name: 'Диаметр скважины', value: holeID.toFixed(1), unit: 'мм' },
        { name: 'Зазор в затрубье', value: annularClearance.toFixed(1), unit: 'мм' },
        { name: 'Глубина скважины', value: depth.toFixed(0), unit: 'м' }
      ]
    },
    {
      category: 'Насосные параметры',
      items: [
        { name: 'Расход раствора', value: hydraulics.flowRate.toFixed(1), unit: 'л/с' },
        { name: 'Давление насоса', value: hydraulics.pumpPressure.toFixed(2), unit: 'МПа' },
        { name: 'Гидравлическая мощность', value: hydraulics.hydraulicPower.toFixed(1), unit: 'кВт' }
      ]
    },
    {
      category: 'Потери давления',
      items: [
        { name: 'В трубе', value: hydraulics.pipePressureDrop.toFixed(2), unit: 'МПа' },
        { name: 'В затрубье', value: hydraulics.annulusPressureDrop.toFixed(2), unit: 'МПа' },
        { name: 'На долоте', value: hydraulics.bitPressureDrop.toFixed(2), unit: 'МПа' },
        { name: 'Общие потери', value: hydraulics.totalPressureDrop.toFixed(2), unit: 'МПа', highlight: true }
      ]
    },
    {
      category: 'Параметры долота',
      items: [
        { name: 'Количество насадок', value: hydraulics.nozzles.length.toString(), unit: 'шт' },
        { name: 'Общая площадь насадок', value: nozzleTotalArea.toFixed(1), unit: 'мм²' },
        { name: 'Скорость истечения', value: hydraulics.jetVelocity.toFixed(2), unit: 'м/с' },
        { name: 'Ударная сила струи', value: hydraulics.jetImpactForce.toFixed(2), unit: 'кН' },
        { name: 'Гидравлическая мощность долота', value: hydraulics.bitHydraulicPower.toFixed(1), unit: 'кВт', highlight: true }
      ]
    },
    {
      category: 'Гидродинамика',
      items: [
        { name: 'Скорость в затрубье', value: hydraulics.annulusVelocity.toFixed(3), unit: 'м/с' },
        { name: 'Критическая скорость', value: hydraulics.criticalVelocity.toFixed(3), unit: 'м/с' },
        { name: 'Число Рейнольдса', value: hydraulics.reynoldsNumber.toFixed(0), unit: '-' },
        { 
          name: 'Режим течения', 
          value: hydraulics.reynoldsNumber < 2100 ? 'Ламинарный' : 'Турбулентный', 
          unit: '' 
        },
        { name: 'Индекс циркуляции пластичности', value: hydraulics.plasticityIndex.toFixed(2), unit: '-', highlight: true }
      ]
    }
  ];

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Table" size={20} />
          Таблица параметров гидравлики
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {parameters.map((section) => (
            <div key={section.category}>
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                {section.category}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Параметр</TableHead>
                    <TableHead className="text-right">Значение</TableHead>
                    <TableHead className="text-right w-20">Ед. изм.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.items.map((item, idx) => (
                    <TableRow key={idx} className={item.highlight ? 'bg-accent/20 font-semibold' : ''}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right font-mono">{item.value}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        {/* Насадки долота */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Конфигурация насадок долота
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead className="text-right">Диаметр, мм</TableHead>
                <TableHead className="text-right">Площадь, мм²</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hydraulics.nozzles.map((nozzle) => {
                const area = Math.PI * Math.pow(nozzle.diameter / 2, 2);
                return (
                  <TableRow key={nozzle.id}>
                    <TableCell>{nozzle.id}</TableCell>
                    <TableCell className="text-right font-mono">{nozzle.diameter.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">{area.toFixed(1)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-accent/20 font-semibold">
                <TableCell>ИТОГО</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right font-mono">{nozzleTotalArea.toFixed(1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
