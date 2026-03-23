export type Priority = "low" | "medium" | "high" | "critical";
export type Phase = "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4" | "Phase 5";
export type Column = "Backlog" | "Todo" | "In Progress" | "Review" | "Done";

export interface BoardCard {
  id: string;
  title: string;
  phase: Phase;
  priority: Priority;
  column: Column;
  description?: string;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#7c3aed",
};

export const PHASE_COLORS: Record<Phase, string> = {
  "Phase 1": "#4a6fa5",
  "Phase 2": "#6b5fa5",
  "Phase 3": "#a55f9c",
  "Phase 4": "#a56f4a",
  "Phase 5": "#4aa57a",
};

export const COLUMNS: Column[] = ["Backlog", "Todo", "In Progress", "Review", "Done"];

export const DEFAULT_CARDS: BoardCard[] = [
  // Phase 1 — Foundation
  { id: "p1-1", title: "Set up Next.js + Supabase project", phase: "Phase 1", priority: "critical", column: "Done" },
  { id: "p1-2", title: "Authentication (magic link + OAuth)", phase: "Phase 1", priority: "critical", column: "Done" },
  { id: "p1-3", title: "Database schema design", phase: "Phase 1", priority: "high", column: "Done" },
  { id: "p1-4", title: "Responsive layout + navigation", phase: "Phase 1", priority: "high", column: "Done" },
  { id: "p1-5", title: "Landing page + waitlist form", phase: "Phase 1", priority: "high", column: "Done" },
  { id: "p1-6", title: "Deploy to Vercel", phase: "Phase 1", priority: "medium", column: "Done" },
  { id: "p1-7", title: "Email notifications on signup", phase: "Phase 1", priority: "medium", column: "Review" },

  // Phase 2 — Creator Hub
  { id: "p2-1", title: "Creator onboarding flow", phase: "Phase 2", priority: "critical", column: "In Progress" },
  { id: "p2-2", title: "Creator profile page", phase: "Phase 2", priority: "high", column: "In Progress" },
  { id: "p2-3", title: "Portfolio upload (images/videos)", phase: "Phase 2", priority: "high", column: "Todo" },
  { id: "p2-4", title: "Creator dashboard overview", phase: "Phase 2", priority: "high", column: "Todo" },
  { id: "p2-5", title: "Creator approval workflow", phase: "Phase 2", priority: "medium", column: "Todo" },
  { id: "p2-6", title: "Creator search + filtering", phase: "Phase 2", priority: "medium", column: "Backlog" },
  { id: "p2-7", title: "Analytics for creators", phase: "Phase 2", priority: "low", column: "Backlog" },

  // Phase 3 — Brand Portal
  { id: "p3-1", title: "Brand account creation", phase: "Phase 3", priority: "critical", column: "Backlog" },
  { id: "p3-2", title: "Post opportunity/brief", phase: "Phase 3", priority: "high", column: "Backlog" },
  { id: "p3-3", title: "Brand dashboard", phase: "Phase 3", priority: "high", column: "Backlog" },
  { id: "p3-4", title: "Creator discovery for brands", phase: "Phase 3", priority: "high", column: "Backlog" },
  { id: "p3-5", title: "Application/proposal flow", phase: "Phase 3", priority: "medium", column: "Backlog" },
  { id: "p3-6", title: "Contract/agreement module", phase: "Phase 3", priority: "medium", column: "Backlog" },

  // Phase 4 — Marketplace
  { id: "p4-1", title: "Payments integration (Stripe)", phase: "Phase 4", priority: "critical", column: "Backlog" },
  { id: "p4-2", title: "Escrow + milestone payments", phase: "Phase 4", priority: "high", column: "Backlog" },
  { id: "p4-3", title: "Content delivery + review", phase: "Phase 4", priority: "high", column: "Backlog" },
  { id: "p4-4", title: "Rating + review system", phase: "Phase 4", priority: "medium", column: "Backlog" },
  { id: "p4-5", title: "Dispute resolution", phase: "Phase 4", priority: "medium", column: "Backlog" },

  // Phase 5 — Scale
  { id: "p5-1", title: "API for external integrations", phase: "Phase 5", priority: "high", column: "Backlog" },
  { id: "p5-2", title: "Nordic market expansion", phase: "Phase 5", priority: "high", column: "Backlog" },
  { id: "p5-3", title: "Advanced analytics dashboard", phase: "Phase 5", priority: "medium", column: "Backlog" },
  { id: "p5-4", title: "Mobile app (React Native)", phase: "Phase 5", priority: "medium", column: "Backlog" },
  { id: "p5-5", title: "White-label offering", phase: "Phase 5", priority: "low", column: "Backlog" },
];

export const BOARD_STORAGE_KEY = "lh_board_cards";

export function loadCards(): BoardCard[] {
  if (typeof window === "undefined") return DEFAULT_CARDS;
  const stored = localStorage.getItem(BOARD_STORAGE_KEY);
  if (!stored) return DEFAULT_CARDS;
  try {
    return JSON.parse(stored) as BoardCard[];
  } catch {
    return DEFAULT_CARDS;
  }
}

export function saveCards(cards: BoardCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(cards));
}
