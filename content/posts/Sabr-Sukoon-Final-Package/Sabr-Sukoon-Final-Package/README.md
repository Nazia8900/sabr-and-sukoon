# Sabr & Sukoon — Final Recovery Package

## Contents
- `48-missing-articles/` — 48 recovered missing articles. These are the recovered versions, with `updated_date` retained where available.
- `48-missing-articles/48-missing-articles.csv` — article title, original URL and original published date.
- `email-magnet/` — ready-to-publish lead magnet content for the “7-Day Spiritual Peace & Tawakkul Journal”.
- `website-cta/` — homepage, article and footer CTA copy.

## Developer instruction
1. Do NOT create duplicate articles if an existing live article already uses the same slug/content.
2. Preserve the `original_url` in each Markdown file as migration/reference metadata.
3. Use the `slug` field as the intended article slug where it matches the current site's URL structure.
4. If the current site has a deliberately changed URL for an existing article, update the existing article rather than creating a second copy.
5. After deployment, generate/check the sitemap and canonical URLs.
6. The email magnet copy is content only; connect it to the chosen email provider/form before publishing.
