class APIFeatures {
    constructor(query, queryString) {
        const { page = 1, limit = 100, sort, fields, ...queryObj } = queryString;
        this.query = query;
        //this.queryString = queryString;
        this.page = page;
        this.limit = limit;
        this.sort = sort;
        this.fields = fields;
        this.queryObj = queryObj;
    }

    filter() {
        Object.values(this.queryObj).forEach(o => {
            if (typeof o === "object") {
                delete Object.assign(o, { [`\$${Object.keys(o)[0]}`]: Object.values(o)[0] })[Object.keys(o)[0]]
            }
        })

        this.query = this.query.find(this.queryObj);

        return this;
    };

    sortBy() {
        if (this.sort) {
            this.query = this.query.sort(this.sort.split(',').join(' '))
        } else {
            this.query = this.query.sort('-createdAt')
        }

        return this;
    };

    limitFields() {
        if (this.fields) {
            this.query = this.query.select(this.fields.split(',').join(' '))
        } else {
            this.query = this.query.select('-__v')
        }

        return this;
    }

    paginate() {
        this.query = this.query.skip((this.page - 1) * this.limit).limit(+this.limit);

        // if (this.page) {
        //   const numTours = await Tour.countDocuments();
        //   if (((this.page - 1) * this.limit) >= numTours) {
        //     throw new Error('This page does not exist')
        //   }
        // }

        return this;
    }
}

module.exports = APIFeatures