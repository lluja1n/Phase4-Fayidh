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

    if (!currentUser) {
        return (
            <section className="page">
                <h1>Login Required</h1>
                <p>Please log in to create a listing.</p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/login")}
                >
                    Log In
                </button>
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
                <p>Only active organizations can create listings.</p>
            </section>
        );
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
