import { conversionFactors } from "./data.js";

const URIC_MMOL_TO_UMOL = 1000;

export function toStandardUnit(value, unit, test) {
  if (value === null || value === undefined) return 0;

  // 1. Handle vitamin D
  if (test === "vitamin_d") {
    if (unit === "nmol") return value; // already standard
    if (unit === "ngml") return value * conversionFactors.vitamin_d;
  }

  // 2. Handle Uric Acid
  if (test === "uric_acid") {
    if (unit === "umol") return value; // already standard
    if (unit === "mgdl") return value * conversionFactors.uric_acid;
    if (unit === "mmol") return value * URIC_MMOL_TO_UMOL;
  }

  // 3. Handle phosphate and magnesium
  if (unit === "mmol") return value;
  const factor = conversionFactors[test];
  return unit === "mgdl" && factor ? value * factor : value;

}

/**
 * Returns an object containing the formatted primary value and its converted peer.
 */
 export function convertValue(value, unit, test) {
   // 1. Handle uric acid -has 3 potential units
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

   // 2. Handle vitamin D- 2 potential units
   if (test === "vitamin_d") {
     const factor = conversionFactors.vitamin_d;
     if ( unit === "ngml") {
       return {
         primary: `${value.toFixed(2)} ng/mL`,
         secondary: `${(value * factor).toFixed(2)} nmol/L`
       };
     }
     return {
       primary: `${value.toFixed(2)} nmol/L`,
       secondary: `${(value / factor).toFixed(2)} ng/mL`
     };
   }

   // 3. Handle phosphate and magnesium- 2 potential units
   const factor = conversionFactors[test];
   if(unit === "mgdl") {
     return {
       primary: `${value.toFixed(2)} mg/dL`,
       secondary: `${(value * factor).toFixed(2)} mmol/L`
     };
   }
   return {
     primary: `${value.toFixed(2)} mmol/L`,
     secondary: `${(value / factor).toFixed(2)} mg/dL`
   };


 }
