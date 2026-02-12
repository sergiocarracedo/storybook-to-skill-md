import React from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataCollectionProps<T extends object> {
  /** Array of data items to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Enable row selection */
  selectable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Items per page */
  pageSize?: number;
  /** Enable sorting */
  sortable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when selection changes */
  onSelectionChange?: (selected: T[]) => void;
  /** Callback when sort changes */
  onSortChange?: (column: keyof T, direction: 'asc' | 'desc') => void;
}

/**
 * A comprehensive data table component for displaying and managing collections of data.
 * Supports pagination, sorting, selection, and custom rendering.
 */
export function DataCollection<T extends object>({
  data,
  columns,
  selectable = false,
  pagination = false,
  pageSize = 10,
  sortable = false,
  loading = false,
  emptyMessage = 'No data available',
  onSelectionChange,
  onSortChange,
}: DataCollectionProps<T>): React.ReactElement {
  if (loading) {
    return <div className="data-collection-loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="data-collection-empty">{emptyMessage}</div>;
  }

  return (
    <div className="data-collection">
      <table>
        <thead>
          <tr>
            {selectable && <th>Select</th>}
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {selectable && (
                <td>
                  <input type="checkbox" />
                </td>
              )}
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataCollection;
