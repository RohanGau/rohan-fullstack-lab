import type { Request, Response, NextFunction } from "express";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function requireCaptcha(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body?.captchaToken;
    if (!token) return res.status(400).json({ msg: "Captcha missing" });

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return res.status(500).json({ msg: "Captcha not configured" });

    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (req.ip) form.append("remoteip", req.ip);

    const r = await fetch(VERIFY_URL, { method: "POST", body: form });
    const data = (await r.json()) as { success: boolean; ["error-codes"]?: string[] };

    if (!data.success) {
      return res.status(403).json({ msg: "Captcha verification failed", error: data["error-codes"] });
    }
    next();
  } catch {
    res.status(500).json({ msg: "Captcha verification error" });
  }
}
