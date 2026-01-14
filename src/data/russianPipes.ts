/**
 * База данных обсадных труб российских производителей
 * ОТТМ, БТС, ТМК по ГОСТ Р 51906
 */

export interface RussianPipe {
  manufacturer: 'ОТТМ' | 'БТС' | 'ТМК';
  outerDiameter: number; // мм
  wallThickness: number; // мм
  grade: string; // Марка стали
  weight: number; // кг/м
  innerDiameter: number; // мм
  yieldStrength: number; // МПа
  tensileStrength: number; // МПа
  connectionType: string;
  collapse: number; // МПа - давление смятия
  burst: number; // МПа - давление разрыва
  tension: number; // кН - растяжение
  drift: number; // мм - диаметр проходного калибра
}

export const RUSSIAN_PIPES: RussianPipe[] = [
  // ОТТМ - Орский трубный завод
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 114.3,
    wallThickness: 6.35,
    grade: 'Д',
    weight: 17.05,
    innerDiameter: 101.6,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'ОТТМ-Buttress',
    collapse: 19.3,
    burst: 44.8,
    tension: 645,
    drift: 96.8
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 127,
    wallThickness: 7.72,
    grade: 'Д',
    weight: 23.2,
    innerDiameter: 111.56,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'ОТТМ-Buttress',
    collapse: 21.4,
    burst: 46.5,
    tension: 880,
    drift: 106.4
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 139.7,
    wallThickness: 7.72,
    grade: 'Д',
    weight: 25.5,
    innerDiameter: 124.26,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'ОТТМ-Buttress',
    collapse: 17.9,
    burst: 42.4,
    tension: 965,
    drift: 119.1
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 168.3,
    wallThickness: 8.94,
    grade: 'Е',
    weight: 35.7,
    innerDiameter: 150.42,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'ОТТМ-Premium',
    collapse: 22.1,
    burst: 56.2,
    tension: 1850,
    drift: 145.4
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 177.8,
    wallThickness: 10.36,
    grade: 'Е',
    weight: 43.5,
    innerDiameter: 157.08,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'ОТТМ-Premium',
    collapse: 27.6,
    burst: 60.5,
    tension: 2250,
    drift: 151.4
  },

  // БТС - Белорецкий трубный завод
  {
    manufacturer: 'БТС',
    outerDiameter: 114.3,
    wallThickness: 6.35,
    grade: 'Д',
    weight: 17.0,
    innerDiameter: 101.6,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'БТС-Buttress',
    collapse: 19.5,
    burst: 45.0,
    tension: 640,
    drift: 96.8
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 127,
    wallThickness: 9.19,
    grade: 'К',
    weight: 27.4,
    innerDiameter: 108.62,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'БТС-Premium',
    collapse: 38.6,
    burst: 82.1,
    tension: 1800,
    drift: 103.2
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 139.7,
    wallThickness: 10.54,
    grade: 'К',
    weight: 34.7,
    innerDiameter: 118.62,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'БТС-Premium',
    collapse: 42.8,
    burst: 87.4,
    tension: 2275,
    drift: 113.0
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 168.3,
    wallThickness: 10.59,
    grade: 'Е',
    weight: 42.2,
    innerDiameter: 147.12,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'БТС-Buttress',
    collapse: 28.6,
    burst: 66.7,
    tension: 2185,
    drift: 141.3
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 177.8,
    wallThickness: 11.51,
    grade: 'К',
    weight: 48.3,
    innerDiameter: 154.78,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'БТС-Premium',
    collapse: 43.1,
    burst: 92.1,
    tension: 3165,
    drift: 148.8
  },

  // ТМК - Трубная Металлургическая Компания
  {
    manufacturer: 'ТМК',
    outerDiameter: 114.3,
    wallThickness: 6.35,
    grade: 'Д',
    weight: 17.1,
    innerDiameter: 101.6,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'TMK-Premium',
    collapse: 19.7,
    burst: 45.5,
    tension: 650,
    drift: 96.8
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 127,
    wallThickness: 7.72,
    grade: 'Е',
    weight: 23.3,
    innerDiameter: 111.56,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'TMK-Premium',
    collapse: 29.2,
    burst: 63.5,
    tension: 1205,
    drift: 106.4
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 139.7,
    wallThickness: 9.17,
    grade: 'К',
    weight: 30.2,
    innerDiameter: 121.36,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'TMK-Ultra',
    collapse: 37.9,
    burst: 82.7,
    tension: 1980,
    drift: 115.9
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 168.3,
    wallThickness: 9.52,
    grade: 'Е',
    weight: 37.9,
    innerDiameter: 149.26,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'TMK-Premium',
    collapse: 24.1,
    burst: 58.9,
    tension: 1960,
    drift: 143.8
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 177.8,
    wallThickness: 10.36,
    grade: 'К',
    weight: 43.6,
    innerDiameter: 157.08,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'TMK-Ultra',
    collapse: 36.8,
    burst: 85.9,
    tension: 2850,
    drift: 151.4
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 219.1,
    wallThickness: 10.16,
    grade: 'Е',
    weight: 52.6,
    innerDiameter: 198.78,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'TMK-Premium',
    collapse: 17.6,
    burst: 48.3,
    tension: 2700,
    drift: 193.7
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 244.5,
    wallThickness: 11.99,
    grade: 'К',
    weight: 69.4,
    innerDiameter: 220.52,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'TMK-Ultra',
    collapse: 24.8,
    burst: 66.2,
    tension: 4545,
    drift: 214.9
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 273.1,
    wallThickness: 12.19,
    grade: 'Д',
    weight: 78.8,
    innerDiameter: 248.72,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'TMK-Buttress',
    collapse: 11.4,
    burst: 36.4,
    tension: 2960,
    drift: 243.8
  },

  // Дополнительные типоразмеры ОТТМ
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 219.1,
    wallThickness: 12.7,
    grade: 'К',
    weight: 65.9,
    innerDiameter: 193.7,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'ОТТМ-Ultra',
    collapse: 31.7,
    burst: 75.9,
    tension: 4315,
    drift: 187.7
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 244.5,
    wallThickness: 10.03,
    grade: 'Е',
    weight: 58.0,
    innerDiameter: 224.44,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'ОТТМ-Premium',
    collapse: 15.2,
    burst: 42.6,
    tension: 2995,
    drift: 219.1
  },

  // Дополнительные типоразмеры БТС
  {
    manufacturer: 'БТС',
    outerDiameter: 219.1,
    wallThickness: 10.16,
    grade: 'Д',
    weight: 52.7,
    innerDiameter: 198.78,
    yieldStrength: 379,
    tensileStrength: 517,
    connectionType: 'БТС-Buttress',
    collapse: 13.0,
    burst: 35.4,
    tension: 1995,
    drift: 193.7
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 244.5,
    wallThickness: 13.84,
    grade: 'К',
    weight: 80.1,
    innerDiameter: 216.82,
    yieldStrength: 655,
    tensileStrength: 758,
    connectionType: 'БТС-Ultra',
    collapse: 31.0,
    burst: 74.3,
    tension: 5555,
    drift: 210.3
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 273.1,
    wallThickness: 13.06,
    grade: 'Е',
    weight: 84.4,
    innerDiameter: 246.98,
    yieldStrength: 517,
    tensileStrength: 655,
    connectionType: 'БТС-Premium',
    collapse: 15.5,
    burst: 48.9,
    tension: 4365,
    drift: 241.3
  },
];

export const getPipesByManufacturer = (manufacturer: string) => {
  return RUSSIAN_PIPES.filter(p => p.manufacturer === manufacturer);
};

export const getPipeBySpecs = (outerDiameter: number, wallThickness: number) => {
  return RUSSIAN_PIPES.find(
    p => Math.abs(p.outerDiameter - outerDiameter) < 0.1 && 
         Math.abs(p.wallThickness - wallThickness) < 0.1
  );
};

export const getAvailableDiameters = () => {
  return [...new Set(RUSSIAN_PIPES.map(p => p.outerDiameter))].sort((a, b) => a - b);
};

export const getAvailableGrades = () => {
  return [...new Set(RUSSIAN_PIPES.map(p => p.grade))];
};
