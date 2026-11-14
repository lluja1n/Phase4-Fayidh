// I start importing the useParams to get ID listing from URL
// , import also the useApp to get access data from shaerd app
import { Link, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";

//import the usestate to mange form input and vaildation state
import { useState } from "react";
// I have added alert component to display feedback when the user is not eligible to submit a request.
import {
  TextField,
  TextAreaField,
  Alert,
  EmptyState,
  BackLink,
  Badge,
} from "../../components/ui.jsx";

// importing the request eligibility and form validation rules
import {
  requestEligibility,
  eligibilityMessage,
  validateRequestForm,
} from "../../utils/rules.js";

import { ListingImage } from "../../components/ListingCard.jsx";
import { formatPrice } from "../../data/mockHelpers.js";

// this component will handle both purchase and donation requests :
export default function RequestForm({ type }) {
  const { id } = useParams();
  const { currentUser, users, getListing, createRequest, toast } = useApp(); // added current User and user to access the current user and shared application data.
  const listing = getListing(id);
  // I added the owner variable to get the owner of the listing, if the listing exists. If the listing does not exist, owner will be null.
  const owner = listing
    ? users.find((user) => user.id === listing.ownerId)
    : null;
  const isDonation = type === "donation";
  const expectedType =
    listing?.type === "sale"
      ? "purchase"
      : listing?.type === "donation"
        ? "donation"
        : null;

  const { allowed, reason } = requestEligibility(
    // To check if current user can request this listing.
    currentUser,
    listing,
    users,
  );

  //  here i stored the values enterd by the requester
  const [form, setForm] = useState({
    quantity: "1",
    purpose: "",
  });
  // I added the estimatedTotal variable to calculate the total price of the request based on the quantity and price of the listing. If the request is a donation, the estimated total will be 0.
  const estimatedTotal =
    !isDonation && listing ? Number(form.quantity) * Number(listing.price) : 0;

  const [errors, setErrors] = useState({}); // store field vaildation errors I made it for later use
  const [submitted, setSubmitted] = useState(null); // store the submission status of the form, I made it for later use
  // updating form fields when user types
  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedForm = {
      ...form,
      [name]: value,
    };
    setForm(updatedForm);
    if (Object.values(errors).some(Boolean) && listing) {
      const validationErrors = validateRequestForm(
        { type, ...updatedForm },
        listing,
      );
      setErrors(validationErrors);
    }
  };

  // This function checks if form is valid and updates the errors state
  const handleValidate = () => {
    if (!listing || !allowed) {
      return false;
    }
    // Prevent submitting a request with the wrong type
    if (type !== expectedType) {
      setErrors({
        type: "This request type does not match the listing type.",
      });
      return false;
    }
    const validationErrors = validateRequestForm({ type, ...form }, listing);

    setErrors(validationErrors);

    return !Object.values(validationErrors).some(Boolean);
  };
  // This function handles request submission after validating eligibility and form inputs
  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitted) {
      return;
    }
    if (!handleValidate()) {
      return;
    }
    const request = createRequest({
      listingId: listing.id,
      requesterId: currentUser.id,
      type,
      quantity: Number(form.quantity),
      purpose: isDonation ? form.purpose.trim() : "",
    });
    setSubmitted(request);
    toast("Your request has been submitted successfully.");
  };
  if (!listing) {
    return (
      <div className="container page">
        <EmptyState
          title="Listing Not Found"
          message="The requested listing could not be found."
          action={
            <Link to="/browse" className="btn btn-primary">
              Browse Listings
            </Link>
          }
        />
      </div>
    );
  }
  if (submitted) {
    return (
      <div className="container page">
        <EmptyState
          title="Request Submitted"
          message="Your request has been submitted successfully and is pending review."
          action={
            <Link to="/my-requests" className="btn btn-primary">
              View My Requests
            </Link>
          }
        />
      </div>
    );
  }
  return (
    <div className="container page">
      <h1>{isDonation ? "Donation Request" : "Purchase Request"}</h1>
      {/* I added a back link to the listing page, so the user can easily navigate back to the listing they are requesting.*/}
      <BackLink to={`/listings/${listing.id}`}>Back to Listing</BackLink>
      <div className="card mb">
        <div className="row">
          <div className="listing-thumb lg">
            <ListingImage listing={listing} showType={false} />
          </div>

          <div>
            <h2>{listing.name}</h2>

            <Badge status={listing.type} />

            <p className="muted">{listing.quantity} available</p>

            {owner && <p className="muted">Seller: {owner.name}</p>}

            <p>{isDonation ? "Free Donation" : formatPrice(listing.price)}</p>
          </div>
        </div>
      </div>
      {listing && !allowed && (
        <Alert kind="warning">{eligibilityMessage(reason, listing.type)}</Alert>
      )}
      {/* Display an error when request type does not match listing type */}
      {errors.type && <Alert kind="warning">{errors.type}</Alert>}
      {/* Submit the request after validating eligibility and form inputs. */}
      <form className="card card-medium stack" onSubmit={handleSubmit}>
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          min="1"
          max={listing?.quantity ?? undefined}
          value={form.quantity}
          onChange={handleChange}
          error={errors.quantity}
          required
        />

        {!isDonation && (
          <div className="row-between">
            <span>Estimated Total</span>
            <strong>{formatPrice(estimatedTotal)}</strong>
          </div>
        )}

        {isDonation && (
          <TextAreaField
            label="Purpose of Donation"
            name="purpose"
            placeholder="Explain why you need this donation..."
            value={form.purpose}
            onChange={handleChange}
            error={errors.purpose}
            required
          />
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!allowed || Boolean(submitted)}
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
