import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface HydraulicsParams {
  flowRate: number; // л/с
  pumpPressure: number; // МПа
  mudDensity: number; // г/см³
  mudViscosity: number; // сП
  pipeID: number; // мм
  pipeOD: number; // мм
  holeSize: number; // мм
  depth: number; // м
  nozzlesArea: number; // мм²
  pressureLossPipe: number; // МПа
  pressureLossAnnulus: number; // МПа
  pressureLossNozzles: number; // МПа
  totalPressureLoss: number; // МПа
  annulusVelocity: number; // м/с
  pipeVelocity: number; // м/с
  jetVelocity: number; // м/с
  hydraulicPower: number; // кВт
  jetImpactForce: number; // Н
  reynoldsNumber: number;
  flowRegime: 'Ламинарный' | 'Переходный' | 'Турбулентный';
}

interface HydraulicsTableProps {
  params: HydraulicsParams;
}

export default function HydraulicsTable({ params }: HydraulicsTableProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Table" size={20} />
          Таблица гидравлических параметров
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Входные параметры */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Icon name="Settings" size={16} />
              Входные параметры
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Расход раствора:</span>
                <span className="font-mono font-semibold">{params.flowRate} л/с</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Давление насоса:</span>
                <span className="font-mono font-semibold">{params.pumpPressure} МПа</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Плотность раствора:</span>
                <span className="font-mono font-semibold">{params.mudDensity} г/см³</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Вязкость раствора:</span>
                <span className="font-mono font-semibold">{params.mudViscosity} сП</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Внутр. диаметр трубы:</span>
                <span className="font-mono font-semibold">{params.pipeID} мм</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Диаметр скважины:</span>
                <span className="font-mono font-semibold">{params.holeSize} мм</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Глубина:</span>
                <span className="font-mono font-semibold">{params.depth} м</span>
              </div>
              <div className="flex justify-between p-2 border rounded bg-muted/30">
                <span>Площадь насадок:</span>
                <span className="font-mono font-semibold">{params.nozzlesArea.toFixed(1)} мм²</span>
              </div>
            </div>
          </div>

          {/* Потери давления */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Icon name="TrendingDown" size={16} />
              Потери давления
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <span className="font-medium">В бурильной трубе</span>
                <span className="font-mono font-bold text-lg">{params.pressureLossPipe.toFixed(2)} МПа</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                <span className="font-medium">В затрубном пространстве</span>
                <span className="font-mono font-bold text-lg">{params.pressureLossAnnulus.toFixed(2)} МПа</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                <span className="font-medium">На насадках долота</span>
                <span className="font-mono font-bold text-lg">{params.pressureLossNozzles.toFixed(2)} МПа</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/20 border-2 border-primary/50 rounded">
                <span className="font-semibold text-base">Суммарные потери</span>
                <span className="font-mono font-bold text-xl">{params.totalPressureLoss.toFixed(2)} МПа</span>
              </div>
            </div>
          </div>

          {/* Скорости потока */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Icon name="Gauge" size={16} />
              Скорости потока
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-accent/10 border rounded text-center">
                <div className="text-xs text-muted-foreground mb-1">В трубе</div>
                <div className="text-2xl font-bold font-mono">{params.pipeVelocity.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">м/с</div>
              </div>
              <div className="p-3 bg-accent/10 border rounded text-center">
                <div className="text-xs text-muted-foreground mb-1">В затрубье</div>
                <div className="text-2xl font-bold font-mono">{params.annulusVelocity.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">м/с</div>
              </div>
              <div className="p-3 bg-primary/10 border rounded text-center">
                <div className="text-xs text-muted-foreground mb-1">Струи из насадок</div>
                <div className="text-2xl font-bold font-mono">{params.jetVelocity.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">м/с</div>
              </div>
            </div>
          </div>

          {/* Режим течения и мощность */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Icon name="Zap" size={16} />
              Эффективность и режим течения
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <div className="text-sm text-muted-foreground mb-1">Гидравлическая мощность</div>
                <div className="text-3xl font-bold font-mono">{params.hydraulicPower.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">кВт</div>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                <div className="text-sm text-muted-foreground mb-1">Ударная сила струи</div>
                <div className="text-3xl font-bold font-mono">{(params.jetImpactForce / 1000).toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">кН</div>
              </div>
            </div>
          </div>

          {/* Число Рейнольдса и режим */}
          <div className="p-4 bg-muted/50 rounded-lg border-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Число Рейнольдса (труба)</div>
                <div className="text-2xl font-bold font-mono">{params.reynoldsNumber.toFixed(0)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-2">Режим течения</div>
                <Badge 
                  variant={
                    params.flowRegime === 'Турбулентный' ? 'default' :
                    params.flowRegime === 'Переходный' ? 'secondary' : 'outline'
                  }
                  className="text-base px-4 py-1"
                >
                  {params.flowRegime}
                </Badge>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <div className="grid grid-cols-3 gap-2">
                <div>Re &lt; 2300: Ламинарный</div>
                <div>2300 ≤ Re ≤ 4000: Переходный</div>
                <div>Re &gt; 4000: Турбулентный</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
