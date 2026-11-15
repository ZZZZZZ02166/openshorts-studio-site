# OpenShorts Studio website

The public website for OpenShorts Studio: what the app does, how it posts to TikTok, and its
privacy policy, terms of service, data deletion steps and contact page. Plain HTML and CSS,
served by GitHub Pages from the root of `main`. There is no build step.

| Page | File |
| --- | --- |
| Home | `index.html` |
| Privacy policy | `privacy.html` |
| Terms of service | `terms.html` |
| Data deletion | `data-deletion.html` |
| Contact | `contact.html` |
| Not found | `404.html` |

Shared styles and scripts are in `assets/`. The site sets no cookies and loads nothing from
other origins: the fonts (Geist and Instrument Serif, SIL Open Font License, see
`assets/fonts/OFL.txt`) are served from the site itself.

## Editing

- The header and footer are repeated in every page; change them everywhere at once.
- When a policy changes, update its "Last updated" date and `sitemap.xml`.
- The policies describe what Studio's code actually does. If Studio starts handling data
  differently, update `privacy.html` before the change ships.
- The screenshots in `assets/` come from a fresh Studio install with no projects; the
  interface pieces drawn in HTML use sample names only.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/.
