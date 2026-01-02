# UI Patterns: Create Flows

## When to Use Each Pattern

### Dialog/Overlay (Default)
Use for most "Create New" actions:
- **Simple forms** with 3-6 fields
- **Quick creation** where user stays in context
- **No type selection** needed upfront
- **Returns to list** after creation

Examples: CRM entities, Studio content, Dashboards, Workflow Boards, Widgets

### New Page
Use only when:
- **Complex multi-step** wizard (e.g., Briefs with type selection)
- **Full-screen editor** opens immediately after creation
- **Heavy form** with many fields, file uploads, rich text
- **Template gallery** is the primary entry point

Examples: Briefs (type selection + complex form), Client Instances (setup wizard)

## Implementation Pattern

### Dialog Pattern (Preferred)
```tsx
// In list page component
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

// Button
<Button onClick={() => setIsCreateDialogOpen(true)}>
  <Plus className="mr-2 h-4 w-4" />
  New Item
</Button>

// Dialog
<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Item</DialogTitle>
    </DialogHeader>
    {/* Form fields */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleCreate}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### New Page Pattern (When Needed)
```tsx
// Button links to /[entity]/new
<Button asChild>
  <Link href="/briefs/new">
    <Plus className="mr-2 h-4 w-4" />
    New Brief
  </Link>
</Button>

// /[entity]/new/page.tsx handles type selection or wizard
```

## Decision Tree

```
Need to create new item?
├── Is form simple (≤6 fields)? → Use Dialog
├── Need type/template selection?
│   ├── Can show as tabs in dialog? → Use Dialog
│   └── Need full gallery view? → Use Page (link to /templates)
├── Opens full-screen editor after? → Use Dialog, redirect after
└── Complex wizard/stepper? → Use Page
```
