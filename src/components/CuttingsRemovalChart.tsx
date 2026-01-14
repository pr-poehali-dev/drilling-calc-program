import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface CuttingsData {
  depth: number; // м
  flowRate: number; // л/с
  cuttingsConcentration: number; // %
  bedHeight: number; // см
  cleaningEfficiency: number; // %
}

interface CuttingsRemovalChartProps {
  data: CuttingsData[];
}

export default function CuttingsRemovalChart({ data }: CuttingsRemovalChartProps) {
  if (data.length === 0) return null;

  const maxDepth = Math.max(...data.map(d => d.depth));
  const maxConcentration = Math.max(...data.map(d => d.cuttingsConcentration));
  const maxBedHeight = Math.max(...data.map(d => d.bedHeight));

  const getYPosition = (depth: number) => {
    return (depth / maxDepth) * 280 + 10;
  };

  const getXConcentration = (conc: number) => {
    return (conc / maxConcentration) * 100 + 80;
  };

  const getXBedHeight = (height: number) => {
    return (height / maxBedHeight) * 100 + 220;
  };

  const getXEfficiency = (eff: number) => {
    return (eff / 100) * 100 + 360;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Layers" size={20} />
          Диаграмма очистки ствола скважины
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 520 330" className="w-full" style={{ maxHeight: '450px' }}>
          {/* Ось глубины */}
          <line x1="70" y1="10" x2="70" y2="290" stroke="currentColor" strokeWidth="2" />
          
          {/* Метки глубины */}
          {data.map((point, idx) => {
            const y = getYPosition(point.depth);
            return (
              <g key={idx}>
                <line x1="65" y1={y} x2="70" y2={y} stroke="currentColor" strokeWidth="1" />
                <text x="60" y={y + 4} textAnchor="end" fontSize="10" fill="currentColor">
                  {point.depth.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Линия концентрации шлама */}
          <polyline
            points={data.map((d) => `${getXConcentration(d.cuttingsConcentration)},${getYPosition(d.depth)}`).join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.5"
          />
          
          {/* Линия высоты подушки */}
          <polyline
            points={data.map((d) => `${getXBedHeight(d.bedHeight)},${getYPosition(d.depth)}`).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* Линия эффективности очистки */}
          <polyline
            points={data.map((d) => `${getXEfficiency(d.cleaningEfficiency)},${getYPosition(d.depth)}`).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* Вертикальные оси для каждого параметра */}
          <line x1="80" y1="290" x2="180" y2="290" stroke="currentColor" strokeWidth="1" />
          <line x1="220" y1="290" x2="320" y2="290" stroke="currentColor" strokeWidth="1" />
          <line x1="360" y1="290" x2="460" y2="290" stroke="currentColor" strokeWidth="1" />

          {/* Подписи параметров */}
          <text x="130" y="310" textAnchor="middle" fontSize="11" fontWeight="600" fill="#ef4444">
            Концентрация шлама, %
          </text>
          <text x="270" y="310" textAnchor="middle" fontSize="11" fontWeight="600" fill="#f59e0b">
            Высота подушки, см
          </text>
          <text x="410" y="310" textAnchor="middle" fontSize="11" fontWeight="600" fill="#10b981">
            Эффективность, %
          </text>

          {/* Подпись оси глубины */}
          <text x="30" y="150" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor" transform="rotate(-90, 30, 150)">
            Глубина, м
          </text>

          {/* Значения на точках */}
          {data.map((point, idx) => {
            const y = getYPosition(point.depth);
            return (
              <g key={`values-${idx}`}>
                <circle cx={getXConcentration(point.cuttingsConcentration)} cy={y} r="3" fill="#ef4444" />
                <circle cx={getXBedHeight(point.bedHeight)} cy={y} r="3" fill="#f59e0b" />
                <circle cx={getXEfficiency(point.cleaningEfficiency)} cy={y} r="3" fill="#10b981" />
              </g>
            );
          })}
        </svg>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {data.map((point, idx) => (
            <div key={idx} className="p-3 bg-muted/30 rounded-lg border text-sm">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="MapPin" size={14} />
                Глубина: {point.depth} м
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Расход:</span>
                  <span className="font-mono font-semibold">{point.flowRate} л/с</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Концентрация:</span>
                  <span className="font-mono font-semibold text-red-600">{point.cuttingsConcentration}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Подушка:</span>
                  <span className="font-mono font-semibold text-orange-600">{point.bedHeight} см</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Эффективность:</span>
                  <span className="font-mono font-semibold text-green-600">{point.cleaningEfficiency}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
