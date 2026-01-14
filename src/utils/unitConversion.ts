/**
 * Конвертация единиц измерения для бурения
 * Переключение между системой СИ и полевыми единицами
 */

export type UnitSystem = 'SI' | 'FIELD';

export interface Units {
  length: string;
  pressure: string;
  density: string;
  force: string;
  torque: string;
  flowRate: string;
  velocity: string;
  weight: string;
}

export const UNITS: Record<UnitSystem, Units> = {
  SI: {
    length: 'м',
    pressure: 'МПа',
    density: 'кг/м³',
    force: 'кН',
    torque: 'кН·м',
    flowRate: 'л/с',
    velocity: 'м/с',
    weight: 'кг/м'
  },
  FIELD: {
    length: 'ft',
    pressure: 'psi',
    density: 'ppg',
    force: 'lbf',
    torque: 'ft-lbf',
    flowRate: 'gpm',
    velocity: 'ft/s',
    weight: 'lb/ft'
  }
};

export const convert = {
  lengthToSI: (value: number, from: 'ft' | 'in' | 'm'): number => {
    switch (from) {
      case 'ft': return value * 0.3048;
      case 'in': return value * 0.0254;
      case 'm': return value;
    }
  },
  
  lengthFromSI: (value: number, to: 'ft' | 'in' | 'm'): number => {
    switch (to) {
      case 'ft': return value / 0.3048;
      case 'in': return value / 0.0254;
      case 'm': return value;
    }
  },

  pressureToSI: (value: number, from: 'psi' | 'bar' | 'MPa'): number => {
    switch (from) {
      case 'psi': return value * 0.00689476;
      case 'bar': return value * 0.1;
      case 'MPa': return value;
    }
  },

  pressureFromSI: (value: number, to: 'psi' | 'bar' | 'MPa'): number => {
    switch (to) {
      case 'psi': return value / 0.00689476;
      case 'bar': return value / 0.1;
      case 'MPa': return value;
    }
  },

  densityToSI: (value: number, from: 'ppg' | 'sg' | 'kg/m3'): number => {
    switch (from) {
      case 'ppg': return value * 119.826;
      case 'sg': return value * 1000;
      case 'kg/m3': return value;
    }
  },

  densityFromSI: (value: number, to: 'ppg' | 'sg' | 'kg/m3'): number => {
    switch (to) {
      case 'ppg': return value / 119.826;
      case 'sg': return value / 1000;
      case 'kg/m3': return value;
    }
  },

  forceToSI: (value: number, from: 'lbf' | 'kN' | 'tonf'): number => {
    switch (from) {
      case 'lbf': return value * 0.00444822;
      case 'kN': return value;
      case 'tonf': return value * 9.80665;
    }
  },

  forceFromSI: (value: number, to: 'lbf' | 'kN' | 'tonf'): number => {
    switch (to) {
      case 'lbf': return value / 0.00444822;
      case 'kN': return value;
      case 'tonf': return value / 9.80665;
    }
  },

  torqueToSI: (value: number, from: 'ft-lbf' | 'kN-m' | 'N-m'): number => {
    switch (from) {
      case 'ft-lbf': return value * 0.00135582;
      case 'kN-m': return value;
      case 'N-m': return value * 0.001;
    }
  },

  torqueFromSI: (value: number, to: 'ft-lbf' | 'kN-m' | 'N-m'): number => {
    switch (to) {
      case 'ft-lbf': return value / 0.00135582;
      case 'kN-m': return value;
      case 'N-m': return value / 0.001;
    }
  },

  flowRateToSI: (value: number, from: 'gpm' | 'l/s' | 'bpm'): number => {
    switch (from) {
      case 'gpm': return value * 0.0630902;
      case 'l/s': return value;
      case 'bpm': return value * 2.64979;
    }
  },

  flowRateFromSI: (value: number, to: 'gpm' | 'l/s' | 'bpm'): number => {
    switch (to) {
      case 'gpm': return value / 0.0630902;
      case 'l/s': return value;
      case 'bpm': return value / 2.64979;
    }
  },

  velocityToSI: (value: number, from: 'ft/s' | 'm/s' | 'ft/min'): number => {
    switch (from) {
      case 'ft/s': return value * 0.3048;
      case 'm/s': return value;
      case 'ft/min': return value * 0.00508;
    }
  },

  velocityFromSI: (value: number, to: 'ft/s' | 'm/s' | 'ft/min'): number => {
    switch (to) {
      case 'ft/s': return value / 0.3048;
      case 'm/s': return value;
      case 'ft/min': return value / 0.00508;
    }
  },

  weightToSI: (value: number, from: 'lb/ft' | 'kg/m'): number => {
    switch (from) {
      case 'lb/ft': return value * 1.48816;
      case 'kg/m': return value;
    }
  },

  weightFromSI: (value: number, to: 'lb/ft' | 'kg/m'): number => {
    switch (to) {
      case 'lb/ft': return value / 1.48816;
      case 'kg/m': return value;
    }
  }
};

export interface FrictionCoefficients {
  casingToCasing: number; // труба к обсадной колонне
  casingToOpenHole: number; // труба к открытому стволу
  rotatingCasing: number; // вращение обсадной трубы
  rotatingOpenHole: number; // вращение в открытом стволе
}

export const DEFAULT_FRICTION_COEFFICIENTS: FrictionCoefficients = {
  casingToCasing: 0.25, // типичное значение для стали по стали
  casingToOpenHole: 0.35, // типичное значение для горных пород
  rotatingCasing: 0.20, // снижается при вращении
  rotatingOpenHole: 0.28 // снижается при вращении
};

export const formatValue = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatUnit = (value: number, unitSystem: UnitSystem, type: keyof Units, decimals: number = 2): string => {
  return `${formatValue(value, decimals)} ${UNITS[unitSystem][type]}`;
};
