import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface ECDData {
  depth: number; // м
  staticDensity: number; // г/см³ - статическая плотность
  ecdCirculating: number; // г/см³ - ЭЦП при циркуляции
  ecdTripping: number; // г/см³ - ЭЦП при СПО
  fracGradient: number; // г/см³ - градиент гидроразрыва
  poreGradient: number; // г/см³ - градиент порового давления
}

interface ECDChartProps {
  data: ECDData[];
}

export default function ECDChart({ data }: ECDChartProps) {
  const maxDepth = Math.max(...data.map(d => d.depth));
  const maxECD = Math.max(...data.map(d => Math.max(d.ecdCirculating, d.ecdTripping, d.fracGradient)));

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="Activity" size={20} />
            ЭЦП (Эквивалентная Циркуляционная Плотность)
          </span>
          <Badge variant="outline" className="font-mono">
            Макс. глубина: {maxDepth} м
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Статическая плотность</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>ЭЦП при циркуляции</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>ЭЦП при СПО</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Градиент поглощения</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="depth" 
                label={{ value: 'Глубина, м', position: 'insideBottom', offset: -10 }}
                stroke="hsl(var(--foreground))"
              />
              <YAxis 
                label={{ value: 'Плотность, г/см³', angle: -90, position: 'insideLeft' }}
                stroke="hsl(var(--foreground))"
                domain={[0.8, 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => `${value.toFixed(3)} г/см³`}
                labelFormatter={(label) => `Глубина: ${label} м`}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="line"
              />
              
              {/* Градиент гидроразрыва - красная пунктирная */}
              <Line 
                type="monotone" 
                dataKey="fracGradient" 
                stroke="rgb(239, 68, 68)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Градиент гидроразрыва"
                dot={false}
              />
              
              {/* Градиент порового давления - серая пунктирная */}
              <Line 
                type="monotone" 
                dataKey="poreGradient" 
                stroke="rgb(156, 163, 175)" 
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Градиент порового давления"
                dot={false}
              />
              
              {/* Статическая плотность */}
              <Line 
                type="monotone" 
                dataKey="staticDensity" 
                stroke="rgb(59, 130, 246)" 
                strokeWidth={2}
                name="Статическая плотность"
                dot={{ r: 3 }}
              />
              
              {/* ЭЦП при циркуляции */}
              <Line 
                type="monotone" 
                dataKey="ecdCirculating" 
                stroke="rgb(34, 197, 94)" 
                strokeWidth={2.5}
                name="ЭЦП при циркуляции"
                dot={{ r: 4 }}
              />
              
              {/* ЭЦП при СПО */}
              <Line 
                type="monotone" 
                dataKey="ecdTripping" 
                stroke="rgb(249, 115, 22)" 
                strokeWidth={2.5}
                name="ЭЦП при СПО"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Статистика и предупреждения */}
          <div className="space-y-3 pt-4 border-t">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <div className="text-sm font-semibold mb-2">Статическая плотность</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Средняя:</span>
                    <span className="font-mono font-bold">
                      {(data.reduce((sum, d) => sum + d.staticDensity, 0) / data.length).toFixed(3)} г/см³
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="text-sm font-semibold mb-2">ЭЦП при циркуляции</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Макс.:</span>
                    <span className="font-mono font-bold">
                      {Math.max(...data.map(d => d.ecdCirculating)).toFixed(3)} г/см³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">На глубине:</span>
                    <span className="font-mono font-bold">
                      {data.find(d => d.ecdCirculating === Math.max(...data.map(x => x.ecdCirculating)))?.depth} м
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                <div className="text-sm font-semibold mb-2">ЭЦП при СПО</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Макс.:</span>
                    <span className="font-mono font-bold">
                      {Math.max(...data.map(d => d.ecdTripping)).toFixed(3)} г/см³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">На глубине:</span>
                    <span className="font-mono font-bold">
                      {data.find(d => d.ecdTripping === Math.max(...data.map(x => x.ecdTripping)))?.depth} м
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Проверка окна плотностей */}
            {data.some(d => d.ecdCirculating > d.fracGradient || d.ecdTripping > d.fracGradient) && (
              <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg flex items-start gap-3">
                <Icon name="AlertTriangle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-destructive">ПРЕДУПРЕЖДЕНИЕ: Риск гидроразрыва!</div>
                  <div className="text-sm text-muted-foreground">
                    ЭЦП превышает градиент гидроразрыва на некоторых глубинах. Возможно поглощение бурового раствора.
                  </div>
                </div>
              </div>
            )}

            {data.some(d => d.staticDensity < d.poreGradient) && (
              <div className="p-4 bg-orange-500/10 border-2 border-orange-500/30 rounded-lg flex items-start gap-3">
                <Icon name="AlertCircle" size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-orange-600">ВНИМАНИЕ: Низкая плотность раствора!</div>
                  <div className="text-sm text-muted-foreground">
                    Статическая плотность ниже порового давления. Риск газонефтеводопроявления.
                  </div>
                </div>
              </div>
            )}

            {!data.some(d => d.ecdCirculating > d.fracGradient || d.ecdTripping > d.fracGradient) &&
             !data.some(d => d.staticDensity < d.poreGradient) && (
              <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-lg flex items-start gap-3">
                <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-green-600">Окно плотностей в норме</div>
                  <div className="text-sm text-muted-foreground">
                    Все значения ЭЦП находятся в безопасном диапазоне между поровым давлением и гидроразрывом.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Формула расчета ЭЦП */}
          <div className="p-4 bg-muted/50 rounded-lg border text-sm">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Формула расчета ЭЦП
            </div>
            <div className="space-y-2 text-muted-foreground ml-6">
              <div>ЭЦП = ρ<sub>статич</sub> + ΔP<sub>потери</sub> / (0.00981 × H)</div>
              <div className="text-xs mt-2">
                где: ρ<sub>статич</sub> — статическая плотность раствора (г/см³),<br/>
                ΔP<sub>потери</sub> — потери давления в затрубье (кПа),<br/>
                H — глубина (м)
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
