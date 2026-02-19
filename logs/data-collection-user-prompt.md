# Component: Data Collection
Slug: data-collection
Hierarchy: Components/Data Collection

## Sub-components / Sub-pages
This component includes the following sub-pages with additional documentation:
- Callbacks
- Collection Actions
- Empty State
- Filters
- Grouping
- Internal
- Item Actions
- Miscellaneous
- Navigation Filters
- Summary
- Temporary or Deprecated features
- Total Items Summary
- Value Display
- Visualizations

## Props
- **allowHiding** (required): `boolean`
- **allowSorting** (required): `boolean`
- **items** (required): `Array of items that can be sorted and hidden`
- **allPagesSelection** (optional): `boolean`
- **bulkActions** (optional): `BulkActionsDefinition`
- **currentFilters** (optional): `FiltersState`
- **currentGrouping** (optional): `GroupingState`
- **currentNavigationFilters** (optional)
  {
  [K in keyof Definition]?: NavigationFilterValue<Definition[K]>
}
- **currentSortings** (optional): `SortingsState`
- **dataAdapter** (optional)
  DataCollectionDataAdapter
- **defaultSelectedItems** (optional): `SelectedItemsState`
- **enableCache** (optional): `boolean` [default: true]
- **frozenColumns** (optional): `union` [default: 0]
- **fullHeight** (optional): `boolean`
- **grouping** (optional): `union`
- **hideFilters** (optional): `boolean`
- **id** (optional): `string`
- **navigationFilters** (optional): `NavigationFilterDefinition`
  Record<
  Keys,
  NavigationFilterDefinition
>
- **nestedRecords** (optional): `boolean` [default: false]
- **nestedRecordsType** (optional): `union` [default: "basic"]
- **noSorting** (optional): `boolean` [default: false]
- **onBulkAction** (optional): `inSelectItems`
  Callback triggered when a bulk action is performed. It gets the action name, and the same args as inSelectItems. ‼️ Please check the onSelectItems docs for more information.
- **onChange** (optional)
  (items: SortAndHideListItem[]) => void
