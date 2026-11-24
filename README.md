# FAM — BMW-клуб Санкт-Петербурга

Adaptation of the BMW cockpit design for the FAM community. The original 25-second locally hosted background video is retained. Main social buttons link to Telegram, Instagram, and Threads; the top navigation links to club information, events, the media channel, and the marketplace.

## Sources checked on 25 November 2026

- https://t.me/famcrsclub — official description and resource links.
- https://www.instagram.com/famcrsclub/ — club identity, Saint Petersburg, est.2023, and original profile logo.
- https://www.threads.com/@famcrsclub — club description and community tone.
- https://www.threads.com/@famcrsclub/post/DfuO5h0jqjm — community story.
- https://t.me/famcrsclub/894 — FAMEET at MEGA Parnas, 14 November 2026, 19:00; marked as a past event.
- https://t.me/famcrsclub/895 — recap, photographs, and the announcement that the next date was not yet set.
- https://t.me/famcrsclub/885 — club meeting photograph, published 31 October 2026.
- https://t.me/famcrsclub/877 — partnership contact @stordanya.

The site uses a verified static snapshot of event information, not a live Telegram feed. All event entries link to their original posts. The user supplied the marketplace, chat, media, merchandise, VK, and support URLs. No future dates are invented.

## Local development

Run `npm run dev`, then open http://127.0.0.1:4173. Run `npm run check` for JavaScript syntax validation. Static content lives in the repository root: `index.html`, `styles.css`, `app.js`, and `assets/`. Reduced-motion preferences and the viewing settings pause the video. Settings persist only in the current browser.

## Versions and rollback

The `main` branch contains the original BMW version. The `feature_fam` branch contains this FAM adaptation. Both are standalone static sites served from the repository root. Select the corresponding branch to switch versions; no force push or history rewrite is required.