import { useState } from 'react';

export const usePagination = (dataArray = [], itemsPerPage = 2) => {
    const [activePage, setActivePage] = useState(1);

    // 1. Calculate which items to show
    const indexOfLastItem = activePage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // 2. Slice the array
    const currentItems = dataArray.slice(indexOfFirstItem, indexOfLastItem);

    // 3. Handle page changes
    const handlePageChange = (pageNumber) => setActivePage(pageNumber);

    return {
        activePage,
        currentItems,
        handlePageChange,
        totalItems: dataArray.length,
        itemsPerPage
    };
};
