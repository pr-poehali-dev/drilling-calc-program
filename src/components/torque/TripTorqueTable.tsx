import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface TripTorquePoint {
  depth: number; // м
  hookLoad: number; // кН
  pickupLoad: number; // кН - подъем
  slackOffLoad: number; // кН - спуск
  rotatingLoad: number; // кН - вращение
  torqueWithCirculation: number; // кН·м - с циркуляцией
  torqueNoCirculation: number; // кН·м - без циркуляции
  overpull: number; // кН - превышение нагрузки при подъеме
  pipeStress: number; // МПа - напряжение в трубе
}

interface TripTorqueTableProps {
  data: TripTorquePoint[];
  yieldStrength: number; // МПа - предел текучести
}

export default function TripTorqueTable({ data, yieldStrength }: TripTorqueTableProps) {
  const maxStress = Math.max(...data.map(d => d.pipeStress));
  const safetyFactor = yieldStrength / maxStress;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Table2" size={20} />
            Таблица нагрузок и моментов при СПО
          </span>
          <div className="flex gap-2">
            <Badge variant={safetyFactor > 1.5 ? 'default' : safetyFactor > 1.2 ? 'secondary' : 'destructive'}>
              Запас: {safetyFactor.toFixed(2)}x
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Предупреждения */}
          {safetyFactor < 1.5 && (
            <div className={`p-3 rounded border flex items-start gap-2 ${
              safetyFactor < 1.2 ? 'bg-destructive/10 border-destructive/30 text-destructive' :
              'bg-orange-500/10 border-orange-500/30 text-orange-600'
            }`}>
              <Icon name="AlertTriangle" size={18} className="mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-semibold mb-1">
                  {safetyFactor < 1.2 ? 'КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ' : 'ВНИМАНИЕ'}
                </div>
                <div>
                  Коэффициент запаса прочности ниже рекомендуемого (1.5). 
                  Максимальное напряжение в трубе: {maxStress.toFixed(1)} МПа при пределе текучести {yieldStrength} МПа.
                </div>
              </div>
            </div>
          )}

          {/* Таблица */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="border-b">
                    <th className="p-3 text-left font-semibold" rowSpan={2}>Глубина, м</th>
                    <th className="p-3 text-center font-semibold border-l" colSpan={4}>Нагрузки на крюке, кН</th>
                    <th className="p-3 text-center font-semibold border-l" colSpan={2}>Момент в конце интервала, кН·м</th>
                    <th className="p-3 text-center font-semibold border-l" rowSpan={2}>Превышение<br/>подъема, кН</th>
                    <th className="p-3 text-center font-semibold border-l" rowSpan={2}>Напряжение,<br/>МПа</th>
                  </tr>
                  <tr className="border-b bg-muted/80">
                    <th className="p-2 text-center text-xs border-l">Статика</th>
                    <th className="p-2 text-center text-xs">Подъем</th>
                    <th className="p-2 text-center text-xs">Спуск</th>
                    <th className="p-2 text-center text-xs">Вращение</th>
                    <th className="p-2 text-center text-xs border-l">С циркуляцией</th>
                    <th className="p-2 text-center text-xs">Без циркуляции</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((point, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono font-semibold">{point.depth}</td>
                      <td className="p-3 font-mono text-center border-l">{point.hookLoad.toFixed(1)}</td>
                      <td className="p-3 font-mono text-center bg-blue-500/5">{point.pickupLoad.toFixed(1)}</td>
                      <td className="p-3 font-mono text-center bg-orange-500/5">{point.slackOffLoad.toFixed(1)}</td>
                      <td className="p-3 font-mono text-center bg-green-500/5">{point.rotatingLoad.toFixed(1)}</td>
                      <td className="p-3 font-mono text-center border-l bg-primary/5">{point.torqueWithCirculation.toFixed(2)}</td>
                      <td className="p-3 font-mono text-center bg-muted/30">{point.torqueNoCirculation.toFixed(2)}</td>
                      <td className={`p-3 font-mono text-center border-l font-semibold ${
                        point.overpull > point.hookLoad * 0.3 ? 'text-destructive bg-destructive/10' :
                        point.overpull > point.hookLoad * 0.2 ? 'text-orange-600 bg-orange-500/10' :
                        'text-green-600'
                      }`}>
                        {point.overpull.toFixed(1)}
                      </td>
                      <td className={`p-3 font-mono text-center border-l font-semibold ${
                        point.pipeStress / yieldStrength > 0.8 ? 'text-destructive bg-destructive/10' :
                        point.pipeStress / yieldStrength > 0.67 ? 'text-orange-600 bg-orange-500/10' :
                        'text-green-600'
                      }`}>
                        {point.pipeStress.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Легенда и статистика */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Icon name="Info" size={16} />
                Обозначения
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>• <strong>Статика</strong> - вес колонны в растворе без движения</div>
                <div>• <strong>Подъем</strong> - нагрузка с учетом трения вверх</div>
                <div>• <strong>Спуск</strong> - нагрузка с учетом трения вниз</div>
                <div>• <strong>Вращение</strong> - нагрузка при вращении колонны</div>
                <div>• <strong>Превышение</strong> - разница между подъемом и статикой</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Icon name="BarChart3" size={16} />
                Критические значения
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-destructive/10 border border-destructive/30 rounded">
                  <div className="text-xs text-muted-foreground">Макс. напряжение</div>
                  <div className="font-mono font-bold text-destructive">{maxStress.toFixed(1)} МПа</div>
                </div>
                <div className="p-2 bg-primary/10 border border-primary/30 rounded">
                  <div className="text-xs text-muted-foreground">Предел текучести</div>
                  <div className="font-mono font-bold">{yieldStrength} МПа</div>
                </div>
                <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                  <div className="text-xs text-muted-foreground">Макс. превышение</div>
                  <div className="font-mono font-bold">{Math.max(...data.map(d => d.overpull)).toFixed(1)} кН</div>
                </div>
                <div className={`p-2 rounded border ${
                  safetyFactor > 1.5 ? 'bg-green-500/10 border-green-500/30' :
                  safetyFactor > 1.2 ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-destructive/10 border-destructive/30'
                }`}>
                  <div className="text-xs text-muted-foreground">Коэф. запаса</div>
                  <div className={`font-mono font-bold ${
                    safetyFactor > 1.5 ? 'text-green-600' :
                    safetyFactor > 1.2 ? 'text-orange-600' :
                    'text-destructive'
                  }`}>
                    {safetyFactor.toFixed(2)}x
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
