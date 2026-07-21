import { ResourceListPage } from "../../components/ResourceListPage";
import { navItemsResource } from "../../services/resources/navItemsResource";

const NavItemsListPage = () => (
  <ResourceListPage resource={navItemsResource} description="The main navigation menu shown in the site header." />
);

export default NavItemsListPage;
