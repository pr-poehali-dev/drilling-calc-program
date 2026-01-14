import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TorqueChartProps {
  currentTorque: number;
  maxTorque: number;
  depth: number;
}

export default function TorqueChart({ currentTorque, maxTorque, depth }: TorqueChartProps) {
  const depthPoints = 20;
  const depthStep = depth / depthPoints;
  
  const torqueData = Array.from({ length: depthPoints + 1 }, (_, i) => {
    const d = Math.round(i * depthStep);
    const torque = currentTorque * (1 + (d / depth) * 0.3);
    return { 
      depth: d, 
      torque: parseFloat(torque.toFixed(2)),
      maxTorque: maxTorque,
      safetyMargin: parseFloat((maxTorque - torque).toFixed(2))
    };
  });

  const safetyFactor = maxTorque / currentTorque;
  const isOverLimit = torqueData.some(d => d.torque > maxTorque);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="TrendingUp" size={18} />
          График крутящего момента по глубине
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={torqueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="depth" 
                label={{ value: 'Глубина (м)', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                label={{ value: 'Крутящий момент (кН·м)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number) => [`${value} кН·м`, '']}
                labelFormatter={(label) => `Глубина: ${label} м`}
              />
              <Legend />
              <ReferenceLine 
                y={maxTorque} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5" 
                label={{ value: 'Предел', position: 'right', fill: 'hsl(var(--destructive))' }}
              />
              <Line 
                type="monotone" 
                dataKey="torque" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Текущий момент"
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-primary/10 rounded border">
              <div className="text-muted-foreground text-xs mb-1">Текущий момент</div>
              <div className="font-mono font-bold text-lg">{currentTorque.toFixed(1)} кН·м</div>
            </div>
            <div className="p-3 bg-destructive/10 rounded border">
              <div className="text-muted-foreground text-xs mb-1">Предельный момент</div>
              <div className="font-mono font-bold text-lg">{maxTorque.toFixed(1)} кН·м</div>
            </div>
            <div className={`p-3 rounded border ${
              safetyFactor >= 1.5 ? 'bg-green-500/10 border-green-500/30' :
              safetyFactor >= 1.2 ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="text-muted-foreground text-xs mb-1">Коэффициент запаса</div>
              <div className="font-mono font-bold text-lg">{safetyFactor.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground border-t pt-3">
            {isOverLimit ? (
              <div className="flex items-center gap-2 text-destructive">
                <Icon name="AlertTriangle" size={14} />
                <span className="font-semibold">ВНИМАНИЕ: Превышение допустимого момента!</span>
              </div>
            ) : safetyFactor >= 1.5 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Безопасный режим работы</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <Icon name="AlertCircle" size={14} />
                <span>Ограниченный запас прочности</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}