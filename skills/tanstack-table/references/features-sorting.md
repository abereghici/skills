---
name: tanstack-table-sorting
description: Client-side and server-side sorting, sort functions, multi-sort
---

# Sorting

## Setup

```ts
import {
  tableFeatures, useTable,
  rowSortingFeature,
  createSortedRowModel, sortFns,
  type SortingState,
} from '@tanstack/react-table'

const _features = tableFeatures({ rowSortingFeature })

// Uncontrolled (table manages state internally)
const table = useTable({
  _features,
  _rowModels: { sortedRowModel: createSortedRowModel(sortFns) },
  columns, data,
})

// Controlled (you manage state — useful for server-side or URL sync)
const [sorting, setSorting] = useState<SortingState>([])
const table = useTable({
  _features,
  _rowModels: { sortedRowModel: createSortedRowModel(sortFns) },
  columns, data,
  state: { sorting },
  onSortingChange: setSorting,
})

// Initial state only (no need to control ongoing)
const table = useTable({
  _features,
  _rowModels: { sortedRowModel: createSortedRowModel(sortFns) },
  columns, data,
  initialState: {
    sorting: [{ id: 'lastName', desc: false }],
  },
})
```

## Server-Side Sorting

```ts
const [sorting, setSorting] = useState<SortingState>([])

const table = useTable({
  _features: tableFeatures({ rowSortingFeature }),
  _rowModels: {},                  // no sortedRowModel needed
  columns,
  data,                            // pre-sorted by server
  manualSorting: true,
  state: { sorting },
  onSortingChange: setSorting,     // triggers re-fetch with new sort params
})
```

## Sort Functions

Built-in functions (pass by name string or import from `sortFns`):

| Name | Use case |
|---|---|
| `alphanumeric` | Mixed text+numbers, case-insensitive (slower, more accurate) |
| `alphanumericCaseSensitive` | Same, case-sensitive |
| `text` | Pure text, case-insensitive (faster) |
| `textCaseSensitive` | Pure text, case-sensitive |
| `datetime` | `Date` objects |
| `basic` | Simple `a > b` comparison (fastest) |

Per-column sort function:

```ts
columnHelper.accessor('score', {
  sortFn: 'basic',       // built-in by name
})
columnHelper.accessor('rank', {
  sortFn: 'myRankSort', // custom global function
})
```

Custom global sort functions — pass to `createSortedRowModel`:

```ts
const table = useTable({
  _features,
  _rowModels: {
    sortedRowModel: createSortedRowModel({
      ...sortFns,
      myRankSort: (rowA, rowB, columnId) =>
        rowA.getValue(columnId) - rowB.getValue(columnId),
    }),
  },
  columns, data,
})
```

Custom sort function signature:

```ts
// Return -1 (a < b), 0 (equal), 1 (a > b) — ascending direction only
// The row model handles desc/asc reversal automatically
const mySortFn: SortFn<typeof _features, MyData> = (rowA, rowB, columnId) => {
  const a = rowA.original.someField
  const b = rowB.original.someField
  return a < b ? -1 : a > b ? 1 : 0
}
```

## Sort Behavior Options

```ts
// Per-column options
columnHelper.accessor('id', {
  enableSorting: false,          // disable sort for this column
  sortDescFirst: true,           // first click sorts descending
  invertSorting: true,           // invert sort (useful for rankings/golf scores)
  sortUndefined: 'last',         // 'first' | 'last' | 1 | -1 | false
})

// Table-level options
const table = useTable({
  ...
  enableSorting: false,          // disable all sorting
  enableSortingRemoval: false,   // keep at least one column sorted always
  enableMultiSort: false,        // disable multi-column sort
  maxMultiSortColCount: 3,       // limit simultaneous sorted columns
  isMultiSortEvent: e => e.ctrlKey || e.shiftKey,  // customize multi-sort trigger key
})
```

## UI Integration

```tsx
// Sortable header cell
<th
  onClick={header.column.getToggleSortingHandler()}
  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
>
  {flexRender(header.column.columnDef.header, header.getContext())}
  {{
    asc: ' ↑',
    desc: ' ↓',
  }[header.column.getIsSorted() as string] ?? null}
</th>
```

Key APIs:
- `column.getCanSort()` — enable/disable sort UI
- `column.getIsSorted()` — `'asc' | 'desc' | false`
- `column.getToggleSortingHandler()` — attach to header click
- `column.toggleSorting(desc?, multi?)` — programmatic toggle
- `column.clearSorting()` — clear this column's sort
- `column.getSortIndex()` — position in multi-sort (for badges)
- `column.getNextSortingOrder()` — what direction sorts next
- `table.setSorting(state)` / `table.resetSorting()` — direct state control

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/sorting
-->
