import { createTable, getCoreRowModel, type ColumnDef } from "@tanstack/table-core";

interface FeatureRow {
  feature: string;
  status: string;
  owner: string;
}

const threshold = {
  rows: 8,
  columns: 6
};

const sampleData: FeatureRow[] = Array.from({ length: 12 }, (_row, index) => ({
  feature: `Feature ${index + 1}`,
  status: index % 2 === 0 ? "ready" : "watch",
  owner: "reader"
}));

const columns: ColumnDef<FeatureRow>[] = [
  { accessorKey: "feature", header: "Feature" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "owner", header: "Owner" }
];

const table = createTable<FeatureRow>({
  data: sampleData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  state: {},
  onStateChange: () => {},
  renderFallbackValue: null
});

const rowCount = table.getRowModel().rows.length;
const shouldEnhance = rowCount >= threshold.rows || columns.length >= threshold.columns;

if (!shouldEnhance) {
  console.error("Expected sample data to cross the large-table threshold.");
  process.exit(1);
}

console.log(`Large-table threshold verified with ${rowCount} rows and ${columns.length} columns.`);
