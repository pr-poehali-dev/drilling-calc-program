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

interface Calculation {
  id: string;
  timestamp: Date;
  pipeGrade: string;
  outerDiameter: number;
  weight: number;
  burst: number;
  collapse: number;
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
  const [calculations, setCalculations] = useState<Calculation[]>([]);

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

  const handleCalculate = () => {
    const od = parseFloat(outerDiameter);
    const wt = parseFloat(wallThickness);
    const w = parseFloat(weight);

    if (!od || !wt || !w || !selectedGrade) return;

    const burst = calculateBurstPressure(od, wt, selectedGrade);
    const collapse = calculateCollapsePressure(od, wt, selectedGrade);

    const newCalc: Calculation = {
      id: Date.now().toString(),
      timestamp: new Date(),
      pipeGrade: selectedGrade,
      outerDiameter: od,
      weight: w,
      burst: Math.round(burst),
      collapse: Math.round(collapse),
    };

    setCalculations([newCalc, ...calculations.slice(0, 9)]);
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
              <Badge variant="outline" className="font-mono">v1.0</Badge>
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
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grades">Марки</TabsTrigger>
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
