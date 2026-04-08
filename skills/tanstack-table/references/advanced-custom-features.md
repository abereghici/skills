---
name: tanstack-table-custom-features
description: Building custom table features/plugins with TypeScript, state, and APIs
---

# Custom Features

TanStack Table's feature system is fully extensible. Custom features integrate at the same level as built-in ones — they can add state, options, and methods to the `table`, `column`, `row`, `header`, and `cell` instances.

## Feature Object Shape

```ts
import type { TableFeature, TableFeatures, RowData } from '@tanstack/react-table'

const MyFeature: TableFeature<any> = {
  // Add initial state
  getInitialState: (state) => ({
    myState: 'default',
    ...state,
  }),

  // Add default options
  getDefaultTableOptions: (table) => ({
    enableMyFeature: true,
    onMyStateChange: makeStateUpdater('myState', table),
  }),

  // Add default column options
  getDefaultColumnDef: () => ({
    meta: { myColumnOption: false },
  }),

  // Add methods to table instance
  constructTable: (table) => {
    table.setMyState = (value) => table.options.onMyStateChange?.(value)
    table.toggleMyState = () => table.setMyState(old => !old)
  },

  // Add methods to column/row/header/cell instances
  constructColumn: (column, table) => { /* column.myApi = ... */ },
  constructRow: (row, table) => { /* row.myApi = ... */ },
  constructHeader: (header, table) => { /* header.myApi = ... */ },
  constructCell: (cell, column, row, table) => { /* cell.myApi = ... */ },
}
```

## Full Example: Density Feature

```ts
// 1. Define types
type DensityState = 'sm' | 'md' | 'lg'

// 2. Declaration merging — adds types to TanStack globally
declare module '@tanstack/react-table' {
  interface TableState extends DensityTableState {}
  interface TableOptions<TFeatures extends TableFeatures, TData extends RowData>
    extends DensityOptions {}
  interface Table<TFeatures extends TableFeatures, TData extends RowData>
    extends DensityInstance {}
}

interface DensityTableState { density: DensityState }
interface DensityOptions {
  enableDensity?: boolean
  onDensityChange?: OnChangeFn<DensityState>
}
interface DensityInstance {
  setDensity: (updater: Updater<DensityState>) => void
  toggleDensity: (value?: DensityState) => void
}

// 3. Feature object
const DensityFeature: TableFeature<any> = {
  getInitialState: (state) => ({ density: 'md', ...state }),

  getDefaultTableOptions: (table) => ({
    enableDensity: true,
    onDensityChange: makeStateUpdater('density', table),
  }),

  constructTable: (table) => {
    table.setDensity = (updater) => {
      table.options.onDensityChange?.(
        functionalUpdate(updater, table.store.state.density)
      )
    }
    table.toggleDensity = (value) => {
      table.setDensity(old =>
        value ?? (old === 'lg' ? 'md' : old === 'md' ? 'sm' : 'lg')
      )
    }
  },
}

// 4. Register and use
const _features = tableFeatures({ DensityFeature })

const table = useTable({
  _features,
  _rowModels: {},
  columns, data,
  state: { density },
  onDensityChange: setDensity,
})

// In render
const paddingMap = { sm: '4px', md: '8px', lg: '16px' }
<td style={{ padding: paddingMap[table.store.state.density] }}>
```

## Key Points

- Use `makeStateUpdater(stateKey, table)` for standard state updaters
- Use `functionalUpdate(updater, currentValue)` to support both value and function updaters
- `getDefaultColumnDef` should use `meta` to add column options (direct ColumnDef modification causes TypeScript issues)
- Declaration merging affects all tables — if you need per-table isolation, extend types manually instead
- Custom features don't need a row model unless they transform rows

## Alternative: External State

Custom features don't have to integrate into the table instance. Simple solutions often work fine outside:

```ts
// Just use React state alongside the table
const [density, setDensity] = useState<'sm' | 'md' | 'lg'>('md')
const table = useTable({ _features: tableFeatures({}), ... })

// Use density independently in your render
<td style={{ padding: density === 'sm' ? 4 : density === 'md' ? 8 : 16 }}>
```

<!--
Source references:
- https://tanstack.com/table/latest/docs/guide/custom-features
-->
