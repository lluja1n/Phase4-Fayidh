import { useApp } from '../../context/AppContext.jsx';
// import the reauable page heading component to display the page title and subtitle
import { PageHeader } from '../../components/ui.jsx';

export default function SellerRequests() {
      const { currentUser, listings, requests } = useApp();

      const myListingIds = new Set(
     listings
    .filter((listing) => listing.ownerId === currentUser?.id)
    .map((listing) => listing.id)
);

const received = requests
  .filter((request) => myListingIds.has(request.listingId))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  
  return (
    <div className="container page">
      <PageHeader
        title="Buyer Requests"
        subtitle="Purchase and donation requests received for your listings."
      />
    </div>
  );
}