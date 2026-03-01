/**
 * CancelKit Embed Widget v1.0
 * Vanilla JS modal for cancel flow interception.
 * <5KB gzipped. No dependencies.
 */

"use strict";

var _config = null;
var _modal = null;
var _flowData = null;
var _currentStepIndex = 0;
var _customerId = null;
var _onCancel = null;
var _onSave = null;

// ─── Public API ──────────────────────────────────────────────────────────────

var CancelKit = {
  /**
   * Initialize CancelKit with your API endpoint and flow config.
   * @param {{ apiUrl?: string, flowId: string }} opts
   */
  init: function (opts) {
    if (!opts || !opts.flowId) {
      console.error("[CancelKit] init() requires flowId");
      return;
    }
    _config = {
      apiUrl: opts.apiUrl || "",
      flowId: opts.flowId,
    };
  },

  /**
   * Show the cancel flow modal.
   * @param {{ customerId?: string, onCancel?: Function, onSave?: Function }} opts
   */
  show: function (opts) {
    if (!_config) {
      console.error("[CancelKit] Call init() before show()");
      return;
    }
    opts = opts || {};
    _customerId = opts.customerId || null;
    _onCancel = typeof opts.onCancel === "function" ? opts.onCancel : null;
    _onSave = typeof opts.onSave === "function" ? opts.onSave : null;

    if (_flowData) {
      _startFlow();
    } else {
      _fetchFlow().then(_startFlow).catch(function (err) {
        console.error("[CancelKit] Failed to load flow:", err);
      });
    }
  },
};

// ─── Flow Loading ─────────────────────────────────────────────────────────

function _fetchFlow() {
  return fetch(_config.apiUrl + "/api/public/flows/" + _config.flowId)
    .then(function (res) {
      if (!res.ok) throw new Error("Flow not found");
      return res.json();
    })
    .then(function (data) {
      _flowData = data;
      return data;
    });
}

// ─── Event Tracking ───────────────────────────────────────────────────────

function _track(eventType, stepId, metadata) {
  var payload = {
    flowId: _config.flowId,
    eventType: eventType,
  };
  if (_customerId) payload.customerId = _customerId;
  if (stepId) payload.stepId = stepId;
  if (metadata) payload.metadata = metadata;

  fetch(_config.apiUrl + "/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(function () {}); // fire-and-forget
}

// ─── Modal Helpers ────────────────────────────────────────────────────────

function _startFlow() {
  if (!_flowData || !_flowData.steps || _flowData.steps.length === 0) {
    console.warn("[CancelKit] Flow has no steps");
    return;
  }
  _track("impression");
  _currentStepIndex = 0;
  _createModal();
  _renderStep(_flowData.steps[0]);
}

function _createModal() {
  _destroyModal();

  if (!document.getElementById("ck-style")) {
    var style = document.createElement("style");
    style.id = "ck-style";
    style.textContent = [
      "#ck-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
      "#ck-modal{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:28px;max-width:440px;width:90%;color:#f4f4f5;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.5)}",
      "#ck-close{position:absolute;top:12px;right:16px;background:none;border:none;color:#71717a;cursor:pointer;font-size:20px;line-height:1;padding:4px}",
      "#ck-close:hover{color:#f4f4f5}",
      ".ck-title{font-size:18px;font-weight:700;margin:0 0 10px;color:#f4f4f5}",
      ".ck-body{font-size:14px;color:#a1a1aa;margin:0 0 20px;line-height:1.6}",
      ".ck-options{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}",
      ".ck-opt{background:#27272a;border:1px solid #3f3f46;border-radius:8px;padding:10px 14px;cursor:pointer;color:#f4f4f5;font-size:14px;text-align:left;transition:border-color .15s}",
      ".ck-opt:hover{border-color:#e11d48}",
      ".ck-opt.selected{border-color:#e11d48;background:#2d1a21}",
      ".ck-actions{display:flex;gap:10px;justify-content:flex-end}",
      ".ck-btn{padding:9px 18px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;transition:opacity .15s}",
      ".ck-btn:hover{opacity:.85}",
      ".ck-btn-primary{background:#e11d48;color:#fff}",
      ".ck-btn-ghost{background:transparent;color:#71717a;border:1px solid #3f3f46}",
      ".ck-offer-card{background:#27272a;border:1px solid #e11d48;border-radius:10px;padding:16px;margin-bottom:20px}",
      ".ck-offer-badge{font-size:11px;font-weight:700;color:#e11d48;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}",
      ".ck-offer-title{font-size:16px;font-weight:700;color:#f4f4f5;margin:0 0 6px}",
      ".ck-offer-body{font-size:13px;color:#a1a1aa;margin:0}",
      ".ck-step-indicator{font-size:11px;color:#52525b;margin-bottom:16px}",
    ].join("");
    document.head.appendChild(style);
  }

  var overlay = document.createElement("div");
  overlay.id = "ck-overlay";

  var modal = document.createElement("div");
  modal.id = "ck-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  var closeBtn = document.createElement("button");
  closeBtn.id = "ck-close";
  closeBtn.innerHTML = "&#x2715;";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", function () {
    _destroyModal();
  });

  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  _modal = modal;
}

