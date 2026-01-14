import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RUSSIAN_PIPES, RussianPipe } from '@/data/russianPipes';
import { API_PIPE_GRADES, COMMON_SIZES_SI } from './CalculationEngine';

interface MainPanelProps {
  selectedGrade: string;
  setSelectedGrade: (value: string) => void;
  outerDiameter: string;
  setOuterDiameter: (value: string) => void;
  wallThickness: string;
  setWallThickness: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  depth: string;
  setDepth: (value: string) => void;
  mudWeight: string;
  setMudWeight: (value: string) => void;
  wellDiameter: string;
  setWellDiameter: (value: string) => void;
  pipeLength: string;
  setPipeLength: (value: string) => void;
  connectionType: string;
  setConnectionType: (value: string) => void;
  maxTorque: string;
  setMaxTorque: (value: string) => void;
  frictionOpenHole: string;
  setFrictionOpenHole: (value: string) => void;
  frictionCased: string;
  setFrictionCased: (value: string) => void;
  enabledCalculations: {
    pressure: boolean;
    drilling: boolean;
    running: boolean;
    hydraulics: boolean;
  };
  setEnabledCalculations: (value: any) => void;
  rpm: string;
  setRpm: (value: string) => void;
  bitDiameter: string;
  setBitDiameter: (value: string) => void;
  axialLoad: string;
  setAxialLoad: (value: string) => void;
  bitType: string;
  setBitType: (value: string) => void;
  bitTorque: string;
  setBitTorque: (value: string) => void;
  flowRate: string;
  setFlowRate: (value: string) => void;
  mudViscosity: string;
  setMudViscosity: (value: string) => void;
  handleCalculate: () => void;
  selectedManufacturer: string;
  setSelectedManufacturer: (value: string) => void;
}

