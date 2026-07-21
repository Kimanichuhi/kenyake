import { ResourceListPage } from "../../components/ResourceListPage";
import { wildlifeSpeciesResource } from "../../services/resources/wildlifeSpeciesResource";

const WildlifeSpeciesListPage = () => (
  <ResourceListPage resource={wildlifeSpeciesResource} description="Big Five facts shown on the public Wildlife Tracker page." />
);

export default WildlifeSpeciesListPage;
