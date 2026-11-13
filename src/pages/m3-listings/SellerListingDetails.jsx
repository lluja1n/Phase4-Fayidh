import { useApp } from "../../context/AppContext.jsx";
import "./SellerListings.css";
import { Link, useParams } from "react-router-dom";

export default function SellerListingDetails() {

    const { id: listingId } = useParams();
    const { listings, categories, currentUser } = useApp();


    const listing = listings.find(
        (item) =>
            currentUser?.role === "organization" &&
            currentUser?.status === "active" &&
            item.id === listingId &&
            item.ownerId === currentUser.id
    );


    // Show a mesage if the listing not exist
    if (!listing) {
        return (
            <section className="page">
                <h1>Listing not found</h1>
            </section>
        );
    }

    // Find the category name
    const category = categories.find(
        (item) => item.id === listing.categoryId
    );


    return (
        <section className="page">
            <Link to="/my-listings" className="back-link">
                ← Back to My Listings
            </Link>
            <h1>{listing.name}</h1>

            <div className="card">
                <div className="seller-details-layout">
                    <div className="listing-photo">
                        {listing.images.length > 0 ? (
                            <img
                                src={listing.images[0]}
                                alt={listing.name}
                            />
                        ) : (
                            <span>No image available</span>
                        )}
                    </div>

                    <div className="seller-details-info">
                        <p>Category: {category?.name || "Unknown"}</p>
                        <p>Quantity: {listing.quantity}</p>
                        <p>Condition: {listing.condition}</p>
                        <p>Location: {listing.location}</p>

                        <p>
                            {listing.type === "sale"
                                ? `Price: SAR ${listing.price}`
                                : "For Donation"}
                        </p>

                        <p>Description: {listing.description}</p>

                        <span className={`badge badge-${listing.status}`}>
                            {listing.status}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );

}
