// I start importing the useParams to get ID listing from URL
// , import also the useApp to get access data from shaerd app
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

// this component will handle both purchase and donation requests :
export default function RequestForm({ type }) {
    const { id } = useParams(); 
    const { getListing } = useApp();
    const listing = getListing(id);
    const isDonation = type === 'donation';

    // For know I just display a temporary page untill I implement the form and the logic to handle the request submission
      return (
    <div className="container page">
      <h1>
        {isDonation ? 'Donation Request' : 'Purchase Request'}
      </h1>
      <p>Request Form - TODO 1 completed.</p>

      <p>Listing ID: {id}</p>

      <p> Listing: {listing ? listing.name : 'Listing not found'}  </p>
    </div>
  );
}
