import { ResourceListPage } from "../../components/ResourceListPage";
import { footerLinksResource } from "../../services/resources/footerLinksResource";

const FooterLinksListPage = () => (
  <ResourceListPage resource={footerLinksResource} description="Links shown in the site footer." />
);

export default FooterLinksListPage;
