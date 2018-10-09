const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
   _id : mongoose.Schema.Types.ObjectId,
   tableNumber : String,
   customerName : String,
   phoneNumber : Number,
   noOfSeats : Number,
   status :  {
        type: String,
        enum:['READY','CLEANING','DINING','RESERVED','WAITING','COMPLETE'],
        default:'RESERVED'
   },
    bookingDate: Date
});

module.exports = mongoose.model('Reservation', tableSchema);