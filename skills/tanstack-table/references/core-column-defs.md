---
name: tanstack-table-column-defs
description: Column definition types, accessors, cell/header/footer rendering
---

# Column Definitions

Column defs are the most important part of building a table — they define the data model, display logic, and header/footer content.

## Three Column Def Types

- **Accessor columns** — have a data model (can sort, filter, group)
- **Display columns** — no data model; for UI-only content (buttons, checkboxes, expanders)
- **Grouping columns** — structural containers for nested column headers; no data model

## Column Helper (Recommended)

Provides the best TypeScript inference. Requires `TFeatures` and `TData` generics in v9:

```ts
import { tableFeatures, createColumnHelper } from '@tanstack/react-table'

type Person = { firstName: string; lastName: string; age: number }

const _features = tableFeatures({})  // or with feature objects
const columnHelper = createColumnHelper<typeof _features, Person>()

const columns = columnHelper.columns([
  // Display column — no accessor
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <button onClick={() => deleteRow(row.original)}>Delete</button>,
  }),
  // Grouping column — wraps other columns
  columnHelper.group({
    header: 'Name',
    columns: [
      columnHelper.accessor('firstName', { header: 'First' }),
      columnHelper.accessor('lastName', { header: 'Last' }),
    ],
  }),
  // Accessor column — direct key
  columnHelper.accessor('age', { header: 'Age' }),
])
```

## Accessor Patterns

```ts
// 1. Object key (string) — infers type from data
columnHelper.accessor('firstName')
// or: { accessorKey: 'firstName' }

// 2. Deep key — dot notation, periods in key names must be avoided
columnHelper.accessor('name.first', { id: 'firstName' })
// or: { accessorKey: 'name.first', id: 'firstName' }

// 3. Array index — for tuple-shaped data
columnHelper.accessor(1)

// 4. Accessor function — for computed values, MUST provide id
columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, { id: 'fullName' })
// or: { id: 'fullName', accessorFn: row => `${row.firstName} ${row.lastName}` }
```

> Accessor function columns need either an `id` OR a primitive string `header` for TanStack to auto-generate the ID.

## Column IDs

- `accessorKey` string → column ID is the key (dots replaced with underscores)
- Accessor function → use explicit `id` or provide a string `header`
- Display/group columns → always provide explicit `id`

## Cell Rendering

```ts
columnHelper.accessor('status', {
  // Simple value display
  cell: info => info.getValue(),

  // Access row data for context
  cell: props => <span>{props.row.original.id}: {props.getValue()}</span>,

  // Access table for global context
  cell: props => {
    const isAdmin = props.table.options.meta?.currentUser?.isAdmin
    return isAdmin ? <AdminCell value={props.getValue()} /> : props.getValue()
  },
})
```

## Header & Footer Rendering

```ts
columnHelper.accessor('name', {
  header: 'Name',                              // string shorthand
  header: () => <span>Name</span>,             // function returning JSX
  header: ({ column }) => (                    // function with column access
    <button onClick={column.getToggleSortingHandler()}>Name</button>
  ),
  footer: props => props.column.id,            // same pattern for footers
})
```

## Aggregated Cell (for Grouping)

```ts
columnHelper.accessor('amount', {
  aggregationFn: 'sum',
  aggregatedCell: props => `Total: ${props.getValue()}`,
})
```

## Default Column Options

Apply defaults across all columns:

```ts
const table = useTable({
  _features,
  _rowModels: {},
  columns,
  data,
  defaultColumn: {
    size: 200,
    minSize: 50,
    maxSize: 500,
    cell: info => String(info.getValue() ?? ''),
  },
})
```

## Column Meta (custom data)

Pass arbitrary metadata through column defs:

```ts
// Declare the type (TypeScript)
declare module '@tanstack/react-table' {
  interface ColumnMeta<TFeatures extends TableFeatures, TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

columnHelper.accessor('age', {
  meta: { filterVariant: 'range' },
})

// Access in cell/header/filter UI
const filterVariant = column.columnDef.meta?.filterVariant
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/column-defs
- https://tanstack.com/table/latest/docs/guide/columns
-->
