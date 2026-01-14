import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ExcelImport from '@/components/wellProfile/ExcelImport';
import NozzleConfig, { Nozzle } from '@/components/hydraulics/NozzleConfig';
import { API_PIPE_GRADES } from './CalculationEngine';
import { RUSSIAN_PIPES } from '@/data/russianPipes';
import { Calculation } from './CalculationEngine';

interface SidebarProps {
  nozzles: Nozzle[];
  setNozzles: (nozzles: Nozzle[]) => void;
  setWellProfile: (profile: any[]) => void;
  calculations: Calculation[];
}

export default function Sidebar({ nozzles, setNozzles, setWellProfile, calculations }: SidebarProps) {
  return (
    <div className="space-y-6">
      <ExcelImport onImport={setWellProfile} />
      
      {nozzles.length === 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Settings" size={20} />
              Продвинутые расчеты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setNozzles([{ id: Date.now(), diameter: 12 }])}
              className="w-full gap-2"
            >
              <Icon name="Plus" size={16} />
              Добавить насадки долота
            </Button>
          </CardContent>
        </Card>
      )}

      {nozzles.length > 0 && (
        <NozzleConfig nozzles={nozzles} onChange={setNozzles} />
      )}

      <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Factory" size={20} />
            Российские производители
          </CardTitle>
          <CardDescription>
            База труб по ГОСТ Р 51906
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {['ОТТМ', 'БТС', 'ТМК'].map(manufacturer => {
              const count = RUSSIAN_PIPES.filter(p => p.manufacturer === manufacturer).length;
              return (
                <div key={manufacturer} className="p-3 bg-background rounded-lg border text-center">
                  <div className="font-bold text-lg">{manufacturer}</div>
                  <div className="text-xs text-muted-foreground">{count} труб</div>
                </div>
              );
            })}
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <Icon name="Info" size={14} />
              Доступные марки стали
            </div>
            <div className="flex flex-wrap gap-2">
              {['Д', 'Е', 'К'].map(grade => (
                <Badge key={grade} variant="outline" className="text-xs">
                  {grade}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-background rounded">
              <span className="text-muted-foreground">Диаметры:</span>
              <span className="font-mono font-semibold">114.3 - 273.1 мм</span>
            </div>
            <div className="flex justify-between p-2 bg-background rounded">
              <span className="text-muted-foreground">Предел текучести:</span>
              <span className="font-mono font-semibold">379 - 758 МПа</span>
            </div>
            <div className="flex justify-between p-2 bg-background rounded">
              <span className="text-muted-foreground">Резьбы:</span>
              <span className="font-mono font-semibold">Buttress, Premium, Ultra</span>
            </div>
          </div>

          <div className="pt-3 border-t text-xs text-muted-foreground">
            💡 Выберите производителя в разделе "Параметры трубы" для загрузки характеристик
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Справочник труб
          </CardTitle>
          <CardDescription>
            API 5CT и ГОСТ Р 51906
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grades" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="grades">API</TabsTrigger>
              <TabsTrigger value="russian">РФ</TabsTrigger>
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
            <TabsContent value="russian" className="space-y-3 mt-4">
              <div className="space-y-3">
                <div className="text-sm font-semibold">ГОСТ Р 51906 - Российские производители</div>
                
                {['ОТТМ', 'БТС', 'ТМК'].map((manufacturer, idx) => {
                  const bgColor = idx === 0 ? 'bg-blue-500/10' : idx === 1 ? 'bg-green-500/10' : 'bg-orange-500/10';
                  const iconColor = idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-green-600' : 'text-orange-600';
                  
                  return (
                    <div key={manufacturer} className="space-y-2">
                      <div className={`flex items-center gap-2 p-2 ${bgColor} rounded`}>
                        <Icon name="Factory" size={16} className={iconColor} />
                        <span className="font-semibold">{manufacturer}</span>
                      </div>
                      <ScrollArea className="h-[80px]">
                        <div className="space-y-1 text-xs pr-3">
                          {RUSSIAN_PIPES.filter(p => p.manufacturer === manufacturer).slice(0, 3).map((pipe, idx) => (
                            <div key={idx} className="flex justify-between p-1 hover:bg-muted/50 rounded">
                              <span className="font-mono">{pipe.outerDiameter}×{pipe.wallThickness} мм</span>
                              <span className="text-muted-foreground">{pipe.grade}, {pipe.weight} кг/м</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}

                <div className="p-3 bg-muted/50 rounded border">
                  <div className="font-semibold mb-2 text-sm">Марки стали по ГОСТ</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Д (ст. 20):</span>
                      <span className="font-mono font-semibold">379 МПа</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Е (ст. 30ХГСА):</span>
                      <span className="font-mono font-semibold">517 МПа</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">К (ст. 38ХА):</span>
                      <span className="font-mono font-semibold">655 МПа</span>
                    </div>
                  </div>
                </div>
              </div>
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
  );
}
