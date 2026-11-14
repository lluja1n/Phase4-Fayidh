
import { useApp } from "../../context/AppContext.jsx";
import { Link } from "react-router-dom";

export default function MyListings() {

    const { listings, categories, currentUser, removeListing, toast } = useApp();

    const myListings = listings.filter(
        (listing) => listing.ownerId === currentUser?.id
    );

    function getCategoryName(categoryId) {
        const category = categories.find(
            (item) => item.id === categoryId
        );

        return category ? category.name : "Unknown";
    }


    function handleRemove(listingId) {
        const listing = myListings.find(
            (item) => item.id === listingId
        );

        if (!listing || listing.status === "removed") {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to remove "${listing.name}"?`
        );

        if (!confirmed) {
            return;
        }

        removeListing(listingId);
        toast("Listing removed successfully.");
    }


    if (!currentUser) {
        return (
            <section className="page">
                <h1>Login Required</h1>
                <p>Please log in to manage your listings.</p>
                <Link to="/login" className="btn btn-primary">
                    Log In
                </Link>
            </section>
        );
    }

    if (
        currentUser.role !== "organization" ||
        currentUser.status !== "active"
    ) {
        return (
            <section className="page">
                <h1>Access Denied</h1>
                <p>
                    Only active organization accounts can manage listings.
                </p>
            </section>
        );
    }




    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <h1>My Listings</h1>
                    <p>Items your organization is selling or donating.</p>
                </div>

                <Link to="/seller/listings/new" className="btn btn-primary">
                    + Create Listing
                </Link>
            </div>


            {myListings.length === 0 ? (
                <div className="seller-empty-state">
                    <h2>No Listings Yet</h2>
                    <p>
                        You haven't created any listings yet.
                        Start by adding your first surplus material.
                    </p>

                    <Link to="/seller/listings/new" className="btn btn-primary">
                        + Create Your First Listing
                    </Link>
                </div>
            ) : (

                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Type / Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {myListings.map((listing) => (
                                <tr key={listing.id}>
                                    <td>{listing.name}</td>
                                    <td>{getCategoryName(listing.categoryId)}</td>
                                    <td>{listing.quantity}</td>
                                    <td>
                                        <span className={`badge badge-${listing.type}`}>
                                            {listing.type === "sale"
                                                ? "For Sale"
                                                : "For Donation"}
                                        </span>

                                        {listing.type === "sale" && (
                                            <div>SAR {listing.price}</div>
                                        )}
                                    </td>

                                    <td>
                                        <span className={`badge badge-${listing.status}`}>
                                            {listing.status}
                                        </span>
                                    </td>


                                    <td>
                                        <div className="seller-listing-actions">
                                            <Link
                                                to={`/seller/listings/${listing.id}`}
                                                className="btn"
                                            >
                                                View
                                            </Link>


                                            {listing.status !== "removed" ? (
                                                <Link
                                                    to={`/seller/listings/${listing.id}/edit`}
                                                    className="btn"
                                                >
                                                    Edit
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    disabled
                                                >
                                                    Edit
                                                </button>
                                            )}


                                            <button
                                                type="button"
                                                className="btn seller-remove-btn"
                                                onClick={() => handleRemove(listing.id)}
                                                disabled={listing.status === "removed"}
                                            >
                                                Remove
                                            </button>

                                        </div>
                                    </td>


                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

