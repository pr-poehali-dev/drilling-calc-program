import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface CasingVisualizationProps {
  outerDiameter: number;
  wallThickness: number;
  depth: number;
  mudDensity: number;
  hookLoad: number;
  burst: number;
  collapse: number;
}

export default function CasingVisualization({
  outerDiameter,
  wallThickness,
  depth,
  mudDensity,
  hookLoad,
  burst,
  collapse
}: CasingVisualizationProps) {
  const innerDiameter = outerDiameter - 2 * wallThickness;
  const ratio = outerDiameter / wallThickness;
  
  const buoyancyFactor = 1 - (mudDensity / 7.85);
  const sections = 5;
  
  const sectionData = Array.from({ length: sections }, (_, i) => {
    const sectionDepth = ((i + 1) * depth) / sections;
    const hydrostaticPressure = (mudDensity * 9.81 * sectionDepth) / 1000;
    const axialStress = (hookLoad * 1000) / (Math.PI * ((outerDiameter/1000)**2 - (innerDiameter/1000)**2));
    
    return {
      depth: Math.round(sectionDepth),
      pressure: hydrostaticPressure.toFixed(1),
      stress: (axialStress / 1000000).toFixed(0),
      loadPercent: ((hookLoad / (burst * 0.001)) * 100).toFixed(0)
    };
  });

  const maxStress = Math.max(...sectionData.map(s => parseFloat(s.stress)));
  const safetyFactor = burst / (maxStress * 1000);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Layers" size={20} />
            Визуализация обсадной колонны
          </span>
          <Badge variant={safetyFactor >= 1.5 ? 'default' : safetyFactor >= 1.2 ? 'secondary' : 'destructive'}>
            Запас: {safetyFactor.toFixed(2)}x
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Схема сечения трубы */}
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border">
            <div className="relative">
              {/* Наружный диаметр */}
              <div 
                className="relative rounded-full border-8 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
                style={{ 
                  width: `${Math.min(200, outerDiameter / 2)}px`, 
                  height: `${Math.min(200, outerDiameter / 2)}px` 
                }}
              >
                {/* Внутренний диаметр */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border-4 border-accent/50"
                  style={{ 
                    width: `${Math.min(200, outerDiameter / 2) * (innerDiameter / outerDiameter)}px`, 
                    height: `${Math.min(200, outerDiameter / 2) * (innerDiameter / outerDiameter)}px` 
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xs text-muted-foreground">ID</div>
                    <div className="font-mono font-bold text-sm">{innerDiameter.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">мм</div>
                  </div>
                </div>
                
                {/* Метки размеров */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-xs text-muted-foreground">OD</div>
                  <div className="font-mono font-bold">{outerDiameter.toFixed(1)} мм</div>
                </div>
                
                <div className="absolute top-1/2 -right-16 -translate-y-1/2 text-center">
                  <div className="text-xs text-muted-foreground">WT</div>
                  <div className="font-mono font-bold">{wallThickness.toFixed(1)} мм</div>
                </div>
              </div>
            </div>
          </div>

          {/* Характеристики трубы */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-primary/10 border border-primary/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Отношение D/t</div>
              <div className="font-mono font-bold text-lg">{ratio.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-accent/10 border border-accent/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Фактор плавучести</div>
              <div className="font-mono font-bold text-lg">{buoyancyFactor.toFixed(3)}</div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Разрыв</div>
              <div className="font-mono font-bold text-lg">{(burst / 1000).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">МПа</div>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Смятие</div>
              <div className="font-mono font-bold text-lg">{(collapse / 1000).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">МПа</div>
            </div>
          </div>

          {/* Распределение нагрузок по глубине */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Распределение напряжений по глубине
            </h4>
            
            <div className="space-y-2">
              {sectionData.map((section, index) => {
                const stressPercent = (parseFloat(section.stress) / maxStress) * 100;
                const isWarning = parseFloat(section.loadPercent) > 80;
                const isCritical = parseFloat(section.loadPercent) > 100;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold">{section.depth} м</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          Гидростат.: <span className="font-mono font-bold">{section.pressure} МПа</span>
                        </span>
                        <span className="text-muted-foreground">
                          Напряжение: <span className="font-mono font-bold">{section.stress} МПа</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative h-8 bg-muted/20 rounded overflow-hidden border">
                      <div 
                        className={`h-full transition-all flex items-center justify-center text-xs font-mono font-bold ${
                          isCritical ? 'bg-destructive text-white' :
                          isWarning ? 'bg-orange-500 text-white' :
                          'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }`}
                        style={{ width: `${Math.min(stressPercent, 100)}%` }}
                      >
                        {stressPercent > 20 && `${section.loadPercent}%`}
                      </div>
                      {stressPercent <= 20 && (
                        <div className="absolute inset-0 flex items-center pl-2 text-xs font-mono font-bold">
                          {section.loadPercent}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Рекомендации */}
          <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <Icon name="Info" size={16} />
              Оценка прочности
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {ratio <= 15 && (
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={14} className="text-green-600" />
                  <span>Толстостенная труба (D/t &le; 15) - высокая устойчивость к смятию</span>
                </div>
              )}
              {ratio > 15 && ratio <= 25 && (
                <div className="flex items-center gap-2">
                  <Icon name="AlertCircle" size={14} className="text-orange-600" />
                  <span>Среднестенная труба (15 &lt; D/t &le; 25) - стандартная прочность</span>
                </div>
              )}
              {ratio > 25 && (
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" size={14} className="text-destructive" />
                  <span>Тонкостенная труба (D/t &gt; 25) - повышенный риск смятия</span>
                </div>
              )}
              
              {safetyFactor >= 1.5 ? (
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={14} className="text-green-600" />
                  <span>Достаточный запас прочности для безопасной эксплуатации</span>
                </div>
              ) : safetyFactor >= 1.2 ? (
                <div className="flex items-center gap-2">
                  <Icon name="AlertCircle" size={14} className="text-orange-600" />
                  <span>Ограниченный запас - рекомендуется контроль нагрузок</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon name="XCircle" size={14} className="text-destructive" />
                  <span>Недостаточный запас прочности - риск разрушения!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}