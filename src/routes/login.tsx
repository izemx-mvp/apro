import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AproLogo } from "@/components/apro/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CREDENTIALS, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — APRO Hygiène Back-office" },
      {
        name: "description",
        content:
          "Accédez au back-office APRO Hygiène : leads, devis, agents Odoo et service client.",
      },
      { property: "og:title", content: "Connexion — APRO Hygiène Back-office" },
      { property: "og:description", content: "Espace de connexion du back-office APRO Hygiène." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && user) navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  // Parallaxe 3D douce suivant le curseur
  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    el.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await signIn(email, password);
      toast.success(`Bienvenue, ${u.name.split(" ")[0]} 👋`);
      navigate({ to: "/", replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connexion impossible";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ambient-canvas relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-rise hidden lg:block">
          <AproLogo height={54} />
          <h1 className="mt-8 text-4xl leading-tight font-semibold tracking-tight text-foreground">
            Le back-office qui pilote
            <span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              vos leads, devis et agents IA.
            </span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Qualification automatique des leads, relances de devis, copilote Odoo et service client
            WhatsApp — réunis dans une seule console.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Synchronisation Odoo en temps réel",
              "Relances automatiques des devis",
              "Agent client WhatsApp & Web",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="rotate-border animate-pop relative rounded-2xl border border-border bg-card/90 p-7 shadow-soft backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
            style={{
              background:
                "radial-gradient(220px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="lg:hidden">
              <AproLogo height={38} />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground lg:mt-0">
              Connexion
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Accédez à votre espace APRO Hygiène.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email" className="mb-1.5 text-xs">
                  Adresse e-mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="mb-1.5 text-xs">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {error && (
                <p className="animate-pop rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="press h-11 w-full text-sm">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion…
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 rounded-xl border border-dashed border-accent/40 bg-accent-soft/50 px-4 py-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Compte de démonstration (pré-rempli)</p>
              <p className="mt-1">
                {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
