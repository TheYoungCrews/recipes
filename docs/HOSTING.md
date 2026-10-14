# Hosting: spare laptop + Tailscale ($0, private)

The spare laptop keeps a copy of the repo, rebuilds the site every 15 minutes, and serves it. Phones and the iPad reach it from anywhere through Tailscale, a free private network that only your devices can join. Nothing is public. The full site works this way, search and filters included (unlike the iCloud file).

You need: the spare laptop (plugged in, sleep off), a free Tailscale account (you make it; sign in with Google or Apple), and Python 3 + git on the laptop.

## 1. Tailscale (all devices)
1. Laptop: install from https://tailscale.com/download and sign in.
2. Your iPhone, Anna's iPhone, the iPad: install the Tailscale app from the App Store. Sign in to the same tailnet (you can sign Anna's phone in with your account, or invite her from the admin console; the free Personal plan allows a few users).
3. In the Tailscale admin console, find the laptop's name (e.g. `recipes-laptop`). Turn on **MagicDNS** if it's off.

## 2. Repo on the laptop (read access to the private repo)
Pick one:
- **gh login (easiest):** install GitHub CLI, run `gh auth login`, then `gh repo clone TheYoungCrews/recipes ~/recipes`.
- **Deploy key (read-only, safer):** `ssh-keygen -t ed25519 -f ~/.ssh/recipes_deploy -N ""`. Paste the `.pub` into GitHub > TheYoungCrews/recipes > Settings > Deploy keys (leave "write" unchecked). Then `GIT_SSH_COMMAND="ssh -i ~/.ssh/recipes_deploy" git clone git@github.com:TheYoungCrews/recipes.git ~/recipes` and `git -C ~/recipes config core.sshCommand "ssh -i ~/.ssh/recipes_deploy"`.
Then build once: `cd ~/recipes && python3 scripts/build.py`.

## 3a. macOS
1. Keep it awake: System Settings > Battery/Energy > "Prevent automatic sleeping when the display is off" on.
2. Serve the site: in Terminal, `crontab -e` and add:
```
@reboot cd ~/recipes/site && /usr/bin/python3 -m http.server 8080
*/15 * * * * ~/recipes/scripts/update.sh >> ~/recipes-update.log 2>&1
```
   (If macOS asks, allow Terminal/cron "Full Disk Access", or keep the repo outside Documents/Desktop.) Restart, or start it now with `cd ~/recipes/site && nohup python3 -m http.server 8080 &`.

## 3b. Windows
1. Install Python 3 (python.org, tick "Add to PATH") and Git for Windows. Settings > Power: sleep "Never" when plugged in.
2. Task Scheduler > Create Task:
   - **Recipes server:** trigger "At log on"; action `python`, arguments `-m http.server 8080`, start in `C:\Users\<you>\recipes\site`.
   - **Recipes update:** trigger daily, repeat every 15 minutes; action `powershell`, arguments `-ExecutionPolicy Bypass -File C:\Users\<you>\recipes\scripts\update.ps1`.
3. Allow Python through Windows Firewall on Private networks when asked.

## 4. Open it
- Any device with Tailscale on: `http://recipes-laptop:8080` (use your laptop's Tailscale name). Bookmark it, then Share > **Add to Home Screen** in Safari.
- Optional HTTPS: on the laptop run `tailscale serve --bg 8080` (enable HTTPS certificates in the admin console when prompted). Then use `https://recipes-laptop.<your-tailnet>.ts.net`. Still private to your tailnet.

## Checks and gotchas
- New recipe not showing? Wait 15 minutes, or run `scripts/update.sh` (or `update.ps1`) by hand; check `~/recipes-update.log`.
- If the laptop is off or asleep, the site is down. The iCloud `Recipes.html` (share/HOW-TO-SHARE.md) is the backup.
- The update only pulls (`--ff-only`); never edit recipes on the laptop itself.
