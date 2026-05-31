import { conversionFactors } from "./data.js";

const URIC_MMOL_TO_UMOL = 1000;

/**
 * Converts any incoming unit to the system's standard unit for processing.
 */
export function toStandardUnit(value, unit, test) {
  if (unit === "umol" || unit === "mmol" && test !== "uric_acid") {
    return value; // Already in standard unit
  }

  if (test === "uric_acid") {
    if (unit === "mgdl") return value * conversionFactors.uric_acid;
    if (unit === "mmol") return value * URIC_MMOL_TO_UMOL;
  }

  // For phosphate and magnesium: mg/dL -> mmol/L
  const factor = conversionFactors[test];
  return unit === "mgdl" ? value * factor : value;
}

/**
 * Returns an object containing the formatted primary value and its converted peer.
 */
export function convertValue(value, unit, test) {
  // 1.Handle Uric Acid (Has 3 potential units)
  if (test === "uric_acid") {
    if (unit === "mgdl") {
      const umol = value * conversionFactors.uric_acid;
      return {
        primary: `${value.toFixed(2)} mg/dL`,
        secondary: `${umol.toFixed(2)} µmol/L`
      };
    }
    if (unit === "mmol") {
      const umol = value * URIC_MMOL_TO_UMOL;
      return {
        primary: `${value.toFixed(2)} mmol/L`,
        secondary: `${umol.toFixed(2)} µmol/L`
      };
    }
    return {
      primary: `${value.toFixed(2)} µmol/L`,
      secondary: "Already in standard unit"
    };
  }

  // 2. Handle Vitamin D ( Has 2 potential units: ngml, nmol)
  if (test === "vitamin_d") {
    const factor = conversionFactors.vitamin_d;
    if (unit === "ngml") {
      return {
        primary: `${value.toFixed(2)} ng/mL`,
        secondary: `${(value * factor).toFixed(2)} nmol/L`
      };
    }
    // If source unit is nmol/L, divide to get ng/mL
    return {
      primary: `${value.toFixed(2)} nmol/L`,
      secondary: `${(value / factor).toFixed(2)} ng/mL`
    };
  }

  // 3. Handle Phosphate and Magnesium (2 potential units)
  const factor = conversionFactors[test];

  if (unit === "mgdl") {
    return {
      primary: `${value.toFixed(2)} mg/dL`,
      secondary: `${(value * factor).toFixed(2)} mmol/L`
    };
  }

  // FIXED: Divide by factor to safely scale back up to mg/dL from mmol/L
  return {
    primary: `${value.toFixed(2)} mmol/L`,
    secondary: `${(value / factor).toFixed(2)} mg/dL`
  };
}
