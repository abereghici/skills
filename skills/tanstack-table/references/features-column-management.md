---
name: tanstack-table-column-management
description: Column visibility, ordering, pinning, and sizing/resizing
---

# Column Management

## Column Visibility

Show/hide columns dynamically.

```ts
import { tableFeatures, useTable, columnVisibilityFeature } from '@tanstack/react-table'

const _features = tableFeatures({ columnVisibilityFeature })

// Controlled
const [columnVisibility, setColumnVisibility] = useState({ email: false })
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  state: { columnVisibility },
  onColumnVisibilityChange: setColumnVisibility,
})

// Initial only
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  initialState: { columnVisibility: { email: false, notes: false } },
})
```

Prevent a column from being hidden:

```ts
columnHelper.accessor('name', { enableHiding: false })
```

Column visibility toggle UI:

```tsx
{table.getAllColumns().map(column => (
  <label key={column.id}>
    <input
      type="checkbox"
      checked={column.getIsVisible()}
      disabled={!column.getCanHide()}
      onChange={column.getToggleVisibilityHandler()}
    />
    {String(column.columnDef.header)}
  </label>
))}
```

**Important:** Use visibility-aware APIs when rendering:
- `row.getVisibleCells()` — not `row.getAllCells()`
- `table.getVisibleLeafColumns()` — not `table.getAllLeafColumns()`
- Header group APIs already account for visibility automatically.

---

## Column Ordering

Reorder columns manually. Column order applied after pinning, before grouping reorder.

```ts
import { columnOrderingFeature } from '@tanstack/react-table'

const _features = tableFeatures({ columnOrderingFeature })

// Static initial order
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  initialState: { columnOrder: ['select', 'name', 'email', 'actions'] },
})

// Dynamic ordering (e.g., drag-and-drop)
const [columnOrder, setColumnOrder] = useState<string[]>(
  columns.map(c => c.id as string)
)
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  state: { columnOrder },
  onColumnOrderChange: setColumnOrder,
})
```

Reorder utility for DnD:

```ts
// Splice-based column reorder
const reorderColumns = (
  movingId: string,
  targetId: string,
  currentOrder: string[]
): string[] => {
  const order = [...currentOrder]
  const movingIdx = order.indexOf(movingId)
  const targetIdx = order.indexOf(targetId)
  order.splice(targetIdx, 0, order.splice(movingIdx, 1)[0])
  return order
}

// Use @dnd-kit/core for drag-and-drop (recommended over react-dnd)
```

> **Note:** `columnOrder` only affects non-pinned columns. Pinned column order is controlled via `columnPinning.left` and `columnPinning.right`.

---

## Column Pinning

Freeze columns to the left or right of the table.

```ts
import { columnPinningFeature } from '@tanstack/react-table'

const _features = tableFeatures({ columnPinningFeature })

// Default pinned columns
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  initialState: {
    columnPinning: {
      left: ['select', 'name'],   // pinned to left
      right: ['actions'],          // pinned to right
    },
  },
})

// Controlled
const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({ left: [], right: [] })
const table = useTable({
  _features, _rowModels: {},
  columns, data,
  state: { columnPinning },
  onColumnPinningChange: setColumnPinning,
})
```

Sticky CSS approach (keep all columns in one `<table>`):

```tsx
{row.getVisibleCells().map(cell => {
  const isPinned = cell.column.getIsPinned()
  return (
    <td
      key={cell.id}
      style={{
        position: isPinned ? 'sticky' : 'relative',
        left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
        zIndex: isPinned ? 1 : 0,
        background: isPinned ? 'white' : undefined,
        boxShadow: cell.column.getIsLastColumn('left') ? '2px 0 4px rgba(0,0,0,0.1)' : undefined,
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
})}
```

Split table approach (separate `<table>` elements for left/center/right):

```tsx
// Left pinned columns
table.getLeftHeaderGroups()
row.getLeftVisibleCells()

// Center (unpinned) columns
table.getCenterHeaderGroups()
row.getCenterVisibleCells()

// Right pinned columns
table.getRightHeaderGroups()
row.getRightVisibleCells()
```

Key column APIs:
- `column.pin('left' | 'right' | false)` — pin/unpin
- `column.getIsPinned()` — `'left' | 'right' | false`
- `column.getStart(position)` — CSS `left` offset for sticky
- `column.getAfter(position)` — CSS `right` offset for sticky
- `column.getIsFirstColumn(position)` / `column.getIsLastColumn(position)` — for shadow styling

---

## Column Sizing & Resizing

```ts
import { columnSizingFeature, columnResizingFeature } from '@tanstack/react-table'

const _features = tableFeatures({ columnSizingFeature, columnResizingFeature })

// Per-column sizes
columnHelper.accessor('name', {
  size: 300,
  minSize: 100,
  maxSize: 600,
  enableResizing: true,   // default true
})

const table = useTable({
  _features, _rowModels: {},
  columns, data,
  defaultColumn: { size: 150, minSize: 20, maxSize: Number.MAX_SAFE_INTEGER },
  columnResizeMode: 'onEnd',     // 'onEnd' (default) | 'onChange'
  columnResizeDirection: 'ltr',  // 'ltr' (default) | 'rtl'
})
```

Apply sizes to cells:

```tsx
<th style={{ width: `${header.getSize()}px` }}>
  {/* Resize handle */}
  <div
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    style={{ cursor: 'col-resize', position: 'absolute', right: 0 }}
    className={header.column.getIsResizing() ? 'isResizing' : ''}
  />
</th>
```

CSS variable approach (better performance for large tables):

```tsx
// Calculate once, memoized
const columnSizeVars = useMemo(() => {
  const vars: Record<string, string> = {}
  table.getAllLeafColumns().forEach(col => {
    vars[`--col-${col.id}-size`] = `${col.getSize()}px`
  })
  return vars
}, [table.store.state.columnSizingInfo, table.store.state.columnSizing])

// Apply to table
<table style={columnSizeVars}>
  <th style={{ width: `var(--col-${header.id}-size)` }}>
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/column-visibility
- https://tanstack.com/table/latest/docs/guide/column-ordering
- https://tanstack.com/table/latest/docs/guide/column-pinning
- https://tanstack.com/table/latest/docs/guide/column-sizing
-->
