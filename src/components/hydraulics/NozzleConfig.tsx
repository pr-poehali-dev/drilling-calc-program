import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface Nozzle {
  id: number;
  diameter: number; // мм
}

interface NozzleConfigProps {
  nozzles: Nozzle[];
  onChange: (nozzles: Nozzle[]) => void;
}

export default function NozzleConfig({ nozzles, onChange }: NozzleConfigProps) {
  const addNozzle = () => {
    if (nozzles.length < 12) {
      onChange([...nozzles, { id: Date.now(), diameter: 12 }]);
    }
  };

  const removeNozzle = (id: number) => {
    onChange(nozzles.filter(n => n.id !== id));
  };

  const updateNozzle = (id: number, diameter: number) => {
    onChange(nozzles.map(n => n.id === id ? { ...n, diameter } : n));
  };

  const totalArea = nozzles.reduce((sum, n) => {
    const radius = n.diameter / 2;
    return sum + Math.PI * radius * radius;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="CircleDot" size={20} />
            Конфигурация насадок долота
          </span>
          <Badge variant="secondary" className="font-mono">
            {nozzles.length}/12
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {nozzles.map((nozzle, index) => (
            <div key={nozzle.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Badge variant="outline" className="w-16 justify-center">
                #{index + 1}
              </Badge>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Диаметр насадки, мм</Label>
                <Input
                  type="number"
                  value={nozzle.diameter}
                  onChange={(e) => updateNozzle(nozzle.id, parseFloat(e.target.value) || 0)}
                  step="0.5"
                  min="6"
                  max="32"
                  className="mt-1"
                />
              </div>
              <div className="text-right min-w-[80px]">
                <div className="text-xs text-muted-foreground">Площадь</div>
                <div className="font-mono font-semibold">
                  {(Math.PI * Math.pow(nozzle.diameter / 2, 2)).toFixed(1)} мм²
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNozzle(nozzle.id)}
                className="text-destructive hover:text-destructive"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))}
        </div>

        {nozzles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Icon name="CircleDot" size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Добавьте насадки долота</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <Button
            onClick={addNozzle}
            disabled={nozzles.length >= 12}
            variant="outline"
            className="gap-2"
          >
            <Icon name="Plus" size={16} />
            Добавить насадку
          </Button>
          
          {nozzles.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Общая площадь</div>
              <div className="text-lg font-bold font-mono">{totalArea.toFixed(1)} мм²</div>
            </div>
          )}
        </div>

        {nozzles.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-primary/5 rounded-lg text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Мин. диаметр</div>
              <div className="font-mono font-semibold">
                {Math.min(...nozzles.map(n => n.diameter))} мм
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Макс. диаметр</div>
              <div className="font-mono font-semibold">
                {Math.max(...nozzles.map(n => n.diameter))} мм
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Средний</div>
              <div className="font-mono font-semibold">
                {(nozzles.reduce((sum, n) => sum + n.diameter, 0) / nozzles.length).toFixed(1)} мм
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
