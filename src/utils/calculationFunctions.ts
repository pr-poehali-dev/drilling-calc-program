import { Nozzle } from '@/components/hydraulics/NozzleConfig';
import { HydraulicsParams } from '@/components/hydraulics/HydraulicsTable';
import { TorqueData } from '@/components/torque/TorqueDepthChart';
import { TripTorquePoint } from '@/components/torque/TripTorqueTable';
import { CleaningPillowData } from '@/components/cleaning/HoleCleaningChart';
import { ECDData } from '@/components/ecd/ECDChart';

export interface Calculation {
  id: string;
  timestamp: Date;
  pipeGrade: string;
  outerDiameter: number;
  innerDiameter: number;
  weight: number;
  burst: number;
  collapse: number;
  drilling?: DrillingCalc;
  running?: RunningCalc;
  hydraulics?: HydraulicsCalc;
  connections?: ConnectionCalc;
}

export interface DrillingCalc {
  torque: number;
  hookLoad: number;
  drillingForce: number;
  maxRPM: number;
  axialLoad: number;
  mechanicalSpeed: number;
  wob: number;
}

export interface RunningCalc {
  runningLoad: number;
  buoyantWeight: number;
  dragForce: number;
  maxRunningSpeed: number;
  pressureAtBottom: number;
  velocityAnnulus: number;
}

export interface HydraulicsCalc {
  flowRate: number;
  pressureLossPipe: number;
  pressureLossAnnulus: number;
  totalPressureLoss: number;
  criticalVelocity: number;
  annulusVelocity: number;
  cleaningEfficiency: number;
}

export interface ConnectionCalc {
  maxTorqueConnection: number;
  torqueSafetyFactor: number;
  maxAxialLoad: number;
  axialSafetyFactor: number;
  connectionType: string;
}

export interface PipeData {
  outerDiameter: number;
  wallThickness: number;
  weight: number;
  grade: string;
  yieldStrength: number;
}

export const API_PIPE_GRADES = {
  'H-40': { yield: 40000, tensile: 60000 },
  'J-55': { yield: 55000, tensile: 75000 },
  'K-55': { yield: 55000, tensile: 95000 },
  'N-80': { yield: 80000, tensile: 100000 },
  'L-80': { yield: 80000, tensile: 95000 },
  'C-90': { yield: 90000, tensile: 100000 },
  'P-110': { yield: 110000, tensile: 125000 },
};

export const COMMON_SIZES_SI = [
  { od: 114.3, wt: 6.35, weight: 17.0 },
  { od: 127.0, wt: 7.72, weight: 23.2 },
  { od: 139.7, wt: 7.72, weight: 25.5 },
  { od: 168.3, wt: 8.94, weight: 35.7 },
  { od: 177.8, wt: 10.36, weight: 43.5 },
  { od: 219.1, wt: 10.16, weight: 52.6 },
  { od: 244.5, wt: 11.99, weight: 69.4 },
  { od: 273.1, wt: 12.19, weight: 78.8 },
  { od: 324.0, wt: 11.00, weight: 84.5 },
  { od: 340.0, wt: 12.70, weight: 102.3 },
  { od: 406.4, wt: 12.70, weight: 122.5 },
  { od: 508.0, wt: 14.27, weight: 172.0 },
];

export const calculateBurstPressure = (od: number, wt: number, grade: string): number => {
  const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield * 6.895;
  return (2 * yieldStrength * wt) / od;
};

export const calculateCollapsePressure = (od: number, wt: number, grade: string): number => {
  const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield * 6.895;
  const ratio = od / wt;
  
  if (ratio <= 15) {
    return (2 * yieldStrength) / (ratio - 1);
  } else if (ratio <= 25) {
    return yieldStrength / (0.465 * ratio - 6.775);
  } else {
    return (46950000 * 6.895) / (Math.pow(ratio, 3));
  }
};

export const calculateDrillingParams = (od: number, wt: number, grade: string, depth: number, rpm: number, bitDia: number, axLoad: number, mudDensity: number, frictionCoeff: number, maxTorqueInput: number, weight: string): DrillingCalc => {
  const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield * 6.895;
  const area = Math.PI * (Math.pow(od / 1000, 2) - Math.pow((od - 2 * wt) / 1000, 2)) / 4;
  const pipeWeight = parseFloat(weight);
  
  const buoyancyFactor = 1 - (mudDensity / 7.85);
  const weightInMud = (pipeWeight * depth * buoyancyFactor * 9.81) / 1000;
  
  const wobKN = axLoad * 9.81;
  
  const torque = (weightInMud * frictionCoeff * (od / 1000) / 2) + (wobKN * frictionCoeff * (bitDia / 1000) / 2);
  const hookLoad = weightInMud + (frictionCoeff * weightInMud) + wobKN;
  const drillingForce = wobKN;
  const maxRPM = Math.min(120, Math.sqrt((maxTorqueInput * 1000) / (0.05 * od * depth / 1000)));
  const mechanicalSpeed = (rpm * (bitDia / 1000) * Math.PI) / 60;
  
  return {
    torque: Math.round(torque * 10) / 10,
    hookLoad: Math.round(hookLoad * 10) / 10,
    drillingForce: Math.round(drillingForce * 10) / 10,
    maxRPM: Math.round(maxRPM),
    axialLoad: Math.round(wobKN * 10) / 10,
    mechanicalSpeed: Math.round(mechanicalSpeed * 1000) / 1000,
    wob: wobKN
  };
};

