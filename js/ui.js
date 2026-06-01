import { unitLabels, unitsMap } from "./data.js";

// Cache DOM elements for better performance
export const elements = {
  testSelect: document.getElementById("test"),
  unitSelect: document.getElementById("unit"),
  valueInput: document.getElementById("value"),
  clearBtn: document.getElementById("clearValue"),
  cholesterolSection: document.getElementById("cholesterolInputs"),
  totalCholInput: document.getElementById("totalChol"),
  hdlInput: document.getElementById("hdl"),
  resultPanel: document.getElementById("result")
};

/**
 * Updates the 'From Unit' dropdown menu based on the selected test.
 * @param {string} selectedTest - The current test name (e.g., 'phosphate')
 */
export function renderUnitDropdown(selectedTest) {
  const allowedUnits = unitsMap[selectedTest] || [];

  // Clear existing options
  elements.unitSelect.innerHTML = "";

  // Populate matching options
  allowedUnits.forEach(unitKey => {
    const option = document.createElement("option");
    option.value = unitKey;
    option.textContent = unitLabels[unitKey] || unitKey;
    elements.unitSelect.appendChild(option);
  });
}

/**
 * Toggles the visibility of standard inputs vs. explicit cholesterol inputs accessibly.
 * @param {string} selectedTest - The current test name
 */
export function toggleInputVisibility(selectedTest) {
  const cholSection = elements.cholesterolSection;
  const standardInputWrapper = document.getElementById("standardInputWrapper");
  const unitSelectorWrapper = elements.unitSelect.closest("div");

  if (selectedTest === "chol_hdl_ratio") {
    // 1. Show Cholesterol Section accessibly
    cholSection.classList.remove("hidden");
    cholSection.setAttribute("aria-hidden", "false");

    // 2. Hide Standard Single Value Input Wrapper accessibly
    if (standardInputWrapper) {
      standardInputWrapper.classList.add("hidden");
      standardInputWrapper.setAttribute("aria-hidden", "true");
    }

    // 3. Hide Unit Dropdown Wrapper accessibly (not needed for ratios)
    if (unitSelectorWrapper) {
      unitSelectorWrapper.classList.add("hidden");
      unitSelectorWrapper.setAttribute("aria-hidden", "true");
    }
  } else {
    // 1. Hide Cholesterol Section accessibly
    cholSection.classList.add("hidden");
    cholSection.setAttribute("aria-hidden", "true");

    // 2. Show Standard Single Value Input Wrapper accessibly
    if (standardInputWrapper) {
      standardInputWrapper.classList.remove("hidden");
      standardInputWrapper.setAttribute("aria-hidden", "false");
    }

    // 3. Show Unit Dropdown Wrapper accessibly
    if (unitSelectorWrapper) {
      unitSelectorWrapper.classList.remove("hidden");
      unitSelectorWrapper.setAttribute("aria-hidden", "false");
    }
  }
}

/**
 * Clears out form inputs and resets the result card.
 */
export function clearUIForm() {
  elements.valueInput.value = "";
  elements.totalCholInput.value = "";
  elements.hdlInput.value = "";
  
  // Structured to cleanly layer as a white card above the #F9FAFB app background canvas
  elements.resultPanel.className = "p-4 rounded-xl bg-white border border-gray-200 text-gray-500 text-sm font-medium transition-all shadow-xs";
  
  // UPDATED: Clearer microcopy matching the conversion purpose
  elements.resultPanel.innerHTML = `
    <div class="text-center py-2 text-gray-400">
      <p class="font-semibold text-gray-500">Awaiting Clinical Data</p>
      <p class="text-xs mt-0.5">Select a test and enter values to view standardized mmol/L or nmol/L equivalents.</p>
    </div>
  `;
}

/**
 * Renders the clinical result panel with dynamic color blocks matching severe statuses.
 * @param {object} interpretationResult - Object containing { status, message, isCritical }
 * @param {object} conversionResult - Object containing { primary, secondary }
 */
export function renderResults(interpretationResult, conversionResult) {
  const { status, message, isCritical } = interpretationResult;
  const { primary, secondary } = conversionResult;

  // Determine design elements dynamically based on severity
  let themeClasses = "bg-gray-50 border-gray-200 text-gray-800";
  let badgeClasses = "bg-gray-200 text-gray-700";

  // 1. Green Theme: Optimal / Healthy baseline targets
  if (status === "NORMAL" || status === "SUFFICIENT") {
    themeClasses = "bg-green-50 border-brand-green/30 text-green-950";
    badgeClasses = "bg-brand-green text-white font-bold shadow-sm";

  // 2. Yellow Theme: Borderline warning / Inadequate trends
  } else if (
    status === "LOW" || 
    status === "HIGH" || 
    status === "INSUFFICIENCY" || 
    status === "DEFICIENCY" || 
    status === "POSSIBLE EXCESS"
  ) {
    themeClasses = "bg-yellow-50 border-yellow-300 text-yellow-950";
    badgeClasses = "bg-yellow-400 text-yellow-950 font-semibold";

  // 3. Red Theme: High-alert panic limits / Dangerous clinical indicators
  } else if (
    isCritical || 
    status.includes("CRITICAL") || 
    status.includes("SEVERE") || 
    status.includes("TOXICITY")
  ) {
    themeClasses = "bg-red-50 border-red-300 text-red-950 animate-pulse";
    badgeClasses = "bg-red-600 text-white font-bold shadow-sm";

  // 4. Blue Theme: Fallback processing rules for calculations/ratios
  } else {
    themeClasses = "bg-blue-50/60 border-brand-blue/20 text-brand-blue";
    badgeClasses = "bg-brand-blue text-white font-semibold shadow-sm";
  }

  elements.resultPanel.className = `p-4 rounded-xl border-2 transition-all shadow-sm ${themeClasses}`;

  elements.resultPanel.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs uppercase tracking-wider font-semibold opacity-75">Analysis Output</span>
      <span class="text-xs px-2 py-0.5 rounded-full ${badgeClasses}">${status}</span>
    </div>
    <div class="space-y-1">
      <p class="text-2xl font-bold tracking-tight">${primary}</p>
      <p class="text-sm opacity-75">Converted equivalent: <span class="font-semibold">${secondary}</span></p>
    </div>
    <hr class="my-2 border-current opacity-10" />
    <p class="text-sm font-medium leading-relaxed">${message}</p>
  `;
}