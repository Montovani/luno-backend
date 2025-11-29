const verifyToken = require("../middlewares/auth.middleware");
const Booking = require("../models/Booking.model");

const router = require("express").Router();

module.exports = router;

// Create a new booking
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { host, message, petCared, dateStart, dateEnd } = req.body;
    const startBooking = new Date(dateStart);
    const endBooking = new Date(dateEnd);

    // Guard Clause for pet (Don't want to the user increase the maximum amount  on proporse, for a friend for example)
    if (!petCared || petCared.length === 0 || petCared.length > 5) {
      res
        .status(400)
        .json({
          errorMessage: "The booking must containe between 1 and 5 pets",
        });
      return;
    }

    // Guard Clauses for date
    if (!dateStart || !dateEnd) {
      res.status(400).json({ errorMessage: "not a valid date" });
      return;
    }

    if (startBooking.getTime() === endBooking.getTime()) {
      res
        .status(400)
        .json({ errorMessage: "date end and date start cannot be equal" });
      return;
    }
    if (endBooking.getTime() < startBooking.getTime()) {
      res
        .status(400)
        .json({ errorMessage: "dateEnd cannot be less than dateStart" });
      return;
    }

    const millisecondsInDay = 86400000;
    const totalDays =
      (endBooking.getTime() - startBooking.getTime()) / millisecondsInDay + 1;

    // Calculate the lunies based in  the date and total of pets (length)
    const luniesBooking = petCared.length * totalDays * 10;
    console.log(luniesBooking);

    // Add the total of lunies in the document creation
    await Booking.create({
      requester: req.payload._id,
      host,
      lunies: luniesBooking,
      message,
      dateStart,
      dateEnd,
      petCared,
    });
    res.status(200).json({ message: "Booking created!" });
  } catch (error) {
    next(error);
  }
});

// Get all the bookings from a user
router.get("/user/:userId", verifyToken, async (req, res, next) => {
  try {
    //verify the token and userId
    if (req.params.userId !== req.payload._id) {
      res
        .status(403)
        .json({ message: "User not allowed to see this information" });
      return;
    }
    const userBooking = await Booking.find({
      $or: [{ host: req.payload._id }, { requester: req.payload._id }],
    })
      .populate("petCared")
      .populate("review");
    res.status(200).json(userBooking);
  } catch (error) {
    next(error);
  }
});

// Update a booking
router.patch("/:bookingId", verifyToken, async (req, res, next) => {
  try {
    
    const bookingHostReq = await Booking.findById(req.params.bookingId).select('host requester')

    if (!bookingHostReq.requester.equals(req.payload._id) && !bookingHostReq.host.equals(req.payload._id) ) {
      res
        .status(403)
        .json({ errorMessage: "Not allowed to update this booking" });
      return;
    }

    const allowedFields = ['status']
    const receivedFields = Object.keys(req.body)
    
    const invalidFields = receivedFields.filter((field)=>{
        return !allowedFields.includes(field)
    })

    const validFields = receivedFields.filter((field)=>{
        return allowedFields.includes(field)
    })

    if(validFields.length === 0){
        res.status(400).json({
            message: 'No valid fields to update',
            fieldsSent: invalidFields,
            allowedFields,
        })
        return
    }

    const status = req.body.status;


    await Booking.findByIdAndUpdate(bookingHostReq._id,{
        status,
    },{runValidators: true})

    if(invalidFields.length > 0){
            res.status(400).json({
            message: 'Booking updated with valid fields',
            warning: 'Some  fields were ignored due to permission',
            ignoredFields: invalidFields
        })
    } else {
        res.status(200).json({message: 'Booking updated'})
    }
  } catch (error) {
    next(error)
  }
});

// Delete booking
router.delete('/:bookingId',verifyToken,async(req,res,next)=>{
    try {  
    const bookingRequester = await Booking.findById(req.params.bookingId).select('host requester')

    if (!bookingRequester.requester.equals(req.payload._id)) {
      res
        .status(403)
        .json({ errorMessage: "Not allowed to delete this booking" });
      return;
    }
    await Booking.findByIdAndDelete(req.params.bookingId)
    res.status(200).json({message: "Booking deleted!"})
    } catch (error) {
     next(error)   
    }
})

//Get information about a booking
router.get('/:bookingId', verifyToken,async(req,res,next)=>{
    try {
        const bookingHostReq = await Booking.findById(req.params.bookingId).select('host requester')

        if(!bookingHostReq){
            res.status(400).json({errorMessage: 'Booking not found'})
        }

        if (!bookingHostReq.requester.equals(req.payload._id) && !bookingHostReq.host.equals(req.payload._id) ) {
        res
            .status(403)
            .json({ errorMessage: "Not allowed to see the information of this Booking" });
        return;
        }
        const bookingInfo = await Booking.findById(req.params.bookingId)
        .populate('host', 'name city homeInformation homeType avatar petsCategoryAllowed coordinates')
        .populate('requester','name city avatar ')
        .populate('petCared')
        .populate('review')

        res.status(200).json(bookingInfo)
    } catch (error) {
        next(error)
    }
})
