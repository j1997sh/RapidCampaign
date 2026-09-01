Rapid Campaign – Meta-ready export pass

Changed files:
- campaign.html
- assets/js/admin-central-campaign-rollout-stage12.js

Replace these two files in the existing Rapid Campaign deployment.

Key behaviour:
- Final Meta CSV download is locked until all pre-flight checks pass.
- Checks live microsites, audiences, creatives, landing URLs, naming, Page ID, budget and copy.
- Campaign/ad sets/ads export as PAUSED.
- Output filename ends -meta-ready.csv.
