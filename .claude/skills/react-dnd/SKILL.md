---
name: react-dnd
description: Build drag-and-drop UIs in React with react-dnd — the backend + hooks approach (useDrag / useDrop / useDragLayer, DndProvider, monitors, HTML5/Touch backends). Use when implementing draggable cards, sortable lists, kanban boards, reorderable rows, file-drop zones, or any DnD interaction in a React app. Covers setup, core concepts, hooks API, common patterns (sortable list, kanban, custom drag preview), and mobile/touch support.
---

# React DnD

## Overview

React DnD is a set of React utilities for building complex drag-and-drop interfaces while keeping components decoupled. Unlike libraries that manipulate the DOM directly, React DnD is data-driven: you describe **what** can be dragged and **what** happens on drop, and it manages the DnD state for you.

Core idea: a **backend** translates native DOM events into abstract DnD actions, and **hooks** (`useDrag`, `useDrop`) connect your components to that state. Data moves between components via a serializable **item** matched by **type**.

**When to use this skill:** draggable cards, sortable/reorderable lists, kanban boards, tree reordering, file-drop zones, or any React interaction where "pick up X and drop it on Y" is the model. For simple single-list sorting, also consider `@dnd-kit/*` — but react-dnd shines when sources and targets are heterogeneous and decoupled.

---

## Installation

```bash
# HTML5 backend (desktop, uses native drag events)
bun add react-dnd react-dnd-html5-backend

# add Touch backend if you need mobile support
bun add react-dnd-touch-backend
```

Wrap the app once, near the root, in a `DndProvider`:

```tsx
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export function Root() {
  return (
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  );
}
```

> Only **one** `DndProvider` per backend should mount at a time. Nesting two HTML5 providers throws.

---

## Core Concepts

| Concept | What it is |
|---|---|
| **Backend** | Translates DOM events into DnD actions. `HTML5Backend` (desktop), `TouchBackend` (mobile), `TestBackend` (unit tests). |
| **type** | A string/symbol label. A drop target only accepts drags whose `type` matches its `accept`. |
| **item** | Plain serializable object describing what is being dragged (e.g. `{ id, index }`). Available to targets on hover/drop. |
| **monitor** | Read-only DnD state: `isDragging()`, `isOver()`, `canDrop()`, `getItem()`, `getClientOffset()`, etc. |
| **connector (ref)** | The function returned by the hook (`drag`, `drop`, `preview`). Attach it to a DOM node's `ref` to wire it up. |
| **collect** | Selector that maps a monitor to props your component re-renders on. Keep it minimal. |

---

## Hooks API

### `useDrag` — make something draggable

```tsx
import { useDrag } from "react-dnd";

function Card({ id }: { id: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        // dropped successfully on a target
      }
    },
  }), [id]);

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: "move" }}>
      Card {id}
    </div>
  );
}
```

- Pass a **factory function** `() => ({...})` plus a **deps array** (like `useMemo`) so the spec updates when props change.
- `item` may be a function `(monitor) => ({...})` to compute lazily at drag start.
- `end(item, monitor)` fires when the drag stops — use `monitor.getDropResult()` to react.

### `useDrop` — make a drop zone

```tsx
import { useDrop } from "react-dnd";

function Bin() {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "CARD",                      // string | string[] | symbol
    drop: (item: { id: string }) => {    // returned value becomes the dropResult
      handleDrop(item.id);
      return { name: "Bin" };
    },
    hover: (item, monitor) => {          // fires continuously while dragging over
      // used for live reordering (see sortable pattern)
    },
    canDrop: (item, monitor) => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),          // isOver({ shallow: true }) ignores nested targets
      canDrop: monitor.canDrop(),
    }),
  }), []);

  return (
    <div ref={drop} style={{ background: isOver && canDrop ? "#e6ffe6" : undefined }}>
      Drop here
    </div>
  );
}
```

### `useDragLayer` — custom drag preview

Render your own preview that follows the cursor (instead of the browser's default ghost). Combine with `useDrag`'s `preview` connector + `getEmptyImage()` to hide the native one. Required for pixel-perfect previews and for `TouchBackend`.

```tsx
import { useDragLayer } from "react-dnd";

function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));
  if (!isDragging || !currentOffset) return null;
  return (
    <div style={{ position: "fixed", pointerEvents: "none", left: 0, top: 0,
      transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)` }}>
      {/* preview UI for `item` */}
    </div>
  );
}
```

### `useDragDropManager`

Low-level access to the shared manager/monitor/backend. Rarely needed — use for imperative control or bridging non-React code.

---

## Common Patterns

### 1. Sortable list (reorder via `hover`)

Reorder items live as the dragged card passes over its neighbors. The `hover` callback mutates order using indices; `item.index` is updated so the calculation stays stable.

```tsx
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier } from "dnd-core";

