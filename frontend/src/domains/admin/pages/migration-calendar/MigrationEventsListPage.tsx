import { ResourceListPage } from "../../components/ResourceListPage";
import { wildlifeMigrationResource } from "../../services/resources/wildlifeMigrationResource";

const MigrationEventsListPage = () => (
  <ResourceListPage resource={wildlifeMigrationResource} description="Month-by-month migration calendar shown on the public Wildlife Tracker page." />
);

export default MigrationEventsListPage;
