import RecentIncident from "./RecentIncident";
import UpcomingReservations from "./UpcomingRevervation";

export default function RecentIncidentAndUpcomingRevervation() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-8">
        <RecentIncident />
        <UpcomingReservations />
      </div>
    </>
  );
}
