import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface LoadChartProps {
  hookLoad: number;
  buoyantWeight: number;
  dragForce: number;
  maxLoad: number;
}

export default function LoadChart({ hookLoad, buoyantWeight, dragForce, maxLoad }: LoadChartProps) {
  const totalLoad = hookLoad;
  const safetyFactor = maxLoad / totalLoad;
  
  const chartData = [
    { name: 'Вес в растворе', value: buoyantWeight, color: 'hsl(var(--chart-1))' },
    { name: 'Сила трения', value: dragForce, color: 'hsl(var(--chart-2))' },
    { name: 'Нагрузка на крюк', value: hookLoad, color: 'hsl(var(--primary))' },
  ];

  const utilizationPercent = (totalLoad / maxLoad) * 100;
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Weight" size={18} />
          Анализ нагрузок
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                interval={0}
                angle={0}
                textAnchor="middle"
              />
              <YAxis 
                label={{ value: 'Нагрузка (кН)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`${value.toFixed(1)} кН`, '']}
              />
              <ReferenceLine 
                y={maxLoad} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5" 
                label={{ value: `Предел: ${maxLoad.toFixed(0)} кН`, position: 'right', fill: 'hsl(var(--destructive))', fontSize: 11 }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-muted/50 rounded border text-center">
              <div className="text-muted-foreground text-xs mb-1">Предельная нагрузка</div>
              <div className="font-mono font-bold text-lg">{maxLoad.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">кН</div>
            </div>
            <div className={`p-3 rounded border text-center ${
              utilizationPercent > 100 ? 'bg-destructive/10 border-destructive/30' :
              utilizationPercent > 80 ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-green-500/10 border-green-500/30'
            }`}>
              <div className="text-muted-foreground text-xs mb-1">Использование</div>
              <div className="font-mono font-bold text-lg">{utilizationPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">от предела</div>
            </div>
            <div className={`p-3 rounded border text-center ${
              safetyFactor >= 1.5 ? 'bg-green-500/10 border-green-500/30' : 
              safetyFactor >= 1.2 ? 'bg-orange-500/10 border-orange-500/30' : 
              'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="text-muted-foreground text-xs mb-1">Коэффициент запаса</div>
              <div className="font-mono font-bold text-lg">{safetyFactor.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">-</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            {safetyFactor >= 1.5 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Безопасный режим работы (Кз &ge; 1.5)</span>
              </div>
            ) : safetyFactor >= 1.2 ? (
              <div className="flex items-center gap-2 text-orange-600">
                <Icon name="AlertTriangle" size={14} />
                <span>Ограниченный запас прочности (1.2 &le; Кз &lt; 1.5)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <Icon name="XCircle" size={14} />
                <span className="font-semibold">КРИТИЧЕСКАЯ ПЕРЕГРУЗКА! (Кз &lt; 1.2)</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}