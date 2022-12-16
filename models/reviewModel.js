const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
});


reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    // this.populate('tour', 'name').populate('user', 'name photo');
    this.populate('user', 'name photo');
    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    //in static method "this" points to model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log({ stats })
    if (stats && Array.isArray(stats) && stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        });
    }
}

reviewSchema.post('save', function () {
    //"this" points to current review, "this".constructor to review model
    this.constructor.calcAverageRatings(this.tour); // i can use mongoose.models['Review']
})

//hint: how to use static method on query middlware
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next()
})
reviewSchema.post(/^findOneAnd/, function () {
    //const r = await this.findOne(); //if I use findOneAndDelete, review is no longer exists here, and r equals null
    //i think, don't need to await here
    mongoose.models['Review'].calcAverageRatings(this.r.tour); //instead of mongoose.models['Review'] , i can use this.r.constructor
})

module.exports = mongoose.model('Review', reviewSchema);