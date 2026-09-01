# Rapid Campaign

Rapid Campaign is the standalone product extracted from the strongest central-rollout functionality in DigitalToolKit.

## What it does

1. Create one campaign centrally.
2. Import constituencies, wards or local areas by CSV.
3. Generate and centrally control localised campaign microsites.
4. Upload/match area-specific Meta creative.
5. Reuse a constituency/area Meta Custom Audience library.
6. Generate Meta Ads Manager bulk-upload CSVs linking each area to the correct microsite, audience and creative.
7. Track supporter capture, attribution and geographic performance.

## Product surfaces

- `campaigns.html` — campaign list and campaign creation.
- `campaign.html` — rollout operations, microsites, supporters, performance and Meta CSV generation.
- `audiences.html` — reusable Meta audience library.
- `creatives.html` — area-specific creative library for a rollout.
- `attribution.html` — source/channel reporting.
- `geography.html` — geographic performance.
- `public-site.html` / `public-router.html` — public microsite rendering/routing.
- `login.html` — Rapid Campaign admin authentication.

## Supabase setup

The original ZIP did **not** contain the full historical Supabase migration chain. The frontend relies on a set of RPCs created in the existing DigitalToolKit Supabase project. Only the later Facebook Audience Library migration was present in the source ZIP.

For that reason this repository deliberately does not contain the old Supabase project credentials and does not pretend to be database-complete.

1. Create a fresh Supabase project for Rapid Campaign.
2. Copy `assets/js/supabase-config.example.js` to `assets/js/supabase-config.js` and add the new project URL and publishable key.
3. Rebuild the database objects listed in `BACKEND_CONTRACT.md` in the new project.
4. Apply `migrations/20260828_facebook_audience_library.sql` only after its prerequisites (`organisations`, admin helper functions, etc.) exist.
5. Create the `campaign-assets` Storage bucket used for area-specific creative.

## Repository extraction

Removed from the source product:

- local candidate/user workspaces
- generic website builder
- survey builder/editor
- standalone campaign builder/editor
- NationBuilder, Mailchimp and VoteSource screens
- generic creative workspace/editor
- election rollout/account-management tools unrelated to Rapid Campaign
- network activity, privacy, security and hosting admin surfaces from the wider Campaign Platform
- original Supabase project credentials

The internal `CP_` JavaScript namespace has intentionally been retained in this first extraction to avoid introducing functional regressions while separating the product. It can be renamed to an `RC_` namespace in a later refactor.

## GitHub

This folder is intended to be the root of a new `rapid-campaign` repository.
