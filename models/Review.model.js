const {Schema,model} = require('mongoose')

const reviewSchema = new Schema ({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    bookSitting: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    }
    },
    {
        timestamps: true,
    })
