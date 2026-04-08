---
name: tanstack-table
description: >
  TanStack Table v8/v9 — headless, framework-agnostic data grid library.
  Use this skill whenever working with TanStack Table, @tanstack/react-table,
  @tanstack/vue-table, @tanstack/solid-table, @tanstack/svelte-table, or
  @tanstack/table-core. Covers the v9 opt-in features system (tableFeatures,
  _features, _rowModels), column definitions, sorting, filtering, pagination,
  row selection, grouping, expanding, column visibility/ordering/pinning/sizing,
  and custom features. Apply when implementing data tables, data grids, sorting,
  filtering, pagination, row selection, column management, or migrating from v8 to v9.
metadata:
  author: Alexandru Bereghici
  version: "2026.4.8"
  source: Generated from https://github.com/TanStack/table/tree/alpha, scripts located at https://github.com/abereghici/skills
---

> Based on TanStack Table v9.0.0-alpha.30 (alpha branch), generated 2026-04-08.
> v9 makes features opt-in via `tableFeatures()` for tree-shaking. See core-setup for v8→v9 differences.

TanStack Table is a headless, framework-agnostic table/datagrid library. It provides state management and logic; you supply the markup and styles. Framework adapters: `@tanstack/react-table`, `@tanstack/vue-table`, `@tanstack/solid-table`, `@tanstack/svelte-table`, `@tanstack/angular-table`, `@tanstack/table-core` (vanilla).

## Core References

| Topic | Description | Reference |
|---|---|---|
| Table Setup | v8 vs v9 differences, `tableFeatures()`, `_rowModels`, adapters, stable references, rendering | [core-setup](references/core-setup.md) |
| Column Definitions | Accessor columns, display columns, grouping columns, formatters, deep keys, column meta | [core-column-defs](references/core-column-defs.md) |

## Features

### Data Features

| Topic | Description | Reference |
|---|---|---|
| Sorting | Client/server sorting, sort functions, multi-sort, sort direction | [features-sorting](references/features-sorting.md) |
| Filtering | Column filters, global search, filter functions, server-side, sub-row filtering | [features-filtering](references/features-filtering.md) |
| Pagination | Client/server pagination, page controls, row count, auto-reset | [features-pagination](references/features-pagination.md) |
| Row Selection | Checkboxes, single/multi select, conditional selection, getting selected data | [features-row-selection](references/features-row-selection.md) |
| Grouping & Expanding | Row grouping with aggregations, sub-rows, detail panels, server-side | [features-grouping-expanding](references/features-grouping-expanding.md) |

### Column Features

| Topic | Description | Reference |
|---|---|---|
| Column Management | Visibility toggling, ordering/reordering, pinning (sticky), sizing and resizing | [features-column-management](references/features-column-management.md) |

## Advanced

| Topic | Description | Reference |
|---|---|---|
| Custom Features | Building plugins with state, APIs, and TypeScript declaration merging | [advanced-custom-features](references/advanced-custom-features.md) |

## Quick Reference: Features & Row Models

```ts
import {
  tableFeatures,
  // Features
  columnFilteringFeature, globalFilteringFeature,
  rowSortingFeature, rowPaginationFeature,
  rowExpandingFeature, columnGroupingFeature,
  rowSelectionFeature, columnVisibilityFeature,
  columnOrderingFeature, columnPinningFeature,
  columnSizingFeature, columnResizingFeature,
  rowPinningFeature,
  // Row model factories
  createFilteredRowModel, filterFns,
  createSortedRowModel, sortFns,
  createPaginatedRowModel,
  createExpandedRowModel,
  createGroupedRowModel, aggregationFns,
} from '@tanstack/react-table'

const _features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
})

const table = useTable({
  _features,
  _rowModels: {
    filteredRowModel: createFilteredRowModel(filterFns),
    sortedRowModel: createSortedRowModel(sortFns),
    paginatedRowModel: createPaginatedRowModel(),
  },
  columns, data,
})
```

## Row Model Execution Order

`getCoreRowModel` → `getFilteredRowModel` → `getGroupedRowModel` → `getSortedRowModel` → `getExpandedRowModel` → `getPaginatedRowModel` → **`getRowModel()`** (use this for rendering)