export const calculateRunningParams = (od: number, depth: number, mudWt: number, pipeWt: number, wellDia: number, frictionCoeff: number, flowRate: string): RunningCalc => {
  const buoyancyFactor = 1 - (mudWt / 7.85);
  
  const buoyantWeight = (pipeWt * depth * buoyancyFactor * 9.81) / 1000;
  const dragForce = buoyantWeight * frictionCoeff;
  const runningLoad = buoyantWeight + dragForce;
  const maxRunningSpeed = Math.max(0.5, 3.0 - (depth / 1000));
  
  const pressureGradient = mudWt * 9.81 / 1000;
  const pressureAtBottom = pressureGradient * depth;
  
  const annulusArea = Math.PI * (Math.pow(wellDia / 1000, 2) - Math.pow(od / 1000, 2)) / 4;
  const velocityAnnulus = (parseFloat(flowRate) / 1000) / annulusArea;
  
  return {
    runningLoad: Math.round(runningLoad * 10) / 10,
    buoyantWeight: Math.round(buoyantWeight * 10) / 10,
    dragForce: Math.round(dragForce * 10) / 10,
    maxRunningSpeed: Math.round(maxRunningSpeed * 100) / 100,
    pressureAtBottom: Math.round(pressureAtBottom * 100) / 100,
    velocityAnnulus: Math.round(velocityAnnulus * 100) / 100
  };
};

export const calculateHydraulics = (od: number, id: number, depth: number, flowRate: number, mudWt: number, viscosity: number, wellDia: number): HydraulicsCalc => {
  const pipeArea = Math.PI * Math.pow(id / 1000, 2) / 4;
  const annulusArea = Math.PI * (Math.pow(wellDia / 1000, 2) - Math.pow(od / 1000, 2)) / 4;
  
  const flowRateM3s = flowRate / 1000;
  const velocityPipe = flowRateM3s / pipeArea;
  const velocityAnnulus = flowRateM3s / annulusArea;
  
  const mudDensityKg = mudWt * 1000;
  const reynoldsPipe = (mudDensityKg * velocityPipe * (id / 1000)) / (viscosity / 1000);
  const reynoldsAnnulus = (mudDensityKg * velocityAnnulus * ((wellDia - od) / 1000)) / (viscosity / 1000);
  
  const frictionPipe = reynoldsPipe < 2100 ? 64 / reynoldsPipe : 0.316 / Math.pow(reynoldsPipe, 0.25);
  const frictionAnnulus = reynoldsAnnulus < 2100 ? 64 / reynoldsAnnulus : 0.316 / Math.pow(reynoldsAnnulus, 0.25);
  
  const pressureLossPipe = (frictionPipe * mudDensityKg * Math.pow(velocityPipe, 2) * depth) / (2 * (id / 1000) * 9.81);
  const pressureLossAnnulus = (frictionAnnulus * mudDensityKg * Math.pow(velocityAnnulus, 2) * depth) / (2 * ((wellDia - od) / 1000) * 9.81);
  
  const totalPressureLoss = pressureLossPipe + pressureLossAnnulus;
  
  const criticalVelocity = (2100 * (viscosity / 1000)) / (mudDensityKg * (id / 1000));
  
  const minVelocityClean = 0.4;
  const cleaningEfficiency = Math.min(100, (velocityAnnulus / minVelocityClean) * 100);
  
  return {
    flowRate,
    pressureLossPipe: Math.round(pressureLossPipe / 1000 * 100) / 100,
    pressureLossAnnulus: Math.round(pressureLossAnnulus / 1000 * 100) / 100,
    totalPressureLoss: Math.round(totalPressureLoss / 1000 * 100) / 100,
    criticalVelocity: Math.round(criticalVelocity * 100) / 100,
    annulusVelocity: Math.round(velocityAnnulus * 100) / 100,
    cleaningEfficiency: Math.round(cleaningEfficiency)
  };
};

