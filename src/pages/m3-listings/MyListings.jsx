
import { mockListings } from "../../data/mockListings.js";
import { Link } from "react-router-dom";
import { mockCategories } from "../../data/mockCategories.js";
export default function MyListings() {
    // Temporary seller ID until login is implemented
    const currentSellerId = "u-org-1";

    // Get listings belonging to this seller
    const myListings = mockListings.filter(
        (listing) => listing.ownerId === currentSellerId
    );

    return (
        <section className="page">
            <div className="page-header">
                <div>
                    <h1>My Listings</h1>
                    <p>Items your organization is selling or donating.</p>
                </div>

                <Link to="/listings/new" className="btn btn-primary">
                    + Create Listing
                </Link>
            </div>

            {myListings.length === 0 ? (
                <p>You have no listings yet.</p>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function getCategoryName(categoryId) {
    const category = mockCategories.find(
        (category) => category.id === categoryId
    );

    return category ? category.name : "Unknown";
}