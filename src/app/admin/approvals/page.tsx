import { getDrivers } from "@/lib/data/drivers";
import { DriverApprovalList } from "@/components/admin/driver-approval-list";

export default async function ApprovalsPage() {
  const drivers = await getDrivers();
  const pendingDrivers = drivers.filter(d => d.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Driver Registration Approvals</h2>
        <p className="text-muted-foreground">
          Review and approve new driver sign-ups.
        </p>
      </div>
      <DriverApprovalList drivers={pendingDrivers} />
    </div>
  );
}
