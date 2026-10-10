# Gym Manager — Design specification

## Upgrade baseline — supersedes conflicting legacy rules below
Direction: Vietnamese owner-only operations dashboard, cream/teal administrative desk. Approachable, structured, legible; variance 5/10, motion 2/10, density 5/10, color 5/10. Confirmed cream/teal overrides athletic orange design search suggestions. Data-first, no marketing or gamification.

Typography: Fira Sans 400/500/600/700 heading/body, Vietnamese support, swap and system fallback. H1 clamp(28px,3vw,40px)/1.2, H2 24px/1.3, body 16px/1.6, helpers 13–14px, tabular numbers. Tokens: bg #f6f4ed, surface #ffffff, elevated #edf5f2, text #173c37, muted #536b66, accent #087f70, hover #066657, border #c9d9d2, danger #b42332, success #166b45, warning #8a5209; primary white on teal. Light semantic badges with text. 8/16/24/32 spacing, radius 12, decorative teal top border and subtle panel shadow.

Layout: horizontal navigation above all screens, max 1440px main with 32px desktop gutters. Four member cards above three financial metrics, month/quarter/year selectors, exact monthly table with inline labelled revenue bars, member table below. New registrations = unique initial receipt member IDs; renewals = renewal receipts; revenue = amount grouped by paidAt including deleted-member history. No fabricated trends. Package grid add/edit/disable with price in VND. Alert counts filter lists; member badges link by ID to exact profile, handle missing IDs.

Forms: optional gallery/capture photo JPG/PNG/WebP <=5MB source, browser shrink to 800px and <=1MB JPEG. Preview/remove/loading/errors; capture=environment opens native phone camera where supported, desktop may open file chooser. Protected Storage paths with authenticated getBlob and session object URLs; revoke on logout, no public token URLs. Preserve old HTTPS avatars. Upload on submit only; failure retains form, orphan objects possible after failed Firestore save, no automated deletion. Add separates actual paidAt/amount from joinedAt. Gói 1/2/3 months 250000/500000/700000 starter presets; further prices entered by owner. Calendar months clamp month-end, expiry inclusive; legacy no-plan members remain 30-day until explicit new package. Seven-day warning. Edit never rewrites ledger/dates silently, disabled plans remain historical.

Motion: view fade 220ms, modal scale/fade 180ms, hover/focus color 180ms. No scroll animation in tables for clarity, reduced-motion disables all. Visible labels, >=44px targets, role alert errors, polite toast, dirty image/form cancellation confirmation, focus restoration. Loading/offline/empty/no-results/error with retry states retained; demo memory-only, no live data before owner login.

Visuals: retain existing original generated login gym photo for continuity behind scrim and white caption. Operational data screens intentionally image-free because decoration reduces usability; member photos are owner content, never generated identities. Existing badge skeleton/icon retained with teal theme. Preview session integration only /apps/{id}/ and one fetch; GitHub skips it. Teal abstract barbell SVG first head link.

Responsive: 1440 desktop four counters/three finance cards, 768 two counters with wrapping nav, 375 two compact counters/one finance column, stacked controls/member cards/forms, one package column, no overflow. Landscape 812x375 scroll naturally; 16px phone inputs, 88px photo preview and wrapping buttons, bottom clearance for badge. Technical: existing Vite/Firebase and base './', src/features.js helpers, upgrade tests, storage.rules. Confirmed owner UID matches both rules. No database migration, no automatic commit/push. Handoff includes rule publication, Storage CORS for authenticated blobs, real-phone/live-auth verification caveats.

## 1. Design Direction
Reading this as a Vietnamese gym operations dashboard for one owner, with black/orange athletic block-based visual language. Keywords: structured, energetic, legible. Prioritize expiring memberships over decorative analytics; no attendance.

## 2. Aesthetic System
Industrial Training Desk: graphite surfaces, orange primary actions, white labels, thin divider lines, compact sport typography. Variance 6/10; motion 2/10; density 6/10; boldness 7/10.
Typography: Barlow Condensed 600/700 display, Barlow 400/500/600/700 body, Google Fonts with swap, system fallbacks. H1 clamp(32px,4vw,48px) line 1.15; H2 24px line 1.3; body 16px line 1.6; small 14px; numerical figures tabular.
Tokens: bg #101112, surface #191b1e, elevated #222529, primary text #f5f5f4, secondary #b3b7bc, accent #ff8b3d, hover #ffa469, border #3f444c, danger #ff9090, success #83dfad, warning #ffd479. Dark text #101112 on orange. 8px rhythm, radius 12px cards and 8px controls.

