---
name: tanstack-table-pagination
description: Client-side and server-side pagination, pagination state and APIs
---

# Pagination

## Client-Side Pagination

```ts
import {
  tableFeatures, useTable,
  rowPaginationFeature,
  createPaginatedRowModel,
} from '@tanstack/react-table'

const _features = tableFeatures({ rowPaginationFeature })

// Uncontrolled
const table = useTable({
  _features,
  _rowModels: { paginatedRowModel: createPaginatedRowModel() },
  columns, data,
})

// Controlled (for URL sync, persisted state, etc.)
const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
})
const table = useTable({
  _features,
  _rowModels: { paginatedRowModel: createPaginatedRowModel() },
  columns, data,
  state: { pagination },
  onPaginationChange: setPagination,
})

// Initial state only
const table = useTable({
  _features,
  _rowModels: { paginatedRowModel: createPaginatedRowModel() },
  columns, data,
  initialState: {
    pagination: { pageIndex: 2, pageSize: 25 },
  },
})
```

## Server-Side Pagination

When the server pages data, skip the client-side row model and tell the table total counts:

```ts
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

// Re-fetch when pagination changes
const { data, totalRows } = useServerData(pagination)

const table = useTable({
  _features: tableFeatures({ rowPaginationFeature }),
  _rowModels: {},          // no paginatedRowModel — data is already a single page
  columns,
  data,
  manualPagination: true,
  rowCount: totalRows,     // needed for getPageCount(), getCanNextPage(), etc.
  // pageCount: totalPages, // or provide pageCount directly
  state: { pagination },
  onPaginationChange: setPagination,
})
```

Pass `-1` for `pageCount` if the total is unknown — `getCanNextPage()` will always return `true`.

## Pagination State Shape

```ts
type PaginationState = {
  pageIndex: number  // 0-based
  pageSize: number
}
```

## Pagination UI

```tsx
<div>
  <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>«</button>
  <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</button>
  <span>
    Page {table.store.state.pagination.pageIndex + 1} of {table.getPageCount()}
  </span>
  <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</button>
  <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>»</button>
</div>

{/* Page size selector */}
<select
  value={table.store.state.pagination.pageSize}
  onChange={e => table.setPageSize(Number(e.target.value))}
>
  {[10, 20, 50, 100].map(size => (
    <option key={size} value={size}>Show {size}</option>
  ))}
</select>

{/* Jump to page */}
<input
  type="number"
  min={1}
  max={table.getPageCount()}
  defaultValue={table.store.state.pagination.pageIndex + 1}
  onChange={e => table.setPageIndex(Number(e.target.value) - 1)}
/>
```

## Key APIs

Navigation:
- `table.firstPage()` / `table.lastPage()` — jump to first/last
- `table.previousPage()` / `table.nextPage()` — increment
- `table.setPageIndex(index)` — jump to specific page (0-based)
- `table.getCanPreviousPage()` / `table.getCanNextPage()` — for disabling buttons

State:
- `table.store.state.pagination` — `{ pageIndex, pageSize }`
- `table.setPageSize(size)` — change page size
- `table.setPagination(state)` — set both at once
- `table.resetPagination()` — reset to initial state

Info:
- `table.getPageCount()` — total page count
- `table.getRowCount()` — total row count

## Auto Reset Page Index

By default, `pageIndex` resets to `0` when filters, grouping, or data change. Disable if needed:

```ts
const table = useTable({
  ...
  autoResetPageIndex: false,   // you manage resetting manually
})
```

With `manualPagination: true`, auto-reset is already disabled by default.

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/pagination
-->
