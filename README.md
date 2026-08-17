<p align="center">
  <img src="icon.png" width="90" alt="Stryke logo">
</p>

<h1 align="center">Stryke</h1>

<p align="center"><strong>Find who unfollowed you on Instagram in 15 seconds.</strong></p>

<p align="center">No sketchy third-party apps. Nothing leaves your browser. 100% free.</p>

---

## Why Stryke

- **Lightning fast.** Results in about 15 seconds, so you can stay on top of your network without waiting around.
- **Accurate.** Reads the same follower data Instagram itself serves. No estimates, no stale caches.
- **Actually private.** No backend, no third-party servers, no credentials collected. Everything runs client-side in your browser, using the Instagram session you're already logged into.
- **Free.** Seeing who unfollowed you should be a built-in Instagram feature. It's very odd that it isn't. Until then, Stryke is entirely free.

## How it works

1. **Log into Instagram.** Stryke piggybacks on your existing browser session. It never sees your password and there are no tokens to paste anywhere.
2. **Enter any username.** Yours, or any account whose follower list you can view (public accounts, or private ones you follow).
3. **Find out.** Stryke compares the account's following list against its followers and shows exactly who doesn't follow back. Find the snakes in your network and unfollow them too.

Under the hood: the extension resolves the username to a user ID, pages through followers and following via Instagram's own GraphQL web endpoints, and computes the difference locally. Profile pictures are cached in `chrome.storage` so results render instantly on reopen.

Heavy scanning can trip Instagram's rate limits, so please use the tool responsibly.

## Install

```bash
git clone https://github.com/krishras23/stryke.git
```

Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the cloned folder.

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Cache scan results and profile pictures so the popup loads instantly |
| `instagram.com` + Instagram CDN hosts | Fetch follower data and profile pictures using your own session |

That's the entire list: no tabs, no cookies, no history, no browsing data.

## FAQ

**Will accounts know I checked them?**
No. A scan is invisible to the account being looked up.

**Is my account safe?**
Stryke sends nothing to any server. Requests come from your own browser, the same way they do when you browse Instagram normally. That said, your account is always subject to Instagram's policies, and very heavy use may be rate limited, so go easy.

**Does it cost money?**
No. Stryke is entirely free.

## What people say

> "This was a really upfront, transparent and trustworthy site that I'm glad I was able to find and use to filter out my Instagram."
>
> *[Antoine Mistico](https://open.spotify.com/artist/7nRpx3i5aNefrsPwvlD9ma), Artist*

> "This is going to become one of the biggest instagram tools in 2024. Absolutely game changing."
>
> *[Anuj Shah](https://x.com/AnujTalks12), Blogger*

> "I love the fact that you can see unfollowers of people in your network as well, and its extremely accurate too!"
>
> *[Matthew Espinoza](https://x.com/mattespoz), Content Creator*

> "This tool is dope!! I love using stryke to manage my instagram accounts."
>
> *[Aleem Rehmtulla](https://x.com/aleemrehmtulla), Content Creator*

## Disclaimer

Stryke is an independent project and is not affiliated with, endorsed by, or connected to Instagram or Meta. We hold no rights over Instagram content. By using Stryke, you acknowledge that your account is subject to Instagram's terms, policies, and actions.

© 2026 Krish Rastogi
