import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import TorqueChart from '@/components/TorqueChart';
import CleaningChart from '@/components/CleaningChart';
import LoadChart from '@/components/LoadChart';
import NozzleConfig, { Nozzle } from '@/components/hydraulics/NozzleConfig';
import HydraulicsTable, { HydraulicsParams } from '@/components/hydraulics/HydraulicsTable';
import ExcelImport, { WellProfilePoint } from '@/components/wellProfile/ExcelImport';
import TorqueDepthChart, { TorqueData } from '@/components/torque/TorqueDepthChart';
import TripTorqueTable, { TripTorquePoint } from '@/components/torque/TripTorqueTable';
import HoleCleaningChart, { CleaningPillowData } from '@/components/cleaning/HoleCleaningChart';
import { RUSSIAN_PIPES, RussianPipe } from '@/data/russianPipes';
import { UnitSystem, UNITS, convert, FrictionCoefficients, DEFAULT_FRICTION_COEFFICIENTS } from '@/utils/unitConversion';

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

interface PipeData {
  outerDiameter: number;
  wallThickness: number;
  weight: number;
  grade: string;
  yieldStrength: number;
}

const API_PIPE_GRADES = {
  'H-40': { yield: 40000, tensile: 60000 },
  'J-55': { yield: 55000, tensile: 75000 },
  'K-55': { yield: 55000, tensile: 95000 },
  'N-80': { yield: 80000, tensile: 100000 },
  'L-80': { yield: 80000, tensile: 95000 },
  'C-90': { yield: 90000, tensile: 100000 },
  'P-110': { yield: 110000, tensile: 125000 },
};

const COMMON_SIZES = [
  { od: 4.5, wt: 0.205, weight: 9.5 },
  { od: 5.0, wt: 0.220, weight: 11.5 },
  { od: 5.5, wt: 0.244, weight: 14.0 },
  { od: 7.0, wt: 0.272, weight: 20.0 },
  { od: 9.625, wt: 0.352, weight: 36.0 },
  { od: 13.375, wt: 0.480, weight: 68.0 },
];

