import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import TorqueChart from '@/components/TorqueChart';
import CleaningChart from '@/components/CleaningChart';
import LoadChart from '@/components/LoadChart';
import PressureProfileChart from '@/components/PressureProfileChart';
import CasingVisualization from '@/components/CasingVisualization';
import TorqueDepthChart from '@/components/torque/TorqueDepthChart';
import TripTorqueTable from '@/components/torque/TripTorqueTable';
import HoleCleaningChart from '@/components/cleaning/HoleCleaningChart';
import ECDChart from '@/components/ecd/ECDChart';
import HydraulicsTable from '@/components/hydraulics/HydraulicsTable';
import ExportReport from '@/components/export/ExportReport';
import { Calculation } from './CalculationEngine';

interface ResultsPanelProps {
  calculations: Calculation[];
  showCharts: boolean;
  depth: string;
  mudWeight: string;
  wallThickness: string;
  bitType: string;
  torqueDepthData: any[];
  tripTorqueData: any[];
  cleaningData: any[];
  hydraulicsParams: any;
  ecdData: any[];
}

export default function ResultsPanel({
  calculations,
  showCharts,
  depth,
  mudWeight,
  wallThickness,
  bitType,
  torqueDepthData,
  tripTorqueData,
  cleaningData,
  hydraulicsParams,
  ecdData
}: ResultsPanelProps) {
  if (calculations.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="LineChart" size={20} />
              Результаты расчета
            </CardTitle>
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
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Icon name="Gauge" size={20} />
                <span className="font-semibold">Давление разрыва (Burst)</span>
              </div>
              <div className="text-4xl font-bold font-mono">{calculations[0].burst.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">МПа</div>
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
              <div className="text-sm text-muted-foreground">МПа</div>
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
                    <div className="text-sm text-muted-foreground mb-1">Крутящий момент (поверхность)</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].drilling.torque.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН·м</div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30">
                    <div className="text-sm text-muted-foreground mb-1">Крутящий момент на долоте</div>
                    <div className="text-2xl font-bold font-mono">{(calculations[0].drilling.bitTorque || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН·м (PDC)</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Нагрузка на крюк</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].drilling.hookLoad.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Нагрузка на долото (WOB)</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].drilling.drillingForce.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Макс. обороты</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].drilling.maxRPM}</div>
                    <div className="text-xs text-muted-foreground">об/мин</div>
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
                    <div className="text-xs text-muted-foreground">кН</div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Вес в растворе</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].running.buoyantWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН</div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Сила трения</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].running.dragForce.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">кН</div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Макс. скорость спуска</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].running.maxRunningSpeed}</div>
                    <div className="text-xs text-muted-foreground">м/с</div>
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
                    <div className="text-xs text-muted-foreground">МПа</div>
                  </div>
                  <div className="p-3 bg-primary/5 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Потери в затрубье</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].hydraulics.pressureLossAnnulus.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">МПа</div>
                  </div>
                  <div className="p-3 bg-accent/5 rounded border border-accent/30">
                    <div className="text-sm text-muted-foreground mb-1">Общие потери</div>
                    <div className="text-2xl font-bold font-mono">{calculations[0].hydraulics.totalPressureLoss.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">МПа</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-3">
                  <div className="p-3 bg-muted/50 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Скорость в затрубье</div>
                    <div className="text-xl font-bold font-mono">{calculations[0].hydraulics.annulusVelocity}</div>
                    <div className="text-xs text-muted-foreground">м/с</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded border">
                    <div className="text-sm text-muted-foreground mb-1">Критическая скорость</div>
                    <div className="text-xl font-bold font-mono">{calculations[0].hydraulics.criticalVelocity}</div>
                    <div className="text-xs text-muted-foreground">м/с</div>
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Марка стали</div>
                <div className="font-mono font-semibold">{calculations[0].pipeGrade}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Диаметр</div>
                <div className="font-mono font-semibold">{calculations[0].outerDiameter} мм</div>
              </div>
              <div>
                <div className="text-muted-foreground">Вес</div>
                <div className="font-mono font-semibold">{calculations[0].weight} кг/м</div>
              </div>
              <div>
                <div className="text-muted-foreground">Время расчета</div>
                <div className="font-mono text-xs">{calculations[0].timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showCharts && (
        <>
          {calculations[0].hydraulics && parseFloat(depth) > 0 && (
            <PressureProfileChart
              depth={parseFloat(depth)}
              mudDensity={parseFloat(mudWeight)}
              pressureLossPipe={calculations[0].hydraulics.pressureLossPipe}
              pressureLossAnnulus={calculations[0].hydraulics.pressureLossAnnulus}
              burst={calculations[0].burst}
              collapse={calculations[0].collapse}
            />
          )}

          {calculations[0].drilling && (
            <CasingVisualization
              outerDiameter={calculations[0].outerDiameter}
              wallThickness={parseFloat(wallThickness)}
              depth={parseFloat(depth)}
              mudDensity={parseFloat(mudWeight)}
              hookLoad={calculations[0].drilling.hookLoad}
              burst={calculations[0].burst}
              collapse={calculations[0].collapse}
            />
          )}

          {calculations[0].drilling && calculations[0].connections && (
            <div className="grid md:grid-cols-2 gap-6">
              <TorqueChart
                currentTorque={calculations[0].drilling.torque}
                maxTorque={calculations[0].connections.maxTorqueConnection}
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
                        <span className="font-mono font-bold">{calculations[0].hydraulics.pressureLossPipe} МПа</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-accent/10 rounded border">
                        <span className="text-sm">В затрубье</span>
                        <span className="font-mono font-bold">{calculations[0].hydraulics.pressureLossAnnulus} МПа</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-secondary/20 rounded border-2">
                        <span className="text-sm font-semibold">Общие потери</span>
                        <span className="font-mono font-bold text-lg">{calculations[0].hydraulics.totalPressureLoss} МПа</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-3">
                      <div className="mb-2">Расход раствора: <span className="font-mono font-semibold">{calculations[0].hydraulics.flowRate} л/с</span></div>
                      <div>Скорость в затрубье: <span className="font-mono font-semibold">{calculations[0].hydraulics.annulusVelocity} м/с</span></div>
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
                      <div className="text-xs text-muted-foreground">кН·м</div>
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
                      <div className="text-xs text-muted-foreground">кН</div>
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

          {hydraulicsParams && <HydraulicsTable params={hydraulicsParams} />}
          {torqueDepthData.length > 0 && calculations[0]?.connections && (
            <TorqueDepthChart 
              data={torqueDepthData} 
              maxTorque={calculations[0].connections.maxTorqueConnection}
            />
          )}
          {tripTorqueData.length > 0 && <TripTorqueTable data={tripTorqueData} />}
          {cleaningData.length > 0 && <HoleCleaningChart data={cleaningData} />}
          {ecdData.length > 0 && <ECDChart data={ecdData} />}
        </>
      )}
    </>
  );
}
