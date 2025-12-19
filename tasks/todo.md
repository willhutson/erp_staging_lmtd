# SpokeStack - Phase 3: Resource Planning

## Overview
Build resource planning views: Kanban board, Gantt timeline, and team capacity management.

**Target:** Visual work management with drag-and-drop and capacity tracking.

---

## Todo List

### 3.1 Kanban Board
- [ ] Install @dnd-kit for drag-and-drop
- [ ] Create Kanban board component
- [ ] Columns by status (Submitted, In Progress, Review, etc.)
- [ ] Brief cards with key info
- [ ] Drag-and-drop between columns
- [ ] Update status on drop

### 3.2 Gantt Timeline
- [ ] Timeline component with date axis
- [ ] Resource rows (by person)
- [ ] Brief bars showing duration
- [ ] Today indicator line
- [ ] Week/month zoom controls

### 3.3 Capacity Overview
- [ ] Team utilization cards by department
- [ ] Individual capacity bars
- [ ] Overallocation warnings
- [ ] Weekly hours summary

### 3.4 Resources Page
- [ ] View toggle (Kanban / Timeline / Capacity)
- [ ] Filter by department
- [ ] Filter by client
- [ ] Date range selector

---

## File Structure

```
src/
├── app/(dashboard)/resources/
│   ├── page.tsx           # Main resources page with view toggle
│   ├── kanban/
│   │   └── page.tsx       # Kanban view
│   └── timeline/
│       └── page.tsx       # Gantt view
│
├── modules/resources/
│   ├── components/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── GanttTimeline.tsx
│   │   ├── GanttRow.tsx
│   │   ├── CapacityOverview.tsx
│   │   └── CapacityBar.tsx
│   └── actions/
│       └── update-brief-status.ts
```

---

## Review

*(To be filled after Phase 3 completion)*