- **onSelectItems** (optional): `allItemsCheck`
  Callback triggered when items are selected. It gets if allItemsCheck is checked(boolean | 'indeterminate', indeterminate means at least one item was delected), itemsStatus return the list of know items (if the datacollection is async we don't all the items) and the check status for each item, and filters the current filters state.‼️ If the datacollection is async, the itemsStatus will return the items that are known at the moment of the callback execution, that means when the allChecked is not false you need to apply the selection logic in the backend for all the items (using the filters state) and removing the items which status is checked: false, but in this case never use the itemsStatus
- **onStateChange** (optional): `FiltersState`
  Callback triggered when the state of the data collection changes. It gets the new state.
- **paginationType** (optional): `PaginationType`
- **primaryActions** (optional): `undefined`
  () =>
| PrimaryActionItemDefinition
| PrimaryActionItemDefinition[]
| undefined
- **searchBar** (optional): `union` [default: false]
- **secondaryActions** (optional): `union`
- **selectable** (optional): `string`
  (item: MockUser) => string | number | undefined
- **storage** (optional): `union`
- **tableAllowColumnHiding** (optional): `boolean` [default: false]
- **tableAllowColumnReordering** (optional): `boolean` [default: false]
- **tmpFullWidth** (optional): `boolean`
- **totalItemSummary** (optional): `union`
- **useObservable** (optional): `boolean` [default: false]
  Use Observable for data fetching
- **usePresets** (optional): `boolean` [default: false]
  Include filter presets
- **visualizations** (optional)
  ReadonlyArray

## Stories (Use Cases)

### Available Stories
- Example
- Collection Actions/Example
- Internal/Key Features
- Internal/All Items Visible
- Internal/All Items Hidden
- Internal/Mixed States
- Internal/Edge Cases
- Item Actions/Example
- Miscellaneous/Example
- Miscellaneous/Example 2
- Summary/Basic Summary Row
- Summary/Infinite Scroll with Sticky Summary Row
- Summary/Sticky Summary Row with Frozen Columns
- Temporary or Deprecated features/TmpFullWidth
- Total Items Summary/Example
- Total Items Summary/Example 2
- Value Display/Data types
- Visualizations/Example
- Visualizations/Example
- Visualizations/Example 2
- Visualizations/Example 3
- Visualizations/Example
- Visualizations/Example 2
- Visualizations/Example 3
- Visualizations/Frozen Columns
- Visualizations/Column Ordering
- Visualizations/Column Reordering
- Visualizations/Column Hiding
- Visualizations/Basic Setup
- Visualizations/Required Methods
- Visualizations/Response Types: basic vs detailed
- Visualizations/Children Pagination
- Visualizations/Complete Example with all nested table features

## Documentation
### Table of contents

### Collection Actions

### Stories

### Basic Actions Example

### Multiple Primary Actions Example

### With Expanded Actions Example

### With Grouped Expanded Actions Example

### Hidden Label Expanded Actions Example

### Card Actions Example

### John Doe

### Jane Smith

### Bob Johnson

### Alice Williams
## Collection Actions

### Table of contents

### Collection Actions

### Stories

### Basic Actions Example

### Multiple Primary Actions Example

### With Expanded Actions Example

### With Grouped Expanded Actions Example

### Hidden Label Expanded Actions Example

### Card Actions Example

### John Doe

### Jane Smith

### Bob Johnson

### Alice Williams
## Internal

The SortAndHideList component provides an interface for managing the sorting
order and visibility of table columns. It allows users to:

### Table of contents

### SortAndHideList

The SortAndHideList component provides an interface for managing the sorting
order and visibility of table columns. It allows users to:

### Introduction

This component is designed to be used within table settings to give users
control over which columns are displayed and in what order. It integrates with
the Switch component from the Forms library to provide consistent toggle
functionality.

### Key Features

### Default Usage

### Examples

### All Items Visible

Shows the component when all optional columns are currently visible.

### All Items Hidden

Demonstrates the state when all optional columns are hidden. Note that required
columns would still be visible in the actual table.

### Mixed States

A realistic example showing a combination of required columns (that cannot be
hidden), visible optional columns, and hidden optional columns.

### Edge Cases

### Empty List

### Single Item

### Long Labels

Shows how the component handles long column names that might wrap or need
truncation.

### Props

The component accepts a single items prop which is an array of objects with
the following structure:

### Implementation Notes

### Accessibility

### Related Components
## Item Actions

[object Object][object Object][object Object]

### Table of contents

### Item Actions

[object Object][object Object][object Object]

### Items Actions Example

This example demonstrates various types of actions that can be used in Collections. Click in the top right button or top right actions menu (three dots) to see the available actions for the data collection.

### Stories

### Basic Actions Example

### Items Actions Example

This example demonstrates various types of actions that can be used in Collections. Click in the top right button or top right actions menu (three dots) to see the available actions for the data collection.

### Card Actions Example

### Card Item Actions Example

This example shows how actions work with card visualization.

### John Doe

### Jane Smith

### Bob Johnson

### Alice Williams
## Miscellaneous

This component is used to display a collection of data with filtering and visualization capabilities.

### Table of contents

### Miscellaneous

This component is used to display a collection of data with filtering and visualization capabilities.

### Stories

### Simplest

### Basic Table View

### With Linked Items

### Basic Card View

### Dani Smith

### Senior Engineer

### Desirée Johnson

### Product Manager

### Eliseo Williams

### Designer

### Arnau Brown

### Marketing Lead

### Carlos Jones

### Software Engineer

### Lilian Garcia

### Senior Engineer

### Andrea Miller

### Product Manager

### Mario Davis

### Designer

### Nik Rodriguez

### Marketing Lead

### René Martinez

### Software Engineer

### Renderer Types

### Custom Card Properties

### Dani Smith

### Desirée Johnson

### Eliseo Williams

### Arnau Brown

### Carlos Jones

### Lilian Garcia

### Andrea Miller

### Mario Davis

### Nik Rodriguez

### René Martinez

### Switchable Visualizations

### With Selectable And Bulk Actions

### With Page Only Selection

### With Cross Page Selection

### With Selectable And Default Selected Items

### With Selectable And Default Selected Groups

### With Custom Json View

### With Table Visualization

### With Card Visualization

### With Multiple Visualizations

### With Pages Pagination

### With Infinite Scroll Pagination

### With Infinite Scroll Pagination One Col

### With Synchronous Data

### With Advanced Actions

### Table Column Properties

### Table With No Filters And Search

### Table With No Filters

### Table With Secondary Actions

### With Progress Bar

Callback triggered when items are selected. It gets if allItemsCheck is checked(boolean | 'indeterminate', indeterminate means at least one item was delected), itemsStatus return the list of know items (if the datacollection is async we don't all the items) and the check status for each item, and filters the current filters state.

Callback triggered when a bulk action is performed. It gets the action name, and the same args as inSelectItems. ‼️ Please check the onSelectItems docs for more information.

Callback triggered when the state of the data collection changes. It gets the new state.
## Summary

The Summary feature provides a way to display aggregated data at the bottom of
your data collection tables. This powerful tool lets you quickly visualize
totals, averages, or counts for numeric columns, giving users valuable insights
at a glance without requiring additional calculations.

### Table of contents

### Data collection / Summary

### Introduction

The Summary feature provides a way to display aggregated data at the bottom of
your data collection tables. This powerful tool lets you quickly visualize
totals, averages, or counts for numeric columns, giving users valuable insights
at a glance without requiring additional calculations.

This feature is particularly useful for financial data, inventory management,
performance metrics, and any scenario where aggregated values provide meaningful
context to the tabular data.

### Examples

### Basic Summary Row

### Setting Up Summary Rows

To enable the Summary feature in your data collection component, provide the
summary attribute in the source prop:

### Infinite Scroll with Sticky Summary Row

For data collections with large datasets, you can combine infinite scroll
pagination with a sticky summary row. This keeps the summary information visible
at the bottom of the table while users scroll through the data.

To implement a data collection with infinite scroll and sticky summary:

### Sticky Summary Row with Frozen Columns

To implement a data collection with infinite scroll and sticky summary:
## Temporary or Deprecated features

The Temporary or Deprecated features still in use but you should avoid as much
as possible.

### Table of contents

### Temporary or Deprecated features

### Introduction

The Temporary or Deprecated features still in use but you should avoid as much
as possible.

### TmpFullWidth

Removed the horizontal padding from the data collection.
## Total Items Summary

The Total Items Summary is a component that displays the total number of items
in the data collection. It is displayed in the top right of the data collection.

### Table of contents

### Total Items Summary

### Introduction

The Total Items Summary is a component that displays the total number of items
in the data collection. It is displayed in the top right of the data collection.

### Setting Up Total Items Summary

To enable the Total Items Summary in your data collection component, provide the
totalItemSummary property to the useDataCollectionSource hook.

This will display the total number of items in the data collection with the
default text.

### Example

### Customizing the Total Items Summary

You can customize the Total Items Summary by providing a function that takes the
total number of items as a parameter and returns a string to be displayed.

### Example

### Position of the Total Items Summary

The Total Items Summary is displayed in the top right of the data collection. If
you have filters, it will be displayed over the filters, in the same row as the
navigation filters. If not, it will be displayed in the place of the filters.
## Value Display

In order to provide a homogeneous experience to the customers and abstract the
render logic to developer using the ValueDisplay components,

### Table of contents

### Value Display

### Introduction

In order to provide a homogeneous experience to the customers and abstract the
render logic to developer using the ValueDisplay components,

ValueDisplay provides a semantic way to define the value's display of a
property.

The way a cell/property must be rendered is defined in the render function of
the datacollection, the type is the cell type to render and the value depends on

### Data types

Data Collection supports various data types, each with an optimized
visualization designed for specific use cases. These visualizations fall into
several categories:

for details.
## Visualizations

The Card visualization is a visualization that displays the data in a card
format.

### Table of contents

### Card Visualization

### Introduction

The Card visualization is a visualization that displays the data in a card
format.

### Examples

### Dani Smith

### Senior Engineer

### Desirée Johnson

### Product Manager

### Eliseo Williams

### Designer

### Arnau Brown

### Marketing Lead

### Carlos Jones

### Software Engineer

### Lilian Garcia

### Senior Engineer

### Andrea Miller

### Product Manager

### Mario Davis

### Designer

### Nik Rodriguez

### Marketing Lead

### René Martinez

### Software Engineer

### Setting Up Card Visualization

To enable the Card visualization in your data collection component, provide the
type: "card" in the visualizations prop:

### Card Properties

### Card Property Definition

### Complete Example

### Item actions

The card visualization supports item actions. To enable item actions, provide
the itemActions prop to the useDataCollectionSource hook.

The action type will make the action to be displayed in the card dropdown menu
(other type), or in the card footer (primary type and secondary type).
## Visualizations

Kanban view visualization. Displays records distributed across lanes.

### Table of contents

### Kanban

Kanban view visualization. Displays records distributed across lanes.

### Dani Smith

### Senior Engineer

### Carlos Jones

### Software Engineer

### Nik Rodriguez

### Marketing Lead

### Dani Gonzalez

### Designer

### Carlos Taylor

### Product Manager

### Nik Lee

### Senior Engineer

### Dani Harris

### Software Engineer

### Carlos Lewis

### Marketing Lead

### Nik Williams

### Designer

### Dani Miller

### Product Manager

### Desirée Johnson

### Product Manager

### Lilian Garcia

### Senior Engineer

### René Martinez

### Software Engineer

### Desirée Wilson

### Marketing Lead

### Lilian Moore

### Designer

### René Perez

### Product Manager

### Desirée Sanchez

### Senior Engineer

### Lilian Robinson

### Software Engineer

### René Brown

### Marketing Lead

### Desirée Davis

### Designer

### Eliseo Williams

### Designer

### Andrea Miller

### Product Manager

### Sergio Hernandez

### Senior Engineer

### Eliseo Anderson

### Software Engineer

### Andrea Jackson

### Marketing Lead

### Sergio Thompson

### Designer

### Eliseo Clark

### Product Manager

### Andrea Smith

### Senior Engineer

### Sergio Jones

### Software Engineer

### Eliseo Rodriguez

### Marketing Lead

### Arnau Brown

### Marketing Lead

### Mario Davis

### Designer

### Saúl Lopez

### Product Manager

### Arnau Thomas

### Senior Engineer

### Mario Martin

### Software Engineer

### Saúl White

### Marketing Lead

### Arnau Ramirez

### Designer

### Mario Johnson

### Product Manager

### Saúl Garcia

### Senior Engineer

### Arnau Martinez

### Software Engineer

### Stories

### Basic Kanban Visualization

### Dani Smith

### Senior Engineer

### Carlos Jones

### Software Engineer

### Nik Rodriguez

### Marketing Lead

### Dani Gonzalez

### Designer

### Carlos Taylor

### Product Manager

### Nik Lee

### Senior Engineer

### Dani Harris

### Software Engineer

### Carlos Lewis

### Marketing Lead

### Nik Williams

### Designer

### Dani Miller

### Product Manager

### Desirée Johnson

### Product Manager

### Lilian Garcia

### Senior Engineer

### René Martinez

### Software Engineer

### Desirée Wilson

### Marketing Lead

### Lilian Moore

### Designer

### René Perez

### Product Manager

### Desirée Sanchez

### Senior Engineer

### Lilian Robinson

### Software Engineer

### René Brown

### Marketing Lead

### Desirée Davis

### Designer

### Eliseo Williams

### Designer

### Andrea Miller

### Product Manager

### Sergio Hernandez

### Senior Engineer

### Eliseo Anderson

### Software Engineer

### Andrea Jackson

### Marketing Lead

### Sergio Thompson

### Designer

### Eliseo Clark

### Product Manager

### Andrea Smith

### Senior Engineer

### Sergio Jones

### Software Engineer

### Eliseo Rodriguez

### Marketing Lead

### Arnau Brown

### Marketing Lead

### Mario Davis

### Designer

### Saúl Lopez

### Product Manager

### Arnau Thomas

### Senior Engineer

### Mario Martin

### Software Engineer

### Saúl White

### Marketing Lead

### Arnau Ramirez

### Designer

### Mario Johnson

### Product Manager

### Saúl Garcia

### Senior Engineer

### Arnau Martinez

### Software Engineer

### Kanban With Create Actions

### Dani Smith

### Senior Engineer

### Carlos Jones

### Software Engineer

### Nik Rodriguez

### Marketing Lead

### Dani Gonzalez

### Designer

### Carlos Taylor

### Product Manager

### Nik Lee

### Senior Engineer

### Desirée Johnson

### Product Manager

### Lilian Garcia

### Senior Engineer

### René Martinez

### Software Engineer

### Desirée Wilson

### Marketing Lead

### Lilian Moore

### Designer

### René Perez

### Product Manager

### Eliseo Williams

### Designer

### Andrea Miller

### Product Manager

### Sergio Hernandez

### Senior Engineer

### Eliseo Anderson

### Software Engineer

### Andrea Jackson

### Marketing Lead

### Sergio Thompson

### Designer

### Arnau Brown

### Marketing Lead

### Mario Davis

### Designer

### Saúl Lopez

### Product Manager

### Arnau Thomas

### Senior Engineer

### Mario Martin

### Software Engineer

### Saúl White

### Marketing Lead
## Visualizations

The List visualization is a visualization that displays the data in a list
format. It's an hybrid between the card and the table visualization, as there
are fixed fiedlds (title, avatar, description) and dynamic fields (properties).

### Table of contents

### List Visualization

### Introduction

The List visualization is a visualization that displays the data in a list
format. It's an hybrid between the card and the table visualization, as there
are fixed fiedlds (title, avatar, description) and dynamic fields (properties).

### Examples

### Dani Smith

### Desirée Johnson

### Eliseo Williams

### Arnau Brown

### Carlos Jones

### Lilian Garcia

### Andrea Miller

### Mario Davis

### Nik Rodriguez

### René Martinez

### Setting Up List Visualization

To enable the List visualization in your data collection component, provide the
type: "list" in the visualizations prop:

### List Properties

### Card Property Definition

### Complete Example

### Item actions

The list visualization supports item actions. To enable item actions, provide
the itemActions prop to the useDataCollectionSource hook.

The action type will make the action to be displayed in the list dropdown menu
(other and secondary type), or in in a button (primary type).

### Examples

### List with grouping

### List with item actions and sorting

### Eliseo Williams

### Andrea Miller

### Dani Smith

### Carlos Jones

### Nik Rodriguez

### Arnau Brown

### Mario Davis

### Desirée Johnson

### Lilian Garcia

### René Martinez

### List with item actions and filtering

### Eliseo Williams

### Andrea Miller

### Dani Smith

### Carlos Jones

### Nik Rodriguez

### Arnau Brown

### Mario Davis

### Desirée Johnson

### Lilian Garcia

### René Martinez
## Visualizations

The Table visualization is a tabular visualization that displays data in rows
and columns with advanced features like column sorting, filtering, frozen
columns, column reordering, and column hiding. It provides a comprehensive view
of structured data with enhanced interactivity.

### Table of contents

### Table Visualization

### Introduction

The Table visualization is a tabular visualization that displays data in rows
and columns with advanced features like column sorting, filtering, frozen
columns, column reordering, and column hiding. It provides a comprehensive view
of structured data with enhanced interactivity.

### Examples

### Setting Up Table Visualization

To enable the Table visualization in your data collection component, provide the
type: "table" in the visualizations prop:

### Table Properties

### Table Column Definition

### Complete Example

### Advanced Features

### Frozen Columns

You can freeze columns to the left side of the table to keep them visible while
scrolling horizontally:

### Column Ordering

Using the order property you can define the initial order of the columns.

If no order is provided, the column will be placed at the end of the table.

### Column Reordering

Allow users to reorder columns by drag and drop:

### Column Hiding

Allow users to show/hide columns using column settings:

### Nested Tables

Tables can display hierarchical data by allowing rows to be expanded to reveal
child items. This functionality is useful for representing tree structures,
categories with subcategories, or any parent-child relationship in your data.

### Basic Setup

To enable nested tables, you need to provide three methods in your data source:

### Required Methods

### itemsWithChildren

Type: (item: R) => boolean

Function that determines if an item has children and therefore should display
the expand button.

### childrenCount

Type:
({ item, pagination }: { item: R; pagination?: ChildrenPaginationInfo }) => number | undefined

Function that returns the total number of child items an element has. This
number is displayed next to the expand button and helps the user understand how
many items they will see when expanding.

### fetchChildren

Type:
({ item, filters, pagination }: { item: R; filters?: FiltersState<Filters>; pagination?: ChildrenPaginationInfo }) => Promise<ChildrenResponse<R>>

Async function that fetches the child items of a parent item. This is the main
method that controls how hierarchical data is loaded.

### Response Types: basic vs detailed

The type field in the fetchChildren response controls the visual layout of
child items. Both types support expandable children, but they differ in their
presentation:

### "basic" (default)

Children are displayed in a hierarchical tree view with visual connectors
and indentation. This creates a traditional tree structure that clearly shows
the parent-child relationships. Use this type when:

### "detailed"

Children are displayed aligned with the parent without tree connectors or
indentation. This creates a flatter, more detailed view where children are
treated as full table rows. Use this type when:

### Children Pagination

When a parent item has many children, you can implement pagination to load them
incrementally. This significantly improves performance and user experience.

### Pagination Setup

### "Load More" Behavior

When paginationInfo.hasMore is true, a "Load more" button is automatically
shown at the end of the expanded children. When clicked:

### Complete Example with all nested table features

Note: If you return undefined, no counter will be displayed next to the
expand button, but the button will still work.

Returns: Promise<ChildrenResponse<R>>

---
Generate a SKILL.md file for this component following the guidelines in the system prompt.
IMPORTANT: Start your response with the YAML frontmatter delimiters (---).
IMPORTANT: When the documentation references other components, hooks, or patterns, add a note directing users to find the related skill. Use format: "For [component/hook name], see the skill in ./references/[component-name].md"
IMPORTANT: Output props as a bullet list format (one prop per line), NOT as a markdown table. Use format: "- **propName** (required/optional): `type` - description"