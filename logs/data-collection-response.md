---
name: data-collection
description: A comprehensive component for managing and displaying datasets with support for multiple visualizations (Table, Card, Kanban, List), filtering, sorting, pagination, and bulk actions. Use when displaying complex data that requires user interaction, hierarchical structures, or multiple view formats.
---

## Overview
The `Data Collection` component is the primary tool for displaying lists or grids of data. It abstracts complex logic for filtering, sorting, and pagination while providing a flexible interface for different visual representations. It is often used in conjunction with the `useDataCollectionSource` hook to manage state and data fetching.

For the `useDataCollectionSource` hook, see the skill in ./references/use-data-collection-source.md.

## Props
- **allowHiding** (required): `boolean` - Enables the interface for users to show or hide specific columns/fields.
- **allowSorting** (required): `boolean` - Enables the interface for users to change the sort order of the data.
- **items** (required): `Array<T>` - The array of data items to be rendered.
- **allPagesSelection** (optional): `boolean` - Enables selection of all items across all pages in async collections.
- **bulkActions** (optional): `BulkActionsDefinition` - Configuration for actions that can be performed on multiple selected items.
- **currentFilters** (optional): `FiltersState` - The current state of active filters.
- **currentGrouping** (optional): `GroupingState` - The current state of data grouping.
- **currentSortings** (optional): `SortingsState` - The current state of active sortings.
- **dataAdapter** (optional): `DataCollectionDataAdapter` - Adapter for transforming data between the source and the component.
- **defaultSelectedItems** (optional): `SelectedItemsState` - Initial state of selected items.
- **enableCache** (optional): `boolean` [default: true] - Enables caching of data to improve performance.
- **frozenColumns** (optional): `number` [default: 0] - Number of columns to freeze to the left in table view.
- **fullHeight** (optional): `boolean` - Forces the component to take up the full height of its container.
- **grouping** (optional): `GroupingDefinition` - Configuration for how data can be grouped.
- **hideFilters** (optional): `boolean` - Hides the filter interface even if filters are defined.
- **id** (optional): `string` - Unique identifier for the component instance.
- **navigationFilters** (optional): `NavigationFilterDefinition` - Configuration for top-level navigation filters (tabs/pills).
- **nestedRecords** (optional): `boolean` [default: false] - Enables hierarchical/tree data support.
- **nestedRecordsType** (optional): `"basic" | "detailed"` [default: "basic"] - Visual style for nested records.
- **noSorting** (optional): `boolean` [default: false] - Disables sorting functionality entirely.
- **onBulkAction** (optional): `(action: string, items: T[]) => void` - Callback triggered when a bulk action is executed.
- **onChange** (optional): `(items: SortAndHideListItem[]) => void` - Callback triggered when column visibility or order changes.
- **onSelectItems** (optional): `(selectionState: SelectionState) => void` - Callback triggered when items are selected or deselected.
- **onStateChange** (optional): `(state: DataCollectionState) => void` - Callback triggered when filters, sorting, or pagination changes.
- **paginationType** (optional): `PaginationType` - Defines the pagination style (e.g., "pages", "infiniteScroll").
- **primaryActions** (optional): `PrimaryActionItemDefinition | PrimaryActionItemDefinition[]` - Main actions displayed at the top of the collection.
- **searchBar** (optional): `boolean | SearchBarConfig` [default: false] - Enables and configures the search input.
- **secondaryActions** (optional): `ActionDefinition[]` - Additional actions typically hidden behind a menu.
- **selectable** (optional): `(item: T) => string | number | undefined` - Function to determine if an item is selectable and return its unique ID.
- **storage** (optional): `StorageConfig` - Configuration for persisting state (filters, column visibility) to local storage.
- **tableAllowColumnHiding** (optional): `boolean` [default: false] - Specifically enables column hiding in table visualization.
- **tableAllowColumnReordering** (optional): `boolean` [default: false] - Specifically enables drag-and-drop column reordering in table visualization.
- **totalItemSummary** (optional): `boolean | ((total: number) => string)` - Displays the total count of items in the top right.
- **useObservable** (optional): `boolean` [default: false] - Set to true if using RxJS Observables for data.
- **usePresets** (optional): `boolean` [default: false] - Enables saved filter presets.
- **visualizations** (optional): `ReadonlyArray<VisualizationConfig>` - Defines the available view modes (Table, Card, List, Kanban).

## Usage Example

```tsx
import { DataCollection } from '@company/ui';

const MyCollection = () => {
  const items = [
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'User' },
  ];

  return (
    <DataCollection
      id="user-table"
      items={items}
      allowHiding={true}
      allowSorting={true}
      searchBar={true}
      totalItemSummary={(total) => `${total} Users Found`}
      visualizations={[
        {
          type: 'table',
          columns: [
            { id: 'name', header: 'Name', accessor: 'name' },
            { id: 'role', header: 'Role', accessor: 'role' },
          ],
        },
      ]}
      selectable={(item) => item.id}
      onBulkAction={(action, selectedItems) => {
        console.log(`Performing ${action} on`, selectedItems);
      }}
    />
  );
};
```

## Visualizations

### Table
The default tabular view. Supports:
- **Frozen Columns**: Keep specific columns visible while scrolling horizontally.
- **Column Reordering**: Drag and drop columns to change their order.
- **Nested Tables**: Expand rows to show child records using `fetchChildren`.

### Card
Displays data in a grid of cards. Best for visual content or entities with few fields.
- Supports `itemActions` displayed in a dropdown or footer.

### List
A hybrid between Card and Table. Features fixed fields (title, avatar, description) and dynamic properties.

### Kanban
Distributes records across lanes based on a status or category field.

For `ValueDisplay` components used within cells, see the skill in ./references/value-display.md.

## Advanced Features

### Nested Records (Hierarchical Data)
To implement tree structures, provide the following in your data source:
- `itemsWithChildren`: `(item: T) => boolean` - Determines if a row is expandable.
- `childrenCount`: `(item: T) => number` - Shows the count next to the expander.
- `fetchChildren`: `(args: FetchArgs) => Promise<ChildrenResponse<T>>` - Loads child data.

### Summary Rows
Use the `summary` attribute to display aggregated data (totals, averages) at the bottom of a table. This is compatible with sticky positioning and infinite scroll.

## Best Practices
- **Unique IDs**: Always provide a unique `id` prop to ensure state persistence (if using storage) works correctly.
- **Async Data**: For large datasets, use `paginationType="infiniteScroll"` or `"pages"` and handle data fetching via a data adapter or hook.
- **Selection**: When using async data with `allPagesSelection`, ensure your backend can handle actions based on the current filter state rather than just a list of IDs.
- **Accessibility**: Ensure `selectable` items have clear labels and that primary actions are keyboard accessible.