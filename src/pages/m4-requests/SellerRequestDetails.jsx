import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { EmptyState } from '../../components/ui.jsx';



export default function SellerRequestDetails() {
 const { id } = useParams();
  const { currentUser, requests, getListing } = useApp();
    const request = requests.find((item) => item.id === id);
    // to find the listing associated with the request 
      const listing = request
    ? getListing(request.listingId)
    : null;

  const isOwner =
    currentUser &&
    listing &&
    listing.ownerId === currentUser.id;

   // checking and preventing users from viewing requests that do not belong to their listings:
 if (!request || !listing || !isOwner) { 
    return (
      <div className="container page">
        <EmptyState
          title="Request Not Found"
          message="You can only view requests for your own listings."
          action={
            <Link to="/seller/requests" className="btn btn-primary">
              Back to Buyer Requests
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>
        {request.type === 'purchase'
          ? 'Purchase Request'
          : 'Donation Request'}
      </h1>
    </div>
  );
}