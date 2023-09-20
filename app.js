// CORE PACKAGE/MODULE (Sudah dipasang pada node js)
const fs = require('fs');


// OUR  OWN PACKAGE/MODULE

// THRID PARTY PACKAGE/MODULE (Pelu npm)
const express = require('express');
const morgan = require('morgan');

const app = express();


// middleware express
// memodifikasi incoming request/request body ke api kita
app.use(express.json());
app.use(morgan('dev'));

// OUR OWN MIDDLEWARE
app.use((req, res, next) => {
  console.log(
    "test"
  )
  next();
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.requestTime)
  next();
})

app.use((req, res, next) => {
  if (req.body.role !== admin) {
    return res.status(401).json({
      message: "Kamu tidak boleh akses"
    })
  }

  next();

})
const port = process.env.port || 3000;

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'succes',
    requestTime: req.requestTime,
    data: {
      tours
    }
  })
};

const getTourById = (req, res) => {
  // console.log(req.params);

  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);
  console.log(tour);

  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: `data with ${id} this not found`
    })
  }

  res.status(200).json({
    status: 'succes',
    data: {
      tour
    }
  })
};

const editTour = (req, res) => {
  const id = req.params.id * 1;
  // findIndex = -1 (kalau datanya gak ada)
  const tourIndex = tours.findIndex(el => el.id === id);


  if (tourIndex === -1) {
    return res.status(404).json({
      status: 'failed',
      message: `data with ${id} this not found`
    })
  }

  tours[tourIndex] = { ...tours[tourIndex], ...req.body }
  console.log(tourIndex);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(200).json({
      status: 'success',
      message: `tour with this id ${id} edited`,
      data: {
        tour: tours[tourIndex]
      }
    })
  })
};

const removeTour = (req, res) => {
  // konversi string menjadi number
  const id = req.params.id * 1;

  // cari index dari data yang sesuai id di req.params
  const tourIndex = tours.finsIndex(el => el.id === id);

  // validasi kalau data yang sesuai req.params.id nya gak ada
  if (tourIndex === -1) {
    return res.status(404).json({
      status: 'failed',
      message: 'data not found'
    })
  }

  // proses menghapus data sesuai index arraynya => req.params.id
  tours.splice(tourIndex, 1);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    res.status(200).json({
      status: 'success',
      message: `tour with this id ${id} deleted`,
      data: null
    })
  })
};

const createTour = (req, res) => {
  // console.log(req.body);
  // console.log(req.body.name);

  // generate id untuk data baru dari request api
  const newId = tours[tours.length - 1].id + 1;
  const newData = Object.assign({ id: newId }, req.body);

  tours.push(newData);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    // 201 = created
    res.status(201).json({
      status: 'succes',
      data: {
        tour: newData
      }
    })
  })
  res.send('finish api');

};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTourById);
// app.patch('/api/v1/tours', editTour);
// app.delete('/api/v1/tours/:id', removeTour);
// app.post('/api/v1/tours', createTour);

// ROUTES untuk tour
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTourById)
  .patch(editTour)
  .delete(removeTour);

// ROUTES untuk users
// app
//   .route('/api/v1/users')
//   .get(getAllUsers)
//   .post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .get(getUserById)
//   .patch(editUser)
//   .delete(removeUser);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});