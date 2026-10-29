# Runbook: Cloudflare R2 for scroll-sequence frames (D25)

Full-size sequence frames are about 15–20 MB per sequence, too heavy for git and Vercel. They live in a Cloudflare R2 bucket on the free tier (10 GB storage, no egress fees). Until this is set up, the sites play the 960×540 review previews committed in the repo.

## 1. Create the bucket

1. Cloudflare dashboard → **R2 Object Storage** → activate R2. Cloudflare asks for a card or PayPal as verification; nothing is charged inside the free tier.
2. **Create bucket**, name it `mas-media`, location Automatic.

## 2. Make it publicly readable

- **For testing now:** bucket → **Settings → Public access → R2.dev subdomain → Allow**. You get a URL like `https://pub-xxxxxxxx.r2.dev`. It is rate-limited and meant for testing, which is fine on Vercel Hobby.
- **For launch:** bucket → **Settings → Custom domains → Connect domain** → `media.mas.com`. This needs the `mas.com` DNS zone in the same Cloudflare account. If the client's DNS is elsewhere, we decide at launch (P9).

## 3. Allow the sites to read frames (CORS)

Bucket → **Settings → CORS policy → Edit**, paste:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

The frames are public images, so allowing every origin is safe; it is read-only.

## 4. An upload key for Claude

1. R2 → **Manage R2 API tokens → Create API token**, permission **Object Read & Write**, applied to the `mas-media` bucket only.
2. Copy the **Access Key ID**, the **Secret Access Key** and your **Account ID** (shown on the R2 overview page and inside the S3 endpoint URL).
3. Add them to this Claude Code environment's settings (environment menu in the session's title bar → Edit → secrets / environment variables), never in the chat:

| Variable | Value |
|---|---|
| `R2_ACCOUNT_ID` | Account ID |
| `R2_ACCESS_KEY_ID` | Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key |
| `R2_BUCKET` | `mas-media` |

A new session picks them up. I then run `pnpm sequence:upload --dir <encoded sequences>`.

## 5. Point the sites at R2

In each Vercel project (Settings → Environment Variables), set `NEXT_PUBLIC_MEDIA_URL` to the public URL from step 2 (no trailing slash) and redeploy. The pages then load the full-size frames, and the security policy allows that origin automatically.
