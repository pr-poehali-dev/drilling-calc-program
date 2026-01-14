import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface WellProfilePoint {
  md: number; // Measured Depth, м
  inc: number; // Inclination, градусы
  azm: number; // Azimuth, градусы
  tvd: number; // True Vertical Depth, м
  ns: number; // North-South displacement, м
  ew: number; // East-West displacement, м
  dls: number; // Dogleg Severity, град/10м
  section: 'cased' | 'openhole'; // Тип интервала
}

interface WellProfileUploaderProps {
  onProfileLoaded: (profile: WellProfilePoint[]) => void;
}

export default function WellProfileUploader({ onProfileLoaded }: WellProfileUploaderProps) {
  const [profile, setProfile] = useState<WellProfilePoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

        if (jsonData.length === 0) {
          throw new Error('Файл пустой или неверный формат');
        }

        // Парсинг данных с гибкими названиями колонок
        const parsedProfile: WellProfilePoint[] = jsonData.map((row, idx) => {
          const md = parseFloat(row['MD'] || row['Глубина'] || row['Measured Depth'] || row['md'] || 0);
          const inc = parseFloat(row['INC'] || row['Зенитный угол'] || row['Inclination'] || row['inc'] || 0);
          const azm = parseFloat(row['AZM'] || row['Азимут'] || row['Azimuth'] || row['azm'] || 0);
          const tvd = parseFloat(row['TVD'] || row['Вертикаль'] || row['True Vertical Depth'] || row['tvd'] || md);
          const ns = parseFloat(row['NS'] || row['North-South'] || row['СЮ'] || row['ns'] || 0);
          const ew = parseFloat(row['EW'] || row['East-West'] || row['ВЗ'] || row['ew'] || 0);
          
          // Расчёт DLS если не указан
          let dls = parseFloat(row['DLS'] || row['Интенсивность'] || row['dls'] || 0);
          if (dls === 0 && idx > 0) {
            const prevPoint = jsonData[idx - 1];
            const prevInc = parseFloat(prevPoint['INC'] || prevPoint['Зенитный угол'] || 0);
            const prevAzm = parseFloat(prevPoint['AZM'] || prevPoint['Азимут'] || 0);
            const prevMd = parseFloat(prevPoint['MD'] || prevPoint['Глубина'] || 0);
            
            const deltaInc = inc - prevInc;
            const deltaAzm = (azm - prevAzm) * Math.sin((inc + prevInc) / 2 * Math.PI / 180);
            const deltaMd = md - prevMd;
            
            if (deltaMd > 0) {
              dls = Math.sqrt(deltaInc * deltaInc + deltaAzm * deltaAzm) * 10 / deltaMd;
            }
          }

          const sectionStr = (row['Section'] || row['Секция'] || row['section'] || '').toLowerCase();
          const section: 'cased' | 'openhole' = 
            sectionStr.includes('open') || sectionStr.includes('откр') ? 'openhole' : 'cased';

          return { md, inc, azm, tvd, ns, ew, dls, section };
        });

        setProfile(parsedProfile);
        onProfileLoaded(parsedProfile);
        setIsLoading(false);
      } catch (err: any) {
        setError(`Ошибка чтения файла: ${err.message}`);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Ошибка чтения файла');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const clearProfile = () => {
    setProfile(null);
    setError(null);
    onProfileLoaded([]);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileSpreadsheet" size={20} />
          Профиль скважины
        </CardTitle>
        <CardDescription>
          Загрузите Excel файл с траекторией скважины (MD, INC, AZM, TVD, NS, EW, DLS, Section)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!profile ? (
          <div className="space-y-3">
            <label 
              htmlFor="well-profile-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/10 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Icon name="Upload" size={32} className="mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Нажмите для загрузки</span> или перетащите файл
                </p>
                <p className="text-xs text-muted-foreground">Excel файл (.xlsx, .xls)</p>
              </div>
              <input 
                id="well-profile-upload" 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Loader2" size={16} className="animate-spin" />
                Загрузка файла...
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Alert className="bg-green-500/10 border-green-500/30">
              <Icon name="CheckCircle2" className="h-4 w-4 text-green-600" />
              <AlertDescription className="ml-2">
                Траектория загружена: <strong>{profile.length}</strong> точек измерения
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-muted/50 rounded border">
                <div className="text-muted-foreground text-xs mb-1">Общая глубина</div>
                <div className="font-bold font-mono">{profile[profile.length - 1].md.toFixed(1)} м</div>
              </div>
              <div className="p-3 bg-muted/50 rounded border">
                <div className="text-muted-foreground text-xs mb-1">Макс. зенитный угол</div>
                <div className="font-bold font-mono">{Math.max(...profile.map(p => p.inc)).toFixed(1)}°</div>
              </div>
              <div className="p-3 bg-muted/50 rounded border">
                <div className="text-muted-foreground text-xs mb-1">Макс. интенсивность</div>
                <div className="font-bold font-mono">{Math.max(...profile.map(p => p.dls)).toFixed(2)}°/10м</div>
              </div>
              <div className="p-3 bg-muted/50 rounded border">
                <div className="text-muted-foreground text-xs mb-1">Вертикальная глубина</div>
                <div className="font-bold font-mono">{profile[profile.length - 1].tvd.toFixed(1)} м</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono">
                {profile.filter(p => p.section === 'cased').length} точек в обсадке
              </Badge>
              <Badge variant="outline" className="font-mono">
                {profile.filter(p => p.section === 'openhole').length} точек в открытом стволе
              </Badge>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearProfile}
              className="w-full"
            >
              <Icon name="X" size={16} className="mr-2" />
              Очистить профиль
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <Icon name="AlertCircle" className="h-4 w-4" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
