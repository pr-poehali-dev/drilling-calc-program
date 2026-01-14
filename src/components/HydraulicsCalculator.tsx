import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface NozzleData {
  id: number;
  diameter: number; // мм
}

export interface HydraulicsResult {
  flowRate: number; // л/с
  pumpPressure: number; // МПа
  bitPressureDrop: number; // МПа
  pipePressureDrop: number; // МПа
  annulusPressureDrop: number; // МПа
  totalPressureDrop: number; // МПа
  annulusVelocity: number; // м/с
  criticalVelocity: number; // м/с
  reynoldsNumber: number;
  hydraulicPower: number; // кВт
  bitHydraulicPower: number; // кВт
  jetVelocity: number; // м/с
  jetImpactForce: number; // кН
  plasticityIndex: number; // ИЦП
  nozzles: NozzleData[];
}

interface HydraulicsCalculatorProps {
  onCalculate: (result: HydraulicsResult) => void;
  pipeOD: number;
  pipeID: number;
  holeID: number;
  depth: number;
  mudDensity: number;
  mudViscosity: number;
}

export default function HydraulicsCalculator({ 
  onCalculate, 
  pipeOD, 
  pipeID, 
  holeID, 
  depth,
  mudDensity,
  mudViscosity 
}: HydraulicsCalculatorProps) {
  const [nozzles, setNozzles] = useState<NozzleData[]>([
    { id: 1, diameter: 12 },
    { id: 2, diameter: 12 },
    { id: 3, diameter: 12 }
  ]);
  
  const [flowRate, setFlowRate] = useState<number>(30); // л/с
  const [pumpPressure, setPumpPressure] = useState<number>(25); // МПа
  const [yieldPoint, setYieldPoint] = useState<number>(8); // Па
  const [powerLawIndex, setPowerLawIndex] = useState<number>(0.6);

  const addNozzle = () => {
    if (nozzles.length < 12) {
      setNozzles([...nozzles, { id: nozzles.length + 1, diameter: 12 }]);
    }
  };

  const removeNozzle = (id: number) => {
    if (nozzles.length > 1) {
      setNozzles(nozzles.filter(n => n.id !== id));
    }
  };

  const updateNozzleDiameter = (id: number, diameter: number) => {
    setNozzles(nozzles.map(n => n.id === id ? { ...n, diameter } : n));
  };

  const calculateHydraulics = () => {
    // Конвертация единиц
    const Q = flowRate / 1000; // м³/с
    const pipeODm = pipeOD / 1000; // м
    const pipeIDm = pipeID / 1000; // м
    const holeIDm = holeID / 1000; // м
    const rho = mudDensity * 1000; // кг/м³
    const mu = mudViscosity / 1000; // Па·с

    // Площади
    const pipeArea = Math.PI * Math.pow(pipeIDm / 2, 2);
    const annulusArea = Math.PI * (Math.pow(holeIDm / 2, 2) - Math.pow(pipeODm / 2, 2));
    
    // Скорости
    const pipeVelocity = Q / pipeArea; // м/с
    const annulusVelocity = Q / annulusArea; // м/с

    // Число Рейнольдса
    const Re = (rho * annulusVelocity * (holeIDm - pipeODm)) / mu;
    
    // Критическая скорость (турбулентность)
    const criticalVelocity = (2100 * mu) / (rho * (holeIDm - pipeODm));

    // Потери в трубе (формула Дарси-Вейсбаха)
    const f_pipe = Re < 2100 ? 64 / Re : 0.316 / Math.pow(Re, 0.25);
    const pipePressureDrop = (f_pipe * depth * rho * Math.pow(pipeVelocity, 2)) / (2 * pipeIDm * 1e6); // МПа

    // Потери в затрубье
    const Dh = holeIDm - pipeODm; // Гидравлический диаметр
    const f_annulus = Re < 2100 ? 64 / Re : 0.316 / Math.pow(Re, 0.25);
    const annulusPressureDrop = (f_annulus * depth * rho * Math.pow(annulusVelocity, 2)) / (2 * Dh * 1e6); // МПа

    // Расчёт потерь на насадках
    const totalNozzleArea = nozzles.reduce((sum, n) => 
      sum + Math.PI * Math.pow((n.diameter / 1000) / 2, 2), 0
    );
    const jetVelocity = Q / totalNozzleArea; // м/с
    const bitPressureDrop = (rho * Math.pow(jetVelocity, 2)) / (2 * 1e6); // МПа

    const totalPressureDrop = pipePressureDrop + annulusPressureDrop + bitPressureDrop;

    // Гидравлическая мощность
    const hydraulicPower = (Q * pumpPressure * 1e6) / 1000; // кВт
    const bitHydraulicPower = (Q * bitPressureDrop * 1e6) / 1000; // кВт

    // Ударная сила струи
    const jetImpactForce = rho * Q * jetVelocity / 1000; // кН

    // Индекс циркуляции пластичности (ИЦП)
    // ИЦП = (τ₀ × V_ann) / (μ_p × V_crit)
    const plasticityIndex = (yieldPoint * annulusVelocity) / (mu * criticalVelocity);

    const result: HydraulicsResult = {
      flowRate,
      pumpPressure,
      bitPressureDrop,
      pipePressureDrop,
      annulusPressureDrop,
      totalPressureDrop,
      annulusVelocity,
      criticalVelocity,
      reynoldsNumber: Re,
      hydraulicPower,
      bitHydraulicPower,
      jetVelocity,
      jetImpactForce,
      plasticityIndex,
      nozzles
    };

    onCalculate(result);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Droplets" size={20} />
          Гидравлический расчёт
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Параметры насоса */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flowRate">Расход раствора, л/с</Label>
            <Input
              id="flowRate"
              type="number"
              value={flowRate}
              onChange={(e) => setFlowRate(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pumpPressure">Давление насоса, МПа</Label>
            <Input
              id="pumpPressure"
              type="number"
              value={pumpPressure}
              onChange={(e) => setPumpPressure(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
          </div>
        </div>

        {/* Реологические параметры */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yieldPoint">Динамическое напряжение сдвига, Па</Label>
            <Input
              id="yieldPoint"
              type="number"
              value={yieldPoint}
              onChange={(e) => setYieldPoint(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="powerLawIndex">Индекс степенного закона (n)</Label>
            <Input
              id="powerLawIndex"
              type="number"
              value={powerLawIndex}
              onChange={(e) => setPowerLawIndex(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0.1"
              max="1"
            />
          </div>
        </div>

        {/* Насадки долота */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Насадки долота</Label>
            <Badge variant="outline">{nozzles.length} / 12</Badge>
          </div>

          <div className="grid gap-3">
            {nozzles.map((nozzle) => (
              <div key={nozzle.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm w-24">Насадка {nozzle.id}</Label>
                    <Input
                      type="number"
                      value={nozzle.diameter}
                      onChange={(e) => updateNozzleDiameter(nozzle.id, parseFloat(e.target.value) || 0)}
                      step="0.5"
                      min="6"
                      max="32"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">мм</span>
                  </div>
                </div>
                {nozzles.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNozzle(nozzle.id)}
                    className="h-8 w-8"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {nozzles.length < 12 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addNozzle}
              className="w-full"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить насадку
            </Button>
          )}
        </div>

        <Button onClick={calculateHydraulics} className="w-full" size="lg">
          <Icon name="Calculator" size={18} className="mr-2" />
          Рассчитать гидравлику
        </Button>
      </CardContent>
    </Card>
  );
}
