# Hosting: Cloudflare Pages + Cloudflare Access (chosen; $0, private)

The site builds from the private repo on every push and is served at `https://<project>.pages.dev`. Cloudflare Access sits in front of it: only Crews and Anna get in, by typing their email and a one-time PIN, and stay signed in for up to a month. Alternative, if you'd rather not use Cloudflare: `docs/HOSTING.md` (spare laptop + Tailscale).

Checked against Cloudflare docs, Oct 2026: Pages build image v3 (Ubuntu 22.04, Python 3.13.3 default, overridable via `.python-version`), and "Known issues > Enable Access on your *.pages.dev domain".

## Build facts (already set up in the repo)
- Build command: `python3 scripts/build.py`. Output directory: `site`. Pure standard-library Python, no installs.
- `.python-version` pins `3.13`. No `requirements.txt` is needed.
- The build fails, and Cloudflare keeps the last good site, if a recipe has a bad tag or missing fields.

## 1. Cloudflare account (Crews)
1. Sign up at https://dash.cloudflare.com/sign-up (free) and verify your email. Turn on 2FA (My Profile > Authentication).

## 2. Pages project from the private repo
1. Dashboard > **Workers & Pages** > **Create** > **Pages** tab > **Import an existing Git repository** (Connect to Git).
2. **Connect GitHub.** In the GitHub install screen choose **Only select repositories** > `TheYoungCrews/recipes` > Install & Authorize.
3. Pick `recipes`, then **Begin setup**:
   - Project name: e.g. `enochs-recipes` (this becomes `enochs-recipes.pages.dev` and **can't be changed later**; it's visible in the URL, so avoid anything personal)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `python3 scripts/build.py`
   - Build output directory: `site`
   - (Optional) Environment variable `SKIP_DEPENDENCY_INSTALL` = `1`
4. **Save and Deploy.** Wait for "Success" and open the URL to check it works. It's public until step 3, so do step 3 right away.

## 3. Lock it down with Access (covers the main URL and preview URLs)
Follows Cloudflare's documented steps for protecting `*.pages.dev` as well as previews:
1. Pages project > **Settings** > **General** > **Enable access policy**. (First time: Cloudflare asks you to set up Zero Trust. Pick a team name and the **Free** plan; it may ask for a card even though Free costs $0.)
2. Select **Manage** on the policy it created. This opens Zero Trust > Access > Applications, with your project selected.
3. **Configure**. Under **Public hostname**, in the **Subdomain** field, delete the `*` and **Save** (if it errors, change the Application name, e.g. `Recipes (main)`). This app now protects `enochs-recipes.pages.dev`.
4. Back to Pages project > **Settings** > **General** > **Enable access policy** again. This re-protects preview URLs (`*.enochs-recipes.pages.dev`).
5. Zero Trust > Access > Applications: confirm **two** apps exist (main domain + previews).

## 4. Who can get in, and how
1. Zero Trust > **Settings** > **Authentication** > Login methods > **Add new** > **One-time PIN** (if it's not already listed).
2. For **each** of the two applications: Edit > **Policies**. Make the policy:
   - Action **Allow**, name `Crews and Anna`
   - Include > **Emails**: `CREWS_EMAIL@example.com`, `ANNA_EMAIL@example.com`
   - Remove any rule that allows the whole account or "Everyone".
3. In each application's settings: **Session Duration** = **1 month**. Login methods: One-time PIN (you can turn off others).
4. Test in a private browser window: you should see a Cloudflare sign-in page. Enter your email, get the code by email, and you're in. An email not on the list never gets a code.

## 5. On iPhone / iPad (Crews and Anna)
1. Open `https://enochs-recipes.pages.dev` in **Safari**, enter your email, then the PIN from your inbox.
2. Share > **Add to Home Screen**. It opens like an app with full search and filters. You'll be asked for a new PIN about once a month.

## Updating
Nothing to do: every push to `main` (any agent, or an email Grok Bot commits) rebuilds the site in about a minute.
