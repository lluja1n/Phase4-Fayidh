import { useApp } from '../../context/AppContext.jsx';
// import the reauable page heading component to display the page title and subtitle
import { PageHeader } from '../../components/ui.jsx';

export default function SellerRequests() {
      const { currentUser, listings, requests } = useApp();

  return (
    <div className="container page">
      <PageHeader
        title="Buyer Requests"
        subtitle="Purchase and donation requests received for your listings."
      />
    </div>
  );
}