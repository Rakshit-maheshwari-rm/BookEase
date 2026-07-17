import React from 'react';

const Pagination = ({ activePage, itemsCountPerPage, totalItemsCount, onChange }) => {
    const totalPages = Math.ceil(totalItemsCount / itemsCountPerPage);

    if (totalPages <= 1) return null; // Hide if only 1 page

    return (
        <div className="d-flex justify-content-center align-items-center gap-2">
            {/* Previous Button */}
            <button
                className="btn btn-outline-secondary btn-sm page-link"
                disabled={activePage === 1}
                onClick={() => onChange(activePage - 1)}
            >
                Prev
            </button>

            {/* Page Numbers */}
            <div className="text-white fw-bold mx-3">
                Page {activePage} of {totalPages}
            </div>

            {/* Next Button */}
            <button
                className="btn btn-outline-secondary btn-sm page-link"
                disabled={activePage === totalPages}
                onClick={() => onChange(activePage + 1)}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
