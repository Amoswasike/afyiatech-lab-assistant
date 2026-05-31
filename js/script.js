import { getState, updateState } from "./state.js";
import {
  unitsMap,
  referenceRanges,
  criticalRanges,
  vitaminDReferenceMap,
  interpretations,
  standardUnits,
  interpretRatio,
  getVitaminDStatus,
} from "./data.js";
import {
  elements,
  renderUnitDropdown,
  toggleInputVisibility,
  clearUIForm,
  renderResults,
} from "./ui.js";
import { toStandardUnit, convertValue } from "./conversions.js";

// ---INIT ---
function init() {
  elements.testSelect.addEventListener("change", onTestChange);
  elements.unitSelect.addEventListener("change", onUnitChange);
  elements.valueInput.addEventListener("input", onValueInput);
  elements.clearBtn.addEventListener("click", onReset);

  elements.totalCholInput?.addEventListener("input", handleAppRender);
  elements.hdlInput?.addEventListener("input", handleAppRender);

  initPWA();

  // Set up baseline UI configuration
  const currentState = getState();
  renderUnitDropdown(currentState.test);
  handleAppRender();
}

// --- Event Handlers---
function onReset() {
  updateState({ value: null });
  clearUIForm();
}

function onTestChange(e) {
  const newTest = e.target.value;
  const defaultUnit = unitsMap[newTest]?.[0] || "mgdl";

  // Safely update state via unified manager
  updateState({test: newTest, unit: defaultUnit });

  // Update view parameters
  renderUnitDropdown(newTest);
  toggleInputVisibility(newTest);
  clearUIForm();
  handleAppRender();
}

function onUnitChange(e) {
  updateState({ unit: e.target.value, value: null });
 clearUIForm();
  handleAppRender();
}

function onValueInput(e) {
  const rawValue = e.target.value === "" ? null : Number(e.target.value);
  updateState({value: Number.isFinite(rawValue) ? rawValue : null });
  handleAppRender();
}

// --- Core Orchestration Pipeline---
function handleAppRender() {
  const state = getState();
  const el = elements.resultPanel;

  // 1. Cholesterol Ratio Mode Routing
  if (state.test === "chol_hdl_ratio") {
    const tc = Number(elements.totalCholInput.value);
    const hdl = Number(elements.hdlInput.value);

    if (!tc || !hdl) {
      el.innerHTML = `<p class="text-sm text-gray-500">Enter valid cholesterol values</p>`;
      return;
    }
    const ratio = +(tc / hdl).toFixed(2);
    const interp = interpretRatio(ratio);

    // Forward formatted structural objects to standard matching layout
    renderResults(
      {
        status: "RATIO COMPLETED",
        message: interp.text,
        isCritical: ratio >= 6,
      },
      {
        primary: `${ratio}`,
        secondary: `Total/HDL ratio calculation`
      },
    );
    return;
  }

  // 2. Empty State Guard
  if (state.value === null) {
    el.innerHTML = `<p class="text-sm test-gray-500">Enter a value to generate clinical
      interpretation</p>`;
      return;
  }

  // 3. calculation Lifecycle
  const conversionResult = convertValue(state.value, state.unit, state.test);
  const standardizedValue = toStandardUnit(state.value, state.unit, state.test);

  const ref = referenceRanges[state.test];
  const crit = criticalRanges[state.test];

  if (!ref || !crit) {
    el.innerHTML = `<p class="text-sm text-red-600 font-medium">
      configuration Error: Missing diagnostic metadata.</p>`;
      return;
  }

  // 4. Deterministic Clinical Metric Tree
  let status = "NORMAL";
  let messageKey = "Normal";

  if (state.test === "vitamin_d") {
    // Redirect to Specialized 6-tier vap engine
    const vitDData = getVitaminDStatus(standardizedValue);
    status = vitDData.label;
    messageKey = vitDData.key;
  } else {
    // Stndard 5-tier processing tree for minerals
    if (standardizedValue <= crit.low) {
      status = "CRITICAL LOW";
      messageKey = "CriticalLow";
    } else if (standardizedValue >= crit.high) {
      status = "CRITICAL HIGH";
      messageKey = "CriticalHigh";
    } else if (standardizedValue < ref.min) {
      status = "LOW";
      messageKey = "Low";
    } else if (standardizedValue > ref.max) {
      status = "HIGH";
      messageKey = "High";
    }
  }

  const clinicalMessage = interpretations[state.test]?.[messageKey] || "";

  // 5. Severity Bar calculation
  const severityBarHtml = (() => {
    const min = ref.min;
    const max = ref.max;
    const low = crit.low;
    const high = crit.high;
    const range = max - min || 1;
    let position = 50;

    if (standardizedValue <= low) {
      position = 10;
    } else if (standardizedValue >= high) {
      position = 90;
    } else {
      position = 20 + ((standardizedValue - min) / range ) * 60;
    }
    position = Math.min(95, Math.max(5, position));
    return `
    <div class="mt-3">
    <div class="h-2 w-full bg-gray-200 rounded-full relative overflow-hidden">
          <div class="absolute left-0 top-0 h-full w-1/5 bg-yellow-300"></div>
          <div class="absolute left-1/5 top-0 h-full w-2/5 bg-green-400"></div>
          <div class="absolute left-3/5 top-0 h-full w-1/5 bg-orange-400"></div>
          <div class="absolute right-0 top-0 h-full w-1/5 bg-red-500"></div>
          <div class="absolute top-0 h-full w-1 bg-black" style="left:${position}%;
          transform:translateX(-50%)"></div>
        </div>
        <div class="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Low</span><span>Normal</span><span>High</span><span>Critical</span>
        </div>
      </div>
    `;
  }) ();

  // 6. Dispatch Data Bundle into the View Container
  renderResults(
    {
      status,
      message: clinicalMessage,
      isCritical: status.includes("CRITICAL") || status.includes("SEVERE") || status.includes("TOXICITY") ,

    },
    {
      primary: conversionResult.primary,
      secondary: `${conversionResult.secondary} <br/> ${severityBarHtml}
      <div class="text-[11px] mt-2 text-gray-500 font-normal">Reference range guidelines:
       ${ref.min} - ${ref.max} ${standardUnits[state.test]}</div>`,

    },
  );

}

// ---- PROGRESSIVE WEB APP LAYOUT LIFECYCLE ----
let installBtn;
let deferredPrompt;
let pwaReady = false;

function initPWA() {
  if (pwaReady) return;
  pwaReady = true;

  installBtn = document.getElementById("installBtn");
  if (!installBtn) return;

  if (window.matchMedia("(display-mode: standalone)").matches) {
    installBtn.style.display = "none";
    return;
  }

  installBtn.addEventListener("click", installApp);

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove("opacity-0", "pointer-events-none");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hideInstall();
  });
}

function installApp() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.finally(() => {
    deferredPrompt = null;
    hideInstall();
  });
}

function hideInstall() {
  installBtn.classList.add("opacity-0", "pointer-events-none");
}

// Start application process
init();
