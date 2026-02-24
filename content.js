const TRACKING_SELECTOR = ".pt-delivery-card-trackingId";
const TRACKING_LINK_MARKER = "data-carrier-tracking-link";

const CARRIER_CONFIGS = [
  {
    key: "mailamericas",
    matchesContext: (content) => /mailamericas|sekdo/i.test(content),
    extractTrackingId: (content) => content.match(/\bSEKDO[A-Z0-9]*\b/i)?.[0],
    buildUrl: (trackingId) => `https://mailamericas.com/tracking?number_id=${trackingId}`,
  },
  {
    key: "fedex",
    matchesContext: (content) => /fedex/i.test(content),
    // FedEx usa varios formatos. Intentamos con patrones comunes y, si no aparecen,
    // usamos un fallback con el token alfanumérico más largo.
    extractTrackingId: (content) => {
      const fedexPattern = content.match(/\b(?:\d{10,22}|\d{12,20}[A-Z]|[A-Z]{2}\d{9}[A-Z]{2})\b/i)?.[0];
      if (fedexPattern) {
        return fedexPattern;
      }

      const fallbackToken = (content.match(/\b[A-Z0-9]{8,34}\b/gi) || [])
        .filter((token) => !["FEDEX", "TRACKING", "AMAZON"].includes(token.toUpperCase()))
        .sort((a, b) => b.length - a.length)[0];

      return fallbackToken;
    },
    buildUrl: (trackingId) => `https://www.fedex.com/fedextrack/?trknbr=${trackingId}`,
  },
];

const renderLinkedTracking = (element, content, trackingId, config) => {
  const trackingIndex = content.indexOf(trackingId);
  if (trackingIndex === -1) {
    return;
  }

  const prefix = content.slice(0, trackingIndex);
  const suffix = content.slice(trackingIndex + trackingId.length);

  element.textContent = "";
  element.appendChild(document.createTextNode(prefix));

  const link = document.createElement("a");
  link.setAttribute(TRACKING_LINK_MARKER, config.key);
  link.href = config.buildUrl(trackingId);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = trackingId;
  element.appendChild(link);

  element.appendChild(document.createTextNode(suffix));
};

const addTrackingLink = (element) => {
  if (!element || element.querySelector(`a[${TRACKING_LINK_MARKER}]`)) {
    return;
  }

  const content = (element.textContent || "").trim();
  if (!content) {
    return;
  }

  for (const config of CARRIER_CONFIGS) {
    if (!config.matchesContext(content)) {
      continue;
    }

    const trackingId = config.extractTrackingId(content);
    if (!trackingId) {
      continue;
    }

    renderLinkedTracking(element, content, trackingId, config);
    return;
  }
};

const processTrackingElements = (root = document) => {
  if (root.matches?.(TRACKING_SELECTOR)) {
    addTrackingLink(root);
  }

  root.querySelectorAll?.(TRACKING_SELECTOR).forEach(addTrackingLink);
};

processTrackingElements();

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) {
        return;
      }

      processTrackingElements(node);
    });
  });
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
}
