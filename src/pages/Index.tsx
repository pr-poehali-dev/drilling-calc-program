import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExportReport from '@/components/export/ExportReport';
import { Nozzle } from '@/components/hydraulics/NozzleConfig';
import { HydraulicsParams } from '@/components/hydraulics/HydraulicsTable';
import { WellProfilePoint } from '@/components/wellProfile/ExcelImport';
import { TorqueData } from '@/components/torque/TorqueDepthChart';
import { TripTorquePoint } from '@/components/torque/TripTorqueTable';
import { CleaningPillowData } from '@/components/cleaning/HoleCleaningChart';
import { ECDData } from '@/components/ecd/ECDChart';
import { UnitSystem, FrictionCoefficients, DEFAULT_FRICTION_COEFFICIENTS } from '@/utils/unitConversion';
import MainPanel from '@/components/calculator/MainPanel';
import ResultsPanel from '@/components/calculator/ResultsPanel';
import Sidebar from '@/components/calculator/Sidebar';
import {
  Calculation,
  calculateBurstPressure,
  calculateCollapsePressure,
  calculateDrillingParams,
  calculateRunningParams,
  calculateHydraulics,
  calculateConnections,
  calculateAdvancedHydraulics,
  calculateECD,
  calculateTorqueDrag,
  calculateHoleCleaning
} from '@/components/calculator/CalculationEngine';

