import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CleaningChartProps {
  efficiency: number;
  annulusVelocity: number;
  criticalVelocity: number;
}

export default function CleaningChart({ efficiency, annulusVelocity, criticalVelocity }: CleaningChartProps) {
  const segments = 12;
  
  const efficiencyLevels = [
    { min: 0, max: 40, color: 'bg-destructive', label: 'Неудовлетворительная' },
    { min: 40, max: 70, color: 'bg-orange-500', label: 'Удовлетворительная' },
    { min: 70, max: 85, color: 'bg-yellow-500', label: 'Хорошая' },
    { min: 85, max: 100, color: 'bg-green-500', label: 'Отличная' },
  ];

  const currentLevel = efficiencyLevels.find(l => efficiency >= l.min && efficiency <= l.max) || efficiencyLevels[0];
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Droplets" size={18} />
          График очистки скважины
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-center h-48">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/20"
                  />
                  
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={currentLevel.color.replace('bg-', 'text-')}
                    strokeDasharray={`${(efficiency / 100) * 251.2} 251.2`}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold font-mono">{efficiency}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Эффективность</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${currentLevel.color} text-white`}>
                {currentLevel.label}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {efficiencyLevels.map((level) => (
              <div key={level.min} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded ${level.color}`} />
                <div className="flex-1">{level.label}</div>
                <div className="font-mono text-muted-foreground">{level.min}-{level.max}%</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
            <div className="p-2 bg-primary/10 rounded border">
              <div className="text-muted-foreground text-xs">Скорость в затрубье</div>
              <div className="font-mono font-bold">{annulusVelocity} ft/s</div>
            </div>
            <div className="p-2 bg-secondary/10 rounded border">
              <div className="text-muted-foreground text-xs">Критическая скорость</div>
              <div className="font-mono font-bold">{criticalVelocity} ft/s</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {annulusVelocity >= criticalVelocity ? (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Турбулентный режим - эффективная очистка</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <Icon name="AlertTriangle" size={14} />
                <span>Ламинарный режим - снижение очистки</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
