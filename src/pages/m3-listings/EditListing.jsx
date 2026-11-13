
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import ListingForm from "./ListingForm.jsx";

export default function EditListing() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { listings, currentUser, updateListing, toast } = useApp();

    const listing = listings.find(
        (item) =>
            item.id === id &&
            item.ownerId === currentUser?.id &&
            item.status !== "removed"
    );

    function handleEdit(data) {
        if (!listing) {
            return;
        }

        updateListing(id, data);
        toast("Listing updated successfully.");
        navigate("/my-listings");
    }

    if (!listing) {
        return (
            <section className="page">
                <h1>Listing not found</h1>
                <p>You cannot edit this listing.</p>
            </section>
        );
    }

    return (
        <section className="page">
            <h1>Edit Listing</h1>
            <p>Update your surplus material information.</p>


            <ListingForm
                initialData={listing}
                onSubmit={handleEdit}
                onCancel={() => navigate("/my-listings")}
                submitLabel="Save Changes"
            />

        </section>
    );
}
