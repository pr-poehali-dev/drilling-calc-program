import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface TorqueDepthChartProps {
  depths: number[]; // м
  torqueRunning: number[]; // кН·м
  torqueRotating: number[]; // кН·м
  torquePulling: number[]; // кН·м
  maxTorque: number; // кН·м
}

export default function TorqueDepthChart({ 
  depths, 
  torqueRunning, 
  torqueRotating, 
  torquePulling, 
  maxTorque 
}: TorqueDepthChartProps) {
  const maxDepth = Math.max(...depths);
  const maxTorqueValue = Math.max(...torqueRunning, ...torqueRotating, ...torquePulling, maxTorque);

  const getYPosition = (depth: number) => {
    return (depth / maxDepth) * 300;
  };

  const getXPosition = (torque: number, offset: number = 0) => {
    return ((torque / maxTorqueValue) * 250) + offset + 60;
  };

  // Создаём точки для линий
  const runningPoints = depths.map((d, i) => 
    `${getXPosition(torqueRunning[i])},${getYPosition(d)}`
  ).join(' ');
  
  const rotatingPoints = depths.map((d, i) => 
    `${getXPosition(torqueRotating[i])},${getYPosition(d)}`
  ).join(' ');
  
  const pullingPoints = depths.map((d, i) => 
    `${getXPosition(torquePulling[i])},${getYPosition(d)}`
  ).join(' ');

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" size={20} />
          Крутящий момент на устье по глубине
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 450 350" className="w-full" style={{ maxHeight: '400px' }}>
          {/* Оси */}
          <line x1="60" y1="10" x2="60" y2="310" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="310" x2="410" y2="310" stroke="currentColor" strokeWidth="2" />
          
          {/* Метки глубины */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const depth = (maxDepth * percent) / 100;
            const y = (percent / 100) * 300 + 10;
            return (
              <g key={percent}>
                <line x1="55" y1={y} x2="60" y2={y} stroke="currentColor" strokeWidth="1" />
                <text x="50" y={y + 4} textAnchor="end" fontSize="10" fill="currentColor">
                  {depth.toFixed(0)}
                </text>
              </g>
            );
          })}
          
          {/* Метки момента */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const torque = (maxTorqueValue * percent) / 100;
            const x = (percent / 100) * 250 + 60;
            return (
              <g key={`torque-${percent}`}>
                <line x1={x} y1="310" x2={x} y2="315" stroke="currentColor" strokeWidth="1" />
                <text x={x} y="330" textAnchor="middle" fontSize="10" fill="currentColor">
                  {torque.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Линия максимального момента */}
          <line 
            x1={getXPosition(maxTorque)} 
            y1="10" 
            x2={getXPosition(maxTorque)} 
            y2="310" 
            stroke="#ef4444" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
            opacity="0.6"
          />

          {/* Кривые */}
          <polyline 
            points={runningPoints} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2.5"
          />
          <polyline 
            points={rotatingPoints} 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="2.5"
          />
          <polyline 
            points={pullingPoints} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2.5"
          />

          {/* Подписи осей */}
          <text x="25" y="160" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor" transform="rotate(-90, 25, 160)">
            Глубина, м
          </text>
          <text x="235" y="345" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor">
            Крутящий момент, кН·м
          </text>
        </svg>

        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          <Badge className="bg-blue-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            Спуск с вращением
          </Badge>
          <Badge className="bg-orange-500">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
            Вращение над забоем
          </Badge>
          <Badge className="bg-green-500">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            Подъём с вращением
          </Badge>
          <Badge variant="destructive">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            Максимальный момент
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
