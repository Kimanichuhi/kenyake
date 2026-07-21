import { ResourceListPage } from "../../components/ResourceListPage";
import { reviewsResource } from "../../services/resources/reviewsResource";

const ReviewsListPage = () => (
  <ResourceListPage resource={reviewsResource} description="Traveler reviews submitted for destinations and experiences." />
);

export default ReviewsListPage;
