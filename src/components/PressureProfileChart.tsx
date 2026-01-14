import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface PressureProfileChartProps {
  depth: number;
  mudDensity: number;
  pressureLossPipe: number;
  pressureLossAnnulus: number;
  burst: number;
  collapse: number;
}

export default function PressureProfileChart({ 
  depth, 
  mudDensity, 
  pressureLossPipe, 
  pressureLossAnnulus,
  burst,
  collapse
}: PressureProfileChartProps) {
  const steps = 20;
  const stepSize = depth / steps;
  
  const data = Array.from({ length: steps + 1 }, (_, i) => {
    const currentDepth = i * stepSize;
    
    const hydrostaticPressure = (mudDensity * 9.81 * currentDepth) / 1000;
    
    const circulationPressure = hydrostaticPressure + (pressureLossPipe * currentDepth / depth);
    
    const annulusPressure = hydrostaticPressure - (pressureLossAnnulus * currentDepth / depth);
    
    const differentialPressure = circulationPressure - annulusPressure;
    
    return {
      depth: Math.round(currentDepth),
      hydrostatic: parseFloat(hydrostaticPressure.toFixed(2)),
      circulation: parseFloat(circulationPressure.toFixed(2)),
      annulus: parseFloat(annulusPressure.toFixed(2)),
      differential: parseFloat(differentialPressure.toFixed(2)),
      burst: burst / 1000,
      collapse: collapse / 1000
    };
  });

  const maxPressure = Math.max(...data.map(d => Math.max(d.circulation, d.burst, d.collapse)));
  const avgDifferential = data.reduce((sum, d) => sum + d.differential, 0) / data.length;

  const isBurstRisk = data.some(d => d.circulation > d.burst);
  const isCollapseRisk = data.some(d => d.annulus < d.collapse);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            Профиль давлений по стволу скважины
          </span>
          <div className="flex items-center gap-2">
            {isBurstRisk && (
              <Badge variant="destructive" className="text-xs">
                <Icon name="AlertTriangle" size={12} className="mr-1" />
                Риск разрыва
              </Badge>
            )}
            {isCollapseRisk && (
              <Badge variant="destructive" className="text-xs">
                <Icon name="AlertCircle" size={12} className="mr-1" />
                Риск смятия
              </Badge>
            )}
            {!isBurstRisk && !isCollapseRisk && (
              <Badge variant="default" className="text-xs">
                <Icon name="CheckCircle" size={12} className="mr-1" />
                Безопасно
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Гидростатическое</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>При циркуляции</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>В затрубье</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Перепад</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="depth" 
                label={{ value: 'Глубина (м)', position: 'insideBottom', offset: -10 }}
                className="text-xs"
              />
              <YAxis 
                label={{ value: 'Давление (МПа)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
                domain={[0, maxPressure * 1.1]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)} МПа`, '']}
                labelFormatter={(label) => `Глубина: ${label} м`}
              />
              <Legend verticalAlign="top" height={36} />
              
              {/* Предельные давления */}
              <Line 
                type="monotone" 
                dataKey="burst" 
                stroke="rgb(239, 68, 68)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Предел разрыва"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="collapse" 
                stroke="rgb(239, 68, 68)" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Предел смятия"
                dot={false}
              />
              
              {/* Основные профили давления */}
              <Area 
                type="monotone" 
                dataKey="hydrostatic" 
                stroke="rgb(59, 130, 246)" 
                strokeWidth={2}
                fill="rgba(59, 130, 246, 0.1)"
                name="Гидростатическое"
              />
              <Line 
                type="monotone" 
                dataKey="circulation" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth={2.5}
                name="При циркуляции"
                dot={{ r: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="annulus" 
                stroke="rgb(168, 85, 247)" 
                strokeWidth={2.5}
                name="В затрубье"
                dot={{ r: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="differential" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth={2}
                name="Перепад давления"
                dot={{ r: 2 }}
                strokeDasharray="2 2"
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Статистика */}
          <div className="grid md:grid-cols-4 gap-3 pt-4 border-t">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Давление на забое</div>
              <div className="font-mono font-bold text-lg">{data[data.length - 1].hydrostatic.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">МПа (гидростат.)</div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">При циркуляции</div>
              <div className="font-mono font-bold text-lg">{data[data.length - 1].circulation.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">МПа</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">В затрубье</div>
              <div className="font-mono font-bold text-lg">{data[data.length - 1].annulus.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">МПа</div>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded text-center">
              <div className="text-xs text-muted-foreground mb-1">Средний перепад</div>
              <div className="font-mono font-bold text-lg">{avgDifferential.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">МПа</div>
            </div>
          </div>

          {/* Предупреждения */}
          <div className="space-y-2 text-xs border-t pt-3">
            {isBurstRisk && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive">
                <Icon name="AlertTriangle" size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">ВНИМАНИЕ: Риск разрыва обсадной колонны</div>
                  <div>
                    Давление при циркуляции превышает предел разрыва на некоторых интервалах. 
                    Рекомендуется снизить расход раствора или пересмотреть параметры бурения.
                  </div>
                </div>
              </div>
            )}
            {isCollapseRisk && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive">
                <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">ВНИМАНИЕ: Риск смятия обсадной колонны</div>
                  <div>
                    Давление в затрубье ниже предела смятия на некоторых интервалах.
                    Рекомендуется увеличить плотность раствора или пересмотреть конструкцию.
                  </div>
                </div>
              </div>
            )}
            {!isBurstRisk && !isCollapseRisk && (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Давления находятся в безопасных пределах по всей глубине скважины</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
