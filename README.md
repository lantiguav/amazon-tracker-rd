# Amazon Tracker RD

A simple Browser extension that turns tracking numbers in Amazon into clickable links to the carrier's tracking page.

## Supported carriers
- MailAmericas (`SEKDO...` codes) using `https://mailamericas.com/tracking?number_id=...`
- FedEx (common numeric/alphanumeric formats) using `https://www.fedex.com/fedextrack/?trknbr=...`

> Note: FedEx uses multiple tracking formats, so this extension uses common patterns plus a fallback token strategy.
