"use client";
import { useState, useEffect } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BoardCard,
  Column,
  Phase,
  Priority,
  COLUMNS,
  PRIORITY_COLORS,
  PHASE_COLORS,
  DEFAULT_CARDS,
  BOARD_STORAGE_KEY,
} from "@/lib/boardData";
import { Plus, X, GripVertical } from "lucide-react";

function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: PRIORITY_COLORS[priority] }}
    />
  );
}

function PhaseTag({ phase }: { phase: Phase }) {
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded font-medium"
      style={{
        background: PHASE_COLORS[phase] + "20",
        color: PHASE_COLORS[phase],
      }}
    >
      {phase}
    </span>
  );
}

interface CardModalProps {
  card: BoardCard;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function CardModal({ card, onClose, onDelete }: CardModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-lg"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="font-semibold text-base" style={{ color: "var(--foreground)" }}>{card.title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PhaseTag phase={card.phase} />
            <PriorityDot priority={card.priority} />
            <span className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>{card.priority} priority</span>
          </div>
          <div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Column: </span>
            <span className="text-xs font-medium">{card.column}</span>
          </div>
          {card.description && (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{card.description}</p>
          )}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => { onDelete(card.id); onClose(); }}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Delete card
          </button>
        </div>
      </div>
    </div>
  );
}

function SortableCard({ card, onClick }: { card: BoardCard; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: "var(--card-bg)", border: "1px solid var(--border)" }}
      className="rounded-lg p-3 cursor-pointer hover:border-blue-200 transition-colors"
    >
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100">
          <GripVertical size={12} style={{ color: "var(--muted-foreground)" }} />
        </button>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <PriorityDot priority={card.priority} />
            <PhaseTag phase={card.phase} />
          </div>
          <p className="text-xs font-medium leading-snug" style={{ color: "var(--foreground)" }}>{card.title}</p>
        </div>
      </div>
    </div>
  );
}

function AddCardForm({ column, onAdd, onCancel }: { column: Column; onAdd: (title: string, phase: Phase, priority: Priority) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState<Phase>("Phase 1");
  const [priority, setPriority] = useState<Priority>("medium");

  return (
    <div className="p-3 rounded-lg border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title…"
        className="w-full text-xs px-2 py-1.5 rounded border mb-2 outline-none"
        style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}
        onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) onAdd(title, phase, priority); if (e.key === "Escape") onCancel(); }}
      />
      <div className="flex gap-2 mb-2">
        <select value={phase} onChange={(e) => setPhase(e.target.value as Phase)} className="flex-1 text-xs px-2 py-1 rounded border outline-none" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
          {(["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"] as Phase[]).map((p) => <option key={p}>{p}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="flex-1 text-xs px-2 py-1 rounded border outline-none" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
          {(["low", "medium", "high", "critical"] as Priority[]).map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { if (title.trim()) onAdd(title, phase, priority); }} className="text-xs px-3 py-1 rounded text-white transition-opacity hover:opacity-90" style={{ background: "var(--primary)" }}>Add</button>
        <button onClick={onCancel} className="text-xs px-3 py-1 rounded hover:bg-gray-100" style={{ color: "var(--muted-foreground)" }}>Cancel</button>
      </div>
    </div>
  );
}

function BoardContent() {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [activeCard, setActiveCard] = useState<BoardCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);
  const [filterPhase, setFilterPhase] = useState<Phase | "All">("All");
  const [addingIn, setAddingIn] = useState<Column | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(BOARD_STORAGE_KEY);
    if (stored) {
      try { setCards(JSON.parse(stored)); return; } catch {}
    }
    setCards(DEFAULT_CARDS);
  }, []);

  const save = (updated: BoardCard[]) => {
    setCards(updated);
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(updated));
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as Column)) {
      save(cards.map((c) => c.id === activeId ? { ...c, column: overId as Column } : c));
      return;
    }

    // Dropped on another card
    const overCard = cards.find((c) => c.id === overId);
    if (!overCard) return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    if (activeCard.column === overCard.column) {
      const colCards = cards.filter((c) => c.column === activeCard.column);
      const otherCards = cards.filter((c) => c.column !== activeCard.column);
      const oldIdx = colCards.findIndex((c) => c.id === activeId);
      const newIdx = colCards.findIndex((c) => c.id === overId);
      const reordered = arrayMove(colCards, oldIdx, newIdx);
      save([...otherCards, ...reordered]);
    } else {
      save(cards.map((c) => c.id === activeId ? { ...c, column: overCard.column } : c));
    }
  };

  const addCard = (column: Column, title: string, phase: Phase, priority: Priority) => {
    const newCard: BoardCard = {
      id: `card-${Date.now()}`,
      title,
      phase,
      priority,
      column,
    };
    save([...cards, newCard]);
    setAddingIn(null);
  };

  const deleteCard = (id: string) => {
    save(cards.filter((c) => c.id !== id));
  };

  const filteredCards = filterPhase === "All" ? cards : cards.filter((c) => c.phase === filterPhase);

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Filter:</span>
        {(["All", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"] as (Phase | "All")[]).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPhase(p)}
            className="text-xs px-3 py-1 rounded-full transition-all"
            style={{
              background: filterPhase === p ? "var(--primary)" : "var(--muted)",
              color: filterPhase === p ? "#fff" : "var(--muted-foreground)",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
          {COLUMNS.map((col) => {
            const colCards = filteredCards.filter((c) => c.column === col);
            return (
              <div
                key={col}
                id={col}
                className="flex-shrink-0 flex flex-col rounded-xl p-3"
                style={{ width: 240, background: "var(--muted)", minHeight: 400 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{col}</h3>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--border)", color: "var(--muted-foreground)" }}>
                    {colCards.length}
                  </span>
                </div>

                <SortableContext items={colCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex-1 space-y-2">
                    {colCards.map((card) => (
                      <SortableCard
                        key={card.id}
                        card={card}
                        onClick={() => setSelectedCard(card)}
                      />
                    ))}
                  </div>
                </SortableContext>

                {addingIn === col ? (
                  <div className="mt-2">
                    <AddCardForm
                      column={col}
                      onAdd={(title, phase, priority) => addCard(col, title, phase, priority)}
                      onCancel={() => setAddingIn(null)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingIn(col)}
                    className="mt-2 flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-lg hover:bg-white/50 transition-colors w-full"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <Plus size={12} />
                    Add card
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeCard && (
            <div
              className="rounded-lg p-3 shadow-lg rotate-2"
              style={{ background: "var(--card-bg)", border: "1px solid var(--primary)", width: 230 }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <PriorityDot priority={activeCard.priority} />
                <PhaseTag phase={activeCard.phase} />
              </div>
              <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{activeCard.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDelete={(id) => { deleteCard(id); setSelectedCard(null); }}
        />
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <AuthGate>
      <AppShell title="Project Board">
        <BoardContent />
      </AppShell>
    </AuthGate>
  );
}
