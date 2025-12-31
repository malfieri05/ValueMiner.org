"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  LogOut,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

type Clip = {
  id: string;
  youtubeUrl: string;
  title?: string | null;
  thumbnailUrl?: string | null;
  transcript?: string | null;
  summary?: string | null;
  actionSteps?: unknown;
  status: string;
  category?: { id: string; name: string } | null;
  createdAt: string;
};

type Category = { id: string; name: string; slug: string };
type User = { id: string; email: string; name?: string | null };

const fetchJson = async <T,>(url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data as T;
};

function AuthCard({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      await fetchJson(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthenticated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Value Miner</p>
          <h2 className="text-2xl font-semibold text-white">
            Sign {mode === "signup" ? "up" : "in"}
          </h2>
        </div>
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
          <Sparkles className="mr-1 h-4 w-4 text-sky-300" />
          AI summaries & actions
        </div>
      </div>
      <div className="mb-5 flex flex-col gap-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none transition"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none transition"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
      <div className="flex justify-center">
        <div className="flex gap-3">
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-sky-300/60 hover:bg-white/5"
          >
            Switch to {mode === "signup" ? "Login" : "Sign up"}
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:scale-[1.02] hover:shadow-sky-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {mode === "signup" ? "Create account" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ActionPlan = ({ steps }: { steps: string[] }) => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-100">
    {steps.map((step, idx) => (
      <p key={idx}>
        {idx + 1}. {step}
      </p>
    ))}
  </div>
);

const makeShortTitle = (title?: string | null) => {
  const pickWords = (text: string, count = 3) =>
    text
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, count)
      .join(" ");

  if (title && title.trim().length > 0) return pickWords(title, 3);
  return "Short";
};

const ClipCard = ({
  clip,
  onOpen,
  onChangeCategory,
  categories,
}: {
  clip: Clip;
  onOpen: (clip: Clip) => void;
  onChangeCategory: (clipId: string, categoryId: string | null) => void;
  categories: Category[];
}) => {
  const steps = useMemo(() => {
    if (Array.isArray(clip.actionSteps)) {
      return clip.actionSteps.filter((s): s is string => typeof s === "string");
    }
    return [];
  }, [clip.actionSteps]);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleCategorySelect = (categoryId: string | null) => {
    onChangeCategory(clip.id, categoryId);
    setMenuOpen(false);
  };

  const title = makeShortTitle(clip.title);

  return (
    <div
      className="relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-inner shadow-black/30 transition hover:border-sky-400/40"
      onClick={() => onOpen(clip)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="max-w-[75%]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {clip.category?.name || "Unsorted"}
          </p>
          <h3 className="text-lg font-semibold text-white line-clamp-2">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={clip.youtubeUrl}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-xs text-sky-100 hover:border-sky-300"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            View
            <ArrowRight className="h-3 w-3" />
          </a>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="rounded-full border border-white/15 p-1 text-slate-200 transition hover:border-sky-300"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 p-2 text-sm text-slate-100 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Move to category
                </p>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-white/10"
                >
                  Unsorted
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="w-full rounded-lg px-2 py-2 text-left hover:bg-white/10"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {clip.summary && (
        <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Summary</p>
          <p className="text-slate-100">{clip.summary}</p>
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Action plan</p>
          <ActionPlan steps={steps.slice(0, 3)} />
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Saved {new Date(clip.createdAt).toLocaleString()}</span>
        <span
          className={twMerge(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px]",
            clip.status === "PROCESSED"
              ? "bg-emerald-500/15 text-emerald-200"
              : "bg-amber-500/15 text-amber-200",
          )}
        >
          <Check className="h-3 w-3" />
          {clip.status.toLowerCase()}
        </span>
      </div>
    </div>
  );
};

const CategoryPills = ({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onSelect(null)}
      className={twMerge(
        "rounded-full border px-4 py-2 text-xs font-semibold transition",
        activeId === null
          ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
          : "border-white/10 text-slate-200 hover:border-sky-300/50",
      )}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={twMerge(
          "rounded-full border px-4 py-2 text-xs font-semibold transition",
          activeId === cat.id
            ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
            : "border-white/10 text-slate-200 hover:border-sky-300/50",
        )}
      >
        {cat.name}
      </button>
    ))}
  </div>
);

export default function DashboardClient() {
  const params = useSearchParams();
  const sharedUrl = params.get("url");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [ingestUrl, setIngestUrl] = useState(sharedUrl || "");
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await fetchJson<{ user: User }>("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchJson<{ categories: Category[] }>("/api/categories");
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
    }
  };

  const loadClips = async (categoryId: string | null = null) => {
    try {
      const query = categoryId ? `?categoryId=${categoryId}` : "";
      const data = await fetchJson<{ clips: Clip[] }>(`/api/clips${query}`);
      const sorted = [...data.clips].sort((a, b) => {
        const aCat = a.category?.name || "Unsorted";
        const bCat = b.category?.name || "Unsorted";
        if (aCat.toLowerCase() === bCat.toLowerCase()) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return aCat.localeCompare(bCat);
      });
      setClips(sorted);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadCategories();
    loadClips(activeCategory);
  }, [user, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (accountMenuOpen && !target.closest('[data-account-menu]')) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountMenuOpen]);

  const ingest = async () => {
    if (!ingestUrl) return;
    setIngesting(true);
    setToast(null);
    try {
      await fetchJson<{ clip: Clip }>("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          youtubeUrl: ingestUrl,
          categoryId: activeCategory || undefined,
          autoCategorize,
        }),
      });
      setIngestUrl("");
      setToast("Short saved and summarized.");
      loadClips(activeCategory);
      loadCategories();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save";
      setToast(msg);
    } finally {
      setIngesting(false);
    }
  };

  const createCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      const data = await fetchJson<{ category: Category }>("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName }),
      });
      setCategories((prev) => [...prev, data.category]);
      setCategoryName("");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not create";
      setToast(msg);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setClips([]);
    setCategories([]);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-200">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Checking session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-xl">
          <AuthCard onAuthenticated={loadUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-violet-400 via-sky-400 to-violet-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
            Value Miner
          </span>
        </a>
        <div className="relative" data-account-menu>
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-sky-300/60 hover:bg-white/10"
          >
            <User className="h-5 w-5" />
          </button>
          {accountMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 p-2 text-sm text-slate-100 shadow-xl">
              <div className="px-3 py-2 text-xs text-slate-400">{user.email}</div>
              <button
                onClick={() => {
                  setAccountMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-16 pt-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
            <h2 className="text-3xl font-semibold text-white">
              Welcome back, {user.name || user.email}
            </h2>
            <p className="text-sm text-slate-300">
              Input shorts link to mine and save value.
            </p>
          </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
            placeholder="https://youtube.com/shorts/..."
            value={ingestUrl}
            onChange={(e) => setIngestUrl(e.target.value)}
          />
          <button
            disabled={ingesting}
            onClick={ingest}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:scale-[1.01] disabled:opacity-60"
          >
            {ingesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Mine
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={autoCategorize}
            onChange={(e) => setAutoCategorize(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-900 text-sky-500 focus:ring-sky-400"
          />
          Auto-categorize with AI when no category is selected.
        </label>
        {toast && <p className="text-sm text-slate-200">{toast}</p>}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</p>
            <p className="text-sm text-slate-200">Tap to filter or add your own.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              placeholder="Add category"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <button
              onClick={createCategory}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:border-sky-300/60"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </button>
          </div>
        </div>
        <CategoryPills
          categories={categories}
          activeId={activeCategory}
          onSelect={(id) => setActiveCategory(id)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">Recent saves</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
            <Sparkles className="h-4 w-4 text-sky-300" />
            AI-powered
          </div>
        </div>
        {clips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
            No clips yet. Share a Short to Value Miner to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {clips.map((clip) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                categories={categories}
                onOpen={setSelectedClip}
                onChangeCategory={async (clipId, categoryId) => {
                  try {
                    await fetchJson(`/api/clips/${clipId}`, {
                      method: "PATCH",
                      body: JSON.stringify({ categoryId }),
                    });
                    loadClips(activeCategory);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
      {selectedClip && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedClip(null)}
              className="absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200 hover:border-sky-300"
            >
              Close
            </button>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {selectedClip.category?.name || "Unsorted"}
              </p>
              <h2 className="text-2xl font-semibold text-white">{selectedClip.title || "YouTube Short"}</h2>
              <a
                href={selectedClip.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-sky-200 hover:underline"
              >
                Open on YouTube
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
            {selectedClip.summary && (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Summary</p>
                <p className="text-slate-100">{selectedClip.summary}</p>
              </div>
            )}
            {Array.isArray(selectedClip.actionSteps) && selectedClip.actionSteps.length > 0 && (
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Action plan</p>
                <ActionPlan
                  steps={selectedClip.actionSteps.filter((s): s is string => typeof s === "string").slice(0, 3)}
                />
              </div>
            )}
            {selectedClip.transcript && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-200">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">Transcript</p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-100">
                  {selectedClip.transcript}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

