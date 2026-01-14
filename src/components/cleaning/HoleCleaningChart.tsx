import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface CleaningPillowData {
  depth: number;
  flowRate: number;
  cleaningEfficiency: number;
  cuttingsConcentration: number;
  pillowHeight: number;
  annulusVelocity: number;
  transportRatio: number;
}

interface HoleCleaningChartProps {
  data: CleaningPillowData[];
  criticalConcentration?: number;
}

export default function HoleCleaningChart({ data, criticalConcentration = 5 }: HoleCleaningChartProps) {
  const maxConcentration = Math.max(...data.map(d => d.cuttingsConcentration));
  const avgEfficiency = data.reduce((sum, d) => sum + d.cleaningEfficiency, 0) / data.length;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Wind" size={20} />
            Диаграмма очистки ствола скважины
          </span>
          <Badge variant={avgEfficiency >= 85 ? 'default' : avgEfficiency >= 70 ? 'secondary' : 'destructive'}>
            Средняя эффективность: {avgEfficiency.toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {maxConcentration > criticalConcentration && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive flex items-start gap-2">
              <Icon name="AlertTriangle" size={18} className="mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-semibold mb-1">ВНИМАНИЕ: Высокая концентрация шлама</div>
                <div>
                  Максимальная концентрация ({maxConcentration.toFixed(1)}%) превышает критическое значение ({criticalConcentration}%).
                  Рекомендуется увеличить расход раствора или скорость циркуляции.
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 text-sm">Расход раствора и эффективность очистки</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="depth" 
                  label={{ value: 'Глубина, м', position: 'insideBottom', offset: -10 }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Расход, л/с', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Эффективность, %', angle: 90, position: 'insideRight' }}
                  stroke="hsl(var(--foreground))"
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="flowRate" 
                  stroke="rgb(59, 130, 246)" 
                  strokeWidth={2.5}
                  name="Расход раствора, л/с"
                  dot={{ r: 3 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cleaningEfficiency" 
                  stroke="rgb(34, 197, 94)" 
                  strokeWidth={2.5}
                  name="Эффективность очистки, %"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Концентрация шлама и высота подушки</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="depth" 
                  label={{ value: 'Глубина, м', position: 'insideBottom', offset: -10 }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Концентрация, %', angle: -90, position: 'insideLeft' }}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Высота подушки, м', angle: 90, position: 'insideRight' }}
                  stroke="hsl(var(--foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey={() => criticalConcentration} 
                  stroke="rgb(239, 68, 68)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Критическая концентрация"
                  dot={false}
                />
                
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="cuttingsConcentration" 
                  stroke="rgb(249, 115, 22)" 
                  strokeWidth={2.5}
                  fill="rgb(249, 115, 22, 0.2)"
                  name="Концентрация шлама, %"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="pillowHeight" 
                  stroke="rgb(168, 85, 247)" 
                  strokeWidth={2.5}
                  name="Высота подушки, м"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Icon name="Table" size={16} />
              Параметры очистки по интервалам
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="border-b">
                      <th className="p-3 text-left font-semibold">Глубина, м</th>
                      <th className="p-3 text-center font-semibold">Расход, л/с</th>
                      <th className="p-3 text-center font-semibold">Очистка, %</th>
                      <th className="p-3 text-center font-semibold">Концентр., %</th>
                      <th className="p-3 text-center font-semibold">Подушка, м</th>
                      <th className="p-3 text-center font-semibold">Скорость, м/с</th>
                      <th className="p-3 text-center font-semibold">Трансп. коэф.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((point, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono font-semibold">{point.depth}</td>
                        <td className="p-3 font-mono text-center">{point.flowRate.toFixed(1)}</td>
                        <td className={`p-3 font-mono text-center font-semibold ${
                          point.cleaningEfficiency >= 85 ? 'text-green-600' :
                          point.cleaningEfficiency >= 70 ? 'text-orange-600' :
                          'text-destructive'
                        }`}>
                          {point.cleaningEfficiency.toFixed(1)}
                        </td>
                        <td className={`p-3 font-mono text-center font-semibold ${
                          point.cuttingsConcentration > criticalConcentration ? 'text-destructive bg-destructive/10' :
                          point.cuttingsConcentration > criticalConcentration * 0.8 ? 'text-orange-600 bg-orange-500/10' :
                          'text-green-600'
                        }`}>
                          {point.cuttingsConcentration.toFixed(2)}
                        </td>
                        <td className="p-3 font-mono text-center">{point.pillowHeight.toFixed(1)}</td>
                        <td className="p-3 font-mono text-center">{point.annulusVelocity.toFixed(2)}</td>
                        <td className="p-3 font-mono text-center">{point.transportRatio.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="p-3 bg-primary/5 border rounded">
              <div className="text-xs text-muted-foreground mb-1">Средняя очистка</div>
              <div className="text-2xl font-bold font-mono">{avgEfficiency.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
              <div className="text-xs text-muted-foreground mb-1">Макс. концентрация</div>
              <div className="text-2xl font-bold font-mono text-orange-600">{maxConcentration.toFixed(2)}%</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
              <div className="text-xs text-muted-foreground mb-1">Макс. подушка</div>
              <div className="text-2xl font-bold font-mono text-purple-600">{Math.max(...data.map(d => d.pillowHeight)).toFixed(1)} м</div>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="text-xs text-muted-foreground mb-1">Средняя скорость</div>
              <div className="text-2xl font-bold font-mono text-blue-600">
                {(data.reduce((sum, d) => sum + d.annulusVelocity, 0) / data.length).toFixed(2)} м/с
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
