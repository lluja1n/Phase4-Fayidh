import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import ListingForm from "./ListingForm.jsx";

export default function CreateListing() {
    const navigate = useNavigate();
    const { currentUser, createListing, toast } = useApp();

    function handleCreate(data) {
        if (!currentUser ||
            currentUser.role !== "organization" ||
            currentUser.status !== "active") {
            toast("Please log in with an active organization account.", "error");
            return;
        }

        createListing({
            ...data,
            ownerId: currentUser.id
        });

        toast("Listing created successfully.");
        navigate("/my-listings");
    }

    return (
        <section className="page">
            <h1>Create Listing</h1>
            <p>Describe your surplus material.</p>


            <ListingForm
                onSubmit={handleCreate}
                onCancel={() => navigate("/my-listings")}
                submitLabel="Publish Listing"
            />

        </section>
    );
}
