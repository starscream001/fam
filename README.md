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

## Original version and rollback

The unmodified BMW source remains in `../../bmw-page`. A complete baseline ZIP is stored at `../../backups/bmw-before-fam-2026-11-25.zip`. The original source commit is `7e2a8301134ae3f4a0cdfec7684e0483fbfdcce7` and its saved hosted version is `appgprj_6b05fed9144481918a3bec432db4be7c~appgver_ebc377e2fb7c8191b9124a38e8c18845`. Re-deploy that saved version through Sites to roll back the hosted content without rebuilding it. This checkout is the FAM working copy; the baseline directory and ZIP should be retained.