const TYPE = "ROW";

function Row({ id, index, move }: {
  id: string; index: number; move: (from: number, to: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    { id: string; index: number }, void, { handlerId: Identifier | null }
  >({
    accept: TYPE,
    collect: (m) => ({ handlerId: m.getHandlerId() }),
    hover(item, monitor) {
      if (!ref.current || item.index === index) return;
      const rect = ref.current.getBoundingClientRect();
      const middleY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - rect.top;
      // only cross the midpoint to avoid flicker
      if (item.index < index && hoverY < middleY) return;
      if (item.index > index && hoverY > middleY) return;
      move(item.index, index);
      item.index = index; // mutate so subsequent hovers are correct
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: TYPE,
    item: () => ({ id, index }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  drag(drop(ref)); // compose: same node is both source and target
  return (
    <div ref={ref} data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0.4 : 1 }}>
      {id}
    </div>
  );
}
```

`move` is typically an immutable splice in the parent:

```tsx
const move = (from: number, to: number) =>
  setItems((prev) => {
    const next = [...prev];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });
```

### 2. Kanban board (drop into columns)

Each column is a `useDrop` with `accept: "CARD"`; its `drop` moves the card's `columnId`. Cards are `useDrag` with `item: { id, fromColumn }`.

```tsx
function Column({ columnId, cards, onDropCard }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item: { id: string; fromColumn: string }) => {
      if (item.fromColumn !== columnId) onDropCard(item.id, columnId);
    },
    collect: (m) => ({ isOver: m.isOver() }),
  }), [columnId]);

  return (
    <div ref={drop} className={isOver ? "column column--over" : "column"}>
      {cards.map((c) => <KanbanCard key={c.id} card={c} columnId={columnId} />)}
    </div>
  );
}
```

### 3. Multiple accepted types

```tsx
useDrop(() => ({ accept: ["CARD", "IMAGE"], drop: (item, monitor) => {
  const type = monitor.getItemType(); // discriminate
} }));
```

### 4. Native file drop (drag files from OS)

```tsx
import { NativeTypes } from "react-dnd-html5-backend";

useDrop(() => ({
  accept: [NativeTypes.FILE],
  drop: (item: { files: File[] }) => uploadFiles(item.files),
  collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
}));
```

---

## Mobile / Touch

`HTML5Backend` does not fire on touch devices. Use `TouchBackend` (and usually a custom `useDragLayer` preview, since touch has no native drag image):

```tsx
import { TouchBackend } from "react-dnd-touch-backend";
<DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
  <App />
</DndProvider>
```

To support both, switch backend by pointer capability, or use a multi-backend package. Keep a single provider mounted.

---

## Testing

Use `react-dnd-test-backend` + `react-dnd-test-utils` to drive DnD in unit tests without a real DOM drag:

```tsx
import { TestBackend } from "react-dnd-test-backend";
render(<DndProvider backend={TestBackend}><Subject /></DndProvider>);
// then use the test monitor/manager to simulate begin/hover/drop
```

For Playwright/E2E, real HTML5 drag events are flaky — prefer asserting the reorder callback via the app's state, or use `dispatchEvent` with `dragstart`/`drop` manually.

---

## Gotchas

- **Deps array matters.** `useDrag`/`useDrop` take a spec factory + deps like `useMemo`. Forgetting deps captures stale props (e.g. an old `index` in a sortable list).
- **`item.index` mutation in `hover`** is intentional and required for the sortable pattern — it keeps drag math correct between renders.
- **One provider per backend.** Two mounted `HTML5Backend` providers throw. Mount `DndProvider` once at the root.
- **`isOver({ shallow: true })`** to ignore nested drop targets bubbling.
- **Ref composition:** `drag(drop(ref))` wires one node as both source and target — order doesn't matter, but call it in render, not in an effect.
- **Return a `dropResult`** from `drop()` if `useDrag`'s `end` needs to know where it landed.
- **Keep `collect` lean** — it runs often; only select the monitor values that drive rendering.

---

## Reference

- Docs: https://react-dnd.github.io/react-dnd/about
- Hooks: `useDrag`, `useDrop`, `useDragLayer`, `useDragDropManager`
- Components: `DndProvider`, `DragPreviewImage`
- Backends: `react-dnd-html5-backend`, `react-dnd-touch-backend`, `react-dnd-test-backend`
- Examples (sortable, kanban, chessboard, nesting): https://react-dnd.github.io/react-dnd/examples
