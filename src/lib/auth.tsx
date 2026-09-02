import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AproUser = { name: string; email: string; role: string; initials: string };

/** Compte de démonstration — pré-rempli sur la page de connexion. */
export const DEMO_CREDENTIALS = { email: "admin@apro.ma", password: "Apro@2026" };

const DEMO_USER: AproUser = {
  name: "Yassine El Fassi",
  email: DEMO_CREDENTIALS.email,
  role: "Administrateur",
  initials: "YE",
};

const STORAGE_KEY = "apro.session";

type AuthValue = {
  user: AproUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AproUser>;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AproUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as AproUser);
    } catch {
      /* session illisible : on repart déconnecté */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 550));
    if (
      email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error("Identifiants incorrects");
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    return DEMO_USER;
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