function _destroyModal() {
  var overlay = document.getElementById("ck-overlay");
  if (overlay) overlay.parentNode.removeChild(overlay);
  _modal = null;
}

function _renderStep(step) {
  if (!_modal || !step) return;

  _track("step_view", step.id);

  var steps = _flowData.steps;
  var total = steps.length;
  var current = _currentStepIndex + 1;

  var closeBtn = _modal.querySelector("#ck-close");
  _modal.innerHTML = "";
  if (closeBtn) _modal.appendChild(closeBtn);

  var indicator = document.createElement("p");
  indicator.className = "ck-step-indicator";
  indicator.textContent = "Step " + current + " of " + total;
  _modal.appendChild(indicator);

  if (step.type === "question") {
    _renderQuestion(step);
  } else if (step.type === "offer") {
    _renderOffer(step);
  } else if (step.type === "confirmation") {
    _renderConfirmation(step);
  }
}

// ─── Question Step ────────────────────────────────────────────────────────

function _renderQuestion(step) {
  var options = Array.isArray(step.options) ? step.options : [];
  var selected = null;

  var titleEl = document.createElement("h2");
  titleEl.className = "ck-title";
  titleEl.textContent = step.title;
  _modal.appendChild(titleEl);

  if (step.body) {
    var bodyEl = document.createElement("p");
    bodyEl.className = "ck-body";
    bodyEl.textContent = step.body;
    _modal.appendChild(bodyEl);
  }

  var optWrap = document.createElement("div");
  optWrap.className = "ck-options";

  options.forEach(function (opt) {
    var btn = document.createElement("button");
    btn.className = "ck-opt";
    btn.textContent = opt.label || opt.value;
    btn.addEventListener("click", function () {
      optWrap.querySelectorAll(".ck-opt").forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");
      selected = opt.value;
    });
    optWrap.appendChild(btn);
  });

  _modal.appendChild(optWrap);

  var actions = document.createElement("div");
  actions.className = "ck-actions";

  var cancelBtn = document.createElement("button");
  cancelBtn.className = "ck-btn ck-btn-ghost";
  cancelBtn.textContent = "Cancel anyway";
  cancelBtn.addEventListener("click", function () {
    _handleCancel();
  });

  var nextBtn = document.createElement("button");
  nextBtn.className = "ck-btn ck-btn-primary";
  nextBtn.textContent = "Continue";
  nextBtn.addEventListener("click", function () {
    if (selected !== null) {
      _track("answer", step.id, { answer: selected });
    }
    _nextStep();
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(nextBtn);
  _modal.appendChild(actions);
}

// ─── Offer Step ───────────────────────────────────────────────────────────

function _renderOffer(step) {
  var titleEl = document.createElement("h2");
  titleEl.className = "ck-title";
  titleEl.textContent = "Before you go\u2026";
  _modal.appendChild(titleEl);

  var card = document.createElement("div");
  card.className = "ck-offer-card";

  var badge = document.createElement("p");
  badge.className = "ck-offer-badge";
  badge.textContent = _offerBadge(step.offerType);
  card.appendChild(badge);

  var offerTitle = document.createElement("h3");
  offerTitle.className = "ck-offer-title";
  offerTitle.textContent = step.title;
  card.appendChild(offerTitle);

  if (step.body) {
    var offerBody = document.createElement("p");
    offerBody.className = "ck-offer-body";
    offerBody.textContent = step.body;
    card.appendChild(offerBody);
  }

  _modal.appendChild(card);

  var actions = document.createElement("div");
  actions.className = "ck-actions";

  var declineBtn = document.createElement("button");
  declineBtn.className = "ck-btn ck-btn-ghost";
  declineBtn.textContent = "No thanks, cancel";
  declineBtn.addEventListener("click", function () {
    _nextStep();
  });

  var acceptBtn = document.createElement("button");
  acceptBtn.className = "ck-btn ck-btn-primary";
  acceptBtn.textContent = "Accept offer";
  acceptBtn.addEventListener("click", function () {
    acceptBtn.disabled = true;
    acceptBtn.textContent = "Applying\u2026";
    _applyOffer(step)
      .then(function () {
        _track("save", null, { offerType: step.offerType, offerValue: step.offerValue });
        _destroyModal();
        if (_onSave) _onSave();
      })
      .catch(function (err) {
        acceptBtn.disabled = false;
        acceptBtn.textContent = "Accept offer";
        console.error("[CancelKit] Failed to apply offer:", err);
        _track("save", null, { offerType: step.offerType, error: err.message });
        _destroyModal();
        if (_onSave) _onSave();
      });
  });

  actions.appendChild(declineBtn);
  actions.appendChild(acceptBtn);
  _modal.appendChild(actions);
}

function _offerBadge(offerType) {
  var labels = {
    discount: "Special Offer",
    pause: "Pause Available",
    downgrade: "Downgrade Option",
    custom: "Exclusive Offer",
  };
  return labels[offerType] || "Special Offer";
}

function _applyOffer(step) {
  if (!_customerId || !step.offerType) {
    return Promise.resolve();
  }
  return fetch(_config.apiUrl + "/api/stripe/apply-offer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: _customerId,
      offerType: step.offerType,
      offerValue: step.offerValue || "",
    }),
  }).then(function (res) {
    return res.json();
  });
}

