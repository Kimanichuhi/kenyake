import { ResourceListPage } from "../../components/ResourceListPage";
import { communitiesResource } from "../../services/resources/communitiesResource";

const CommunitiesListPage = () => (
  <ResourceListPage resource={communitiesResource} description="Cultural community profiles shown across the site." />
);

export default CommunitiesListPage;
