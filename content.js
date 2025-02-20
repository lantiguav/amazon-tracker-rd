const trackingIdDiv = document.querySelectorAll(".pt-delivery-card-trackingId");

trackingIdDiv.forEach((div) => {
  const content = div.textContent;
  if (content.includes("SEKDO")) {
    const trackingId = content.match(/\bSEKDO\w*/);
    div.innerHTML = `Tracking ID: <a href="https://mailamericas.com/tracking?tracking=${trackingId}" target="_blank">${trackingId}</a>`;
  }
});
