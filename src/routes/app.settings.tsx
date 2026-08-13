import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useProfile,
  useUpdateProfile,
  useUpdatePrivacy,
  useSessions,
  useRevokeSession,
} from "@/hooks/use-users";
import { useLogout } from "@/hooks/use-auth";
import {
  Download,
  ArrowUpRight,
  Monitor,
  Moon,
  Sun,
  Lock,
  Globe,
  EyeOff,
  Shield,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/app/settings")({ component: Page });

function Page() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePrivacy = useUpdatePrivacy();
  const { data: sessions } = useSessions();
  const revokeSession = useRevokeSession();
  const logout = useLogout();

  const [theme, setTheme] = useState(profile?.themePreference || "system");
  const [privacy, setPrivacy] = useState(profile?.privacy?.profileVisibility || "private");

  useEffect(() => {
    if (profile?.themePreference) setTheme(profile.themePreference);
    if (profile?.privacy?.profileVisibility)
      setPrivacy(profile.privacy.profileVisibility as string);
  }, [profile]);

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    localStorage.setItem("theme", t);
    const isLight =
      t === "light" ||
      (t === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.classList.toggle("light", isLight);
    document.documentElement.classList.toggle("dark", !isLight);
    updateProfile.mutate({ themePreference: t });
  };

  const handlePrivacyChange = (newPrivacy: "public" | "followers" | "private") => {
    setPrivacy(newPrivacy);
    updatePrivacy.mutate({ profileVisibility: newPrivacy });
  };

  return (
    <div className="mx-auto max-w-2xl py-8 pb-24">
      <h1 className="mb-8 font-display text-3xl tracking-tight">Settings</h1>

      <Link
        to="/app/import"
        className="mb-8 flex items-center gap-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/12 to-secondary/8 p-5 transition-[border-color,transform] duration-[200ms] hover:border-primary/40 active:scale-[0.99]"
      >
        <div className="grid h-12 w-12 place-items-center rounded-xl glass-subtle">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-base tracking-tight">Import & Export</div>
          <div className="mt-1 text-[13px] leading-relaxed text-foreground/65">
            Bring your library in from JSON or CSV — or back it all up to a file you control.
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-primary" />
      </Link>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl glass-subtle">
          <h2 className="font-display text-lg tracking-tight mb-4 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => applyTheme("system")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${theme === "system" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <Monitor className="h-5 w-5" />
              <span className="text-sm">System</span>
            </button>
            <button
              onClick={() => applyTheme("light")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${theme === "light" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <Sun className="h-5 w-5" />
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={() => applyTheme("dark")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${theme === "dark" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <Moon className="h-5 w-5" />
              <span className="text-sm">Dark</span>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-subtle">
          <h2 className="font-display text-lg tracking-tight mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Region & Language
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language
              </label>
              <select
                id="language"
                value={profile?.language || "en"}
                onChange={(e) => updateProfile.mutate({ language: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-3 py-2.5 text-sm text-foreground hover:border-foreground/15 hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/30 transition-[border-color,box-shadow,background-color] duration-[140ms]"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="ja">日本語 (Japanese)</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="timezone" className="text-sm font-medium">
                Timezone
              </label>
              <select
                id="timezone"
                value={profile?.timezone || "UTC"}
                onChange={(e) => updateProfile.mutate({ timezone: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] px-3 py-2.5 text-sm text-foreground hover:border-foreground/15 hover:bg-foreground/[0.06] focus-visible:outline-none focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/30 transition-[border-color,box-shadow,background-color] duration-[140ms]"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-subtle">
          <h2 className="font-display text-lg tracking-tight mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Privacy & Visibility
          </h2>
          <div className="grid gap-3">
            <button
              onClick={() => handlePrivacyChange("public")}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${privacy === "public" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <Globe className="mt-0.5 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Public</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  Anyone can view your profile and collections.
                </div>
              </div>
            </button>
            <button
              onClick={() => handlePrivacyChange("private")}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${privacy === "private" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <Lock className="mt-0.5 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Private</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  Only you can see your activity and library.
                </div>
              </div>
            </button>
            <button
              onClick={() => handlePrivacyChange("followers")}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color] duration-[140ms] active:scale-[0.98] ${privacy === "followers" ? "border-primary bg-primary/10" : "border-foreground/[0.08] hover:border-foreground/20 hover:bg-foreground/[0.05]"}`}
            >
              <EyeOff className="mt-0.5 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Followers Only</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  Only approved followers can view your library.
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-subtle">
          <h2 className="font-display text-lg tracking-tight mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Notifications & Connected Accounts
          </h2>
          <div className="text-sm text-muted-foreground rounded-xl glass-subtle p-4">
            <p>
              Notification preferences and connected account management are not currently supported
              by the backend API.
            </p>
          </div>
        </div>

        {sessions && sessions.length > 0 && (
          <div className="p-6 rounded-2xl glass-subtle">
            <h2 className="font-display text-lg tracking-tight mb-4">Active Sessions</h2>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-foreground/[0.07] bg-foreground/[0.03] p-4"
                >
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {s.os} · {s.browser}{" "}
                      {s.isCurrent && (
                        <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      Last active: {new Date(s.lastSeen).toLocaleDateString()} · {s.ipAddress}
                    </div>
                  </div>
                  {!s.isCurrent && (
                    <button
                      onClick={() => revokeSession.mutate(s.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors duration-[140ms] active:scale-[0.95]"
                      title="Revoke session"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-4 text-sm font-medium text-red-500 transition-[background-color,transform] duration-[140ms] hover:bg-red-500/20 active:scale-[0.98] ring-1 ring-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            Log out of Avuno
          </button>
        </div>
      </div>
    </div>
  );
}
