---
name: tanstack-table-filtering
description: Column filtering, global filtering, filter functions, server-side filtering
---

# Filtering

Filtering has two modes: **column filtering** (per-column) and **global filtering** (all columns at once). Both use the same `filteredRowModel`.

## Column Filtering Setup

```ts
import {
  tableFeatures, useTable,
  columnFilteringFeature,
  createFilteredRowModel, filterFns,
  type ColumnFiltersState,
} from '@tanstack/react-table'

const _features = tableFeatures({ columnFilteringFeature })

// Uncontrolled
const table = useTable({
  _features,
  _rowModels: { filteredRowModel: createFilteredRowModel(filterFns) },
  columns, data,
})

// Controlled (needed for URL sync, server-side, etc.)
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const table = useTable({
  _features,
  _rowModels: { filteredRowModel: createFilteredRowModel(filterFns) },
  columns, data,
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
})
```

## Global Filtering Setup

```ts
import { globalFilteringFeature } from '@tanstack/react-table'

const _features = tableFeatures({ globalFilteringFeature })

const [globalFilter, setGlobalFilter] = useState('')
const table = useTable({
  _features,
  _rowModels: { filteredRowModel: createFilteredRowModel(filterFns) },
  columns, data,
  state: { globalFilter },
  onGlobalFilterChange: setGlobalFilter,
  globalFilterFn: 'includesString',   // default global filter function
})
```

Both column and global filtering can be combined by adding both features and using the shared `filteredRowModel`.

## Server-Side Filtering

```ts
const table = useTable({
  _features: tableFeatures({ columnFilteringFeature }),
  _rowModels: {},    // no filteredRowModel — data is already filtered
  columns,
  data,              // pre-filtered by server
  manualFiltering: true,
  state: { columnFilters },
  onColumnFiltersChange: setColumnFilters,
})
```

## Built-in Filter Functions

| Name | Description |
|---|---|
| `includesString` | Case-insensitive string inclusion |
| `includesStringSensitive` | Case-sensitive string inclusion |
| `equalsString` / `equalsStringSensitive` | Exact string match |
| `arrIncludes` | Single value in array |
| `arrIncludesAll` | All values in array |
| `arrIncludesSome` | Some values in array |
| `equals` | `Object.is` equality |
| `weakEquals` | `==` equality |
| `inNumberRange` | Numeric range `[min, max]` |

Per-column filter function:

```ts
columnHelper.accessor('age', {
  filterFn: 'inNumberRange',
})
columnHelper.accessor('name', {
  filterFn: 'includesString',    // built-in by name
})
columnHelper.accessor('tags', {
  filterFn: 'arrIncludesSome',   // filter value is an array
})
```

## Custom Filter Functions

```ts
const startsWithFn: FilterFn<any> = (row, columnId, filterValue) =>
  String(row.getValue(columnId))
    .toLowerCase()
    .startsWith(String(filterValue).toLowerCase())

// Auto-remove filter when input is empty
startsWithFn.autoRemove = (val: any) => !val

// Sanitize filter value before use
startsWithFn.resolveFilterValue = (val: any) =>
  String(val).toLowerCase().trim()

// Register as a global function
const table = useTable({
  _features,
  _rowModels: {
    filteredRowModel: createFilteredRowModel({
      ...filterFns,
      startsWith: startsWithFn,
    }),
  },
  columns, data,
})

// Use in column def
columnHelper.accessor('name', {
  filterFn: 'startsWith',
})
```

## UI Integration

### Column Filter Input

```tsx
// Connecting filter input to a column
<input
  value={(column.getFilterValue() as string) ?? ''}
  onChange={e => column.setFilterValue(e.target.value)}
  placeholder="Filter..."
/>

// Range filter (e.g., for number range)
<input
  type="number"
  value={(column.getFilterValue() as [number, number])?.[0] ?? ''}
  onChange={e => column.setFilterValue((old: [number, number]) => [
    e.target.value ? Number(e.target.value) : undefined,
    old?.[1],
  ])}
  placeholder="Min"
/>
```

### Global Filter Input

```tsx
<input
  value={globalFilter}
  onChange={e => table.setGlobalFilter(e.target.value)}
  placeholder="Search all columns..."
/>
```

Key APIs:
- `column.getFilterValue()` / `column.setFilterValue(value)` — read/write filter
- `column.getCanFilter()` — whether filter is enabled
- `column.getIsFiltered()` — whether a filter is active
- `column.getFilterIndex()` — order in filter chain
- `table.setColumnFilters(state)` / `table.resetColumnFilters()` — bulk control
- `table.setGlobalFilter(value)` / `table.resetGlobalFilter()` — global filter

## Filtering with Sub-Rows (Expanding)

```ts
const table = useTable({
  _features: tableFeatures({ columnFilteringFeature, rowExpandingFeature }),
  _rowModels: {
    filteredRowModel: createFilteredRowModel(filterFns),
    expandedRowModel: createExpandedRowModel(),
  },
  columns, data,
  filterFromLeafRows: true,    // include parent if any child matches
  maxLeafRowFilterDepth: 1,    // how deep into children to filter
})
```

## Disable Filtering

```ts
// Per-column
columnHelper.accessor('id', { enableColumnFilter: false })
columnHelper.accessor('name', { enableGlobalFilter: false })

// Table-level
const table = useTable({
  ...
  enableColumnFilters: false,    // disable all column filters
  enableGlobalFilter: false,     // disable global filter
  enableFilters: false,          // disable both
})
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/column-filtering
- https://tanstack.com/table/latest/docs/guide/global-filtering
- https://tanstack.com/table/latest/docs/guide/fuzzy-filtering
-->
