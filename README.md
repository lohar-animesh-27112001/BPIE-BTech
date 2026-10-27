# BPIE B.Tech website

Static HTML, CSS and JavaScript for **btech.bpie.org.in**, built from the redesign concept. There is no framework and no build step: upload the whole folder to any web host. To preview locally, run `python3 -m http.server` in this folder and open http://localhost:8000 (opening `index.html` straight from disk also works, but some browsers then block the web fonts and the map).

## Files

```
index.html                          Home
about.html                          Who we are, vision and mission, leadership, management, faculty and staff, location
programs.html                       Program comparison, what every program includes, fees, syllabus, calendar
computer-science-engineering.html   Department pages, one per program
mechanical-engineering.html
electrical-engineering.html
artificial-intelligence.html
admissions.html                     Approval timeline, how to apply, eligibility and fees, questions, enquiry form
campus.html                         Facilities and a filterable photo gallery
notices.html                        Notice board with filters and search, careers
compliance.html                     Approvals, mandatory disclosure, anti-ragging, rules, committees
contact.html                        Enquiry form, contact details, map, helpdesk
assets/css/styles.css               All styles; design tokens are at the top
assets/js/main.js                   Menus, announcement bar, filters, forms
assets/fonts/                       Anek Latin and Anek Bangla, variable (SIL Open Font License, see OFL.txt)
assets/img/favicon.svg              Placeholder emblem
sitemap.xml, robots.txt
```

## Before going live

1. **Connect the forms.** The enquiry, "Notify me" and notice-subscription forms validate what people type but have no backend yet. Put a URL in each form's `data-endpoint` attribute: any endpoint that accepts a `POST` of form data and returns a 2xx status (your own server, or a form service). Until then, a valid submission shows a message asking people to call or email instead, so no enquiry is silently lost.
2. **Logo.** Replace the placeholder emblem (inline SVG with class `emb` in the header and footer of every page, and `assets/img/favicon.svg`) with the official logo.
3. **Photos.** Photo slots load the images already published at `btech.bpie.org.in/wp-content/uploads/`. If an image can't load, the slot falls back to the grid placeholder, so nothing looks broken. Before you retire WordPress, download those images into `assets/img/` and update the `src` attributes (search the HTML for `wp-content/uploads`). The two leadership portraits come from the same folder.
4. **Documents.** Notices, the AICTE letter and the 23 mandatory-disclosure PDFs also link to `/wp-content/uploads/`. Move them together with the photos.
5. **Content to confirm.**
   - The Bengali spelling of the institute name (header and footer).
   - Vision, mission and the leadership messages, which are shortened here. Paste the official text where the HTML comments in `about.html` say so.
   - Notice dates shown as "Aug 2026".
   - Anti-ragging committee and squad names and phone numbers (the current site shows placeholders).
6. **Redirect the old URLs** so existing links and search results keep working (table below).

## Old URL → new page

| Old WordPress URL | New page |
|---|---|
| `/about/` | `about.html` |
| `/vision-mission/` | `about.html#vision-and-mission` |
| `/chairmans-desk/` | `about.html#chairman` |
| `/principals-desk/` | `about.html#principal` |
| `/management-committee/` | `about.html#management` |
| `/faculty/`, `/non-teaching-staff/` | `about.html#faculty-and-staff` |
| `/courses/` | `programs.html` |
| `/computer-science-engineering/` | `computer-science-engineering.html` |
| `/mechanical-engineering/` | `mechanical-engineering.html` |
| `/electrical-engineering/` | `electrical-engineering.html` |
| `/artificial-intelligence/` | `artificial-intelligence.html` |
| `/fee-structure/` | `programs.html#fees` |
| `/syllabus/` | `programs.html#syllabus` |
| `/academic-calendar/` | `programs.html#calendar` |
| `/admission/` | `admissions.html` |
| `/admission-process/` | `admissions.html#how-to-apply` |
| `/campus-facilities/` | `campus.html` |
| `/labs/` | `campus.html#labs-and-workshops` |
| `/library/` | `campus.html#computing-and-library` |
| `/gallery/` | `campus.html#gallery` |
| `/notice/` | `notices.html` |
| `/career/` | `notices.html#careers` |
| `/affiliation-approvals/` | `compliance.html#approvals` |
| `/disclosure/` | `compliance.html#mandatory-disclosure` |
| `/anti-ragging/` | `compliance.html#anti-ragging` |
| `/rules-regulations/` | `compliance.html#rules-and-regulations` |
| `/committees/` | `compliance.html#committees` |
| `/contact-us/` | `contact.html` |

On Apache, each line becomes `Redirect 301 /about/ /about.html` in `.htaccess`; on Nginx, `location = /about/ { return 301 /about.html; }`.

## Editing

- **Colours, type and spacing** are CSS custom properties at the top of `styles.css` (`--ink`, `--laterite`, `--brass`, `--paper`, `--slate`, `--moss`, `--amber`). All text and status colours pass WCAG AA contrast.
- **Breakpoints:** 1199 px (the header switches to the menu button), 1000 px, 900 px and 760 px (phone layout).
- **Header, footer and announcement bar** are repeated in every page. Change them in all pages together (a find-and-replace works). The announcement bar has a `data-id`; give it a new value when the announcement changes, so visitors who closed the old one see the new one.
- **Adding a notice:** copy a `<div class="nitem rich" data-cat="…">` block in `notices.html` (and in the home page list if it should appear there). `data-cat` must match one of the filter chip labels, for example `Admissions` or `Recruitment`. Update the "Showing x of y notices" line.
- **Adding a gallery photo:** copy a `<figure class="ph" data-cat="…">` in `campus.html`, set its `img src` and caption, and use a category from the chips.
- **Icons** are inline [Lucide](https://lucide.dev) SVGs (ISC licence). Copy an icon's SVG from lucide.dev to add one.

## Behaviour and accessibility

- JavaScript adds the dropdown and drawer menus, the dismissible announcement, filters and search, and form messages. Without JavaScript, all content and links still work, the FAQs still open (they use native `<details>`), and the mobile menu is shown expanded.
- Skip link, visible focus states, labelled form fields with inline error messages, `aria-expanded` on menus, and support for reduced motion.
- Mobile numbers are checked as 10-digit Indian numbers (a leading `+91` or `0` is accepted).
- Tested in current Chrome at 1440, 1024, 768 and 390 px wide. Uses standard CSS grid and flexbox, so it works in all current browsers, including Safari on iOS.
