const currentState = {
    limit: Number(localStorage.getItem('limit')) || 10,
    page: 1,
    totalPages: 1,
    filters: {},
    sort: 'date',

    setLimit(newLimit) {
        this.limit = newLimit;
        localStorage.setItem('limit', newLimit);
    },

    setParams(params) {
        const { sort, page, limit, ...restFilters } = params;

        if (limit) this.limit = limit;
        if (page) this.page = page;
        if (sort) this.sort = sort;
        this.filters = restFilters;
    },

    getQueryParams() {
        const params = {
            limit: this.limit,
            page: this.page,
            sort: this.sort,
            ...this.filters
        };
        
        return params;
    },

    reset() {
        this.page = 1;
        this.totalPages = 1;
        this.sort = 'date';
        this.filters = {};
    }
};

export default currentState;