export const calculateConnections = (od: number, wt: number, grade: string, connType: string, currentTorque: number, weight: string, depth: string): ConnectionCalc => {
  const yieldStrength = API_PIPE_GRADES[grade as keyof typeof API_PIPE_GRADES].yield * 6.895;
  const area = Math.PI * (Math.pow(od / 1000, 2) - Math.pow((od - 2 * wt) / 1000, 2)) / 4;
  
  const makeupTorqueMultiplier = connType === 'Buttress' ? 1.0 : connType === 'API-8rd' ? 0.85 : 1.15;
  const maxTorqueConnection = ((od / 1000) * yieldStrength * area * 0.6 * makeupTorqueMultiplier) / 1000;
  
  const maxAxialLoad = (yieldStrength * area * 0.8) / 1000;
  
  const torqueSafetyFactor = maxTorqueConnection / currentTorque;
  
  const currentAxial = (parseFloat(weight) * parseFloat(depth) * 9.81) / 1000;
  const axialSafetyFactor = maxAxialLoad / currentAxial;
  
  return {
    maxTorqueConnection: Math.round(maxTorqueConnection * 10) / 10,
    torqueSafetyFactor: Math.round(torqueSafetyFactor * 100) / 100,
    maxAxialLoad: Math.round(maxAxialLoad * 10) / 10,
    axialSafetyFactor: Math.round(axialSafetyFactor * 100) / 100,
    connectionType: connType
  };
};

export const calculateAdvancedHydraulics = (
  pipeID: number, pipeOD: number, holeSize: number, depth: number,
  flowRate: number, mudDensity: number, mudViscosity: number, nozzlesArea: number
): HydraulicsParams => {
  const pipeArea = Math.PI * Math.pow(pipeID / 1000, 2) / 4;
  const annulusArea = Math.PI * (Math.pow(holeSize / 1000, 2) - Math.pow(pipeOD / 1000, 2)) / 4;
  
  const flowRateM3s = flowRate / 1000;
  const pipeVelocity = flowRateM3s / pipeArea;
  const annulusVelocity = flowRateM3s / annulusArea;
  
  const reynoldsNumber = (928 * mudDensity * pipeVelocity * (pipeID / 1000)) / (mudViscosity / 1000);
  let flowRegime: 'Ламинарный' | 'Переходный' | 'Турбулентный';
  if (reynoldsNumber < 2300) flowRegime = 'Ламинарный';
  else if (reynoldsNumber <= 4000) flowRegime = 'Переходный';
  else flowRegime = 'Турбулентный';
  
  const frictionPipe = reynoldsNumber < 2300 ? 64 / reynoldsNumber : 0.316 / Math.pow(reynoldsNumber, 0.25);
  const pressureLossPipe = (frictionPipe * mudDensity * Math.pow(pipeVelocity, 2) * depth) / (2 * (pipeID / 1000) * 9.81);
  
  const reynoldsAnnulus = (928 * mudDensity * annulusVelocity * ((holeSize - pipeOD) / 1000)) / (mudViscosity / 1000);
  const frictionAnnulus = reynoldsAnnulus < 2300 ? 64 / reynoldsAnnulus : 0.316 / Math.pow(reynoldsAnnulus, 0.25);
  const pressureLossAnnulus = (frictionAnnulus * mudDensity * Math.pow(annulusVelocity, 2) * depth) / (2 * ((holeSize - pipeOD) / 1000) * 9.81);
  
  const jetVelocity = flowRateM3s / (nozzlesArea / 1000000);
  const pressureLossNozzles = (mudDensity * Math.pow(jetVelocity, 2)) / (2 * 9.81 * 1000);
  
  const totalPressureLoss = pressureLossPipe + pressureLossAnnulus + pressureLossNozzles;
  const hydraulicPower = (flowRateM3s * totalPressureLoss * 1000) / 1000;
  const jetImpactForce = mudDensity * flowRateM3s * jetVelocity;
  
  return {
    flowRate,
    pumpPressure: totalPressureLoss / 1000,
    mudDensity: mudDensity / 1000,
    mudViscosity,
    pipeID,
    pipeOD,
    holeSize,
    depth,
    nozzlesArea,
    pressureLossPipe: pressureLossPipe / 1000,
    pressureLossAnnulus: pressureLossAnnulus / 1000,
    pressureLossNozzles: pressureLossNozzles / 1000,
    totalPressureLoss: totalPressureLoss / 1000,
    annulusVelocity,
    pipeVelocity,
    jetVelocity,
    hydraulicPower,
    jetImpactForce,
    reynoldsNumber,
    flowRegime
  };
};

