import { useState } from "react";
import { CONDITIONS } from "../../data/mockListings.js";
import { mockCategories } from "../../data/mockCategories.js";
import "./SellerListings.css";
export default function ListingForm({
    initialData = {},
    onSubmit,
    onCancel,
    submitLabel = "Publish Listing"
}) {
    const [formData, setFormData] = useState({

        type: initialData.type || "",
        price: initialData.price ?? "",
        name: initialData.name || "",
        categoryId: initialData.categoryId || "",
        quantity: initialData.quantity ?? "",
        condition: initialData.condition || "",
        location: initialData.location || "",
        description: initialData.description || "",
        images: initialData.images || []

    });
    const [errors, setErrors] = useState({});


    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
            ...(name === "type" && value === "donation"
                ? { price: "" }
                : {})
        });

        // Clear error whenuser changes a field
        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
            ...(name === "type" && value === "donation"
                ? { price: "" }
                : {})
        }));
    }


    async function handleImageChange(event) {
        const files = Array.from(event.target.files);

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (formData.images.length + files.length > 5) {
            setErrors((prev) => ({
                ...prev,
                images: "You can upload up to 5 images."
            }));
            event.target.value = "";
            return;
        }

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setErrors((prev) => ({
                    ...prev,
                    images: "Unsupported image format. Please upload a valid image file."
                }));
                event.target.value = "";
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    images: "Image exceeds the maximum allowed file size."
                }));
                event.target.value = "";
                return;
            }
        }

        setErrors((prev) => ({
            ...prev,
            images: ""
        }));


        // Convert valid images to Data URLs
        try {
            const imageUrls = await Promise.all(
                files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error("Image could not be read."));

                        reader.readAsDataURL(file);
                    });
                })
            );

            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, ...imageUrls]
            }));
        } catch {
            setErrors((prev) => ({
                ...prev,
                images: "Unable to read images. Please try again."
            }));
        }

        event.target.value = "";

    }


    function validateForm() {
        const newErrors = {};

        if (!formData.type) {
            newErrors.type = "Please select a listing type.";
        }

        if (formData.type === "sale" &&
            (!formData.price || Number(formData.price) <= 0 ||
                !Number.isFinite(Number(formData.price)))) {
            newErrors.price = "Please enter a valid price.";
        }

        if (!formData.name.trim()) {
            newErrors.name = "Item / material name is required.";
        }

        if (!formData.categoryId) {
            newErrors.categoryId = "Please select a category.";
        }

        if (!Number.isInteger(Number(formData.quantity)) ||
            Number(formData.quantity) <= 0) {
            newErrors.quantity = "Quantity must be a positive number.";
        }

        if (!formData.condition) {
            newErrors.condition = "Please select a condition.";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }





    function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const listingData = {
            ...formData,
            quantity: Number(formData.quantity),
            price: formData.type === "sale"
                ? Number(formData.price)
                : null
        };

        if (onSubmit) {
            onSubmit(listingData);
        }
    }




    return (
        <form onSubmit={handleSubmit} noValidate className="card seller-listing-form">

            <h2>Listing Type</h2>

            <div className="form-group">
                <label htmlFor="type">Listing Type *</label>

                <select
                    id="type"
                    name="type"
                    className={`form-select ${errors.type ? "input-error" : ""}`}
                    value={formData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select listing type</option>
                    <option value="sale">For Sale</option>
                    <option value="donation">For Donation</option>
                </select>
                {errors.type && (
                    <span className="form-error">{errors.type}</span>
                )}
            </div>

            {formData.type === "sale" && (
                <div className="form-group">
                    <label htmlFor="price">Price per unit (SAR) *</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        className={`form-input ${errors.price ? "input-error" : ""}`}
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                    {errors.price && (
                        <span className="form-error">{errors.price}</span>
                    )}
                </div>
            )}

            <h2>Item Information</h2>

            <div className="form-group">
                <label htmlFor="name">Item / Material Name *</label>
                <input
                    id="name"
                    name="name"
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                {errors.name && (
                    <span className="form-error">{errors.name}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="categoryId">Category *</label>
                <select
                    id="categoryId"
                    name="categoryId"
                    className={`form-select ${errors.categoryId ? "input-error" : ""}`}
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select category</option>
                    {mockCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.categoryId && (
                    <span className="form-error">{errors.categoryId}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    className={`form-input ${errors.quantity ? "input-error" : ""}`}
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />
                {errors.quantity && (
                    <span className="form-error">{errors.quantity}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="condition">Condition *</label>
                <select
                    id="condition"
                    name="condition"
                    className={`form-select ${errors.condition ? "input-error" : ""}`}
                    value={formData.condition}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select condition</option>
                    {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                            {condition}
                        </option>
                    ))}
                </select>
                {errors.condition && (
                    <span className="form-error">{errors.condition}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                    id="location"
                    name="location"
                    className={`form-input ${errors.location ? "input-error" : ""}`}
                    value={formData.location}
                    onChange={handleChange}
                    required
                />
                {errors.location && (
                    <span className="form-error">{errors.location}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="description">Description (optional)</label>
                <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            {/* Listing images */}
            <div className="form-group">
                <label htmlFor="images">Listing Images</label>

                <p>JPG, PNG or WEBP - Max 2 MB each - Up to 5 images</p>

                <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="seller-file-input"
                    onChange={handleImageChange}
                />
                {errors.images && (
                    <span className="form-error">{errors.images}</span>
                )}

                {/* Image Previews */}
                <div className="seller-image-previews">
                    {formData.images.map((image, index) => (
                        <div className="seller-image-preview" key={index}>
                            <img src={image} alt={`Listing preview ${index + 1}`} />

                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        images: prev.images.filter((_, i) => i !== index)
                                    }));
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

            </div>


            {Object.values(errors).some((error) => error !== "") && (
                <p className="form-error">
                    Please correct the highlighted fields before publishing.
                </p>
            )}


            <div className="seller-listing-actions">
                <button
                    type="button"
                    className="btn"
                    onClick={onCancel}
                >
                    Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                    {submitLabel}
                </button>
            </div>

        </form>
    );
}
