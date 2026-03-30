
const alerts = [
  {
    id: "G-001",
    title: "Avian influenza cluster expansion in neighboring region",
    scope: "global",
    severity: 88,
    spreadRisk: 85,
    operationalUrgency: 89,
    confidence: 82,
    reason:
      "Cross-border spread potential and rapid case growth increase importation risk.",
    recommendedAction:
      "Activate airport and livestock import screening; brief national command center.",
    nextReviewTime: "2026-03-30 18:00 UTC",
    actionable: true
  },
  {
    id: "TH-002",
    title: "Dengue hospitalization rate above seasonal baseline",
    scope: "thailand",
    severity: 69,
    spreadRisk: 70,
    operationalUrgency: 67,
    confidence: 78,
    reason:
      "Hospital admissions and vector index are both above expected levels in multiple provinces.",
    recommendedAction:
      "Prioritize hotspot vector control and reinforce triage readiness in referral hospitals.",
    nextReviewTime: "2026-03-30 14:00 UTC",
    actionable: true
  },
  {
    id: "LP-003",
    title: "Lamphun district-level foodborne outbreak signal",
    scope: "lamphun",
    severity: 56,
    spreadRisk: 44,
    operationalUrgency: 62,
    confidence: 74,
    reason:
      "Localized cluster with moderate severity; transmission appears confined but requires field checks.",
    recommendedAction:
      "Deploy district investigation team and inspect shared food distribution points within 12 hours.",
    nextReviewTime: "2026-03-30 12:00 UTC",
    actionable: true
  },
  {
    id: "LP-004",
    title: "Lamphun rumor-only respiratory signal",
    scope: "lamphun",
    severity: 30,
    spreadRisk: 25,
    operationalUrgency: 28,
    confidence: 40,
    reason: "Insufficient verification and no clinical corroboration.",
    recommendedAction: "Monitor passively; no field deployment.",
    nextReviewTime: "2026-03-31 09:00 UTC",
    actionable: false
  }
];

const scopeOrder = ["global", "thailand", "lamphun"];
const scopeLabels = {
  global: "Global",
  thailand: "Thailand",
  lamphun: "Lamphun"
};

function deriveCompositeScore(alert) {
  return Math.round(
    alert.severity * 0.4 +
      alert.spreadRisk * 0.25 +
      alert.operationalUrgency * 0.25 +
      alert.confidence * 0.1
  );
}

function classifySurveillanceTier(score) {
  if (score >= 80) {
    return "Alarm";
  }
  if (score >= 55) {
    return "Alert";
  }
  return "Awareness";
}

function classifyOperationalPriority(score) {
  if (score >= 80) {
    return 1;
  }
  if (score >= 55) {
    return 2;
  }
  return 3;
}

function normalizeAlert(alert) {
  const score = deriveCompositeScore(alert);
  const surveillanceTier = classifySurveillanceTier(score);
  const operationalPriority = classifyOperationalPriority(score);

  return {
    ...alert,
    score,
    surveillanceTier,
    operationalPriority,
    classificationReason: `${alert.reason} (Composite score ${score}, based on severity/spread/urgency/confidence.)`
  };
}

function compareForAction(a, b) {
  if (a.operationalPriority !== b.operationalPriority) {
    return a.operationalPriority - b.operationalPriority;
  }
  if (a.score !== b.score) {
    return b.score - a.score;
  }
  return scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope);
}

function tierBadgeClass(tier) {
  return tier.toLowerCase();
}

function createAlertCard(alert) {
  const card = document.createElement("article");
  card.className = "alert-card";

  if (alert.surveillanceTier === "Alarm" && alert.operationalPriority === 1) {
    card.classList.add("alarm-priority1");
  }

  card.innerHTML = `
    <div class="alert-head">
      <p class="alert-title">${alert.title}</p>
      <div class="badges">
        <span class="badge ${tierBadgeClass(alert.surveillanceTier)}">${alert.surveillanceTier}</span>
        <span class="badge">P${alert.operationalPriority}</span>
      </div>
    </div>
    <div class="alert-grid">
      <p><span class="label">Reason:</span> ${alert.classificationReason}</p>
      <p><span class="label">Recommended action:</span> ${alert.recommendedAction}</p>
      <p><span class="label">Next review:</span> ${alert.nextReviewTime}</p>
      <p><span class="label">Scope:</span> ${scopeLabels[alert.scope]}</p>
    </div>
  `;

  return card;
}

function renderSection(alertsByScope, scope, containerId) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  if (!alertsByScope.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No actionable alerts in this view.";
    container.appendChild(empty);
    return;
  }

  alertsByScope.forEach((alert) => {
    container.appendChild(createAlertCard(alert));
  });
}

function renderTopAction(actionableAlerts) {
  const container = document.getElementById("top-action");

  if (!actionableAlerts.length) {
    container.innerHTML = "<h2>Top Action Today</h2><p class='section-note'>No active actions.</p>";
    return;
  }

  const top = [...actionableAlerts].sort(compareForAction)[0];
  container.innerHTML = `
    <h2>Top Action Today</h2>
    <p class="section-note">${scopeLabels[top.scope]} • ${top.surveillanceTier} • Priority ${top.operationalPriority}</p>
    <div class="alert-grid" style="margin-top:0.65rem;">
      <p><span class="label">Alert:</span> ${top.title}</p>
      <p><span class="label">Why now:</span> ${top.classificationReason}</p>
      <p><span class="label">Do this:</span> ${top.recommendedAction}</p>
      <p><span class="label">Review by:</span> ${top.nextReviewTime}</p>
    </div>
  `;
}

function init() {
  const normalized = alerts.map(normalizeAlert);
  const actionable = normalized.filter((a) => a.actionable);

  const globalAlerts = actionable
    .filter((a) => a.scope === "global")
    .sort(compareForAction);
  const thailandAlerts = actionable
    .filter((a) => a.scope === "thailand")
    .sort(compareForAction);
  const lamphunAlerts = actionable
    .filter((a) => a.scope === "lamphun")
    .sort(compareForAction);

  renderTopAction(actionable);
  renderSection(globalAlerts, "global", "global-alerts");
  renderSection(thailandAlerts, "thailand", "thailand-alerts");
  renderSection(lamphunAlerts, "lamphun", "lamphun-alerts");
}

init();
