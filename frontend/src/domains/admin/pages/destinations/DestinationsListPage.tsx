import { ResourceListPage } from "../../components/ResourceListPage";
import { destinationsResource } from "../../services/resources/destinationsResource";

const DestinationsListPage = () => (
  <ResourceListPage resource={destinationsResource} description="Kenya destinations shown on the public site." />
);

export default DestinationsListPage;