export default function Index() {
  const [selectedGrade, setSelectedGrade] = useState<string>('N-80');
  const [outerDiameter, setOuterDiameter] = useState<string>('244.5');
  const [wallThickness, setWallThickness] = useState<string>('9.0');
  const [weight, setWeight] = useState<string>('53.5');
  const [depth, setDepth] = useState<string>('1500');
  const [mudWeight, setMudWeight] = useState<string>('1.25');
  const [bitDiameter, setBitDiameter] = useState<string>('215.9');
  const [rpm, setRpm] = useState<string>('60');
  const [flowRate, setFlowRate] = useState<string>('30');
  const [mudViscosity, setMudViscosity] = useState<string>('40');
  const [wellDiameter, setWellDiameter] = useState<string>('311.0');
  const [axialLoad, setAxialLoad] = useState<string>('50');
  const [pipeLength, setPipeLength] = useState<string>('9.0');
  const [connectionType, setConnectionType] = useState<string>('Buttress');
  const [maxTorque, setMaxTorque] = useState<string>('25');
  const [frictionOpenHole, setFrictionOpenHole] = useState<string>('0.35');
  const [frictionCased, setFrictionCased] = useState<string>('0.25');
  const [bitTorque, setBitTorque] = useState<string>('5.0');
  const [bitType, setBitType] = useState<string>('PDC');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [enabledCalculations, setEnabledCalculations] = useState({
    pressure: true,
    drilling: false,
    running: false,
    hydraulics: false
  });
  const [showCharts, setShowCharts] = useState(false);
  
  const [nozzles, setNozzles] = useState<Nozzle[]>([]);
  const [wellProfile, setWellProfile] = useState<WellProfilePoint[]>([]);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [frictionCoeffs, setFrictionCoeffs] = useState<FrictionCoefficients>(DEFAULT_FRICTION_COEFFICIENTS);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('ОТТМ');
  const [torqueDepthData, setTorqueDepthData] = useState<TorqueData[]>([]);
  const [tripTorqueData, setTripTorqueData] = useState<TripTorquePoint[]>([]);
  const [cleaningData, setCleaningData] = useState<CleaningPillowData[]>([]);
  const [hydraulicsParams, setHydraulicsParams] = useState<HydraulicsParams | null>(null);
  const [ecdData, setEcdData] = useState<ECDData[]>([]);
  const [activeModule, setActiveModule] = useState<'main' | 'design' | 'torque' | 'hydraulics' | 'reports'>('main');

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
    
    let drilling = undefined;
    let running = undefined;
    let hydraulics = undefined;
    let connections = undefined;
    
    const frCoeff = parseFloat(frictionOpenHole);
    const frCoeffCased = parseFloat(frictionCased);
    const maxT = parseFloat(maxTorque);
    
    if (enabledCalculations.drilling && d && r && bd) {
      const bt = parseFloat(bitTorque);
      drilling = calculateDrillingParams(od, wt, selectedGrade, d, r, bd, axLoad, mw, frCoeff, maxT, bt, weight);
    }
    
    if (enabledCalculations.running && d && mw && wd) {
      running = calculateRunningParams(od, d, mw, w, wd, frCoeffCased, flowRate);
    }

    if (enabledCalculations.hydraulics && d && fr && mw && visc && wd) {
      hydraulics = calculateHydraulics(od, id, d, fr, mw, visc, wd);
      
      if (nozzles.length > 0) {
        const nozzlesArea = nozzles.reduce((sum, n) => {
          const radius = n.diameter / 2;
          return sum + Math.PI * radius * radius;
        }, 0);
        
        const advHydraulics = calculateAdvancedHydraulics(
          id, od, wd, d,
          fr, mw * 1000, visc, nozzlesArea
        );
        setHydraulicsParams(advHydraulics);
        
        const ecd = calculateECD(d, mw, advHydraulics.pressureLossAnnulus, mw * 1.8, mw * 1.0);
        setEcdData(ecd);
        
        const cleaning = calculateHoleCleaning(d, fr, wd, od, mw * 1000, 0.5);
        setCleaningData(cleaning);
      }
    }

    const currentTorque = drilling ? drilling.torque : maxT;
    connections = calculateConnections(od, wt, selectedGrade, connectionType, currentTorque, depth, weight);
    
    if (d && mw) {
      const { torqueData, tripData } = calculateTorqueDrag(
        d, w, od, wd, mw, frCoeff
      );
      setTorqueDepthData(torqueData);
      setTripTorqueData(tripData);
    }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex h-screen">
        <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Icon name="Drill" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold">Casing Designer</h1>
                <p className="text-xs text-slate-400">Pro Edition v3.0</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            <button
              onClick={() => setActiveModule('main')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === 'main'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name="Home" size={20} />
              <span className="font-medium">Главная</span>
            </button>

            <button
              onClick={() => setActiveModule('design')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === 'design'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name="Layers" size={20} />
              <span className="font-medium">Проектирование</span>
            </button>

            <button
              onClick={() => setActiveModule('torque')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === 'torque'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name="Gauge" size={20} />
              <span className="font-medium">Torque & Drag</span>
            </button>

            <button
              onClick={() => setActiveModule('hydraulics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === 'hydraulics'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name="Droplets" size={20} />
              <span className="font-medium">Гидравлика</span>
            </button>

            <button
              onClick={() => setActiveModule('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeModule === 'reports'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon name="FileText" size={20} />
              <span className="font-medium">Отчеты</span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-700 space-y-2">
            <div className="text-xs text-slate-400">Стандарты:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">API 5CT</Badge>
              <Badge variant="secondary" className="text-xs">ГОСТ</Badge>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {activeModule === 'main' && 'Главная панель'}
                  {activeModule === 'design' && 'Проектирование обсадной колонны'}
                  {activeModule === 'torque' && 'Анализ Torque & Drag'}
                  {activeModule === 'hydraulics' && 'Гидравлический расчет'}
                  {activeModule === 'reports' && 'Генерация отчетов'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1">
                  <Icon name="Factory" size={12} />
                  ОТТМ • БТС • ТМК
                </Badge>
                {calculations.length > 0 && (
                  <ExportReport 
                    calculation={calculations[0]}
                    projectName="Расчет обсадной колонны"
                    wellName="Скважина-1"
                    depth={depth}
                    mudWeight={mudWeight}
                    wallThickness={wallThickness}
                    bitType={bitType}
                  />
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {activeModule === 'main' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <MainPanel
                  selectedGrade={selectedGrade}
                  setSelectedGrade={setSelectedGrade}
                  outerDiameter={outerDiameter}
                  setOuterDiameter={setOuterDiameter}
                  wallThickness={wallThickness}
                  setWallThickness={setWallThickness}
                  weight={weight}
                  setWeight={setWeight}
                  depth={depth}
                  setDepth={setDepth}
                  mudWeight={mudWeight}
                  setMudWeight={setMudWeight}
                  wellDiameter={wellDiameter}
                  setWellDiameter={setWellDiameter}
                  pipeLength={pipeLength}
                  setPipeLength={setPipeLength}
                  connectionType={connectionType}
                  setConnectionType={setConnectionType}
                  maxTorque={maxTorque}
                  setMaxTorque={setMaxTorque}
                  frictionOpenHole={frictionOpenHole}
                  setFrictionOpenHole={setFrictionOpenHole}
                  frictionCased={frictionCased}
                  setFrictionCased={setFrictionCased}
                  enabledCalculations={enabledCalculations}
                  setEnabledCalculations={setEnabledCalculations}
                  rpm={rpm}
                  setRpm={setRpm}
                  bitDiameter={bitDiameter}
                  setBitDiameter={setBitDiameter}
                  axialLoad={axialLoad}
                  setAxialLoad={setAxialLoad}
                  bitType={bitType}
                  setBitType={setBitType}
                  bitTorque={bitTorque}
                  setBitTorque={setBitTorque}
                  flowRate={flowRate}
                  setFlowRate={setFlowRate}
                  mudViscosity={mudViscosity}
                  setMudViscosity={setMudViscosity}
                  handleCalculate={handleCalculate}
                  selectedManufacturer={selectedManufacturer}
                  setSelectedManufacturer={setSelectedManufacturer}
                />

                <div className="space-y-6">
                  <ResultsPanel
                    calculations={calculations}
                    showCharts={showCharts}
                    depth={depth}
                    mudWeight={mudWeight}
                    wallThickness={wallThickness}
                    bitType={bitType}
                    torqueDepthData={torqueDepthData}
                    tripTorqueData={tripTorqueData}
                    cleaningData={cleaningData}
                    hydraulicsParams={hydraulicsParams}
                    ecdData={ecdData}
                  />

                  <Sidebar
                    nozzles={nozzles}
                    setNozzles={setNozzles}
                    setWellProfile={setWellProfile}
                    calculations={calculations}
                  />
                </div>
              </div>
            )}

            {activeModule === 'design' && (
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Layers" size={20} />
                      Проектирование обсадной колонны
                    </CardTitle>
                    <CardDescription>Многосекционный дизайн колонны с оптимизацией</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Construction" size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Модуль проектирования в разработке</p>
                      <p className="text-sm mt-2">Здесь будет конструктор многосекционной колонны</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeModule === 'torque' && (
              <div className="space-y-6">
                {torqueDepthData.length > 0 && tripTorqueData.length > 0 ? (
                  <ResultsPanel
                    calculations={calculations}
                    showCharts={true}
                    depth={depth}
                    mudWeight={mudWeight}
                    wallThickness={wallThickness}
                    bitType={bitType}
                    torqueDepthData={torqueDepthData}
                    tripTorqueData={tripTorqueData}
                    cleaningData={[]}
                    hydraulicsParams={null}
                    ecdData={[]}
                  />
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Gauge" size={20} />
                        Анализ Torque & Drag
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Выполните расчет на главной панели</p>
                        <p className="text-sm mt-2">Данные Torque & Drag появятся после расчета</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeModule === 'hydraulics' && (
              <div className="space-y-6">
                {hydraulicsParams ? (
                  <ResultsPanel
                    calculations={calculations}
                    showCharts={true}
                    depth={depth}
                    mudWeight={mudWeight}
                    wallThickness={wallThickness}
                    bitType={bitType}
                    torqueDepthData={[]}
                    tripTorqueData={[]}
                    cleaningData={cleaningData}
                    hydraulicsParams={hydraulicsParams}
                    ecdData={ecdData}
                  />
                ) : (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="Droplets" size={20} />
                        Гидравлический расчет
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Включите гидравлику и добавьте насадки</p>
                        <p className="text-sm mt-2">Расширенные гидравлические данные появятся после расчета</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeModule === 'reports' && (
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="FileText" size={20} />
                      Генерация отчетов
                    </CardTitle>
                    <CardDescription>Экспорт расчетов в различные форматы</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {calculations.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                          <div>
                            <div className="font-semibold">Последний расчет</div>
                            <div className="text-sm text-muted-foreground">
                              {calculations[0].timestamp.toLocaleString('ru-RU')}
                            </div>
                          </div>
                          <ExportReport 
                            calculation={calculations[0]}
                            projectName="Расчет обсадной колонны"
                            wellName="Скважина-1"
                            depth={depth}
                            mudWeight={mudWeight}
                            wallThickness={wallThickness}
                            bitType={bitType}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-primary/5 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="FileText" size={20} className="text-primary" />
                              <span className="font-semibold">PDF отчет</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Полный отчет с таблицами и графиками</p>
                          </div>
                          <div className="p-4 bg-accent/5 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="FileDown" size={20} className="text-accent" />
                              <span className="font-semibold">Word документ</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Редактируемый документ для печати</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="FileX" size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Нет доступных расчетов</p>
                        <p className="text-sm mt-2">Выполните расчет на главной панели</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
