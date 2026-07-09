import { ResourceListPage } from "../../components/ResourceListPage";
import { pagesResource } from "../../services/resources/pagesResource";

const PagesListPage = () => (
  <ResourceListPage resource={pagesResource} description="Structured content pages, built from reusable blocks." />
);

export default PagesListPage;
