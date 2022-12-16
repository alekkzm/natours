const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!doc) return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));

    res.status(200).json({
        status: 'success',
        data: { [(Model.modelName || 'data').toLowerCase()]: doc },
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { [(Model.modelName || 'data').toLowerCase()]: doc },
    });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query.populate('reviews');

    if (!doc) return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));

    res.status(200).json({
        status: 'success',
        data: {
            [(Model.modelName || 'data').toLowerCase()]: doc,
        },
    });
});

exports.getAll = (Model, findOptions = {}) => catchAsync(async (req, res, next) => {
    const fo = typeof findOptions === 'function' ? findOptions(req, res) : findOptions;
    let features = new APIFeatures(Model.find(fo), req.query)
        .filter()
        .sortBy()
        .limitFields()
        .paginate();
    const docs = await features.query;

    res.status(200).send({
        status: 'success',
        results: docs.length,
        data: {
            [`${(Model.modelName || 'data').toLowerCase()}s`]: docs,
        },
    });
});