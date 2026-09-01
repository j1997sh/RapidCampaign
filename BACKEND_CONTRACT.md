# Rapid Campaign backend contract

The extracted frontend currently expects the following Supabase objects. These are the objects that should be recreated — and only these — for the first clean Rapid Campaign backend.

## Auth / organisation

- table: `organisations`
- table: `organisation_memberships`
- helper: `is_org_admin(uuid)`
- helper: `is_org_global_admin(uuid)`

Admin membership roles currently recognised by the frontend are `global_admin` and `regional_admin`.

## Campaign rollout RPCs

- `org_admin_central_campaign_rollouts`
- `org_admin_create_central_campaign_rollout`
- `org_admin_central_campaign_rollout`
- `org_admin_update_central_campaign_master`
- `org_admin_import_central_campaign_sites`
- `org_admin_set_central_campaign_site_status`
- `org_admin_bulk_set_central_campaign_sites`
- `org_admin_set_central_campaign_rollout_status`
- `org_admin_duplicate_central_campaign_rollout`
- `org_admin_delete_central_campaign_rollout`
- `org_admin_central_campaign_rollout_performance`
- `org_admin_central_campaign_supporters`

## Meta audience/creative RPCs

Audience functions are represented by the included migration:

- `org_admin_facebook_audiences`
- `org_admin_upsert_facebook_audiences`
- `org_admin_delete_facebook_audience`

Creative functions are required but their migration was not present in the uploaded ZIP:

- `org_admin_facebook_creatives`
- `org_admin_upsert_facebook_creative`
- `org_admin_delete_facebook_creative`

Storage bucket used by creative uploads:

- `campaign-assets`

## Public microsite RPCs

- `public_resolve_deployment`
- `public_route_request`
- `public_local_content`
- `public_central_campaign_support`
- `public_track_visit`
- `public_capture_action_attributed`
- `public_submit_survey_attributed`
- `public_rsvp_event`
- `public_record_consent`
- `public_privacy_config`

## Reporting RPCs

- `org_admin_attribution_overview`
- `org_admin_attribution_channels`
- `org_admin_attribution_accounts`
- `org_admin_geography_insights`

## Extraction rule

Do not copy the full old DigitalToolKit database into Rapid Campaign. Reconstruct the smallest schema necessary to satisfy this contract, then migrate/import only campaign-rollout data that Rapid Campaign genuinely needs.
