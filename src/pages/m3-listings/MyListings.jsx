
import { mockListings } from "../../data/mockListings.js";

export default function MyListings() {
    // Temporary seller ID until login is implemented
    const currentSellerId = "u-org-1";

    // Get listings belonging to this seller
    const myListings = mockListings.filter(
        (listing) => listing.ownerId === currentSellerId
    );

    return (
        <section className="page">
            <h1>My Listings</h1>
            <p>Manage your surplus materials here.</p>

            {myListings.length === 0 ? (
                <p>You have no listings yet.</p>
            ) : (
                myListings.map((listing) => (
                    <div className="card" key={listing.id}>
                        <h2>{listing.name}</h2>

                        <p>Quantity: {listing.quantity}</p>
                        <p>Location: {listing.location}</p>

                        <p>
                            {listing.type === "sale"
                                ? `Price: ${listing.price} SAR`
                                : "Donation"}
                        </p>

                        <span className={`badge badge-${listing.status}`}>
                            {listing.status}
                        </span>
                    </div>
                ))
            )}
        </section>
    );
}
