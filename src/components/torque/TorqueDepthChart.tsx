import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface TorqueData {
  depth: number; // м
  tripInRotating: number; // кН·м - спуск с вращением
  rotatingOffBottom: number; // кН·м - вращение над забоем
  tripOutRotating: number; // кН·м - подъем с вращением
}

interface TorqueDepthChartProps {
  data: TorqueData[];
  maxTorque: number; // кН·м - максимально допустимый момент
}

export default function TorqueDepthChart({ data, maxTorque }: TorqueDepthChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.tripInRotating, d.rotatingOffBottom, d.tripOutRotating]));
  const safetyMargin = maxTorque * 0.8;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            График крутящего момента по глубине
          </span>
          <Badge variant="outline" className="font-mono">
            Макс: {maxTorque.toFixed(1)} кН·м
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Спуск с вращением</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Вращение над забоем</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Подъем с вращением</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="depth" 
                label={{ value: 'Глубина, м', position: 'insideBottom', offset: -10 }}
                stroke="hsl(var(--foreground))"
              />
              <YAxis 
                label={{ value: 'Крутящий момент, кН·м', angle: -90, position: 'insideLeft' }}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `${value.toFixed(2)} кН·м`}
                labelFormatter={(label) => `Глубина: ${label} м`}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="line"
              />
              
              {/* Предельный момент - красная линия */}
              <Line 
                type="monotone" 
                dataKey={() => maxTorque} 
                stroke="rgb(239, 68, 68)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Предельный момент"
                dot={false}
              />
              
              {/* Безопасный предел - желтая линия */}
              <Line 
                type="monotone" 
                dataKey={() => safetyMargin} 
                stroke="rgb(234, 179, 8)" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Безопасный предел (80%)"
                dot={false}
              />
              
              {/* Данные операций */}
              <Line 
                type="monotone" 
                dataKey="tripInRotating" 
                stroke="rgb(59, 130, 246)" 
                strokeWidth={2.5}
                name="Спуск с вращением"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="rotatingOffBottom" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth={2.5}
                name="Вращение над забоем"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="tripOutRotating" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth={2.5}
                name="Подъем с вращением"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Статистика */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="text-sm font-semibold">Спуск с вращением</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Макс.</div>
                  <div className="font-mono font-bold">{Math.max(...data.map(d => d.tripInRotating)).toFixed(2)} кН·м</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Запас</div>
                  <div className={`font-mono font-bold ${
                    maxTorque / Math.max(...data.map(d => d.tripInRotating)) > 1.5 ? 'text-green-600' :
                    maxTorque / Math.max(...data.map(d => d.tripInRotating)) > 1.2 ? 'text-orange-600' :
                    'text-destructive'
                  }`}>
                    {(maxTorque / Math.max(...data.map(d => d.tripInRotating))).toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Вращение над забоем</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Макс.</div>
                  <div className="font-mono font-bold">{Math.max(...data.map(d => d.rotatingOffBottom)).toFixed(2)} кН·м</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Запас</div>
                  <div className={`font-mono font-bold ${
                    maxTorque / Math.max(...data.map(d => d.rotatingOffBottom)) > 1.5 ? 'text-green-600' :
                    maxTorque / Math.max(...data.map(d => d.rotatingOffBottom)) > 1.2 ? 'text-orange-600' :
                    'text-destructive'
                  }`}>
                    {(maxTorque / Math.max(...data.map(d => d.rotatingOffBottom))).toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Подъем с вращением</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Макс.</div>
                  <div className="font-mono font-bold">{Math.max(...data.map(d => d.tripOutRotating)).toFixed(2)} кН·м</div>
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  <div className="text-xs text-muted-foreground">Запас</div>
                  <div className={`font-mono font-bold ${
                    maxTorque / Math.max(...data.map(d => d.tripOutRotating)) > 1.5 ? 'text-green-600' :
                    maxTorque / Math.max(...data.map(d => d.tripOutRotating)) > 1.2 ? 'text-orange-600' :
                    'text-destructive'
                  }`}>
                    {(maxTorque / Math.max(...data.map(d => d.tripOutRotating))).toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
