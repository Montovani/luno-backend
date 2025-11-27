const {Schema,model} = require('mongoose')

const bookingSchema = new Schema ({
    requester: { 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending','confirmed','in progress','completed','canceled'],
        default: 'pending'
    },
    lunies: {
        type: Number, // It will add to the host after changing from in progress to completed. The owner can change it and the host will be allowed to change it after 2 days of the 'until'
        required: true,
        trim: true,
        max: 800,
        default: 200
    },
    message: {
        type: String,
        maxlength: 500,
        trim: true
    },
    petCared: {
        type: [Schema.Types.ObjectId],
        ref: 'Pet'
    },
    review: {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }
})

const Booking = model('Booking',bookingSchema)

module.exports = Booking
