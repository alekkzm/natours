const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new AppError('Not an image! Please upload only images.', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

//upload.single - req.file
//upload.array - req.files
//upload.fields - req.files

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tours-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tours-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      console.log('foreach block start', i);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      console.log('foreach block finish', i);
      //if (!req.body.images) req.body.images = [];
      req.body.images.push(filename);
    })
  );
  console.log('next after foreach');
  next();
});

// const toursFile = `${__dirname}/../dev-data/data/tours-simple.json`;

// const tours = JSON.parse(fs.readFileSync(toursFile));

// exports.checkID = (req, res, next, val) => {
//   const tour = tours.find((x) => x.id == val);
//   if (!tour) {
//     return res.status(404).send({ status: 'fail', message: 'Invalid ID' });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'Missing name or price' });
//   }
//   next();
// };

// const catchAsync = fn => {
//   return async (...args) => {
//     try {
//       await fn.call(this, args)
//     } catch (err) {
//       throw new AppError()
//     }
//   }
// }

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //try {

//   let features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sortBy()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).send({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // } catch (err) {
//   //   res.status(400).json({ status: 'fail', message: err.message || err });
//   // }
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // try {
//   // console.log(req.params.id);
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404));

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
//   // } catch (err) {
//   //   res.status(404).json({ status: 'fail', message: err });
//   // }
// });

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   // try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err.message || 'Invalid data sent!',
//   //   });
//   // }
// });

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404));

//   res.status(200).json({
//     status: 'success',
//     data: { tour: tour },
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err.message || err,
//   //   });
//   // }
// });

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404));

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err.message || err,
//   //   });
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message || err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //[ {a, b, startDates: [c, d]} ] => [{a, b, startDates: c} , {a, b, startDates: d}]
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numTourStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });

  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message || err,
  //   });
  // }
});

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); //latlng=34.102179,-118.046165

  if (!lat || !lng) return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // Earth radius = 3963.2(mi) or 6378.1(km)
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: { //calculate distance from point "latlng"
        near: {
          type: 'Point',
          coordinates: [+lng, +lat]
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001
      }
    },
    {
      $project: { //keep only distance and name fields
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { distances }
  });
});
