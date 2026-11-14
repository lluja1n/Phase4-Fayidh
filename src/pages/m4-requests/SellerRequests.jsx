import { useApp } from "../../context/AppContext.jsx";
import { useState } from "react";
// import the reauable page heading component to display the page title and subtitle
import { PageHeader, Badge, EmptyState } from "../../components/ui.jsx";

// import the Link component to navigate to the request details page
import { Link } from "react-router-dom";
// import the formatDate function to format the request date
import { formatDate } from "../../data/mockHelpers.js";

// I added FILTERS to define available filters
const FILTERS = ["pending", "accepted", "rejected", "cancelled", "all"];
export default function SellerRequests() {
  const { currentUser, listings, requests, getListing, getUser } = useApp();
  const [filter, setFilter] = useState("pending");

  const myListingIds = new Set(
    listings
      .filter((listing) => listing.ownerId === currentUser?.id)
      .map((listing) => listing.id),
  );

  const received = requests
    .filter((request) => myListingIds.has(request.listingId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  //I added shown to apply the selected status filter to received requests
  const shown =
    filter === "all"
      ? received
      : received.filter((request) => request.status === filter);

  return (
    <div className="container page">
      <PageHeader
        title="Buyer Requests"
        subtitle="Purchase and donation requests received for your listings."
      />

      {/* Display an empty state when the seller has no requests. */}
      {received.length === 0 ? (
        <EmptyState
          title="No requests found"
          message="Requests for your listings will appear here."
        />
      ) : (
        <>
          <div
            className="filter-tabs"
            role="group"
            aria-label="Filter requests by status"
          >
            {FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
              >
                {status === "all"
                  ? `All (${received.length})`
                  : `${status[0].toUpperCase()}${status.slice(1)} (${
                      received.filter((request) => request.status === status)
                        .length
                    })`}
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState
              title="No requests found"
              message="There are no requests with this status."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Requested by</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {shown.map((request) => {
                    const listing = getListing(request.listingId);
                    const buyer = getUser(request.requesterId);

                    return (
                      <tr key={request.id}>
                        <td>
                          <strong>{listing?.name || "Unknown listing"}</strong>
                        </td>

                        <td>{buyer?.name || "Unknown user"}</td>

                        <td>
                          {request.type === "purchase"
                            ? "Purchase"
                            : "Donation"}
                        </td>

                        <td>{request.quantity}</td>

                        <td>{formatDate(request.createdAt)}</td>

                        <td>
                          <Badge status={request.status} />
                        </td>

                        <td>
                          <Link
                            to={`/seller/requests/${request.id}`}
                            className="btn btn-sm"
                          >
                            {request.status === "pending" ? "Review" : "View"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
