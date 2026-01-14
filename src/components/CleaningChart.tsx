import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface CleaningChartProps {
  efficiency: number;
  annulusVelocity: number;
  criticalVelocity: number;
}

export default function CleaningChart({ efficiency, annulusVelocity, criticalVelocity }: CleaningChartProps) {
  const efficiencyLevels = [
    { min: 0, max: 40, color: '#ef4444', label: 'Неудовлетворительная' },
    { min: 40, max: 70, color: '#f97316', label: 'Удовлетворительная' },
    { min: 70, max: 85, color: '#eab308', label: 'Хорошая' },
    { min: 85, max: 100, color: '#22c55e', label: 'Отличная' },
  ];

  const currentLevel = efficiencyLevels.find(l => efficiency >= l.min && efficiency <= l.max) || efficiencyLevels[0];
  
  const chartData = [{
    name: 'Эффективность',
    value: efficiency,
    fill: currentLevel.color
  }];

  const velocityRatio = (annulusVelocity / criticalVelocity) * 100;
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Droplets" size={18} />
          Эффективность очистки скважины
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="90%" 
              barSize={30} 
              data={chartData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                label={{ position: 'center', fill: 'currentColor', fontSize: '32px', fontWeight: 'bold', formatter: (value: number) => `${value}%` }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
            
          <div className="text-center -mt-2">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: currentLevel.color }}>
              {currentLevel.label}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            {efficiencyLevels.map((level) => (
              <div key={level.min} className="flex flex-col items-center gap-1">
                <div className="w-full h-2 rounded" style={{ backgroundColor: level.color }} />
                <span className="text-muted-foreground text-center">{level.min}-{level.max}%</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm pt-2 border-t">
            <div className="p-3 bg-primary/10 rounded border text-center">
              <div className="text-muted-foreground text-xs mb-1">Скорость в затрубье</div>
              <div className="font-mono font-bold text-lg">{annulusVelocity.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">м/с</div>
            </div>
            <div className="p-3 bg-secondary/10 rounded border text-center">
              <div className="text-muted-foreground text-xs mb-1">Критическая скорость</div>
              <div className="font-mono font-bold text-lg">{criticalVelocity.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">м/с</div>
            </div>
            <div className={`p-3 rounded border text-center ${
              velocityRatio >= 100 ? 'bg-green-500/10 border-green-500/30' : 'bg-orange-500/10 border-orange-500/30'
            }`}>
              <div className="text-muted-foreground text-xs mb-1">Отношение</div>
              <div className="font-mono font-bold text-lg">{velocityRatio.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">V/Vкрит</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            {annulusVelocity >= criticalVelocity ? (
              <div className="flex items-center gap-2 text-green-600">
                <Icon name="CheckCircle" size={14} />
                <span>Турбулентный режим - эффективная очистка скважины</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <Icon name="AlertTriangle" size={14} />
                <span>Ламинарный режим - рекомендуется увеличить расход</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}