export const calculateECD = (
  depth: number, staticMudDensity: number, pressureLossAnnulus: number,
  fracGradient: number, poreGradient: number
): ECDData[] => {
  const data: ECDData[] = [];
  const steps = 10;
  const stepSize = depth / steps;
  
  for (let i = 0; i <= steps; i++) {
    const currentDepth = i * stepSize;
    const pressureAtDepth = (pressureLossAnnulus / depth) * currentDepth;
    
    const ecdCirculating = staticMudDensity + (pressureAtDepth * 1000) / (9.81 * currentDepth || 1);
    const ecdTripping = staticMudDensity + (pressureAtDepth * 1000 * 1.15) / (9.81 * currentDepth || 1);
    
    data.push({
      depth: Math.round(currentDepth),
      staticDensity: staticMudDensity,
      ecdCirculating: parseFloat(ecdCirculating.toFixed(3)),
      ecdTripping: parseFloat(ecdTripping.toFixed(3)),
      fracGradient,
      poreGradient
    });
  }
  
  return data;
};

export const calculateTorqueDrag = (
  depth: number, pipeWeight: number, od: number, holeSize: number,
  mudDensity: number, frictionCoeff: number
): { torqueData: TorqueData[]; tripData: TripTorquePoint[] } => {
  const torqueData: TorqueData[] = [];
  const tripData: TripTorquePoint[] = [];
  const steps = 10;
  const stepSize = depth / steps;
  
  const buoyancyFactor = 1 - (mudDensity / 7.85);
  
  for (let i = 0; i <= steps; i++) {
    const currentDepth = i * stepSize;
    const buoyantWeight = pipeWeight * currentDepth * buoyancyFactor * 9.81 / 1000;
    
    const normalForce = buoyantWeight;
    const frictionForce = normalForce * frictionCoeff;
    
    const tripInRotating = (frictionForce * od * 0.0254 / 2) * 0.8;
    const rotatingOffBottom = (frictionForce * od * 0.0254 / 2) * 0.7;
    const tripOutRotating = (frictionForce * od * 0.0254 / 2) * 0.85;
    
    torqueData.push({
      depth: Math.round(currentDepth),
      tripInRotating: parseFloat(tripInRotating.toFixed(2)),
      rotatingOffBottom: parseFloat(rotatingOffBottom.toFixed(2)),
      tripOutRotating: parseFloat(tripOutRotating.toFixed(2))
    });
    
    const hookLoad = buoyantWeight + frictionForce;
    const pickupLoad = hookLoad * 1.1;
    const slackOffLoad = hookLoad * 0.9;
    const rotatingLoad = hookLoad * 0.85;
    
    const area = Math.PI * Math.pow(od * 0.0254 / 2, 2);
    const pipeStress = (hookLoad * 1000) / area;
    
    tripData.push({
      depth: Math.round(currentDepth),
      hookLoad: parseFloat(hookLoad.toFixed(1)),
      pickupLoad: parseFloat(pickupLoad.toFixed(1)),
      slackOffLoad: parseFloat(slackOffLoad.toFixed(1)),
      rotatingLoad: parseFloat(rotatingLoad.toFixed(1)),
      torqueWithCirculation: parseFloat(tripInRotating.toFixed(2)),
      torqueNoCirculation: parseFloat((tripInRotating * 1.2).toFixed(2)),
      overpull: parseFloat((pickupLoad - hookLoad).toFixed(1)),
      pipeStress: parseFloat((pipeStress / 1000000).toFixed(1))
    });
  }
  
  return { torqueData, tripData };
};

export const calculateHoleCleaning = (
  depth: number, flowRate: number, holeSize: number, pipeOD: number,
  mudDensity: number, cuttingsRate: number
): CleaningPillowData[] => {
  const data: CleaningPillowData[] = [];
  const steps = 10;
  const stepSize = depth / steps;
  
  for (let i = 0; i <= steps; i++) {
    const currentDepth = i * stepSize;
    const annulusArea = Math.PI * (Math.pow(holeSize / 1000, 2) - Math.pow(pipeOD / 1000, 2)) / 4;
    const annulusVelocity = (flowRate / 1000) / annulusArea;
    
    const slipVelocity = 0.15;
    const transportRatio = annulusVelocity / slipVelocity;
    const cleaningEfficiency = Math.min(100, transportRatio * 25);
    
    const cuttingsConcentration = (cuttingsRate / (flowRate * 60)) * 100 * (1 - cleaningEfficiency / 100);
    const pillowHeight = (cuttingsConcentration / 100) * stepSize * 0.1;
    
    data.push({
      depth: Math.round(currentDepth),
      flowRate,
      cleaningEfficiency: parseFloat(cleaningEfficiency.toFixed(1)),
      cuttingsConcentration: parseFloat(cuttingsConcentration.toFixed(2)),
      pillowHeight: parseFloat(pillowHeight.toFixed(2)),
      annulusVelocity: parseFloat(annulusVelocity.toFixed(3)),
      transportRatio: parseFloat(transportRatio.toFixed(2))
    });
  }
  
  return data;
};
