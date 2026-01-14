import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';

export interface WellProfilePoint {
  depth: number; // м
  inclination: number; // градусы
  azimuth: number; // градусы
  tvd: number; // истинная вертикальная глубина, м
  northing: number; // смещение на север, м
  easting: number; // смещение на восток, м
  dogLeg: number; // интенсивность искривления, град/10м
}

interface ExcelImportProps {
  onImport: (profile: WellProfilePoint[]) => void;
}

export default function ExcelImport({ onImport }: ExcelImportProps) {
  const [fileName, setFileName] = useState<string>('');
  const [profileData, setProfileData] = useState<WellProfilePoint[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const profile: WellProfilePoint[] = jsonData.map((row, index) => {
          const depth = parseFloat(row['Глубина'] || row['Depth'] || row['MD'] || row['Measured Depth'] || 0);
          const inclination = parseFloat(row['Зенитный угол'] || row['Inclination'] || row['INC'] || 0);
          const azimuth = parseFloat(row['Азимут'] || row['Azimuth'] || row['AZI'] || 0);
          const tvd = parseFloat(row['TVD'] || row['ИВГ'] || row['True Vertical Depth'] || depth);
          const northing = parseFloat(row['Север'] || row['Northing'] || row['N'] || 0);
          const easting = parseFloat(row['Восток'] || row['Easting'] || row['E'] || 0);
          
          let dogLeg = 0;
          if (index > 0) {
            const prev = profile[index - 1];
            const deltaDepth = depth - prev.depth;
            const deltaInc = Math.abs(inclination - prev.inclination);
            const deltaAzi = Math.abs(azimuth - prev.azimuth);
            dogLeg = Math.sqrt(deltaInc ** 2 + deltaAzi ** 2) / (deltaDepth / 10);
          }

          return {
            depth,
            inclination,
            azimuth,
            tvd,
            northing,
            easting,
            dogLeg: parseFloat(dogLeg.toFixed(2))
          };
        });

        if (profile.length === 0) {
          throw new Error('Файл не содержит данных профиля скважины');
        }

        setProfileData(profile);
        onImport(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка чтения файла');
        setProfileData([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Глубина': 0,
        'Зенитный угол': 0,
        'Азимут': 0,
        'TVD': 0,
        'Север': 0,
        'Восток': 0
      },
      {
        'Глубина': 500,
        'Зенитный угол': 2,
        'Азимут': 45,
        'TVD': 499.9,
        'Север': 15.4,
        'Восток': 15.4
      },
      {
        'Глубина': 1000,
        'Зенитный угол': 5,
        'Азимут': 45,
        'TVD': 999.2,
        'Север': 43.6,
        'Восток': 43.6
      },
      {
        'Глубина': 1500,
        'Зенитный угол': 8,
        'Азимут': 50,
        'TVD': 1497.5,
        'Север': 104.3,
        'Восток': 95.8
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Профиль');
    XLSX.writeFile(wb, 'шаблон_профиля_скважины.xlsx');
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileSpreadsheet" size={20} />
          Импорт профиля скважины из Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2 flex-1"
              onClick={() => document.getElementById('excel-input')?.click()}
            >
              <Icon name="Upload" size={16} />
              {fileName || 'Выбрать файл Excel'}
            </Button>
            <Button variant="ghost" onClick={downloadTemplate} className="gap-2">
              <Icon name="Download" size={16} />
              Шаблон
            </Button>
          </div>
          <input
            id="excel-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive flex items-start gap-2">
              <Icon name="AlertCircle" size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-2">
          <div className="font-semibold flex items-center gap-2">
            <Icon name="Info" size={16} />
            Формат файла Excel
          </div>
          <div className="text-muted-foreground space-y-1 ml-6">
            <div>• <strong>Глубина</strong> (MD, Measured Depth) — измеренная глубина, м</div>
            <div>• <strong>Зенитный угол</strong> (INC, Inclination) — угол от вертикали, градусы</div>
            <div>• <strong>Азимут</strong> (AZI, Azimuth) — направление, градусы</div>
            <div>• <strong>TVD</strong> (ИВГ, True Vertical Depth) — вертикальная глубина, м</div>
            <div>• <strong>Север/Восток</strong> (N/E, Northing/Easting) — смещения, м</div>
          </div>
        </div>

        {profileData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-2">
                <Icon name="Check" size={16} className="text-green-600" />
                Профиль загружен
              </span>
              <Badge variant="secondary" className="font-mono">
                {profileData.length} точек
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-primary/5 border rounded">
                <div className="text-xs text-muted-foreground mb-1">Макс. глубина</div>
                <div className="text-xl font-bold font-mono">
                  {Math.max(...profileData.map(p => p.depth))} м
                </div>
              </div>
              <div className="p-3 bg-primary/5 border rounded">
                <div className="text-xs text-muted-foreground mb-1">Макс. зенитный угол</div>
                <div className="text-xl font-bold font-mono">
                  {Math.max(...profileData.map(p => p.inclination)).toFixed(1)}°
                </div>
              </div>
              <div className="p-3 bg-primary/5 border rounded">
                <div className="text-xs text-muted-foreground mb-1">Макс. догл</div>
                <div className="text-xl font-bold font-mono">
                  {Math.max(...profileData.map(p => p.dogLeg)).toFixed(2)}°/10м
                </div>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr className="border-b">
                    <th className="p-2 text-left">Глубина, м</th>
                    <th className="p-2 text-left">Зенитный, °</th>
                    <th className="p-2 text-left">Азимут, °</th>
                    <th className="p-2 text-left">TVD, м</th>
                    <th className="p-2 text-left">Догл, °/10м</th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.map((point, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono">{point.depth}</td>
                      <td className="p-2 font-mono">{point.inclination}</td>
                      <td className="p-2 font-mono">{point.azimuth}</td>
                      <td className="p-2 font-mono">{point.tvd.toFixed(1)}</td>
                      <td className="p-2 font-mono">{point.dogLeg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
