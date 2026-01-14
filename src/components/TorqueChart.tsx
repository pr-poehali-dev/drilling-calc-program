import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TorqueChartProps {
  currentTorque: number;
  maxTorque: number;
  depth: number;
}

export default function TorqueChart({ currentTorque, maxTorque, depth }: TorqueChartProps) {
  const depthPoints = 10;
  const depthStep = depth / depthPoints;
  
  const torqueData = Array.from({ length: depthPoints + 1 }, (_, i) => {
    const d = i * depthStep;
    const torque = currentTorque * (1 + (d / depth) * 0.3);
    return { depth: d, torque, max: maxTorque };
  });

  const maxValue = Math.max(...torqueData.map(d => d.torque), maxTorque);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="TrendingUp" size={18} />
          График крутящего момента
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-64 border rounded-lg p-4 bg-muted/20">
            <div className="absolute inset-4 flex items-end justify-between gap-1">
              {torqueData.map((point, idx) => {
                const heightPercent = (point.torque / maxValue) * 100;
                const maxHeightPercent = (point.max / maxValue) * 100;
                const isExceeded = point.torque > point.max;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative">
                    <div 
                      className="w-full bg-destructive/20 border-t-2 border-destructive/50 absolute bottom-0"
                      style={{ height: `${maxHeightPercent}%` }}
                    />
                    <div 
                      className={`w-full rounded-t transition-all ${
                        isExceeded ? 'bg-destructive' : 'bg-accent'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {idx % 2 === 0 && (
                        <div className="text-[8px] font-mono text-center mt-1">
                          {Math.round(point.torque)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-2 right-2 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded" />
                <span>Текущий момент</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive/20 border border-destructive/50" />
                <span>Предельный момент</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0 ft</span>
            <span className="font-mono">Глубина</span>
            <span>{depth} ft</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-accent/10 rounded border">
              <div className="text-muted-foreground text-xs">Текущий момент</div>
              <div className="font-mono font-bold">{Math.round(currentTorque)} Нм</div>
            </div>
            <div className="p-2 bg-destructive/10 rounded border">
              <div className="text-muted-foreground text-xs">Предельный момент</div>
              <div className="font-mono font-bold">{Math.round(maxTorque)} Нм</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground border-t pt-2">
            Коэффициент запаса: <span className="font-mono font-semibold">{(maxTorque / currentTorque).toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
