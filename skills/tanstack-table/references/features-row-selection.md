---
name: tanstack-table-row-selection
description: Row selection with checkboxes, single/multi select, selection state
---

# Row Selection

Row selection does not need a row model — it tracks IDs only.

## Setup

```ts
import {
  tableFeatures, useTable,
  rowSelectionFeature,
  type RowSelectionState,
} from '@tanstack/react-table'

const _features = tableFeatures({ rowSelectionFeature })

// Uncontrolled (table manages state)
const table = useTable({
  _features,
  _rowModels: {},
  columns, data,
})

// Controlled — almost always preferred (easy access to selected IDs)
const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
const table = useTable({
  _features,
  _rowModels: {},
  columns, data,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
})
```

## Meaningful Row IDs

By default, TanStack uses `row.index` as the row ID. Use a stable identifier from your data so that selection state maps to real entity IDs:

```ts
const table = useTable({
  ...
  getRowId: row => row.uuid,   // row.uuid from your database
})
// rowSelection state will be { "abc-123": true, "def-456": true }
// instead of { "0": true, "1": true }
```

## Checkbox Column

```tsx
columnHelper.display({
  id: 'select',
  header: ({ table }) => (
    <input
      type="checkbox"
      checked={table.getIsAllRowsSelected()}
      ref={el => {
        if (el) el.indeterminate = table.getIsSomeRowsSelected()
      }}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
})
```

## Row Click Selection (no checkbox)

```tsx
<tr
  onClick={row.getToggleSelectedHandler()}
  style={{ background: row.getIsSelected() ? '#e0f0ff' : undefined }}
>
  {row.getVisibleCells().map(cell => ...)}
</tr>
```

## Conditional Selection

```ts
const table = useTable({
  ...
  enableRowSelection: row => row.original.status !== 'locked',  // or just `false` to disable all
  enableMultiRowSelection: false,  // single row only (radio-style)
  enableSubRowSelection: false,    // don't auto-select sub-rows
})
```

## Reading Selection State

```ts
// Raw state — object of { [rowId]: boolean }
const selectionState = table.store.state.rowSelection

// Row objects
const selectedRows = table.getSelectedRowModel().rows
const selectedAfterFilter = table.getFilteredSelectedRowModel().rows
const selectedAfterGrouping = table.getGroupedSelectedRowModel().rows

// Get selected original data
const selectedData = table.getSelectedRowModel().rows.map(r => r.original)
```

> **Note:** `getSelectedRowModel()` only sees rows currently in `data`. If you have server-side pagination, selections on other pages won't appear in this model — but they _are_ preserved in `rowSelection` state.

## Key APIs

Table:
- `table.getIsAllRowsSelected()` — all rows selected
- `table.getIsSomeRowsSelected()` — some (but not all) rows selected
- `table.getIsAllPageRowsSelected()` — all rows on current page selected
- `table.getToggleAllRowsSelectedHandler()` — handler for "select all" checkbox
- `table.getToggleAllPageRowsSelectedHandler()` — handler for "select page" checkbox
- `table.toggleAllRowsSelected(value?)` — programmatic select/deselect all
- `table.setRowSelection(state)` / `table.resetRowSelection()` — direct state control

Row:
- `row.getIsSelected()` — this row is selected
- `row.getCanSelect()` — selection enabled for this row
- `row.getToggleSelectedHandler()` — event handler for checkbox/click
- `row.toggleSelected(value?)` — programmatic toggle

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/row-selection
-->
