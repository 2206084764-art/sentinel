// Edit this file to publish the confirmed event. No rebuild is needed in dist/.
// Keep unknown fields empty. Never put Zoom API secrets in a static website.
window.SENTINEL_EVENT = {
  title: 'Sentinel Global Launch Webinar',
  dateLabel: 'Date to be announced',
  timeLabel: 'Time & timezone to be announced',
  startISO: '', // ISO 8601 with offset, e.g. a confirmed date ending in +08:00.
  endISO: '',
  zoomUrl: '', // Confirmed public https://events.zoom.us/ or https://...zoom.us/ link.
  replayUrl: '',
  language: 'English',
  speakers: [], // [{ name: 'Confirmed name', role: 'Job title', image: './assets/...' }]
  siteUrl: '', // Final GitHub Pages URL, for canonical metadata.
  contactUrl: 'https://www.streamax.com/category/contactform.html',
  analytics: {
    // Existing DS100 Streamax account, preserved but opt-in here until approved.
    linkedinPartnerId: '9006116',
    linkedinEnabled: false,
    ga4Id: '',
    gtmId: '',
  },
};