// ─── Confirmation Step ────────────────────────────────────────────────────

function _renderConfirmation(step) {
  var titleEl = document.createElement("h2");
  titleEl.className = "ck-title";
  titleEl.textContent = step.title || "Are you sure?";
  _modal.appendChild(titleEl);

  if (step.body) {
    var bodyEl = document.createElement("p");
    bodyEl.className = "ck-body";
    bodyEl.textContent = step.body;
    _modal.appendChild(bodyEl);
  }

  var actions = document.createElement("div");
  actions.className = "ck-actions";

  var keepBtn = document.createElement("button");
  keepBtn.className = "ck-btn ck-btn-primary";
  keepBtn.textContent = "Keep my subscription";
  keepBtn.addEventListener("click", function () {
    _track("save");
    _destroyModal();
    if (_onSave) _onSave();
  });

  var confirmCancelBtn = document.createElement("button");
  confirmCancelBtn.className = "ck-btn ck-btn-ghost";
  confirmCancelBtn.textContent = "Yes, cancel";
  confirmCancelBtn.addEventListener("click", function () {
    _handleCancel();
  });

  actions.appendChild(confirmCancelBtn);
  actions.appendChild(keepBtn);
  _modal.appendChild(actions);
}

// ─── Navigation ──────────────────────────────────────────────────────────

function _nextStep() {
  var steps = _flowData.steps;
  _currentStepIndex++;
  if (_currentStepIndex < steps.length) {
    _renderStep(steps[_currentStepIndex]);
  } else {
    _handleCancel();
  }
}

function _handleCancel() {
  _track("cancel");
  _destroyModal();
  if (_onCancel) _onCancel();
}

export default CancelKit;
