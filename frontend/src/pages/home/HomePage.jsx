import Accommodations from "./Accommodations";
import Collections from "./Collections";
import Hero from "./Hero";
import Listings from "./Listings";
import Lodging from "./Lodging";
import Newsletter from "./Newsletter";
import Review from "./Review";
import '../Style.css';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

function HomePage() {
    const [listingData, setListingData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/listing/all?limit=15`).then((res) => {
            setListingData(res.data.listing);
            setLoading(false);
        }).catch((err) => {
            toast.error('Error while fetching data');
            setLoading(false);
        })
    }, []);
    return (
        <>
            <Hero />
            <Collections listings={listingData} loading={loading} />
            <Accommodations listings={listingData} loading={loading} />
            <Lodging />
            <Listings listings={listingData} loading={loading} />
            <Review />
            <Newsletter />
        </>
    )
}

export default HomePage;