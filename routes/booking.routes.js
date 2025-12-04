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
    // TODO - After MVP I might delete the time on it and geet only the date.

    // Guard Clause for pet (Don't want to the user increase the maximum amount  on proporse, for a friend for example)
    if (!petCared || petCared.length === 0 || petCared.length > 5) {
      res.status(400).json({
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
      dateStart: startBooking,
      dateEnd: endBooking,
      petCared,
    });
    res.status(200).json({ message: "Booking created!" });
  } catch (error) {
    next(error);
  }
});

// Get all the bookings from a user
router.get("/user", verifyToken, async (req, res, next) => {
  try {
    const userBooking = await Booking.find({
      $or: [{ host: req.payload._id }, { requester: req.payload._id }],
    }).populate("petCared");
    res.status(200).json(userBooking);
  } catch (error) {
    next(error);
  }
});

// Update a booking - Change to be only the change of the status. make conditions based on host, requester. Go back after MVP.
router.patch("/:bookingId", verifyToken, async (req, res, next) => {
  try {
    // Make conditions
    const bookingHostReq = await Booking.findById(req.params.bookingId).select(
      "host requester status dateStart dateEnd"
    );

    const isRequester = bookingHostReq.requester.equals(req.payload._id);
    const isHost = bookingHostReq.host.equals(req.payload._id);
    const currentStatus = bookingHostReq.status;
    const newStatus = req.body.status;
    const today = new Date();
    today.setUTCDate(12)
    today.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(bookingHostReq.dateStart);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(bookingHostReq.dateEnd);
    endDate.setUTCHours(0, 0, 0, 0);

    const isHappeningBooking = today >= startDate && today <= endDate;
    const isAfterEndBooking = today >= endDate; // Also includes the endDate
    const isBeforeStartBooking = today < startDate; //not include startDate

    console.log("requester",isRequester)
    console.log("host",isHost)
    console.log('today',today)
    console.log("Date Start:", startDate)
    console.log("Date end", endDate)
    console.log("isHappening", isHappeningBooking)
    console.log("isAfter",isAfterEndBooking)
    console.log("isBefore", isBeforeStartBooking)
    console.log("Current Status",currentStatus)
    console.log("newStatus",newStatus)

    if (!isRequester && !isHost) {
      res
        .status(403)
        .json({ errorMessage: "Not allowed to update this booking" });
      return;
    }

    //Change to confirmed
    if (newStatus === "confirmed") {
      if (!isHost) {
        return res.status(403).json({ errorMessage: 'Only the host can confirm the booking' });
      }
      if (currentStatus !== "pending") {
        return res.status(400).json({ errorMessage: 'Booking must be pending to confirm' });
      }
      if (!isBeforeStartBooking) {
        return res.status(400).json({ errorMessage: 'Cannot confirm booking on or after start date' });
      }
    }

    // Change to in progress
    if (newStatus === "in progress") {
      if (!isHost) {
        return res.status(403).json({ errorMessage: 'Only the host can change booking to in progress' });
      }
      if (currentStatus !== "confirmed") {
        return res.status(400).json({ errorMessage: 'Booking must be confirmed to start' });
      }
      if (!isHappeningBooking) {
        return res.status(400).json({ errorMessage: 'Booking can only be in progress during the booking period' });
      }
    }

    // Change to completed
    if (newStatus === "completed") {
      if (currentStatus !== "in progress") {
        return res.status(400).json({ errorMessage: 'Booking must be in progress to complete' });
      }
      if (isRequester && !isAfterEndBooking) {
        return res.status(400).json({ errorMessage: 'Requester can only complete booking on or after end date' });
      }
      if (isHost) {
        const twoDaysAfterEnd = new Date(endDate);
        twoDaysAfterEnd.setDate(twoDaysAfterEnd.getDate() + 2);
        if (isHost) {
          const twoDaysAfterEnd = new Date(endDate);
          twoDaysAfterEnd.setUTCDate(twoDaysAfterEnd.getUTCDate() + 2);
            if (today < twoDaysAfterEnd) {
              return res.status(400).json({ errorMessage: 'Host can only complete booking 2 days after end date' });
            }
        }
    }
  }
    // Change to canceled
    if (newStatus === "canceled") {
      if (currentStatus !== "pending" && currentStatus !== "confirmed") {
        return res.status(400).json({ errorMessage: 'Can only cancel pending or confirmed bookings' });
      }
    }

    const allowedFields = ["status"];
    const receivedFields = Object.keys(req.body);

    const invalidFields = receivedFields.filter((field) => {
      return !allowedFields.includes(field);
    });

    const validFields = receivedFields.filter((field) => {
      return allowedFields.includes(field);
    });

    if (validFields.length === 0) {
      res.status(400).json({
        message: "No valid fields to update",
        fieldsSent: invalidFields,
        allowedFields,
      });
      return;
    }

    const status = req.body.status;

    await Booking.findByIdAndUpdate(
      bookingHostReq._id,
      {
        status,
      },
      { runValidators: true }
    );

    if (invalidFields.length > 0) {
      res.status(400).json({
        message: "Booking updated with valid fields",
        warning: "Some  fields were ignored due to permission",
        ignoredFields: invalidFields,
      });
    } else {
      res.status(200).json({ message: "Booking updated" });
    }
  } catch (error) {
    next(error);
  }
});

// Delete booking
router.delete("/:bookingId", verifyToken, async (req, res, next) => {
  try {
    const bookingRequester = await Booking.findById(
      req.params.bookingId
    ).select("host requester");

    if (!bookingRequester.requester.equals(req.payload._id)) {
      res
        .status(403)
        .json({ errorMessage: "Not allowed to delete this booking" });
      return;
    }
    // TODO - Another condition: You can delete only if the status is to confirm
    await Booking.findByIdAndDelete(req.params.bookingId);
    res.status(200).json({ message: "Booking deleted!" });
  } catch (error) {
    next(error);
  }
});

//Get information about a booking
router.get("/:bookingId", verifyToken, async (req, res, next) => {
  try {
    const bookingHostReq = await Booking.findById(req.params.bookingId).select(
      "host requester"
    );

    if (!bookingHostReq) {
      res.status(400).json({ errorMessage: "Booking not found" });
    }

    if (
      !bookingHostReq.requester.equals(req.payload._id) &&
      !bookingHostReq.host.equals(req.payload._id)
    ) {
      res
        .status(403)
        .json({
          errorMessage: "Not allowed to see the information of this Booking",
        });
      return;
    }
    const bookingInfo = await Booking.findById(req.params.bookingId)
      .populate(
        "host",
        "name city homeInformation homeType avatar petsCategoryAllowed coordinates address"
      )
      .populate("requester", "name city avatar ")
      .populate("petCared")
      .populate("review"); // delete because i will create a route for the review.

    res.status(200).json(bookingInfo);
  } catch (error) {
    next(error);
  }
});
