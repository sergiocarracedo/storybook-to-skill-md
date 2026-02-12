/**
 * Mock LLM responses for testing
 */
export const MOCK_RESPONSES: Record<string, string> = {
  button: `---
name: button
description: Use this button component when you need interactive clickable elements for form submissions, navigation actions, or triggering user interactions.
---

# Button

A reusable button component that supports multiple variants and sizes for different use cases.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \\| 'secondary' \\| 'outline' | 'primary' | The visual style of the button |
| size | 'small' \\| 'medium' \\| 'large' | 'medium' | The size of the button |
| disabled | boolean | false | Whether the button is disabled |
| onClick | () => void | - | Click handler function |

## Usage Examples

### Basic Usage

\`\`\`tsx
import { Button } from '@/components/Button';

<Button variant="primary" onClick={() => console.log('clicked')}>
  Click Me
</Button>
\`\`\`

### Variants

\`\`\`tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
\`\`\`

### Sizes

\`\`\`tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
\`\`\`

## Best Practices

- Use primary buttons for main actions
- Use secondary buttons for secondary actions
- Use outline buttons for tertiary actions
- Always provide meaningful button text
- Use disabled state for unavailable actions
`,

  'data-collection': `---
name: data-collection
description: Use this data collection component when you need to display, sort, filter, and manage tabular data with support for pagination, selection, and custom rendering.
---

# Data Collection

A comprehensive data table component for displaying and managing collections of data.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | T[] | required | Array of data items to display |
| columns | Column<T>[] | required | Column definitions |
| selectable | boolean | false | Enable row selection |
| pagination | boolean | false | Enable pagination |
| pageSize | number | 10 | Items per page |
| sortable | boolean | false | Enable column sorting |
| loading | boolean | false | Show loading state |

## Usage Examples

### Basic Table

\`\`\`tsx
import { DataCollection } from '@/components/DataCollection';

const data = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

<DataCollection data={data} columns={columns} />
\`\`\`

### With Selection

\`\`\`tsx
<DataCollection
  data={data}
  columns={columns}
  selectable
  onSelectionChange={(selected) => console.log(selected)}
/>
\`\`\`

## Best Practices

- Always define column keys that match your data shape
- Use pagination for large datasets (>100 items)
- Provide meaningful empty state messages
- Consider custom cell renderers for complex data
`,
};

/**
 * Get a mock response for a component
 */
export function getMockResponse(slug: string): string {
  return (
    MOCK_RESPONSES[slug] ??
    `---
name: ${slug}
description: Use this ${slug} component when you need its functionality in your application.
---

# ${slug}

Documentation for ${slug} component.
`
  );
}
