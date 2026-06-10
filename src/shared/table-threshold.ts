// Tables at or above either bound get reading affordances (constrained height
// and a sticky header) from the large-table enhancer. The threshold decision is
// recorded in docs/adr/0002-plain-tables-with-a-large-table-enhancer.md; change
// it there first.
export const largeTableThreshold = {
  rows: 8,
  columns: 6
};

export function isLargeTable(rowCount: number, columnCount: number): boolean {
  return rowCount >= largeTableThreshold.rows || columnCount >= largeTableThreshold.columns;
}
