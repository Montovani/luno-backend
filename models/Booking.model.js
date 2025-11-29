const {Schema,model} = require('mongoose')

const bookingSchema = new Schema ({
    requester: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending','confirmed','in progress','completed','canceled'],
        default: 'pending'
    },
    lunies: {
        type: Number, // It will add to the host after changing from in progress to completed. The owner can change it and the host will be allowed to change it after 2 days of the 'until'
        trim: true,
        max: 100,
        default: 10
    },
    message: {
        type: String,
        maxlength: 500,
        trim: true
    },
    dateStart: {
        type: Date,
        required:true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    petCared: {
        type: [Schema.Types.ObjectId],
        ref: 'Pet',
        required: true,
    },
    review: {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }
})

const Booking = model('Booking',bookingSchema)

module.exports = Booking
