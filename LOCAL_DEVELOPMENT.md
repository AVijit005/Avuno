# Local Development Guide

Since Avuno uses a secure production backend (`api.avuno.xyz`) running on a remote VPS, this guide explains how to properly develop and test your frontend locally on Windows (`http://localhost:5173`) while connected to your live database.

## 1. Starting the Local Server

By default, Vite tries to proxy `/api` requests to `http://localhost:3000`. Since your backend is live on the internet, you must tell your local server to proxy requests to the live backend instead.

Run this command in PowerShell to start your local dev server:
```powershell
$env:API_HOST="https://api.avuno.xyz"; bun run dev
```

## 2. Google Login on Localhost (The Easy Way)

We built a custom "Enterprise-Grade" security feature into your backend that allows you to log in with Google on `localhost` without it redirecting you back to your live site!

### Step 1: Enable Local Redirects on your VPS (One-time setup)
Because redirecting production tokens to localhost is technically a security risk for a SaaS, it is disabled by default. You must explicitly turn it on.
SSH into your VPS and add this to your backend's `.env` file:
```bash
echo "ALLOW_LOCAL_DEV_REDIRECT=true" >> /var/www/chronicle/apps/backend/.env
pm2 restart avuno
```
*(Note: If you ever want maximum security, you can remove this line or set it to `false`.)*

### Step 2: Log in!
Once that variable is set on your VPS, you can simply go to `http://localhost:5173/auth`, click **"Continue with Google"**, and it will flawlessly redirect you back to `localhost:5173/app` fully logged in!

---

## 3. The "Copy-Paste" Trick (Fallback Method)

If you ever find yourself locked out of local Google Login or don't want to enable the VPS environment variable, you can use the ultimate developer hack:

1. Open your live site `https://www.avuno.xyz` and make sure you are logged in.
2. Press **F12** to open Developer Tools.
3. Go to the **Application** tab -> **Local Storage** -> `https://www.avuno.xyz`.
4. Find the `accessToken` key, double-click its value, and **Copy** it.
5. Go to `http://localhost:5173` (which will show the login screen).
6. Press **F12** -> **Application** -> **Local Storage** -> `http://localhost:5173`.
7. Add a new row: type `accessToken` for the Key, and **Paste** your token into the Value.
8. Manually change your URL bar to `http://localhost:5173/app` and hit Enter!

You will instantly be logged in on localhost!

## 4. Email/Password (The Offline-Friendly Way)

If you don't want to mess with Google Login or Tokens at all, you can just click the **Create Account** tab on `http://localhost:5173/auth` and create a dummy account (e.g., `test@avuno.xyz`). 

Because Email/Password login happens entirely via a background API call and doesn't rely on strict Google URL redirects, it works out-of-the-box perfectly on localhost!
