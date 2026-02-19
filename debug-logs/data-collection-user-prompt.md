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
- **propertyName** (required): `summary` [default: defaultValue]
  This is a short description
- **propertyName** (required): `summary` [default: defaultValue]
  This is a short description
- **propertyName** (required): `summary` [default: defaultValue]
  This is a short description
- **allPagesSelection** (optional): `boolean`
- **bulkActions** (optional)
  BulkActionsDefinition
- **currentFilters** (optional)
  FiltersState
- **currentGrouping** (optional)
  GroupingState
- **currentNavigationFilters** (optional)
  {
  [K in keyof Definition]?: NavigationFilterValue<Definition[K]>
}
- **currentSortings** (optional)
  SortingsState
- **dataAdapter** (optional)
  DataCollectionDataAdapter
- **defaultSelectedItems** (optional)
  SelectedItemsState
- **enableCache** (optional): `boolean` [default: true]
- **frozenColumns** (optional): `union` [default: 0]
- **fullHeight** (optional): `boolean`
- **grouping** (optional): `union`
- **hideFilters** (optional): `boolean`
- **id** (optional): `string`
- **navigationFilters** (optional)
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
  Callback triggered when items are selected. It gets if allItemsCheck is checked(boolean | 'indeterminate', indeterminate means at least one item was delected), itemsStatus return the list of know item...
- **onStateChange** (optional)
  Callback triggered when the state of the data collection changes. It gets the new state.
- **paginationType** (optional)
  PaginationType
- **primaryActions** (optional)
  () =>
| PrimaryActionItemDefinition
| PrimaryActionItemDefinition[]
| undefined
- **searchBar** (optional): `union` [default: false]
- **secondaryActions** (optional): `union`
- **selectable** (optional)
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
- John Doe
- Collection Actions/John Doe
- Internal/Key Features
- Internal/All Items Visible
- Internal/All Items Hidden
- Internal/Mixed States
- Internal/Edge Cases
- Item Actions/John Doe
- Miscellaneous/Dani Smith
- Miscellaneous/Dani Smith
- Summary/Basic Summary Row
- Summary/Infinite Scroll with Sticky Summary Row
- Summary/Sticky Summary Row with Frozen Columns
- Temporary or Deprecated features/TmpFullWidth
- Total Items Summary/Example
- Total Items Summary/Example
- Value Display/Data types
- Visualizations/Dani Smith
- Visualizations/Dani Smith
- Visualizations/Dani Smith
- Visualizations/Dani Smith
- Visualizations/Dani Smith
- Visualizations/Eliseo Williams
- Visualizations/Eliseo Williams
- Visualizations/Frozen Columns
- Visualizations/Column Ordering
- Visualizations/Column Reordering
- Visualizations/Column Hiding
- Visualizations/Basic Setup
- Visualizations/Required Methods
- *(3 more stories...)*

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


[...]

*[Additional documentation truncated for brevity]*

---
Generate a SKILL.md file for this component following the guidelines in the system prompt.
IMPORTANT: Start your response with the YAML frontmatter delimiters (---).