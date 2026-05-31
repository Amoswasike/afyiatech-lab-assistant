export const unitsMap = {
  phosphate: ["mgdl", "mmol"],
  magnesium: ["mgdl", "mmol"],
  uric_acid: ["mgdl", "umol", "mmol"],
  chol_hdl_ratio: ["ratio"],
  vitamin_d: ["ngml", "nmol"]
};

export const unitLabels = {
  mgdl: "mg/dL",
  mmol: "mmol/L",
  umol: "µmol/L",
  ratio: "ratio",
  ngml: "ng/mL",
  nmol: "nmol/L"
};

// Standardized keys to match unitsMap
export const standardUnits = {
  phosphate: "mmol",
  magnesium: "mmol",
  uric_acid: "umol",
  chol_hdl_ratio: "ratio",
  vitamin_d: "nmol"
};

// Multipliers to convert from mg/dL to Standard Units
export const conversionFactors = {
  phosphate: 0.323,   // mg/dL * 0.323 = mmol/L
  magnesium: 0.411,   // mg/dL * 0.411 = mmol/L
  uric_acid: 59.48,    // mg/dL * 59.48 = µmol/L
  vitamin_d: 2.496
};

// References and Criticals now perfectly step-mesh together
export const referenceRanges = {
  phosphate: { min: 0.80, max: 1.50 },
  magnesium: { min: 0.75, max: 0.95 },
  uric_acid: { min: 150, max: 420 },
  vitamin_d: { min: 75.0, max: 250.0}
};

export const criticalRanges = {
  phosphate: { low: 0.50, high: 2.50 },
  magnesium: { low: 0.50, high: 1.50 },
  uric_acid: { low: 100, high: 600 },
  vitamin_d: { low: 25.0, high: 375.1 }
};

export const vitaminDReferenceMap = {
  severeDeficiency:{ min: 0, max: 24.9, label: "Severe Deficiency" },
  deficienncy: { min: 25, max: 49.9, label: "Dificiency" },
  insufficiency: { min: 50, max: 74.9, label: "Insufficiency" },
  sufficiency: { min: 75, max: 250, label: "Suffient" },
  excess: { min: 250.1, max: 375, label: "Possible Excess" },
  toxicity: { min: 375.1, max: Infinity, label: "Potential Toxixity" }

};

export const  interpretations = {
  phosphate: {
    CriticalLow: "Critical hypophosphatemia! Severe risk of respiratory or cardiac failure.",
    Low: "Possible hypophosphatemia. Monitor levels closely.",
    Normal: "Normal phosphate level.",
    High: "Possible hyperphosphatemia. Evaluate renal function.",
    CriticalHigh: "Critical hyperphosphatemia! Risk of severe hypocalcemia and tetany."

  },
  magnesium: {
    CriticalLow: "Critical hypomagnesemia! High risk of neuromuscular irritability and cardiac arrhythmias.",
    Low: "Possible hypomagnesemia.",
    Normal: "Normal magnesium level.",
    High: "Possible hypermagnesemia.",
    CriticalHigh: "Critical hypermagnesemia! Risk of severe respiratory depression and bradycardia."
  },
  uric_acid: {
    CriticalLow: "Severely low uric acid. Investigate for renal tubular defects or malnutrition.",
    Low: "Low uric acid level.",
    Normal: "Normal uric acid.",
    High: "Possible hyperuricemia. Monitor for signs of gout or joint pain.",
    CriticalHigh: "Critical hyperuricemia! High risk of acute uric acid nephropathy or tumor lysis syndrome complications."
  },
  vitamin_d: {
    SevereDeficiency: "Severe Vitamin D deficiency! Critical risk of rickets, osteomalacia, and profound bone loss.",
    Deficiency: "Vitamin D Deficiency. Increased risk of osteoporosis and secondary hyperparathyroidism.",
    Insufficiency: "Vitamin D Insufficiency. Sub-optimal bone metabolism and calcium absorption.",
    Sufficient: "Optimal Vitamin D status. Adequate for bone health and general homeostasis.",
    PossibleExcess: "Elevated Vitamin D status. Monitor clinical history to avoid accidental over-supplementation.",
    PotentialToxicity: "Critical Vitamin D Toxicity! High risk of hypercalcemia, irreversible renal calcification, and arrhythmias."
  }
};

export function interpretRatio(ratio) {
  if (ratio < 3.5) return { text: "Low risk", color: "text-green-600" };
  if (ratio < 5) return { text: "Moderate risk", color: "text-yellow-600" };
  if (ratio < 6) return { text: "High risk", color: "text-orange-600" };
  return { text: "Very high risk", color: "text-red-700 font-bold" };
}

/**
 * Returns the exact 6-tier classification slice for a given standardized nmol/L value
 * @param {number} nmolValue
 * @returns {object} { label, messageKey }
 */
 export function getVitaminDStatus(nmolValue) {
   if (nmolValue <= 24.9) return { label: "SEVERE DIFICIENCY", key: "SevereDeficiency" };
   if (nmolValue <= 49.9) return { label: "DEFICIENCY", key: "Dificiency" };
   if (nmolValue <= 74.9) return { label: "INSUFFICIENCY", key: "Insufficiency" };
   if (nmolValue <= 250.0) return { label: "SUFFICIENT", key: "Sufficient" };
   if (nmolValue <= 375.0) return { label: "POSSIBLE EXCESS", key: "PossibleExcess" };
   return { label: "POTENTIAL TOXICITY", key: "PotentialToxicity"};
 }
