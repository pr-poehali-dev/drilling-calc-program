// База данных обсадных труб ОТТМ, БТС, ТМК по ГОСТ Р 51753 и API 5CT

export interface CasingPipeSpec {
  manufacturer: 'ОТТМ' | 'БТС' | 'ТМК';
  outerDiameter: number; // мм
  weight: number; // кг/м
  wallThickness: number; // мм
  innerDiameter: number; // мм
  grade: string; // Марка стали
  connectionType: string; // Тип резьбы
  drift: number; // Диаметр шаблона, мм
  collapse: number; // Сопротивление смятию, МПа
  burst: number; // Сопротивление разрыву, МПа
  tensile: number; // Прочность на растяжение, кН
}

export const CASING_DATABASE: CasingPipeSpec[] = [
  // ОТТМ - Трубы 177.8 мм (7")
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 177.8,
    weight: 29.5,
    wallThickness: 7.52,
    innerDiameter: 162.76,
    grade: 'Д',
    connectionType: 'ОТТМ',
    drift: 156.2,
    collapse: 26.3,
    burst: 41.8,
    tensile: 1587
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 177.8,
    weight: 35.3,
    wallThickness: 9.19,
    innerDiameter: 159.42,
    grade: 'К',
    connectionType: 'ОТТМ',
    drift: 153.9,
    collapse: 34.6,
    burst: 54.2,
    tensile: 2072
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 177.8,
    weight: 38.7,
    wallThickness: 10.16,
    innerDiameter: 157.48,
    grade: 'Е',
    connectionType: 'ОТТМ Premium',
    drift: 152.0,
    collapse: 41.2,
    burst: 64.8,
    tensile: 2587
  },

  // БТС - Трубы 177.8 мм (7")
  {
    manufacturer: 'БТС',
    outerDiameter: 177.8,
    weight: 29.5,
    wallThickness: 7.52,
    innerDiameter: 162.76,
    grade: 'Д',
    connectionType: 'БТС-premium',
    drift: 156.2,
    collapse: 27.1,
    burst: 42.5,
    tensile: 1620
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 177.8,
    weight: 35.3,
    wallThickness: 9.19,
    innerDiameter: 159.42,
    grade: 'К',
    connectionType: 'БТС-premium',
    drift: 153.9,
    collapse: 35.8,
    burst: 55.6,
    tensile: 2145
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 177.8,
    weight: 42.1,
    wallThickness: 11.51,
    innerDiameter: 154.78,
    grade: 'Е',
    connectionType: 'БТС-ultra',
    drift: 149.4,
    collapse: 48.9,
    burst: 78.3,
    tensile: 3124
  },

  // ТМК - Трубы 177.8 мм (7")
  {
    manufacturer: 'ТМК',
    outerDiameter: 177.8,
    weight: 29.5,
    wallThickness: 7.52,
    innerDiameter: 162.76,
    grade: 'Д',
    connectionType: 'ТМК UP',
    drift: 156.2,
    collapse: 26.8,
    burst: 42.1,
    tensile: 1605
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 177.8,
    weight: 35.3,
    wallThickness: 9.19,
    innerDiameter: 159.42,
    grade: 'К',
    connectionType: 'ТМК PREMIUM',
    drift: 153.9,
    collapse: 35.2,
    burst: 54.9,
    tensile: 2108
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 177.8,
    weight: 38.7,
    wallThickness: 10.16,
    innerDiameter: 157.48,
    grade: 'Л',
    connectionType: 'ТМК ULTRA',
    drift: 152.0,
    collapse: 43.5,
    burst: 68.7,
    tensile: 2856
  },

  // ОТТМ - Трубы 244.5 мм (9 5/8")
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 244.5,
    weight: 53.5,
    wallThickness: 10.03,
    innerDiameter: 224.44,
    grade: 'Д',
    connectionType: 'ОТТМ',
    drift: 218.7,
    collapse: 20.8,
    burst: 32.4,
    tensile: 2145
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 244.5,
    weight: 60.3,
    wallThickness: 11.43,
    innerDiameter: 221.64,
    grade: 'К',
    connectionType: 'ОТТМ Premium',
    drift: 216.1,
    collapse: 25.6,
    burst: 39.8,
    tensile: 2687
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 244.5,
    weight: 73.2,
    wallThickness: 13.84,
    innerDiameter: 216.82,
    grade: 'Е',
    connectionType: 'ОТТМ Premium',
    drift: 211.3,
    collapse: 34.2,
    burst: 53.6,
    tensile: 3658
  },

  // БТС - Трубы 244.5 мм (9 5/8")
  {
    manufacturer: 'БТС',
    outerDiameter: 244.5,
    weight: 53.5,
    wallThickness: 10.03,
    innerDiameter: 224.44,
    grade: 'Д',
    connectionType: 'БТС-premium',
    drift: 218.7,
    collapse: 21.4,
    burst: 33.1,
    tensile: 2178
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 244.5,
    weight: 60.3,
    wallThickness: 11.43,
    innerDiameter: 221.64,
    grade: 'К',
    connectionType: 'БТС-premium',
    drift: 216.1,
    collapse: 26.5,
    burst: 41.2,
    tensile: 2789
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 244.5,
    weight: 73.2,
    wallThickness: 13.84,
    innerDiameter: 216.82,
    grade: 'Л',
    connectionType: 'БТС-ultra',
    drift: 211.3,
    collapse: 37.8,
    burst: 59.4,
    tensile: 4256
  },

  // ТМК - Трубы 244.5 мм (9 5/8")
  {
    manufacturer: 'ТМК',
    outerDiameter: 244.5,
    weight: 53.5,
    wallThickness: 10.03,
    innerDiameter: 224.44,
    grade: 'Д',
    connectionType: 'ТМК UP',
    drift: 218.7,
    collapse: 21.1,
    burst: 32.8,
    tensile: 2162
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 244.5,
    weight: 60.3,
    wallThickness: 11.43,
    innerDiameter: 221.64,
    grade: 'К',
    connectionType: 'ТМК PREMIUM',
    drift: 216.1,
    collapse: 26.0,
    burst: 40.3,
    tensile: 2738
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 244.5,
    weight: 67.5,
    wallThickness: 12.7,
    innerDiameter: 219.1,
    grade: 'Е',
    connectionType: 'ТМК ULTRA',
    drift: 213.6,
    collapse: 31.5,
    burst: 49.2,
    tensile: 3412
  },

  // ОТТМ - Трубы 298.5 мм (11 3/4")
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 298.5,
    weight: 74.2,
    wallThickness: 11.13,
    innerDiameter: 276.24,
    grade: 'Д',
    connectionType: 'ОТТМ',
    drift: 270.5,
    collapse: 16.8,
    burst: 29.4,
    tensile: 2456
  },
  {
    manufacturer: 'ОТТМ',
    outerDiameter: 298.5,
    weight: 83.5,
    wallThickness: 12.57,
    innerDiameter: 273.36,
    grade: 'К',
    connectionType: 'ОТТМ Premium',
    drift: 267.7,
    collapse: 20.7,
    burst: 35.8,
    tensile: 3124
  },

  // БТС - Трубы 298.5 мм (11 3/4")
  {
    manufacturer: 'БТС',
    outerDiameter: 298.5,
    weight: 74.2,
    wallThickness: 11.13,
    innerDiameter: 276.24,
    grade: 'Д',
    connectionType: 'БТС-premium',
    drift: 270.5,
    collapse: 17.3,
    burst: 30.1,
    tensile: 2512
  },
  {
    manufacturer: 'БТС',
    outerDiameter: 298.5,
    weight: 83.5,
    wallThickness: 12.57,
    innerDiameter: 273.36,
    grade: 'Е',
    connectionType: 'БТС-ultra',
    drift: 267.7,
    collapse: 22.8,
    burst: 39.5,
    tensile: 3658
  },

  // ТМК - Трубы 298.5 мм (11 3/4")
  {
    manufacturer: 'ТМК',
    outerDiameter: 298.5,
    weight: 74.2,
    wallThickness: 11.13,
    innerDiameter: 276.24,
    grade: 'Д',
    connectionType: 'ТМК UP',
    drift: 270.5,
    collapse: 17.0,
    burst: 29.7,
    tensile: 2484
  },
  {
    manufacturer: 'ТМК',
    outerDiameter: 298.5,
    weight: 83.5,
    wallThickness: 12.57,
    innerDiameter: 273.36,
    grade: 'К',
    connectionType: 'ТМК PREMIUM',
    drift: 267.7,
    collapse: 21.2,
    burst: 36.8,
    tensile: 3287
  }
];

export function getCasingByParams(diameter: number, weight: number, manufacturer?: string) {
  const tolerance = 0.5; // мм
  return CASING_DATABASE.filter(pipe => 
    Math.abs(pipe.outerDiameter - diameter) < tolerance &&
    Math.abs(pipe.weight - weight) < 1.0 &&
    (!manufacturer || pipe.manufacturer === manufacturer)
  );
}

export function getCasingByDiameter(diameter: number) {
  const tolerance = 0.5;
  return CASING_DATABASE.filter(pipe => 
    Math.abs(pipe.outerDiameter - diameter) < tolerance
  );
}

export function getManufacturers() {
  return ['ОТТМ', 'БТС', 'ТМК'] as const;
}

export function getAvailableDiameters() {
  const diameters = new Set(CASING_DATABASE.map(p => p.outerDiameter));
  return Array.from(diameters).sort((a, b) => a - b);
}
