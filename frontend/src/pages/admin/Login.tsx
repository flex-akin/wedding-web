import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, setAdminToken } from "../../api/client";
import { SiteTag } from "../../components/SiteTag";

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await apiRequest<{ token: string }>("/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setAdminToken(token);
      navigate("/admin");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ivory px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-sage/20 bg-white/70 p-8">
        <div className="flex justify-center">
          <SiteTag />
        </div>
        <h1 className="mt-4 text-center text-2xl">Admin sign in</h1>

        <div className="mt-6 space-y-4">
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-sage py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
