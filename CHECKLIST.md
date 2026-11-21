# Setup checklist

Do these in order. Nothing posts until the last step.

## 1. Accounts
- [ ] Instagram is a **Business or Creator** account (Buffer can't publish Reels to a personal one).
- [ ] Optional: a Facebook Page, a YouTube channel, an X account.
- [ ] A [Buffer](https://buffer.com) account, with each of those channels connected.

## 2. Claude (writes the scripts)
- [ ] On your computer, create a token and store it in the repo:
  ```bash
  claude setup-token
  ```
  ```bash
  gh secret set CLAUDE_CODE_OAUTH_TOKEN
  ```

## 3. GitHub Pages (hosts the MP4s Buffer fetches)
- [ ] Repo → **Settings → Pages → Source: GitHub Actions**.
- [ ] The repo must be public, unless your GitHub plan includes Pages for private repos.

## 4. Buffer
- [ ] Create an API key in Buffer's account settings.
- [ ] Store it in the repo:
  ```bash
  gh secret set BUFFER_API_KEY_1
  ```
- [ ] Put the same key in a local `.env` file (git-ignored) as `BUFFER_API_KEY_1=...`, then list your channels:
  ```bash
  npm ci
  ```
  ```bash
  npm run post -- --channels
  ```
- [ ] Paste **only the Axpecto channels** from that output into `brand/channels.json`, then commit and push.

## 5. Check the brand settings (`brand/brand.json`)
- [ ] `slots`: post times in India time. It starts with one a day, at 19:00. Add more, e.g. `["09:00", "19:00"]`.
- [ ] `hashtag`, `url` and `product` are right. `product` is the only thing the writer may claim about Axpecto.
- [ ] `pronounce`: how the voice says "Axpecto". Listen to a test video and adjust.

## 6. Test (makes a video, posts nothing)
- [ ] Run it:
  ```bash
  gh workflow run daily.yml -f test=true
  ```
- [ ] Open the run under **Actions** and download the artifact (video + contact sheet). Watch it with sound.

## 7. Go live
- [ ] Make a video before every slot:
  ```bash
  gh variable set DAILY --body on
  ```
- [ ] Review the videos for a few days (they appear in Actions artifacts), and check their facts.
- [ ] Turn on posting:
  ```bash
  gh variable set POSTING --body on
  ```

## If something breaks
A failed run opens a GitHub issue with a link to its logs. To stop everything: `gh variable set DAILY --body off`.
To stop only posting: `gh variable set POSTING --body off`.