export default function MainPanel({
  selectedGrade,
  setSelectedGrade,
  outerDiameter,
  setOuterDiameter,
  wallThickness,
  setWallThickness,
  weight,
  setWeight,
  depth,
  setDepth,
  mudWeight,
  setMudWeight,
  wellDiameter,
  setWellDiameter,
  pipeLength,
  setPipeLength,
  connectionType,
  setConnectionType,
  maxTorque,
  setMaxTorque,
  frictionOpenHole,
  setFrictionOpenHole,
  frictionCased,
  setFrictionCased,
  enabledCalculations,
  setEnabledCalculations,
  rpm,
  setRpm,
  bitDiameter,
  setBitDiameter,
  axialLoad,
  setAxialLoad,
  bitType,
  setBitType,
  bitTorque,
  setBitTorque,
  flowRate,
  setFlowRate,
  mudViscosity,
  setMudViscosity,
  handleCalculate,
  selectedManufacturer,
  setSelectedManufacturer
}: MainPanelProps) {

  const loadPreset = (preset: typeof COMMON_SIZES_SI[0]) => {
    setOuterDiameter(preset.od.toString());
    setWallThickness(preset.wt.toString());
    setWeight(preset.weight.toString());
  };

  const loadRussianPipe = (pipe: RussianPipe) => {
    setOuterDiameter(pipe.outerDiameter.toString());
    setWallThickness(pipe.wallThickness.toString());
    setWeight(pipe.weight.toString());
    setSelectedGrade(pipe.grade === 'Д' ? 'J-55' : pipe.grade === 'Е' ? 'N-80' : 'P-110');
  };

  const russianPipesByManufacturer = RUSSIAN_PIPES.filter(p => p.manufacturer === selectedManufacturer);

  return (
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
                Наружный диаметр (мм)
              </Label>
              <Input
                id="od"
                type="number"
                step="0.1"
                value={outerDiameter}
                onChange={(e) => setOuterDiameter(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wt" className="flex items-center gap-2">
                <Icon name="Layers" size={16} />
                Толщина стенки (мм)
              </Label>
              <Input
                id="wt"
                type="number"
                step="0.1"
                value={wallThickness}
                onChange={(e) => setWallThickness(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Icon name="Weight" size={16} />
                Вес (кг/м)
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
            <Label className="text-sm text-muted-foreground">Быстрый выбор типоразмеров:</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SIZES_SI.map((preset, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(preset)}
                  className="font-mono text-xs"
                >
                  {preset.od} × {preset.wt} мм ({preset.weight} кг/м)
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="Factory" size={16} />
                Российские производители (ГОСТ Р 51906)
              </Label>
              <Badge variant="secondary" className="font-mono">
                {russianPipesByManufacturer.length} типоразмеров
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-3 gap-3">
              <Button
                variant={selectedManufacturer === 'ОТТМ' ? 'default' : 'outline'}
                onClick={() => setSelectedManufacturer('ОТТМ')}
                className="font-semibold"
              >
                ОТТМ
              </Button>
              <Button
                variant={selectedManufacturer === 'БТС' ? 'default' : 'outline'}
                onClick={() => setSelectedManufacturer('БТС')}
                className="font-semibold"
              >
                БТС
              </Button>
              <Button
                variant={selectedManufacturer === 'ТМК' ? 'default' : 'outline'}
                onClick={() => setSelectedManufacturer('ТМК')}
                className="font-semibold"
              >
                ТМК
              </Button>
            </div>

            <ScrollArea className="h-64 rounded border bg-background">
              <div className="p-3 space-y-2">
                {russianPipesByManufacturer.map((pipe, idx) => (
                  <div
                    key={idx}
                    onClick={() => loadRussianPipe(pipe)}
                    className="p-3 rounded-lg border-2 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {pipe.outerDiameter}×{pipe.wallThickness} мм
                      </Badge>
                      <Badge className="text-xs">
                        {pipe.grade}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-muted-foreground">
                        Вес: <span className="font-mono font-semibold text-foreground">{pipe.weight} кг/м</span>
                      </div>
                      <div className="text-muted-foreground">
                        Σ<sub>т</sub>: <span className="font-mono font-semibold text-foreground">{pipe.yieldStrength} МПа</span>
                      </div>
                      <div className="text-muted-foreground">
                        Burst: <span className="font-mono font-semibold text-foreground">{pipe.burst} МПа</span>
                      </div>
                      <div className="text-muted-foreground">
                        Collapse: <span className="font-mono font-semibold text-foreground">{pipe.collapse} МПа</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                      {pipe.connectionType} • Растяжение: {pipe.tension} кН
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          <div className="space-y-4 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Icon name="CheckSquare" size={18} />
                Выберите типы расчетов:
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnabledCalculations({
                  pressure: true,
                  drilling: true,
                  running: true,
                  hydraulics: true
                })}
                className="text-xs h-7"
              >
                Все типы
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                onClick={() => setEnabledCalculations((prev: any) => ({ ...prev, pressure: !prev.pressure }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  enabledCalculations.pressure
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-background hover:bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Gauge" size={24} />
                  <span className="text-sm font-semibold">Прочность</span>
                  <div className="flex items-center gap-1 text-xs">
                    {enabledCalculations.pressure ? (
                      <><Icon name="CheckCircle" size={14} /> Включен</>
                    ) : (
                      <><Icon name="Circle" size={14} /> Выключен</>
                    )}
                  </div>
                </div>
              </div>
              <div
                onClick={() => setEnabledCalculations((prev: any) => ({ ...prev, drilling: !prev.drilling }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  enabledCalculations.drilling
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-background hover:bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Drill" size={24} />
                  <span className="text-sm font-semibold">Бурение</span>
                  <div className="flex items-center gap-1 text-xs">
                    {enabledCalculations.drilling ? (
                      <><Icon name="CheckCircle" size={14} /> Включен</>
                    ) : (
                      <><Icon name="Circle" size={14} /> Выключен</>
                    )}
                  </div>
                </div>
              </div>
              <div
                onClick={() => setEnabledCalculations((prev: any) => ({ ...prev, running: !prev.running }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  enabledCalculations.running
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-background hover:bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="MoveDown" size={24} />
                  <span className="text-sm font-semibold">Спуск</span>
                  <div className="flex items-center gap-1 text-xs">
                    {enabledCalculations.running ? (
                      <><Icon name="CheckCircle" size={14} /> Включен</>
                    ) : (
                      <><Icon name="Circle" size={14} /> Выключен</>
                    )}
                  </div>
                </div>
              </div>
              <div
                onClick={() => setEnabledCalculations((prev: any) => ({ ...prev, hydraulics: !prev.hydraulics }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  enabledCalculations.hydraulics
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-background hover:bg-muted border-muted-foreground/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Droplets" size={24} />
                  <span className="text-sm font-semibold">Гидравлика</span>
                  <div className="flex items-center gap-1 text-xs">
                    {enabledCalculations.hydraulics ? (
                      <><Icon name="CheckCircle" size={14} /> Включен</>
                    ) : (
                      <><Icon name="Circle" size={14} /> Выключен</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Icon name="Settings" size={16} />
              Общие параметры скважины:
            </Label>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="depth_common" className="text-xs flex items-center gap-1">
                  <Icon name="ArrowDown" size={14} />
                  Глубина (м)
                </Label>
                <Input
                  id="depth_common"
                  type="number"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="font-mono h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mudWeight_common" className="text-xs flex items-center gap-1">
                  <Icon name="Droplet" size={14} />
                  Плотность раствора (г/см³)
                </Label>
                <Input
                  id="mudWeight_common"
                  type="number"
                  step="0.01"
                  value={mudWeight}
                  onChange={(e) => setMudWeight(e.target.value)}
                  className="font-mono h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wellDiameter" className="text-xs flex items-center gap-1">
                  <Icon name="Circle" size={14} />
                  Диаметр скважины (мм)
                </Label>
                <Input
                  id="wellDiameter"
                  type="number"
                  step="0.1"
                  value={wellDiameter}
                  onChange={(e) => setWellDiameter(e.target.value)}
                  className="font-mono h-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
            <Label className="text-xs font-semibold">Параметры соединений и трения:</Label>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pipeLength" className="text-xs">Длина трубы (м)</Label>
                <Input
                  id="pipeLength"
                  type="number"
                  value={pipeLength}
                  onChange={(e) => setPipeLength(e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="maxTorque" className="text-xs">Макс. крутящий момент (кН·м)</Label>
                <Input
                  id="maxTorque"
                  type="number"
                  step="1"
                  value={maxTorque}
                  onChange={(e) => setMaxTorque(e.target.value)}
                  className="font-mono h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frictionOpenHole" className="text-xs">Трение откр. ствол</Label>
                <Input
                  id="frictionOpenHole"
                  type="number"
                  step="0.01"
                  value={frictionOpenHole}
                  onChange={(e) => setFrictionOpenHole(e.target.value)}
                  className="font-mono h-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frictionCased" className="text-xs">Трение обсаж. ствол</Label>
                <Input
                  id="frictionCased"
                  type="number"
                  step="0.01"
                  value={frictionCased}
                  onChange={(e) => setFrictionCased(e.target.value)}
                  className="font-mono h-8"
                />
              </div>
            </div>
          </div>

          {enabledCalculations.drilling && (
            <div className="space-y-4 p-4 bg-accent/10 rounded-lg border-2 border-accent/30">
              <div className="flex items-center gap-2 text-accent-foreground">
                <Icon name="Drill" size={20} />
                <Label className="text-sm font-semibold">Параметры бурения</Label>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
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
                    className="font-mono h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bitDiameter" className="flex items-center gap-2 text-xs">
                    <Icon name="CircleDot" size={14} />
                    Диаметр башмака (мм)
                  </Label>
                  <Input
                    id="bitDiameter"
                    type="number"
                    step="0.1"
                    value={bitDiameter}
                    onChange={(e) => setBitDiameter(e.target.value)}
                    className="font-mono h-9"
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
                    className="font-mono h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bitType" className="flex items-center gap-2 text-xs">
                    <Icon name="Settings" size={14} />
                    Тип долота
                  </Label>
                  <Select value={bitType} onValueChange={setBitType}>
                    <SelectTrigger id="bitType" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDC">PDC</SelectItem>
                      <SelectItem value="Roller">Шарошечное</SelectItem>
                      <SelectItem value="Diamond">Алмазное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bitTorque" className="flex items-center gap-2 text-xs">
                    <Icon name="Gauge" size={14} />
                    Момент на долоте (кН·м)
                  </Label>
                  <Input
                    id="bitTorque"
                    type="number"
                    step="0.5"
                    value={bitTorque}
                    onChange={(e) => setBitTorque(e.target.value)}
                    className="font-mono h-9"
                  />
                </div>
                <div className="p-3 bg-muted/50 rounded border flex items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Рекомендуемый момент:</div>
                    <div className="font-mono font-bold text-sm">
                      {bitType === 'PDC' ? '3.0-8.0' : bitType === 'Roller' ? '2.0-5.0' : '4.0-10.0'} кН·м
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {enabledCalculations.hydraulics && (
            <div className="space-y-4 p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-700">
                <Icon name="Droplets" size={20} />
                <Label className="text-sm font-semibold">Параметры гидравлики</Label>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
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
                    className="font-mono h-9"
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
                    className="font-mono h-9"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">Будут выполнены расчеты:</div>
                <div className="flex flex-wrap gap-2">
                  {enabledCalculations.pressure && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Icon name="Gauge" size={12} />
                      Прочность (Burst/Collapse)
                    </Badge>
                  )}
                  {enabledCalculations.drilling && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Icon name="Drill" size={12} />
                      Бурение (Момент, WOB, Нагрузка)
                    </Badge>
                  )}
                  {enabledCalculations.running && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Icon name="MoveDown" size={12} />
                      Спуск (Трение, Нагрузка)
                    </Badge>
                  )}
                  {enabledCalculations.hydraulics && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Icon name="Droplets" size={12} />
                      Гидравлика (Потери, Очистка)
                    </Badge>
                  )}
                  {!Object.values(enabledCalculations).some(v => v) && (
                    <span className="text-sm text-muted-foreground">Выберите хотя бы один тип расчета</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full" 
            size="lg"
            disabled={!Object.values(enabledCalculations).some(v => v)}
          >
            <Icon name="Play" size={18} className="mr-2" />
            Выполнить расчет
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
