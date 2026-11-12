// I start importing the useParams to get ID listing from URL
// , import also the useApp to get access data from shaerd app
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

//import the usestate to mange form input and vaildation state and the TextField and TextAreaField components to render the form inputs
import { useState } from 'react';
import { TextField, TextAreaField } from '../../components/ui.jsx';

// this component will handle both purchase and donation requests :
export default function RequestForm({ type }) {
    const { id } = useParams(); 
    const { getListing } = useApp();
    const listing = getListing(id);
    const isDonation = type === 'donation';

    //  here i stored the values enterd by the requester 
    const [form, setForm] = useState({
         quantity: '1',
         purpose: '',
        });
    
    const [errors, setErrors] = useState({}); // store field vaildation errors I made it for later use
    // updating form fields when user types
    const handleChange = (event) => { 
    const { name, value } = event.target;
    setForm((previousForm) => ({
         ...previousForm,
         [name]: value,
        }));
    };

      return (
    <div className="container page">
      <h1>
        {isDonation ? 'Donation Request' : 'Purchase Request'}
      </h1>

      <p>Listing ID: {id}</p>

      <p> Listing: {listing ? listing.name : 'Listing not found'}  </p>

    {/* Implement form submission later.
    For now, prevent the default form submission. */}
    
      <form
      className="card card-medium stack"
      onSubmit={(event) => event.preventDefault()}
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
        disabled
      >
        Submit Request
      </button>

    </form>

    </div>
  );
}
