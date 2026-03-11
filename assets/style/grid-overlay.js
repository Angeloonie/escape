(function () {
  if (window.HPGridOverlay) {
    return;
  }

  const DEFAULT_GRID_ROWS = 12;
  const DEFAULT_GRID_COLS = 32;
  const STORAGE_KEY = "hp_grid_overlay_on";

  function getConfig() {
    const config = window.HPGridOverlayConfig || {};
    const rows = Number.isInteger(config.rows) && config.rows > 0 ? config.rows : DEFAULT_GRID_ROWS;
    const cols = Number.isInteger(config.cols) && config.cols > 0 ? config.cols : DEFAULT_GRID_COLS;
    const rowLabelMode = config.rowLabelMode === "numbers" ? "numbers" : "letters";
    const colLabelMode = config.colLabelMode === "letters" ? "letters" : "numbers";
    const rowStart = Number.isInteger(config.rowStart) ? config.rowStart : 0;
    const colStart = Number.isInteger(config.colStart) ? config.colStart : 1;

    return { rows, cols, rowLabelMode, colLabelMode, rowStart, colStart };
  }

  function formatLabel(index, mode, startAt) {
    if (mode === "numbers") {
      return String(index + startAt);
    }
    return String.fromCharCode(65 + index);
  }

  function createGrid() {
    const config = getConfig();
    const controls = document.createElement("div");
    controls.className = "hp-grid-controls";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "hp-grid-toggle";
    toggle.textContent = "Grid: uit";

    const status = document.createElement("div");
    status.className = "hp-grid-status";
    status.setAttribute("aria-live", "polite");
    status.textContent = "";

    controls.appendChild(toggle);
    controls.appendChild(status);

    const overlay = document.createElement("div");
    overlay.className = "hp-grid-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.setProperty("--hp-grid-rows", String(config.rows));
    overlay.style.setProperty("--hp-grid-cols", String(config.cols));

    const lines = document.createElement("div");
    lines.className = "hp-grid-lines";

    const labels = document.createElement("div");
    labels.className = "hp-grid-labels";

    const tooltip = document.createElement("div");
    tooltip.className = "hp-grid-tooltip";
    tooltip.hidden = true;

    overlay.appendChild(lines);
    overlay.appendChild(labels);
    overlay.appendChild(tooltip);

    document.body.appendChild(controls);
    document.body.appendChild(overlay);

    return { toggle, status, overlay, labels, tooltip, config };
  }

  function buildLabels(labels, config) {
    labels.innerHTML = "";
    for (let r = 0; r < config.rows; r += 1) {
      const rowLabel = document.createElement("span");
      rowLabel.className = "hp-grid-row-label";
      rowLabel.textContent = formatLabel(r, config.rowLabelMode, config.rowStart);
      rowLabel.style.top = (((r + 0.5) / config.rows) * 100).toFixed(3) + "%";
      labels.appendChild(rowLabel);
    }

    for (let c = 0; c < config.cols; c += 1) {
      const colLabel = document.createElement("span");
      colLabel.className = "hp-grid-col-label";
      colLabel.textContent = formatLabel(c, config.colLabelMode, config.colStart);
      colLabel.style.left = (((c + 0.5) / config.cols) * 100).toFixed(3) + "%";
      labels.appendChild(colLabel);
    }
  }

  function saveState(isOn) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, isOn ? "1" : "0");
    } catch (_) {}
  }

  function loadState() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function init() {
    const ui = createGrid();
    if (!ui) {
      return;
    }
    const { toggle, status, overlay, labels, tooltip, config } = ui;
    let isOn = false;
    let lastPointerEvent = null;
    let rafId = 0;

    const setState = (nextOn) => {
      isOn = !!nextOn;
      overlay.classList.toggle("is-on", isOn);
      overlay.setAttribute("aria-hidden", String(!isOn));
      toggle.textContent = "Grid: " + (isOn ? "aan" : "uit");
      if (!isOn) {
        status.textContent = "";
        tooltip.hidden = true;
      } else {
        status.textContent = "Huidig: -";
      }
      saveState(isOn);
    };

    const ensureLabels = () => {
      if (!labels.children.length) {
        buildLabels(labels, config);
      }
    };

    const updateGridCursor = (event) => {
      if (!isOn || !event) {
        return;
      }

      const x = Math.max(0, Math.min(window.innerWidth, event.clientX));
      const y = Math.max(0, Math.min(window.innerHeight, event.clientY));
      const col = Math.min(config.cols - 1, Math.floor((x / Math.max(window.innerWidth, 1)) * config.cols));
      const row = Math.min(config.rows - 1, Math.floor((y / Math.max(window.innerHeight, 1)) * config.rows));
      const colLabel = formatLabel(col, config.colLabelMode, config.colStart);
      const rowLabel = formatLabel(row, config.rowLabelMode, config.rowStart);
      const label = `${colLabel}${rowLabel}`;

      status.textContent = "Huidig: " + label;
      tooltip.textContent = label;
      tooltip.style.left = x.toFixed(1) + "px";
      tooltip.style.top = y.toFixed(1) + "px";
      tooltip.hidden = false;
    };

    const requestCursorUpdate = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateGridCursor(lastPointerEvent);
      });
    };

    toggle.addEventListener("click", () => {
      const nextState = !isOn;
      if (nextState) {
        ensureLabels();
      }
      setState(nextState);
      if (nextState && lastPointerEvent) {
        requestCursorUpdate();
      }
    });

    document.addEventListener("pointermove", (event) => {
      lastPointerEvent = event;
      if (isOn) {
        requestCursorUpdate();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() !== "g") {
        return;
      }
      const target = event.target;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target && target.isContentEditable);
      if (isInput) {
        return;
      }
      event.preventDefault();
      toggle.click();
    });

    document.addEventListener("pointerleave", () => {
      if (!isOn) {
        return;
      }
      status.textContent = "Huidig: -";
      tooltip.hidden = true;
    });

    const startOn = loadState();
    if (startOn) {
      ensureLabels();
    }
    setState(startOn);
  }

  window.HPGridOverlay = { init: init };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
