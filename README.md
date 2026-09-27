# Swing Dance Kobe

A locally built, static, bilingual website inspired by 1930s–40s swing posters.

## Preview

From this project folder, run `npm run build`, then `npm run dev`. Open http://127.0.0.1:4173. Node.js is the only requirement; no package installation is necessary. You can also open `dist/index.html` directly. Google Fonts are optional; system fonts are used offline.

## Edit English and Japanese

The main translation table is `content/translations.csv` with three columns:

| key | en | ja |
| --- | --- | --- |
| welcome.title | Find your rhythm. | あなたのリズムで。 |

Edit the `en` column as the source text and update its Japanese translation in `ja`. Keep keys unchanged. Save as UTF-8 CSV, then run `npm run build` and refresh your browser. A blank Japanese cell falls back to English and produces a build warning. Translations are supplied as a first draft; changing English does not automatically retranslate Japanese. When a value contains a comma, wrap it in double quotes; double any quotes inside that field. Spreadsheet applications usually do this automatically.

## Events, photographs, schools, resources, and email

Edit `content/site.json`. Text fields use English and Japanese side by side, for example `{"en":"Friday dance","ja":"金曜ダンス"}`. These collections are separate from the shared interface translation table.

- `contactEmail`: set your real public email address to enable the email link.
- `events`: objects with `date`, `title`, `venue`, `description`, optional `url`, and optional bilingual `linkLabel`. Use bilingual objects for text; the date can be an ISO date string.
- `gallery`: objects with `image` (HTTPS image URL), bilingual `alt`, and bilingual `caption`. Use photographs you have permission to publish.
- `schools`: objects with bilingual `name`, bilingual `description`, and `url` (HTTPS).
- `resources`: the same fields as schools.

Example event (replace the sample details before publishing):

```json
{
  "date": "2027-01-01",
  "title": {"en": "Your event title", "ja": "イベント名"},
  "venue": {"en": "Your confirmed venue", "ja": "確定した会場"},
  "description": {"en": "Your event description", "ja": "イベントの説明"}
}
```

The school list appears on both Where to Learn and Swing Connections. Empty collections display honest coming-soon messages. No fabricated events, schools, community photographs, or contact information are included. The welcome artwork is an original generated illustration, not a photograph of the community.

## Structure

- `scripts/build.mjs`: creates the twelve English/Japanese pages from content.
- `scripts/serve.mjs`: loopback-only local preview server.
- `dist/styles.css`: shared responsive design; this is an authored source file, not disposable build output.
- `dist/assets/`: website artwork.
- `dist/en/` and `dist/ja/`: generated pages; edit content rather than these files.

All navigation is ordinary HTML and works without JavaScript. The language switch preserves the current page. The `dist` folder is ready for static hosting. This project has not been published. No contact form backend is configured; contact uses email once an address is supplied.

## Kobe masthead artwork

`dist/assets/kobe-harbour.png` was created with the built-in image generation tool. Prompt: "Use case: illustration-story. Create a wide panoramic Kobe Japan harbour illustration for a vintage swing dance website masthead. 3:1 landscape composition. 1930s/1940s travel-poster linocut print STYLE showing modern recognizable Kobe waterfront: red hourglass lattice Kobe Port Tower on the right, white sail-shaped Kobe Maritime Museum roof nearby, distant Rokko mountain ridge, harbour water foreground with spare horizontal engraved ripples. Restrained deep navy #193d47 ink, warm ivory #f4eddc and burnt orange #a43c24. Landmarks concentrated in rightmost third and leftmost edge; centre upper two-thirds quiet dark navy negative space for separate HTML heading overlay. Flat print texture, sophisticated minimal editorial engraving, no text, no lettering, no border, no logos. This is stylized contemporary Kobe scenery, not a historical reconstruction."

The banner lettering is editable HTML. Its supporting English and Japanese labels are in the translation table under `common.harbour` and `common.harbourNote`.

## YouTube playlist sections

On the Dance Floor shows up to six videos from each of the four playlists in `content/playlists.json`. Videos are sorted by their YouTube publication date, not playlist position or the date they were added. Sections are sorted by their newest video's publication date. Video titles remain as supplied by YouTube; chapter labels and interface text have English/Japanese versions.

Run `npm run dev` for automatic refresh every 15 minutes while the server is running. Reload the page to see new results; playing videos are not interrupted. `npm run sync:playlists` refreshes immediately, and `npm run build` embeds the saved snapshot into the HTML. All four playlists are fetched before replacing the saved snapshot, so a failed fetch retains the last complete result.

This uses public YouTube page metadata without an API key. YouTube page-format changes or request blocking can interrupt refresh; the page then keeps saved videos and shows a notice. Configure a YouTube Data API integration if a production host requires a supported API contract. The pagination reader handles up to 31 pages per playlist and fails safely beyond that limit.

**Hosting:** the automatic refresh runs in `scripts/serve.mjs`, not in static HTML. Deploying only `dist` preserves the saved videos but will not update them by itself. Production hosting needs this refresh process (or a scheduled `npm run sync:playlists` followed by build/deploy). A direct `file://` opening does not run updates and YouTube embeds may fail there; use the local HTTP preview.

Requires Node.js with `--use-system-ca` support (the current installed Node 24 supports it). No packages or credentials are required.
