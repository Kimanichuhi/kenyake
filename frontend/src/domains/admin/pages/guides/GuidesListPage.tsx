import { ResourceListPage } from "../../components/ResourceListPage";
import { guidesResource } from "../../services/resources/guidesResource";

const GuidesListPage = () => (
  <ResourceListPage resource={guidesResource} description="Admin-managed guide profiles available for booking." />
);

export default GuidesListPage;
