(function () {
  "use strict";
  const allowedFields = new Set(["name", "email", "company", "country", "interest", "environment", "primary_challenge", "message", "consent"]);
  function configuredEndpoint(form) {
    return form.dataset.leadEndpoint || document.querySelector('meta[name="gnema-lead-endpoint"]')?.content || window.GNEMA_LEAD_ENDPOINT || "";
  }
  function payloadFor(form) {
    const fields = {};
    new FormData(form).forEach((value, key) => { if (allowedFields.has(key) && typeof value === "string") fields[key] = value.trim(); });
    return { type: form.dataset.gnemaLeadForm || "enquiry", source: window.location.pathname, submittedAt: new Date().toISOString(), fields };
  }
  async function submit(form) {
    const endpoint = configuredEndpoint(form);
    if (!endpoint) return { submitted: false, reason: "not-configured" };
    const response = await fetch(endpoint, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payloadFor(form)) });
    if (!response.ok) throw new Error("Lead submission failed.");
    return { submitted: true };
  }
  window.gnemaLeadSubmission = { isConfigured(form) { return Boolean(configuredEndpoint(form)); }, submit };
  document.querySelectorAll("form[data-gnema-lead-form][action]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      if (!window.gnemaLeadSubmission.isConfigured(form)) return;
      event.preventDefault();
      const status = form.querySelector("[data-lead-status]");
      try {
        await submit(form);
        window.gnemaAnalytics?.track("lead_submit", { lead_type: form.dataset.gnemaLeadForm });
        const destination = form.dataset.successUrl;
        if (destination) window.location.assign(destination);
        else if (status) status.textContent = "Thank you. Your request has been received.";
      } catch {
        if (form.dataset.leadFallbackAttempted !== "true") {
          form.dataset.leadFallbackAttempted = "true";
          form.submit();
          return;
        }
        if (status) status.textContent = "We could not send your request. Please try again or contact G-NeMa directly.";
      }
    });
  });
}());
