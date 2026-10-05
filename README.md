# 🪁 Dashain Premier League (DPL)

A phone-friendly **webpage** tracking the Marriage card-game season during Dashain —
cumulative season standings on the home page, day-wise ranks, player profiles with stats,
full game history, and money settlement. $0.10 / point.

## Screens

| Tab | What it shows |
|---|---|
| 🏠 Home | **Cumulative season leaderboard** (running total across all days), money in play, rank movement |
| 📅 Days | Each day's standings, games, and one-tap settlement |
| 👥 Players | Player cards with titles (The Banker, The Comeback King…); tap for stat tiles, 👁️/🙈/🀄/🚩 counts, day-by-day table, game history |
| 📊 Stats | League superlatives: Crown Collector, Maal Seer, Blind Faith, Dublee Dealer, Foul Machine, Biggest Round, Best Average… |
| 💸 Settle | Season or per-day settlement — winners, payers, and the fewest possible transfers |

📤 **Share** buttons produce WhatsApp-ready text for standings, games, and settlements.

## How it gets updated

Ritik sends game screenshots → the data in `js/seed.js` is extended (one game = one block:
players, per-round points + status icons, totals) → commit + push → GitHub Pages redeploys
in ~1 minute. No build step, no database.

Round status codes: `s` seen 👁️ · `u` unseen/blind 🙈 · `d` dublee 🀄 · `f` foul 🚩.
Winner of each round is stored as `w`. Every game's rounds are verified zero-sum before deploy.

## Files

```
index.html      page shell
css/app.css     Dashain-night theme, phone-first
js/app.js       rendering, standings math, stats, settlement, share
js/seed.js      ALL DATA — days, players, games, rounds (edit this to update)
icons/icon.svg  favicon
```

## Deploy

Static files → any static host. On GitHub Pages: push to `main`, then
Settings → Pages → Deploy from a branch → `main` / root. Live in ~1 minute at
`https://<user>.github.io/<repo>/`.
