import { ResourceListPage } from "../../components/ResourceListPage";
import { blogPostsResource } from "../../services/resources/blogResource";

const BlogListPage = () => (
  <ResourceListPage resource={blogPostsResource} description="Articles and stories published to the public blog." />
);

export default BlogListPage;
