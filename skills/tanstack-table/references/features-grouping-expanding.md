---
name: tanstack-table-grouping-expanding
description: Row grouping with aggregations, row expanding for sub-rows and detail panels
---

# Grouping & Expanding

## Grouping Setup

Groups rows by column values and computes aggregations:

```ts
import {
  tableFeatures, useTable,
  columnGroupingFeature,
  rowExpandingFeature,
  createGroupedRowModel, aggregationFns,
  createExpandedRowModel,
} from '@tanstack/react-table'

const _features = tableFeatures({
  columnGroupingFeature,
  rowExpandingFeature,  // add if you want users to collapse/expand groups
})

const table = useTable({
  _features,
  _rowModels: {
    groupedRowModel: createGroupedRowModel(aggregationFns),
    expandedRowModel: createExpandedRowModel(),  // pair with rowExpandingFeature
  },
  columns, data,
})
```

## Grouping State

```ts
// Programmatic grouping
table.setGrouping(['department', 'role'])  // array of column IDs

// Controlled
const [grouping, setGrouping] = useState<string[]>([])
const table = useTable({
  ...
  state: { grouping },
  onGroupingChange: setGrouping,
})
```

## Aggregations

Built-in aggregation functions:

| Name | Description |
|---|---|
| `sum` | Sum of values |
| `count` | Row count |
| `min` / `max` | Min/max value |
| `mean` / `median` | Average / median |
| `extent` | `[min, max]` tuple |
| `unique` | Array of unique values |
| `uniqueCount` | Count of unique values |

```ts
columnHelper.accessor('salary', {
  aggregationFn: 'sum',
  aggregatedCell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
})
```

Custom aggregation functions:

```ts
const table = useTable({
  _features,
  _rowModels: {
    groupedRowModel: createGroupedRowModel({
      ...aggregationFns,
      myWeightedAvg: (columnId, leafRows, childRows) => {
        const total = leafRows.reduce((sum, row) => sum + row.getValue<number>(columnId), 0)
        return total / leafRows.length
      },
    }),
  },
  columns, data,
})
// Use in column def: aggregationFn: 'myWeightedAvg'
```

## Grouped Column Mode

```ts
const table = useTable({
  ...
  groupedColumnMode: 'reorder',  // move grouped columns to start (default)
  // groupedColumnMode: 'remove', // hide grouped columns
  // groupedColumnMode: false,    // leave in place
})
```

## Expanding Setup (Sub-Rows)

Use `getSubRows` to tell TanStack where child rows live in your data:

```ts
type Category = {
  id: string
  name: string
  children?: Category[]
}

const _features = tableFeatures({ rowExpandingFeature })

const table = useTable({
  _features,
  _rowModels: { expandedRowModel: createExpandedRowModel() },
  columns, data,
  getSubRows: row => row.children,
})
```

## Expanding State

```ts
// Controlled expanding
const [expanded, setExpanded] = useState<ExpandedState>({})
// ExpandedState = true (all expanded) | { [rowId]: boolean }

const table = useTable({
  ...
  state: { expanded },
  onExpandedChange: setExpanded,
})
```

## Custom Detail Panels (non-sub-row expansion)

For accordion-style detail panels that aren't actual rows:

```ts
const table = useTable({
  ...
  getRowCanExpand: () => true,   // all rows can expand
})
```

```tsx
<tbody>
  {table.getRowModel().rows.map(row => (
    <React.Fragment key={row.id}>
      <tr>
        {row.getVisibleCells().map(cell => (
          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
        ))}
      </tr>
      {row.getIsExpanded() && (
        <tr>
          <td colSpan={row.getAllCells().length}>
            {/* Detail panel content */}
            <UserDetailPanel user={row.original} />
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
```

## Expand Toggle in Columns

```ts
columnHelper.display({
  id: 'expander',
  header: () => null,
  cell: ({ row }) =>
    row.getCanExpand() ? (
      <button onClick={row.getToggleExpandedHandler()}>
        {row.getIsExpanded() ? '▼' : '▶'}
      </button>
    ) : null,
})
```

## Key APIs

Row:
- `row.getCanExpand()` — whether row has sub-rows or `getRowCanExpand` returns true
- `row.getIsExpanded()` — current expanded state
- `row.toggleExpanded(value?)` — toggle expansion
- `row.getToggleExpandedHandler()` — event handler

Table:
- `table.toggleAllRowsExpanded(value?)` — expand/collapse all
- `table.getIsAllRowsExpanded()` — all rows expanded
- `table.getExpandedDepth()` — deepest expanded level

## Server-Side Expanding

```ts
const table = useTable({
  _features: tableFeatures({ rowExpandingFeature }),
  _rowModels: {},     // no expandedRowModel needed
  ...
  manualExpanding: true,   // you fetch child data on expand
})
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/grouping
- https://tanstack.com/table/latest/docs/guide/expanding
-->
