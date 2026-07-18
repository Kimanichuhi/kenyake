import { usePartnerBusiness } from "@/components/RequirePartnerBusiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessStatusOverview } from "../components/dashboard/BusinessStatusOverview";
import { BusinessStatusTimeline } from "../components/dashboard/BusinessStatusTimeline";

const PartnerDashboardPage = () => {
  const { business } = usePartnerBusiness();

  return (
    <div className="max-w-3xl space-y-6">
      <BusinessStatusOverview business={business} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessStatusTimeline businessId={business.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboardPage;
