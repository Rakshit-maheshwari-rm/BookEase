function Lodging() {
    const categories = [
        { name: "HOTELS", icon: "fa-regular fa-building" },
        { name: "VILLAS", icon: "fa-regular fa-house" },
        { name: "APARTMENTS", icon: "fa-solid fa-city" },
        { name: "RESORTS", icon: "fa-solid fa-umbrella-beach" },
        { name: "CABINS", icon: "fa-solid fa-tree" },
        { name: "COTTAGES", icon: "fa-solid fa-campground" }
    ];
    return (
        <div className="border-top border-bottom pt-5 pb-3">
            <div className="container my-3">
                <div className="d-flex flex-wrap justify-content-center gap-5">
                    {categories.map((type,index)=>{
                        return(
                            <div className="style-text d-flex flex-column align-items-center" key={index}>
                                <span className="lodging-icon d-flex align-items-center justify-content-center">
                                    <i className={`${type?.icon} fs-5`}></i>
                                </span>
                                <p className="text-12 mt-2 fw-bold">{type?.name}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Lodging;