// I start importing the useParams to get ID listing from URL
// , import also the useApp to get access data from shaerd app
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

//import the usestate to mange form input and vaildation state 
import { useState } from 'react';
// I have added alert component to display feedback when the user is not eligible to submit a request.
import { TextField, TextAreaField , Alert} from '../../components/ui.jsx';

// importing the request eligibility and form validation rules 
import { requestEligibility,eligibilityMessage,  validateRequestForm, } from '../../utils/rules.js';

// this component will handle both purchase and donation requests :
export default function RequestForm({ type }) {
    const { id } = useParams(); 
    const { currentUser, users, getListing, createRequest, toast  } = useApp(); // added current User and user to access the current user and shared application data.
    const listing = getListing(id); 
    const isDonation = type === 'donation';
   
    const { allowed, reason } = requestEligibility(  // To check if current user can request this listing.
        currentUser, listing, users );

    //  here i stored the values enterd by the requester 
    const [form, setForm] = useState({
         quantity: '1',
         purpose: '',
        });
    
    const [errors, setErrors] = useState({}); // store field vaildation errors I made it for later use
    const [submitted, setSubmitted] = useState(null); // store the submission status of the form, I made it for later use
    // updating form fields when user types
    const handleChange = (event) => { 
    const { name, value } = event.target;
    const updatedForm = {
    ...form, [name]: value, };
    setForm(updatedForm);
    if (Object.values(errors).some(Boolean) && listing) {
    const validationErrors = validateRequestForm(
      { type, ...updatedForm },
      listing
    );
     setErrors(validationErrors);
  }
};

// This function checks if form is valid and updates the errors state
const handleValidate = () => {
  if (!listing || !allowed) {
    return false;
  }
  const validationErrors = validateRequestForm(
    { type, ...form },
    listing
  );

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
    purpose: isDonation ? form.purpose.trim() : '',
  });
   setSubmitted(request);
    toast('Your request has been submitted successfully.');
};

      return (
    <div className="container page">
      <h1>
        {isDonation ? 'Donation Request' : 'Purchase Request'}
      </h1>

      <p>Listing ID: {id}</p>

      <p> Listing: {listing ? listing.name : 'Listing not found'}  </p>
      {listing && !allowed && (
         <Alert kind="warning">
         {eligibilityMessage(reason, listing.type)}
        </Alert>
    )}

    {/* Implement form submission later.
    For now, prevent the default form submission. */}

      <form
      className="card card-medium stack"
       onSubmit={handleSubmit}
    >

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
        disabled={!allowed ||Boolean(submitted)}
      >
        Submit Request
      </button>

    </form>

    </div>
  );
}
