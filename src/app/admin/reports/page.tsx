import { ReportGenerator } from '@/components/admin/report-generator';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Generate Reports</h2>
        <p className="text-muted-foreground">
          Export your shipment and driver data to CSV files.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
