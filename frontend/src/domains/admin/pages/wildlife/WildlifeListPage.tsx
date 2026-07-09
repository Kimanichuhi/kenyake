import { ResourceListPage } from "../../components/ResourceListPage";
import { wildlifeResource } from "../../services/resources/wildlifeResource";

const WildlifeListPage = () => (
  <ResourceListPage resource={wildlifeResource} description="Crowdsourced and admin-curated wildlife sighting reports." />
);

export default WildlifeListPage;
