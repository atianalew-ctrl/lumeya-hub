"use client";
import { useState, useEffect, useCallback } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import { Search, Building2, Globe, MapPin, RefreshCw } from "lucide-react";

interface BrandProfile {
  id: string;
  company_name: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  created_at: string;
}

function BrandAccountsContent() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/brand-accounts");
      const data = await res.json();
      if (Array.isArray(data)) setBrands(data);
      else setError("Failed to load brand accounts");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const filtered = brands.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.company_name ?? "").toLowerCase().includes(q) ||
      (b.industry ?? "").toLowerCase().includes(q) ||
      (b.location ?? "").toLowerCase().includes(q)
    );
  });

  const total = brands.length;

  return (
    <div className="space-y-4 max-w-full">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex gap-3">
          {[
            { label: "Total Brands", value: total, color: "var(--foreground)", bg: "var(--card-bg)" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ background: s.bg, color: s.color, borderColor: "var(--border)" }}>
              {s.value} {s.label}
            </div>
          ))}
        </div>
        <button
          onClick={fetchBrands}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: "var(--border)", background: "var(--card-bg)", color: "var(--foreground)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>Loading brand accounts…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {search ? "No brands match your search." : "No brand accounts registered yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["", "Company Name", "Industry", "Location", "Website", "Registered"].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((brand, i) => (
                  <tr key={brand.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-3">
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.company_name ?? ""} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "#eef2fa" }}>
                          <Building2 size={14} style={{ color: "#4a6fa5" }} />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-medium" style={{ color: "var(--foreground)" }}>{brand.company_name || "—"}</div>
                      {brand.description && (
                        <div className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: "var(--muted-foreground)" }}>
                          {brand.description}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {brand.industry || "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {brand.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {brand.location}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {brand.website ? (
                        <a href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs underline"
                          style={{ color: "var(--primary)" }}>
                          <Globe size={11} />
                          {brand.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      ) : <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>}
                    </td>
                    <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>
                      {new Date(brand.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandAccountsPage() {
  return (
    <AuthGate>
      <AppShell title="Brand Accounts">
        <BrandAccountsContent />
      </AppShell>
    </AuthGate>
  );
}
