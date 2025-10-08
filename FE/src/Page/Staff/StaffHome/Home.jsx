import StationDashboardHeader from "../../../Layout/Staff/Header";
import LiveMonitoring from "../Components/DashboardComponents/LiveMoniotring";
import NotificationsPanel from "../Components/DashboardComponents/NotifiCationPanel";
import RecentIncidentAndUpcomingRevervation from "../Components/DashboardComponents/RecentIncidentAndUpcomingRevervation";
import StationDashboardStats from "../Components/DashboardComponents/StaffDashboardStat";

export default function StaffHome() {
  return (
    <>
      <StationDashboardHeader />
      <div className="grid grid-cols-[70%_40%] gap-4 ">
        {/* Left column (60%) */}
        <div className="flex flex-col gap-6">
          <StationDashboardStats />
          <LiveMonitoring />
          <RecentIncidentAndUpcomingRevervation />
        </div>

        <NotificationsPanel />
      </div>
    </>
  );
}
