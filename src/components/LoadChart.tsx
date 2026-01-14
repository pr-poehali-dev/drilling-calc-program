import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LoadChartProps {
  hookLoad: number;
  buoyantWeight: number;
  dragForce: number;
  maxLoad: number;
}

export default function LoadChart({ hookLoad, buoyantWeight, dragForce, maxLoad }: LoadChartProps) {
  const totalLoad = hookLoad + dragForce;
  const safetyFactor = maxLoad / totalLoad;
  
  const loads = [
    { name: 'Нагрузка на крюк', value: hookLoad, color: 'bg-primary' },
    { name: 'Вес в растворе', value: buoyantWeight, color: 'bg-accent' },
    { name: 'Сила трения', value: dragForce, color: 'bg-orange-500' },
  ];

  const maxValue = Math.max(maxLoad, totalLoad);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Weight" size={18} />
          График нагрузок
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            {loads.map((load) => (
              <div key={load.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{load.name}</span>
                  <span className="font-mono font-semibold">{load.value.toLocaleString()} lbs</span>
                </div>
                <div className="relative h-6 bg-muted/20 rounded overflow-hidden">
                  <div 
                    className={`h-full ${load.color} transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${(load.value / maxValue) * 100}%` }}
                  >
                    <span className="text-white text-[10px] font-mono">
                      {Math.round((load.value / maxValue) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Суммарная нагрузка</span>
              <span className="font-mono font-bold text-lg">{totalLoad.toLocaleString()} lbs</span>
            </div>

            <div className="relative h-8 bg-muted/20 rounded overflow-hidden border-2">
              <div 
                className={`h-full transition-all flex items-center justify-center ${
                  totalLoad > maxLoad ? 'bg-destructive' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((totalLoad / maxLoad) * 100, 100)}%` }}
              >
                <span className="text-white text-xs font-mono font-bold">
                  {Math.round((totalLoad / maxLoad) * 100)}% от предела
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-end pr-2 pointer-events-none">
                <Icon 
                  name={totalLoad > maxLoad ? 'AlertTriangle' : 'CheckCircle'} 
                  size={16} 
                  className={totalLoad > maxLoad ? 'text-destructive' : 'text-green-600'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-muted/50 rounded border">
                <div className="text-muted-foreground text-xs">Предельная нагрузка</div>
                <div className="font-mono font-bold">{maxLoad.toLocaleString()} lbs</div>
              </div>
              <div className={`p-2 rounded border ${
                safetyFactor >= 1.5 ? 'bg-green-500/10 border-green-500/30' : 
                safetyFactor >= 1.2 ? 'bg-orange-500/10 border-orange-500/30' : 
                'bg-destructive/10 border-destructive/30'
              }`}>
                <div className="text-muted-foreground text-xs">Коэффициент запаса</div>
                <div className="font-mono font-bold">{safetyFactor.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-2">
            {safetyFactor >= 1.5 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Безопасный режим работы</span>
              </div>
            ) : safetyFactor >= 1.2 ? (
              <div className="flex items-center gap-2 text-orange-600">
                <Icon name="AlertTriangle" size={14} />
                <span>Ограниченный запас прочности</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <Icon name="XCircle" size={14} />
                <span>Критическая перегрузка!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