export default function Index() {
  const [selectedGrade, setSelectedGrade] = useState<string>('N-80');
  const [outerDiameter, setOuterDiameter] = useState<string>('9.625');
  const [wallThickness, setWallThickness] = useState<string>('0.352');
  const [weight, setWeight] = useState<string>('36.0');
  const [depth, setDepth] = useState<string>('5000');
  const [mudWeight, setMudWeight] = useState<string>('10.5');
  const [bitDiameter, setBitDiameter] = useState<string>('8.5');
  const [rpm, setRpm] = useState<string>('60');
  const [flowRate, setFlowRate] = useState<string>('200');
  const [mudViscosity, setMudViscosity] = useState<string>('40');
  const [wellDiameter, setWellDiameter] = useState<string>('12.25');
  const [axialLoad, setAxialLoad] = useState<string>('5');
  const [pipeLength, setPipeLength] = useState<string>('30');
  const [connectionType, setConnectionType] = useState<string>('Buttress');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [calculationType, setCalculationType] = useState<'pressure' | 'drilling' | 'running' | 'hydraulics'>('pressure');
  const [showCharts, setShowCharts] = useState(false);

  const calculateBurstPressure = (od: number, wt: number, grade: string): number => {
    const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield;
    return (2 * yieldStrength * wt) / od;
  };

  const calculateCollapsePressure = (od: number, wt: number, grade: string): number => {
    const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield;
    const ratio = od / wt;
    
    if (ratio <= 15) {
      return (2 * yieldStrength) / (ratio - 1);
    } else if (ratio <= 25) {
      return yieldStrength / (0.465 * ratio - 6.775);
    } else {
      return (46950000) / (Math.pow(ratio, 3));
    }
  };

  const calculateDrillingParams = (od: number, wt: number, grade: string, depth: number, rpm: number, bitDia: number, axLoad: number): DrillingCalc => {
    const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield;
    const area = Math.PI * ((od * od) - ((od - 2 * wt) * (od - 2 * wt))) / 4;
    const pipeWeight = parseFloat(weight);
    
    const torque = (od / 12) * (yieldStrength * area * 0.5) / 1000;
    const hookLoad = (pipeWeight * depth) * 1.15;
    const drillingForce = (bitDia * bitDia * 0.785) * (yieldStrength * 0.7);
    const maxRPM = Math.min(120, 300000 / (od * depth));
    const wob = axLoad * 2000;
    const mechanicalSpeed = (rpm * bitDia * 0.5) / (wob / 1000);
    
    return {
      torque: Math.round(torque),
      hookLoad: Math.round(hookLoad),
      drillingForce: Math.round(drillingForce),
      maxRPM: Math.round(maxRPM),
      axialLoad: Math.round(wob),
      mechanicalSpeed: Math.round(mechanicalSpeed * 10) / 10,
      wob
    };
  };

  const calculateRunningParams = (od: number, depth: number, mudWt: number, pipeWt: number, wellDia: number): RunningCalc => {
    const buoyancyFactor = 1 - (mudWt / 65.5);
    
    const runningLoad = (pipeWt * depth) * 1.2;
    const buoyantWeight = (pipeWt * depth) * buoyancyFactor;
    const dragForce = buoyantWeight * 0.25;
    const maxRunningSpeed = Math.max(30, 180 - (depth / 100));
    
    const pressureGradient = mudWt * 0.052;
    const pressureAtBottom = pressureGradient * depth;
    
    const annulusArea = Math.PI * ((wellDia * wellDia) - (od * od)) / 4;
    const velocityAnnulus = 24.5 / annulusArea;
    
    return {
      runningLoad: Math.round(runningLoad),
      buoyantWeight: Math.round(buoyantWeight),
      dragForce: Math.round(dragForce),
      maxRunningSpeed: Math.round(maxRunningSpeed),
      pressureAtBottom: Math.round(pressureAtBottom),
      velocityAnnulus: Math.round(velocityAnnulus * 10) / 10
    };
  };

  const calculateHydraulics = (od: number, id: number, depth: number, flowRate: number, mudWt: number, viscosity: number, wellDia: number): HydraulicsCalc => {
    const pipeArea = Math.PI * (id * id) / 4;
    const annulusArea = Math.PI * ((wellDia * wellDia) - (od * od)) / 4;
    
    const velocityPipe = (flowRate * 0.408) / pipeArea;
    const velocityAnnulus = (flowRate * 0.408) / annulusArea;
    
    const reynoldsPipe = (928 * mudWt * velocityPipe * id) / viscosity;
    const reynoldsAnnulus = (928 * mudWt * velocityAnnulus * (wellDia - od)) / viscosity;
    
    const frictionPipe = reynoldsPipe < 2100 ? 64 / reynoldsPipe : 0.316 / Math.pow(reynoldsPipe, 0.25);
    const frictionAnnulus = reynoldsAnnulus < 2100 ? 64 / reynoldsAnnulus : 0.316 / Math.pow(reynoldsAnnulus, 0.25);
    
    const pressureLossPipe = (frictionPipe * mudWt * velocityPipe * velocityPipe * depth) / (25.8 * id);
    const pressureLossAnnulus = (frictionAnnulus * mudWt * velocityAnnulus * velocityAnnulus * depth) / (25.8 * (wellDia - od));
    
    const totalPressureLoss = pressureLossPipe + pressureLossAnnulus;
    
    const criticalVelocity = (2100 * viscosity) / (928 * mudWt * id);
    
    const cleaningEfficiency = Math.min(100, (velocityAnnulus / (116 / (wellDia - od))) * 100);
    
    return {
      flowRate,
      pressureLossPipe: Math.round(pressureLossPipe),
      pressureLossAnnulus: Math.round(pressureLossAnnulus),
      totalPressureLoss: Math.round(totalPressureLoss),
      criticalVelocity: Math.round(criticalVelocity * 10) / 10,
      annulusVelocity: Math.round(velocityAnnulus * 10) / 10,
      cleaningEfficiency: Math.round(cleaningEfficiency)
    };
  };

  const calculateConnections = (od: number, wt: number, grade: string, connType: string): ConnectionCalc => {
    const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield;
    const area = Math.PI * ((od * od) - ((od - 2 * wt) * (od - 2 * wt))) / 4;
    
    const makeupTorqueMultiplier = connType === 'Buttress' ? 1.0 : connType === 'API-8rd' ? 0.85 : 1.15;
    const maxTorqueConnection = (od * yieldStrength * area * 0.6 * makeupTorqueMultiplier) / 12000;
    
    const maxAxialLoad = yieldStrength * area * 0.8;
    
    const currentTorque = parseFloat(outerDiameter) * 5000;
    const torqueSafetyFactor = maxTorqueConnection / (currentTorque / 1000);
    
    const currentAxial = parseFloat(weight) * parseFloat(depth);
    const axialSafetyFactor = maxAxialLoad / currentAxial;
    
    return {
      maxTorqueConnection: Math.round(maxTorqueConnection),
      torqueSafetyFactor: Math.round(torqueSafetyFactor * 100) / 100,
      maxAxialLoad: Math.round(maxAxialLoad),
      axialSafetyFactor: Math.round(axialSafetyFactor * 100) / 100,
      connectionType: connType
    };
  };

  const handleCalculate = () => {
    const od = parseFloat(outerDiameter);
    const wt = parseFloat(wallThickness);
    const w = parseFloat(weight);
    const d = parseFloat(depth);
    const mw = parseFloat(mudWeight);
    const bd = parseFloat(bitDiameter);
    const r = parseFloat(rpm);
    const fr = parseFloat(flowRate);
    const visc = parseFloat(mudViscosity);
    const wd = parseFloat(wellDiameter);
    const axLoad = parseFloat(axialLoad);

    if (!od || !wt || !w || !selectedGrade) return;

    const id = od - 2 * wt;
    const burst = calculateBurstPressure(od, wt, selectedGrade);
    const collapse = calculateCollapsePressure(od, wt, selectedGrade);
    
    let drilling: DrillingCalc | undefined;
    let running: RunningCalc | undefined;
    let hydraulics: HydraulicsCalc | undefined;
    let connections: ConnectionCalc | undefined;
    
    if (calculationType === 'drilling' && d && r && bd) {
      drilling = calculateDrillingParams(od, wt, selectedGrade, d, r, bd, axLoad);
    }
    
    if (calculationType === 'running' && d && mw && wd) {
      running = calculateRunningParams(od, d, mw, w, wd);
    }

    if (calculationType === 'hydraulics' && d && fr && mw && visc && wd) {
      hydraulics = calculateHydraulics(od, id, d, fr, mw, visc, wd);
    }

    connections = calculateConnections(od, wt, selectedGrade, connectionType);

    const newCalc: Calculation = {
      id: Date.now().toString(),
      timestamp: new Date(),
      pipeGrade: selectedGrade,
      outerDiameter: od,
      innerDiameter: id,
      weight: w,
      burst: Math.round(burst),
      collapse: Math.round(collapse),
      drilling,
      running,
      hydraulics,
      connections
    };

    setCalculations([newCalc, ...calculations.slice(0, 9)]);
    setShowCharts(true);
  };

  const loadPreset = (preset: typeof COMMON_SIZES[0]) => {
    setOuterDiameter(preset.od.toString());
    setWallThickness(preset.wt.toString());
    setWeight(preset.weight.toString());
  };

  return (
    <div className="min-h-screen bg-background engineering-grid-accent">
      <div className="engineering-grid min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                  <Icon name="Drill" className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">API Casing Calculator</h1>
                  <p className="text-sm text-muted-foreground">Расчет параметров обсадных труб по стандартам API 5CT</p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono">v2.0</Badge>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Calculator" size={20} />
                    Параметры трубы
                  </CardTitle>
                  <CardDescription>Введите технические характеристики обсадной трубы</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade" className="flex items-center gap-2">
                        <Icon name="ShieldCheck" size={16} />
                        Марка стали (API 5CT)
                      </Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger id="grade">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(API_PIPE_GRADES).map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade} ({API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield.toLocaleString()} psi)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="od" className="flex items-center gap-2">
                        <Icon name="Circle" size={16} />
                        Наружный диаметр (дюймы)
                      </Label>
                      <Input
                        id="od"
                        type="number"
                        step="0.001"
                        value={outerDiameter}
                        onChange={(e) => setOuterDiameter(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wt" className="flex items-center gap-2">
                        <Icon name="Layers" size={16} />
                        Толщина стенки (дюймы)
                      </Label>
                      <Input
                        id="wt"
                        type="number"
                        step="0.001"
                        value={wallThickness}
                        onChange={(e) => setWallThickness(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="flex items-center gap-2">
                        <Icon name="Weight" size={16} />
                        Вес (lb/ft)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm text-muted-foreground">Стандартные размеры:</Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SIZES.map((preset, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreset(preset)}
                          className="font-mono text-xs"
                        >
                          {preset.od}" × {preset.wt}" ({preset.weight} lb/ft)
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Тип расчета:</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={calculationType === 'pressure' ? 'default' : 'outline'}
                        onClick={() => setCalculationType('pressure')}
                        className="flex flex-col h-auto py-3"
                      >
                        <Icon name="Gauge" size={20} className="mb-1" />
                        <span className="text-xs">Прочность</span>
                      </Button>
                      <Button
                        variant={calculationType === 'drilling' ? 'default' : 'outline'}
                        onClick={() => setCalculationType('drilling')}
                        className="flex flex-col h-auto py-3"
                      >
                        <Icon name="Drill" size={20} className="mb-1" />
                        <span className="text-xs">Бурение</span>
                      </Button>
                      <Button
                        variant={calculationType === 'running' ? 'default' : 'outline'}
                        onClick={() => setCalculationType('running')}
                        className="flex flex-col h-auto py-3"
                      >
                        <Icon name="MoveDown" size={20} className="mb-1" />
                        <span className="text-xs">Спуск</span>
                      </Button>
                      <Button
                        variant={calculationType === 'hydraulics' ? 'default' : 'outline'}
                        onClick={() => setCalculationType('hydraulics')}
                        className="flex flex-col h-auto py-3"
                      >
                        <Icon name="Droplets" size={20} className="mb-1" />
                        <span className="text-xs">Гидравлика</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                    <Label className="text-xs font-semibold">Дополнительные параметры:</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="pipeLength" className="text-xs">Длина трубы (ft)</Label>
                        <Input
                          id="pipeLength"
                          type="number"
                          value={pipeLength}
                          onChange={(e) => setPipeLength(e.target.value)}
                          className="font-mono h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wellDiameter" className="text-xs">Диаметр скважины (")</Label>
                        <Input
                          id="wellDiameter"
                          type="number"
                          step="0.1"
                          value={wellDiameter}
                          onChange={(e) => setWellDiameter(e.target.value)}
                          className="font-mono h-8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connectionType" className="text-xs">Тип резьбы</Label>
                        <Select value={connectionType} onValueChange={setConnectionType}>
                          <SelectTrigger id="connectionType" className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Buttress">Buttress</SelectItem>
                            <SelectItem value="API-8rd">API 8-Round</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {calculationType === 'drilling' && (
                    <div className="grid md:grid-cols-4 gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="space-y-2">
                        <Label htmlFor="depth" className="flex items-center gap-2 text-xs">
                          <Icon name="ArrowDown" size={14} />
                          Глубина (ft)
                        </Label>
                        <Input
                          id="depth"
                          type="number"
                          value={depth}
                          onChange={(e) => setDepth(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rpm" className="flex items-center gap-2 text-xs">
                          <Icon name="RotateCw" size={14} />
                          Обороты (RPM)
                        </Label>
                        <Input
                          id="rpm"
                          type="number"
                          value={rpm}
                          onChange={(e) => setRpm(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bitDiameter" className="flex items-center gap-2 text-xs">
                          <Icon name="CircleDot" size={14} />
                          Диаметр башмака (")
                        </Label>
                        <Input
                          id="bitDiameter"
                          type="number"
                          step="0.1"
                          value={bitDiameter}
                          onChange={(e) => setBitDiameter(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="axialLoad" className="flex items-center gap-2 text-xs">
                          <Icon name="ArrowDown" size={14} />
                          Осевая нагрузка (т)
                        </Label>
                        <Input
                          id="axialLoad"
                          type="number"
                          step="0.5"
                          value={axialLoad}
                          onChange={(e) => setAxialLoad(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {calculationType === 'hydraulics' && (
                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="space-y-2">
                        <Label htmlFor="flowRate" className="flex items-center gap-2 text-xs">
                          <Icon name="Waves" size={14} />
                          Расход раствора (л/с)
                        </Label>
                        <Input
                          id="flowRate"
                          type="number"
                          value={flowRate}
                          onChange={(e) => setFlowRate(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mudViscosity" className="flex items-center gap-2 text-xs">
                          <Icon name="Droplet" size={14} />
                          Вязкость (сП)
                        </Label>
                        <Input
                          id="mudViscosity"
                          type="number"
                          value={mudViscosity}
                          onChange={(e) => setMudViscosity(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depth3" className="flex items-center gap-2 text-xs">
                          <Icon name="ArrowDown" size={14} />
                          Глубина (ft)
                        </Label>
                        <Input
                          id="depth3"
                          type="number"
                          value={depth}
                          onChange={(e) => setDepth(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {calculationType === 'running' && (
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="space-y-2">
                        <Label htmlFor="depth2" className="flex items-center gap-2 text-xs">
                          <Icon name="ArrowDown" size={14} />
                          Глубина спуска (ft)
                        </Label>
                        <Input
                          id="depth2"
                          type="number"
                          value={depth}
                          onChange={(e) => setDepth(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mudWeight" className="flex items-center gap-2 text-xs">
                          <Icon name="Droplet" size={14} />
                          Плотность раствора (ppg)
                        </Label>
                        <Input
                          id="mudWeight"
                          type="number"
                          step="0.1"
                          value={mudWeight}
                          onChange={(e) => setMudWeight(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <Button onClick={handleCalculate} className="w-full" size="lg">
                    <Icon name="Play" size={18} className="mr-2" />
                    Выполнить расчет
                  </Button>
                </CardContent>
              </Card>

              {calculations.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="LineChart" size={20} />
                      Результаты расчета
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 text-primary">
                          <Icon name="Gauge" size={20} />
                          <span className="font-semibold">Давление разрыва (Burst)</span>
                        </div>
                        <div className="text-4xl font-bold font-mono">{calculations[0].burst.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">psi (фунты на кв. дюйм)</div>
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Расчет по формуле API: (2 × Yield × WT) / OD
                        </div>
                      </div>

                      <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="flex items-center gap-2 text-accent">
                          <Icon name="ArrowDownToLine" size={20} />
                          <span className="font-semibold">Давление смятия (Collapse)</span>
                        </div>
                        <div className="text-4xl font-bold font-mono">{calculations[0].collapse.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">psi (фунты на кв. дюйм)</div>
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Расчет по API 5C3 (зависит от D/t)
                        </div>
                      </div>
                    </div>

                    {calculations[0].drilling && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Icon name="Drill" size={18} />
                            Параметры бурения
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-accent/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Крутящий момент</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].drilling.torque.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">ft-lbs</div>
                            </div>
                            <div className="p-3 bg-accent/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Нагрузка на крюк</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].drilling.hookLoad.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs</div>
                            </div>
                            <div className="p-3 bg-accent/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Усилие на башмаке</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].drilling.drillingForce.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs</div>
                            </div>
                            <div className="p-3 bg-accent/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Макс. обороты</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].drilling.maxRPM}</div>
                              <div className="text-xs text-muted-foreground">RPM</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {calculations[0].running && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Icon name="MoveDown" size={18} />
                            Параметры спуска
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Нагрузка при спуске</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].running.runningLoad.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs (с запасом)</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Вес в растворе</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].running.buoyantWeight.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs (с учетом выталкивания)</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Сила трения</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].running.dragForce.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Макс. скорость спуска</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].running.maxRunningSpeed}</div>
                              <div className="text-xs text-muted-foreground">ft/min</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {calculations[0].hydraulics && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Icon name="Droplets" size={18} />
                            Гидравлические параметры
                          </h4>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Потери в трубе</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].hydraulics.pressureLossPipe.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">psi</div>
                            </div>
                            <div className="p-3 bg-primary/5 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Потери в затрубье</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].hydraulics.pressureLossAnnulus.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">psi</div>
                            </div>
                            <div className="p-3 bg-accent/5 rounded border border-accent/30">
                              <div className="text-sm text-muted-foreground mb-1">Общие потери</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].hydraulics.totalPressureLoss.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">psi</div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mt-3">
                            <div className="p-3 bg-muted/50 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Скорость в затрубье</div>
                              <div className="text-xl font-bold font-mono">{calculations[0].hydraulics.annulusVelocity}</div>
                              <div className="text-xs text-muted-foreground">ft/s</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded border">
                              <div className="text-sm text-muted-foreground mb-1">Критическая скорость</div>
                              <div className="text-xl font-bold font-mono">{calculations[0].hydraulics.criticalVelocity}</div>
                              <div className="text-xs text-muted-foreground">ft/s</div>
                            </div>
                            <div className={`p-3 rounded border ${
                              calculations[0].hydraulics.cleaningEfficiency >= 85 ? 'bg-green-500/10 border-green-500/30' :
                              calculations[0].hydraulics.cleaningEfficiency >= 70 ? 'bg-yellow-500/10 border-yellow-500/30' :
                              'bg-orange-500/10 border-orange-500/30'
                            }`}>
                              <div className="text-sm text-muted-foreground mb-1">Очистка скважины</div>
                              <div className="text-xl font-bold font-mono">{calculations[0].hydraulics.cleaningEfficiency}%</div>
                              <div className="text-xs text-muted-foreground">эффективность</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Icon name="Info" size={16} />
                        Параметры расчета
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Марка стали</div>
                          <div className="font-mono font-semibold">{calculations[0].pipeGrade}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Диаметр</div>
                          <div className="font-mono font-semibold">{calculations[0].outerDiameter}"</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Вес</div>
                          <div className="font-mono font-semibold">{calculations[0].weight} lb/ft</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Время расчета</div>
                          <div className="font-mono text-xs">{calculations[0].timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showCharts && calculations.length > 0 && (
                <>
                  {calculations[0].drilling && calculations[0].connections && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <TorqueChart
                        currentTorque={calculations[0].drilling.torque}
                        maxTorque={calculations[0].connections.maxTorqueConnection * 1000}
                        depth={parseFloat(depth)}
                      />
                      <LoadChart
                        hookLoad={calculations[0].drilling.hookLoad}
                        buoyantWeight={calculations[0].drilling.hookLoad * 0.85}
                        dragForce={calculations[0].drilling.hookLoad * 0.15}
                        maxLoad={calculations[0].connections.maxAxialLoad}
                      />
                    </div>
                  )}

                  {calculations[0].hydraulics && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <CleaningChart
                        efficiency={calculations[0].hydraulics.cleaningEfficiency}
                        annulusVelocity={calculations[0].hydraulics.annulusVelocity}
                        criticalVelocity={calculations[0].hydraulics.criticalVelocity}
                      />
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Icon name="Activity" size={18} />
                            Потери давления
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-primary/10 rounded border">
                                <span className="text-sm">В трубе</span>
                                <span className="font-mono font-bold">{calculations[0].hydraulics.pressureLossPipe} psi</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-accent/10 rounded border">
                                <span className="text-sm">В затрубье</span>
                                <span className="font-mono font-bold">{calculations[0].hydraulics.pressureLossAnnulus} psi</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-secondary/20 rounded border-2">
                                <span className="text-sm font-semibold">Общие потери</span>
                                <span className="font-mono font-bold text-lg">{calculations[0].hydraulics.totalPressureLoss} psi</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground border-t pt-3">
                              <div className="mb-2">Расход раствора: <span className="font-mono font-semibold">{calculations[0].hydraulics.flowRate} л/с</span></div>
                              <div>Скорость в затрубье: <span className="font-mono font-semibold">{calculations[0].hydraulics.annulusVelocity} ft/s</span></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {calculations[0].running && (
                    <LoadChart
                      hookLoad={calculations[0].running.runningLoad}
                      buoyantWeight={calculations[0].running.buoyantWeight}
                      dragForce={calculations[0].running.dragForce}
                      maxLoad={calculations[0].connections ? calculations[0].connections.maxAxialLoad : calculations[0].running.runningLoad * 1.5}
                    />
                  )}
                  
                  {calculations[0].connections && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="Link" size={20} />
                          Параметры резьбовых соединений
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                            <span className="font-semibold">Тип соединения:</span>
                            <Badge variant="outline" className="font-mono">{calculations[0].connections.connectionType}</Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2 p-4 bg-accent/5 rounded-lg border">
                              <div className="text-sm text-muted-foreground">Макс. крутящий момент</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].connections.maxTorqueConnection.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">Нм</div>
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs text-muted-foreground">Коэффициент запаса</div>
                                <div className={`font-mono font-bold ${
                                  calculations[0].connections.torqueSafetyFactor >= 1.5 ? 'text-green-600' :
                                  calculations[0].connections.torqueSafetyFactor >= 1.2 ? 'text-orange-600' : 'text-destructive'
                                }`}>
                                  {calculations[0].connections.torqueSafetyFactor}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border">
                              <div className="text-sm text-muted-foreground">Макс. осевая нагрузка</div>
                              <div className="text-2xl font-bold font-mono">{calculations[0].connections.maxAxialLoad.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">lbs</div>
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs text-muted-foreground">Коэффициент запаса</div>
                                <div className={`font-mono font-bold ${
                                  calculations[0].connections.axialSafetyFactor >= 1.5 ? 'text-green-600' :
                                  calculations[0].connections.axialSafetyFactor >= 1.2 ? 'text-orange-600' : 'text-destructive'
                                }`}>
                                  {calculations[0].connections.axialSafetyFactor}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" size={20} />
                    Справочник API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="grades" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="grades">Марки</TabsTrigger>
                      <TabsTrigger value="operations">Операции</TabsTrigger>
                      <TabsTrigger value="standards">Стандарты</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grades" className="space-y-3 mt-4">
                      <ScrollArea className="h-[300px] pr-4">
                        {Object.entries(API_PIPE_GRADES).map(([grade, data]) => (
                          <div key={grade} className="mb-3 p-3 bg-muted/50 rounded border">
                            <div className="font-bold text-primary font-mono">{grade}</div>
                            <div className="text-sm space-y-1 mt-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Предел текучести:</span>
                                <span className="font-mono font-semibold">{data.yield.toLocaleString()} psi</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Прочность:</span>
                                <span className="font-mono font-semibold">{data.tensile.toLocaleString()} psi</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="operations" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-accent/10 rounded border border-accent/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Drill" size={16} className="text-accent" />
                            <div className="font-semibold">Бурение с башмаком</div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Обсадная колонна + башмак = бурильная колонна</div>
                            <div>• Контроль крутящего момента и нагрузки</div>
                            <div>• Ограничение оборотов по прочности</div>
                          </div>
                        </div>
                        <div className="p-3 bg-primary/10 rounded border border-primary/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="MoveDown" size={16} className="text-primary" />
                            <div className="font-semibold">Спуск колонны</div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Учет выталкивающей силы раствора</div>
                            <div>• Расчет сил трения о стенки</div>
                            <div>• Контроль скорости спуска</div>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="AlertTriangle" size={16} />
                            <div className="font-semibold">Критические факторы</div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>• Прочность на разрыв и смятие</div>
                            <div>• Усталостные напряжения при вращении</div>
                            <div>• Гидродинамическое давление</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="standards" className="space-y-3 mt-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded border">
                          <div className="font-semibold">API 5CT</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Спецификация на обсадные и насосно-компрессорные трубы
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border">
                          <div className="font-semibold">API 5C3</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Расчетные формулы для обсадных труб
                          </div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded border">
                          <div className="font-semibold">API Bull 5C2</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Бюллетень по эксплуатационным свойствам
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {calculations.length > 0 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="History" size={20} />
                      История расчетов
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {calculations.map((calc, idx) => (
                          <div
                            key={calc.id}
                            className={`p-3 rounded border ${
                              idx === 0 ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono font-bold text-sm">{calc.pipeGrade}</span>
                              <span className="text-xs text-muted-foreground">
                                {calc.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">Burst</div>
                                <div className="font-mono font-semibold">{calc.burst.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Collapse</div>
                                <div className="font-mono font-semibold">{calc.collapse.toLocaleString()}</div>
                              </div>
                            </div>
                            {calc.drilling && (
                              <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs text-accent">
                                <Icon name="Drill" size={12} />
                                <span>Бурение: {calc.drilling.maxRPM} RPM макс.</span>
                              </div>
                            )}
                            {calc.running && (
                              <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs text-primary">
                                <Icon name="MoveDown" size={12} />
                                <span>Спуск: {calc.running.maxRunningSpeed} ft/min макс.</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={16} />
                <span>Расчеты выполнены по стандартам American Petroleum Institute</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-mono">API 5CT</Badge>
                <Badge variant="secondary" className="font-mono">API 5C3</Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}