## 3. Layout & Composition
Login: 55% tall original gym photo with scrim and typographic bottom caption; 45% focused login form, no registration. Dashboard: 232px left sidebar, main max 1500px with 32px padding. Header greeting/date and add member primary action. Four summary cards total, valid incl soon/today, soon/today, overdue. Alert strip with actionable filter, table with compact avatar initials and name/phone, expiry/days/status/fee/actions. Bottom pagination. Alert route uses same table; payments separate ledger; settings read-only business and connection information.
Spacing 8/16/24/32/48px. Controlled density in table, asymmetric login composition. Main data begins immediately below summary.

## 4. Motion
Pure CSS. Entry fade 220ms main panel; dialog scale .98 and fade 180ms; buttons color/opacity focus hover 180ms. No scroll-trigger animations in operational tables (clarity). Reduced motion disables all. Loading is status text plus spinner only. No infinite decorative animation.

## 5. Visual Atmosphere
Graphite matte with thin decorative orange border on active navigation and modest shadow on modal. Login photo dim scrim for legible caption. No cursor gimmicks or background animation.

## 6. Components
Login: visible Email/Password labels, toggle password, submit loading, auth error actionable, demo entry link. Owner-only, no registration/password stored.
Header/sidebar: routes Tổng quan, Thành viên, Cảnh báo, Thu tiền, Thiết lập; active state; owner identity and signout spatially separate.
Statistics: values from actual mode dataset, no fabricated trend; monthly collected amount on ledger.
Table: search accent insensitive, status filter, sort expiry/name, pagination 10, buttons Sửa/Gia hạn/Chi tiết. On mobile becomes cards; no horizontal overflow.
Dialogs: native dialog semantics, field labels, invalid focus, error alert, cancel and save; restore focus; unsaved-dismiss confirmation. Add requires name/phone/fee/start/notes; calculates 30-day expiry and initial payment. Edit profile/expiry does not silently rewrite ledger. Renewal date/amount, base and expiry preview, atomic transaction. Delete confirmation retains payment history. Details shows history plus delete action.
States: loading excludes writes; listener failure clears stale data and disables writes with retry; offline banner disables live writes; empty offers add action; no results clear filters; toast role status 4s. Demo fixture data ephemeral and banner unambiguous, reset on reload; never Firebase writes. Live no data before owner login.
Session module: hidden by default, one /app-session/me request only for /apps/{id}/ deployment; nickname/logout and same result toggles badge span. GitHub skips request entirely.
Badge: fixed right/bottom 16px, required icon assets/images/icon.png and link https://museai.im/home, unchanged fixed skeleton; bg #191b1e fg #fff border #3f444c. Reserve bottom padding 80px.

## 7. Images
| Filename | Purpose | Size | Prompt |
|---|---|---|---|
| gym-login.png | Login editorial photo | portrait 2:3 1K | Empty industrial gym, 28mm eye-level, charcoal steel squat racks, dumbbells, bench, rubber floor, warm orange strip lights, natural shadows, upper/lower negative space, no people/logos/text |
Other major admin sections intentionally image-free: imagery would distract from member/payment data and reduce usability. Do not reuse login image on dashboard.

## 8. Responsive
Desktop >1200: sidebar and four cards/table. Tablet 768–1200: 180px sidebar, 2x2 cards. Mobile <768: top brand, wrapping horizontal navigation, 2x2 compact summary cards, member cards, single column fields/dialog, login photo removed for focused form; 16px gutters and >=44px targets. Landscape 812x375: content scrolls naturally; no fixed obstructive footer. Zoom and text scaling retained. Reduced motion same all widths.

## 9. Technical
Vite vanilla JS ES modules; Firebase npm SDK. src/logic.js pure domain, src/data.js Firebase/demo adapter, src/app.js UI, src/styles.css, src/firebase-config.js. index.html with vi language, metadata, viewport, favicon FIRST in head: abstract orange barbell geometric shape on graphite 32x32 (no text). Vite hashed assets cache-bust automatically; base './' supports /QuanLyPhongGym/ and preview. public/assets/images contains icon and original photo. firestore.rules denies all except explicit owner members/payment operations. .github/workflows/pages.yml installs/test/build and deploys via Pages Actions. firebase.json references rules, no server keys. tests/domain.test.js and browser evidence.
Dates use Asia/Ho_Chi_Minh and YYYY-MM-DD. Expiry inclusive, 30 days, soon <=3 and >0, today 0, overdue <0; renew max(existing,date)+30 days. One admin UID from config enforced both client and rules. Source archive excludes node_modules and private data. GitHub/Firebase live configuration needs owner action; preview login or labeled demo only.
