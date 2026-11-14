import { Link, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import {
  EmptyState,
  BackLink,
  Badge,
  InfoList,
  ConfirmModal,
  Alert,
  TextAreaField,
} from "../../components/ui.jsx";
import { formatDate, formatPrice } from "../../data/mockHelpers.js";
import { useState } from "react";

export default function SellerRequestDetails() {
  const { id } = useParams();
  const {
    currentUser,
    requests,
    getListing,
    getUser,
    acceptRequest,
    rejectRequest,
    toast,
  } = useApp();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const request = requests.find((item) => item.id === id);
  // to find the listing associated with the request
  const listing = request ? getListing(request.listingId) : null;

  const isOwner = currentUser && listing && listing.ownerId === currentUser.id;

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
  const buyer = getUser(request.requesterId);
  const buyerType =
    buyer?.role === "student"
      ? `University Student${buyer.verified ? " (verified)" : ""}`
      : buyer?.orgType === "educational"
        ? "Educational Institution"
        : "Business";

  const handleAccept = () => {
    setShowAcceptModal(false);
    if (request.status !== "pending") {
      toast("This request is no longer pending.", "error");
      return;
    }
    const result = acceptRequest(request.id);
    if (result.ok) {
      toast("Request accepted successfully.");
    } else {
      toast(result.error, "error");
    }
  };
  const handleReject = () => {
    if (request.status !== "pending") {
      toast("This request is no longer pending.", "error");
      setShowRejectModal(false);
      return;
    }

    const result = rejectRequest(request.id, rejectReason);

    if (result.ok) {
      toast("Request rejected successfully.");
    } else {
      toast(result.error, "error");
    }

    setShowRejectModal(false);
  };

  return (
    <div className="container page">
      <h1>
        {request.type === "purchase" ? "Purchase Request" : "Donation Request"}
      </h1>
      {request.status === "pending" && (
        <button
          type="button"
          className="btn btn-primary"
          disabled={request.quantity > listing.quantity}
          onClick={() => setShowAcceptModal(true)}
        >
          Accept Request
        </button>
      )}

      {request.status === "pending" && (
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => setShowRejectModal(true)}
        >
          Reject Request
        </button>
      )}

      <BackLink to="/seller/requests">Back to Buyer Requests</BackLink>
      <Badge status={request.status} />

      {request.status === "pending" && request.quantity > listing.quantity && (
        <Alert kind="warning">
          Only {listing.quantity} units are available. This request cannot be
          accepted with the current stock.
        </Alert>
      )}
      <div className="grid grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h2 className="section-title">Requested Item</h2>

          <InfoList
            rows={[
              ["Item", listing.name],
              ["Quantity Requested", request.quantity],
              ["Still Available", listing.quantity],
              [
                "Price",
                request.type === "purchase"
                  ? `${formatPrice(listing.price)} each - Total: ${formatPrice(listing.price * request.quantity)}`
                  : "Donation (Free)",
              ],
              ["Submitted", formatDate(request.createdAt)],
            ]}
          />
        </div>

        <div className="card">
          <h2 className="section-title">Requester Information</h2>

          <InfoList
            rows={[
              ["Name", buyer?.name || "Unknown user"],
              ["Account Type", buyerType],
              [
                "University",
                buyer?.role === "student" ? buyer.university : null,
              ],
              ["City", buyer?.city],
            ]}
          />
        </div>
      </div>
      {/* Display the donation purpose only for donation requests. */}
      {request.type === "donation" && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 className="section-title">Purpose of Donation</h2>
          <p>{request.purpose}</p>
        </div>
      )}
      {/* Display the rejection reason only for rejected requests. */}
      {request.status === "rejected" && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 className="section-title">Rejection Reason</h2>
          <p>{request.reason || "No reason provided."}</p>
        </div>
      )}

      {/* I added this to show the confirmation modal when the user clicks "Accept Request" */}
      {showAcceptModal && (
        <ConfirmModal
          title="Accept this request?"
          message={`Are you sure you want to accept the request for ${request.quantity} unit(s) of ${listing.name}?`}
          confirmLabel="Accept Request"
          onConfirm={handleAccept}
          onCancel={() => setShowAcceptModal(false)}
        />
      )}
      {showRejectModal && (
        <ConfirmModal
          title="Reject this request?"
          message="Are you sure you want to reject this request?"
          confirmLabel="Reject Request"
          danger
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
        >
          <TextAreaField
            label="Reason (optional)"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Explain why the request was rejected..."
            maxLength={300}
          />
        </ConfirmModal>
      )}
    </div>
  );
}
