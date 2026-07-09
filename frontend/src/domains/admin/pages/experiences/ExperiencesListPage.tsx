import { ResourceListPage } from "../../components/ResourceListPage";
import { experiencesResource } from "../../services/resources/experiencesResource";

const ExperiencesListPage = () => (
  <ResourceListPage resource={experiencesResource} description="Curated cultural, culinary, and adventure experiences hosted by local communities." />
);

export default ExperiencesListPage;
