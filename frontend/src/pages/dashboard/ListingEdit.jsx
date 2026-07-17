import { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";

function ListingEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        type: "house",
        address: "",
        city: "",
        state: "",
        country: "",
        code: "",
        description: "",
        inventory: 1,
        personsPerRoom: "",
        bedrooms: "",
        bathrooms: "",
        pricing: {
            price: "",
            cleaningFee: "",
            serviceFee: ""
        },
        amenities: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (["price", "cleaningFee", "serviceFee"].includes(name)) {
            setForm((prev) => ({
                ...prev,
                pricing: { ...prev.pricing, [name]: value }
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleAmenity = (amenity) => {
        setForm(prev => {
            const amenities = prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity];
            return { ...prev, amenities };
        });
    };

    const [coverImage, setCoverImage] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [galleryImage, setGalleryImage] = useState([null, null, null, null]);
    const [galleryImageFiles, setGalleryImageFiles] = useState([null, null, null, null]);

    const handleCoverImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImageFile(file);
            setCoverImage(URL.createObjectURL(file));
        }
    };

    const handleGalleryImage = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const updatedFiles = [...galleryImageFiles];
            updatedFiles[index] = file;
            setGalleryImageFiles(updatedFiles);

            const updated = [...galleryImage];
            updated[index] = URL.createObjectURL(file);
            setGalleryImage(updated);
        }
    };

    const categories = [
        "Luxury Villa", "Beachfront", "Mountain Cabin", "Urban Apartment",
        "Countryside Cottage", "Boutique Hotel", "Treehouse", "Farmhouse",
        "Chalet", "Houseboat", "Mansion", "Castle", "Glamping", "Tiny Home",
        "Camper/RV", "Yurt", "Barn", "Windmill", "Lighthouse", "Cave",
        "Igloo", "Riad", "Trullo", "Ryokan", "Shepherd's Hut", "Tent",
        "Dome", "Earthhouse"
    ];
    const commonAmenities = [
        "High-speed WiFi", "Infinity Pool", "Gourmet Kitchen", "Private Gym",
        "Ocean View", "Free Parking", "Air Conditioning", "Dedicated Workspace",
        "Hot Tub", "BBQ Grill", "Pet Friendly", "Indoor Fireplace",
        "Washing Machine", "Dryer", "TV with Standard Cable", "EV Charger",
        "Heating", "First Aid Kit", "Fire Extinguisher", "Smoke Alarm",
        "Carbon Monoxide Alarm", "Coffee Maker", "Refrigerator", "Dishwasher",
        "Microwave", "Oven", "Stove", "Balcony", "Patio", "Garden",
        "Beach Access", "Ski-in/Ski-out", "Hammock", "Outdoor Shower",
        "Jacuzzi", "Sauna", "Home Theater", "Pool Table", "Foosball Table",
        "Ping Pong Table", "Tennis Court", "Basketball Court", "Volleyball Court"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("type", form.type);
        formData.append("address", form.address);
        formData.append("city", form.city);
        formData.append("state", form.state);
        formData.append("country", form.country);
        formData.append("code", form.code);
        formData.append("description", form.description);
        formData.append("personsPerRoom", form.personsPerRoom);
        formData.append("bedrooms", form.bedrooms);
        formData.append("bathrooms", form.bathrooms);
        formData.append("inventory", form.inventory);
        formData.append("price", form.pricing.price);
        formData.append("cleaningFee", form.pricing.cleaningFee);
        formData.append("serviceFee", form.pricing.serviceFee);
        formData.append("amenities", JSON.stringify(form.amenities));

        if (coverImageFile) {
            formData.append("mainImage", coverImageFile);
        }

        galleryImageFiles.forEach(file => {
            if (file) {
                formData.append("gallery", file);
            }
        });

        try {
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/listing/${id}`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("Listing Updated Successfully");
                navigate('/dashboard/listings');
            } else {
                toast.error("Failed to Updated Listing");
            }
        } catch (error) {
            toast.error("Failed to Updated Listing");
        }
    };

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/${id}`, { withCredentials: true }).then((res) => {
            if (res.data.success && res.data.result) {
                const listing = res.data.result;

                if (listing.amenities) {
                    if (typeof listing.amenities === 'string') {
                        try { listing.amenities = JSON.parse(listing.amenities); } catch (e) { }
                    } else if (Array.isArray(listing.amenities) && listing.amenities.length === 1 && typeof listing.amenities[0] === 'string' && listing.amenities[0].startsWith('[')) {
                        try { listing.amenities = JSON.parse(listing.amenities[0]); } catch (e) { }
                    }
                }

                setForm(listing);

                if (listing.images) {
                    if (listing.images.mainImage) {
                        const mainImagePath = listing.images.mainImage.replace(/\\/g, "/").replace(/^uploads\//, "");
                        setCoverImage(mainImagePath?.startsWith?.('http') ? mainImagePath : `${import.meta.env.VITE_BACKEND_URL}/uploads/${mainImagePath}`);
                    }

                    if (listing.images.gallery) {
                        const initialGallery = [null, null, null, null];
                        listing.images.gallery.forEach((img, index) => {
                            if (index < 4) {
                                const galleryPath = img.replace(/\\/g, "/").replace(/^uploads\//, "");
                                initialGallery[index] = galleryPath?.startsWith?.('http') ? galleryPath : `${import.meta.env.VITE_BACKEND_URL}/uploads/${galleryPath}`;
                            }
                        });
                        setGalleryImage(initialGallery);
                    }
                }
            }
        }).catch((err) => {
            toast.error("Failed to get Listing");
        });
    }, [id]);

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-lg-12">
                    <div className="auth-card p-5 rounded-4">
                        <div className="text-center mb-5">
                            <span className="host-badge mb-3">CREATE YOUR LISTING</span>
                            <h2 className="display-5 fw-bold text-white mt-2">List Your Property</h2>
                            <p className="text-midwhite">Share your beautiful space with travelers from around the world.</p>
                        </div>

                        <form className="user-data-form" onSubmit={handleSubmit}>
                            <h3 className="mb-4">Basic Information</h3>
                            <div className="row">
                                <div className="col-md-8 mb-4">
                                    <label className="form-label">Property Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control"
                                        placeholder="e.g. The Azure Sanctuary Resort & Spa"

                                        value={form.title}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Category</label>
                                    <select
                                        name="type"
                                        className="form-select"
                                        value={form.type}
                                        onChange={handleChange}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Full Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    placeholder="123 Ocean View Drive, Palm Cove, Queensland, Australia"

                                    value={form.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="row">
                                <div className="col-6 b-4">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        placeholder="Palm Cove"

                                        value={form.city}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-6 mb-4">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-control"
                                        placeholder="Queensland"

                                        value={form.state}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 mb-4">
                                    <label className="form-label">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        className="form-control"
                                        placeholder="Australia"

                                        value={form.country}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-6 mb-4">
                                    <label className="form-label">Pin Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        className="form-control"
                                        placeholder="4871"

                                        value={form.code}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder="Describe the unique features, atmosphere, and surroundings of your sanctuary..."

                                    value={form.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <h3 className="mb-4 mt-5">Pricing & Capacity</h3>
                            <div className="row">
                                <div className="col-md-3 mb-4">
                                    <label className="form-label">Price per Night (INR)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        placeholder="850"

                                        value={form.pricing.price}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-4">
                                    <label className="form-label">Max Guests</label>
                                    <input
                                        type="number"
                                        name="personsPerRoom"
                                        className="form-control"

                                        value={form.personsPerRoom}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-4">
                                    <label className="form-label">Bedrooms</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        className="form-control"

                                        value={form.bedrooms}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3 mb-4">
                                    <label className="form-label">Bathrooms</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        className="form-control"

                                        value={form.bathrooms}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Cleaning Fee ($)</label>
                                    <input
                                        type="number"
                                        name="cleaningFee"
                                        className="form-control"
                                        placeholder="e.g. 120"

                                        value={form.pricing.cleaningFee}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Service Fee ($)</label>
                                    <input
                                        type="number"
                                        name="serviceFee"
                                        className="form-control"
                                        placeholder="e.g. 100"

                                        value={form.pricing.serviceFee}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-4 mb-4">
                                    <label className="form-label">Total Inventory</label>
                                    <input
                                        type="number"
                                        name="inventory"
                                        className="form-control"
                                        min="1"
                                        value={form.inventory}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <h3 className="mb-4 mt-5">Amenities</h3>
                            <div className="d-flex flex-wrap gap-3 mb-4">
                                {commonAmenities.map(amenity => {
                                    const isSelected = form.amenities?.includes(amenity);
                                    return (
                                        <div
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`amenities-card px-3 py-2 cursor-pointer border rounded-3 d-flex align-items-center gap-2 ${isSelected ? 'border-primary bg-primary bg-opacity-10 opacity-100' : 'border-secondary opacity-75'}`}
                                            style={{ transition: 'all 0.3s ease' }}
                                        >
                                            <i className={`fa-solid ${isSelected ? 'fa-circle-check text-primary' : 'fa-circle text-secondary text-opacity-25'}`}></i>
                                            <span className="text-14 text-white">{amenity}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <h3 className="mb-4 mt-5">Visual Representation</h3>
                            <div className="mb-4">
                                <label className="form-label">Main Cover Image</label>
                                <div className="upload-area border-dashed rounded-4 p-5 text-center position-relative cursor-pointer" style={{ minHeight: '250px' }}>
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt="Cover Preview"
                                            className="w-100 h-100 object-fit-cover rounded-4"
                                        />
                                    ) : (
                                        <div className="py-4">
                                            <i className="fa-solid fa-cloud-arrow-up fs-1 text-primary mb-3"></i>
                                            <p className="text-white fw-bold mb-1">Click to upload cover image</p>
                                            <p className="text-12">PNG, JPG or WEBP (Max. 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                        accept="image/*"

                                        onChange={handleCoverImage}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <label className="form-label mb-3">Gallery Images (4 )</label>
                                {[1, 2, 3, 4].map((item, index) => (
                                    <div key={index} className="col-md-3 mb-4">
                                        <div className="upload-area border-dashed rounded-3 p-3 text-center position-relative cursor-pointer" style={{ height: '150px' }}>

                                            {galleryImage[index] ? (
                                                <img
                                                    src={galleryImage[index]}
                                                    alt="Gallery Preview"
                                                    className="w-100 h-100 object-fit-cover rounded-3"
                                                />
                                            ) : (
                                                <div className="h-100 d-flex flex-column align-items-center justify-content-center">
                                                    <i className="fa-solid fa-plus text-primary mb-2"></i>
                                                    <p className="text-12 mb-0">Upload</p>
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                                                accept="image/*"
                                                onChange={(e) => handleGalleryImage(index, e)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-5">
                                <button type="submit" className="btn btn-primary px-5 py-3 fw-bold fs-5 rounded-pill shadow-lg">
                                    Publish Your Listing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListingEdit;