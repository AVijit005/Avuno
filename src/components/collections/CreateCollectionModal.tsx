import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lock, Globe, Users, X } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";

const ACCENTS = [
  "var(--primary)",
  "oklch(0.65 0.22 295)",
  "oklch(0.78 0.18 50)",
  "oklch(0.72 0.16 160)",
  "oklch(0.66 0.22 18)",
  "oklch(0.75 0.15 145)",
];

export function CreateCollectionModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [privacy, setPrivacy] = useState<"private" | "public" | "friends">("private");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onOpenChange(false);
        setName("");
        setDesc("");
      }, 900);
    }, 800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[110] grid place-items-center bg-black/60 px-4 py-10 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 18, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="glass-floating relative w-full max-w-xl overflow-hidden rounded-[32px] p-8"
            style={{ boxShadow: "0 60px 140px -30px oklch(0 0 0 / 0.75)" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.45), transparent)",
              }}
            />
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-[10px] uppercase tracking-[0.22em] text-primary/90">
              New collection
            </div>
            <h2 id="modal-title" className="mt-2 font-display text-3xl tracking-tight">
              Curate a new shelf
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A collection becomes a small story of its own.
            </p>

            <div className="mt-7 space-y-5">
              {[
                <Field
                  key="name"
                  label="Collection name"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. Christopher Nolan"
                />,
                <Field
                  key="desc"
                  label="Description"
                  value={desc}
                  onChange={setDesc}
                  placeholder="What ties these together?"
                  multiline
                />,
              ].map((el, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                >
                  {el}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Accent
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      aria-label={`Select accent color ${c}`}
                      className={`relative h-8 w-8 rounded-full transition ${accent === c ? "ring-2 ring-foreground/80 ring-offset-2 ring-offset-background" : ""}`}
                      style={{ background: c, boxShadow: `0 0 16px ${c}` }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Cover preview
                </div>
                <div
                  className="mt-3 h-28 overflow-hidden rounded-2xl ring-1 ring-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, oklch(0.14 0.012 270))`,
                  }}
                >
                  <div className="flex h-full items-end p-4 font-display text-xl text-white">
                    {name || "Your collection"}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5 }}
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Privacy
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { v: "private" as const, icon: Lock, label: "Private" },
                    { v: "friends" as const, icon: Users, label: "Friends" },
                    { v: "public" as const, icon: Globe, label: "Public" },
                  ].map((opt) => {
                    const I = opt.icon;
                    const on = privacy === opt.v;
                    return (
                      <button
                        key={opt.v}
                        onClick={() => setPrivacy(opt.v)}
                        aria-label={`Set privacy to ${opt.label}`}
                        className={`glass-subtle flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs transition ${on ? "ring-2 ring-primary/60" : ""}`}
                      >
                        <I className="h-3.5 w-3.5" /> {opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.5 }}
              className="mt-8 flex items-center justify-end gap-3"
            >
              <PremiumButton variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </PremiumButton>
              <PremiumButton variant="primary" loading={submitting} success={done} onClick={submit}>
                {done ? "Created" : "Create collection"}
              </PremiumButton>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          rows={3}
          className="mt-2 w-full resize-none rounded-2xl border border-border/60 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="mt-2 w-full rounded-2xl border border-border/60 bg-white/[0.03] px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      )}
    </label>
  );
}
