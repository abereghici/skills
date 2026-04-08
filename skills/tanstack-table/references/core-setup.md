---
name: tanstack-table-core-setup
description: Table initialization, features system, and v8 vs v9 migration
---

# TanStack Table Core Setup

TanStack Table is a headless, framework-agnostic table library. The core is in `@tanstack/table-core`; framework adapters (`@tanstack/react-table`, `@tanstack/vue-table`, etc.) wrap it with reactive bindings.

## v8 vs v9 Key Differences

| Concern       | v8                                  | v9                                              |
| ------------- | ----------------------------------- | ----------------------------------------------- |
| Features      | All included automatically          | Opt-in via `tableFeatures()`                    |
| Row models    | `getCoreRowModel` + optional models | `_rowModels: {}` + explicit additions           |
| State access  | `table.getState()`                  | `table.store.state`                             |
| Column helper | `createColumnHelper<TData>()`       | `createColumnHelper<typeof _features, TData>()` |

v9 enables tree-shaking: only bundle what you use. If you want v8-style (all features), use `stockFeatures`.

## Minimal Setup (v9)

```ts
import {
  tableFeatures,
  useTable, // React; use createTable for Solid/Svelte/Vanilla
  createColumnHelper,
} from "@tanstack/react-table";

type User = { id: string; name: string; age: number };

// Define OUTSIDE the component for stable reference
const _features = tableFeatures({}); // add feature objects here as needed

const columnHelper = createColumnHelper<typeof _features, User>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("age", { header: "Age" }),
]);

// Inside component:
const table = useTable({
  _features,
  _rowModels: {}, // add row model factories here as needed
  columns,
  data, // must be a stable reference (useState/useMemo)
});
```

## Framework Adapters

```ts
// Vanilla JS / framework-agnostic
import { _createTable } from "@tanstack/table-core";
const table = _createTable({ _features, _rowModels: {}, columns, data });

// React
import { useTable } from "@tanstack/react-table";
const table = useTable({ _features, _rowModels: {}, columns, data });

// Vue
import { useTable } from "@tanstack/vue-table";
const table = useTable({ _features, _rowModels: {}, columns, data });

// Solid
import { createTable } from "@tanstack/solid-table";
const table = createTable({
  _features,
  _rowModels: {},
  get data() {
    return data();
  },
  columns,
});

// Angular
import { injectTable } from "@tanstack/angular-table";
this.table = injectTable({
  _features,
  _rowModels: {},
  columns,
  data: this.data(),
});

// Svelte
import { createTable } from "@tanstack/svelte-table";
const table = createTable({ _features, _rowModels: {}, columns, data });
```

## Features System

All features are opt-in in v9. Register them in `tableFeatures()` and add the matching row model (if any) to `_rowModels`:

```ts
import {
  tableFeatures,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  filterFns,
  createSortedRowModel,
  sortFns,
  createPaginatedRowModel,
} from "@tanstack/react-table";

const _features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
});

const table = useTable({
  _features,
  _rowModels: {
    filteredRowModel: createFilteredRowModel(filterFns),
    sortedRowModel: createSortedRowModel(sortFns),
    paginatedRowModel: createPaginatedRowModel(),
  },
  columns,
  data,
});
```

## Available Features

| Feature Object            | Row Model Factory                       | Purpose                   |
| ------------------------- | --------------------------------------- | ------------------------- |
| `columnFilteringFeature`  | `createFilteredRowModel(filterFns)`     | Column filters            |
| `globalFilteringFeature`  | `createFilteredRowModel(filterFns)`     | Global search             |
| `rowSortingFeature`       | `createSortedRowModel(sortFns)`         | Sorting                   |
| `rowPaginationFeature`    | `createPaginatedRowModel()`             | Pagination                |
| `rowExpandingFeature`     | `createExpandedRowModel()`              | Row expand/collapse       |
| `columnGroupingFeature`   | `createGroupedRowModel(aggregationFns)` | Grouping + aggregation    |
| `rowSelectionFeature`     | _(none)_                                | Row checkboxes            |
| `columnVisibilityFeature` | _(none)_                                | Show/hide columns         |
| `columnOrderingFeature`   | _(none)_                                | Drag-to-reorder columns   |
| `columnPinningFeature`    | _(none)_                                | Freeze columns left/right |
| `columnSizingFeature`     | _(none)_                                | Column widths             |
| `columnResizingFeature`   | _(none)_                                | Drag-to-resize columns    |
| `rowPinningFeature`       | _(none)_                                | Freeze rows top/bottom    |

## Stable References (React)

Data and `_features` must not be re-created on every render:

```tsx
const _features = tableFeatures({ rowSortingFeature })  // module-level: stable

export default function MyTable() {
  const columns = useMemo(() => [...], [])              // memoized: stable
  const [data, setData] = useState<User[]>([])          // state: stable
  const table = useTable({ _features, _rowModels: { sortedRowModel: createSortedRowModel(sortFns) }, columns, data })
}
```

## Accessing State and APIs

```ts
// v9 state access
table.store.state.sorting;
table.store.state.columnFilters;
table.store.state.pagination;
table.store.state.rowSelection;

// Setter/resetter pattern (same across all features)
table.setSorting(updater);
table.resetSorting();
```

## Rendering

```tsx
// Use getRowModel() for rendering - it applies all active features
{
  table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th key={header.id} colSpan={header.colSpan}>
          {flexRender(header.column.columnDef.header, header.getContext())}
        </th>
      ))}
    </tr>
  ));
}

{
  table.getRowModel().rows.map((row) => (
    <tr key={row.id}>
      {row.getVisibleCells().map(
        (
          cell, // getVisibleCells respects column visibility
        ) => (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ),
      )}
    </tr>
  ));
}
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/tables
- https://tanstack.com/table/latest/docs/guide/features
- https://tanstack.com/table/latest/docs/guide/row-models
- https://tanstack.com/table/latest/docs/guide/data
-->
