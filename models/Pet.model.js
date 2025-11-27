const {Schema, model} = require('mongoose')

const petSchema = new Schema ({
    name: {
        type: String,
        required: true,
        maxlength: [50, "Name cannot exceed 50 characters"],
        trim: true,
        lowercase: true
    },
    category: { // don't use type because it is a keyword from mongoose.
        type: String,
        required: true,
        enum: ['cat','rabbit','hamster','small dog','medium dog','big dog'],
    },
    gender: {
        type: String, 
        required: true,
        enum: ['male', 'female'],
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    isHouseTrained: {
        type: Boolean,
        required: true,
    },
    isNeutered: {
        type: Boolean,
        required: true,       
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: [600, "please, keep your especial instructions bellow 600 characters"]
    },
    owner: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    }
})

const Pet = model('Pet',petSchema)

module.exports = Pet
