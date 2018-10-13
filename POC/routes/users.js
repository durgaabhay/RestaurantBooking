const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const checkAuth = require('../auth/check-auth');
const twilio = require('twilio');
const accountSid = 'AC9388262777de3186753ee81fb05b8ec5';
const authToken = 'a5917e21f65e2698c8066dc4bdd259d5';
const client = new twilio(accountSid, authToken);
const Customer = require('../models/users');
const Reservation = require('../models/reservation');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Customer.find().exec().then(result => {
      console.log(result);
      res.status(200).json({result});
  }).catch(err =>{
      res.status(500).json({err});
  })
});

router.post('/searchCustomer',checkAuth,(req,res,next) => {
    console.log('Getting inside customer search' , req.body.phoneNumber);
   Customer.find({phoneNumber: req.body.phoneNumber}).exec()
       .then(result => {
           console.log({result});
           res.status(200).json(result);
       }).catch(err => {

   });
});

router.post('/placeOrder',checkAuth,(req,res,next)=> {
    Customer.find({email: req.body.email}).exec()
        .then(userExists => {
            if (userExists.length >= 1) {
                console.log('User already exists' , userExists);
                client.messages.create({
                    to : `${userExists.phoneNumber}`,
                    from : '17047538151',
                    body : 'Welcome"' + req.body.userName + '"to Awesome Food.'
                });
                reserveTable(req,res);
            } else {
                console.log('New user coming in');
                const newCustomer = new Customer({
                    _id: mongoose.Types.ObjectId(),
                    userName: req.body.userName,
                    email: req.body.email,
                    phoneNumber: req.body.phoneNumber
                });
                newCustomer.save()
                    .then(result => {
                        console.log('New customer added', result);
                        client.messages.create({
                            to : `${userExists.phoneNumber}`,
                            from : '17047538151',
                            body : 'Welcome"' + req.body.userName + '"to Awesome Food.'
                        });
                        reserveTable(req,res);
                    });
            }
        });
});

function reserveTable(req,res){
    console.log('Inside reserve Table ', req.body);
    var dateTime = new Date().toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, '');    // delete the dot and everything after;

    Reservation.find({noOfSeats:req.body.noOfSeats,status:'READY',tableType:'ALACARTE'}).exec()
        .then( foundTable => {
            console.log('Found tables ' , foundTable);
            if(foundTable.length >= 1){
                console.log('converted date is : ', dateTime);
                Reservation.updateOne({_id:foundTable[0]._id} , {$set : {customerName: req.body.userName, status:'DINING', bookingDate: dateTime.toString()}})
                    .exec().then( result => {
                    res.status(200).json({
                        message : 'Table assigned to customer',
                        tableDetails : foundTable[0].tableNumber
                    })
                }).catch(err=>{
                    res.status(500).json({
                        message : 'Error assigning table to customer',
                        error : err
                    });
                });
            }else{
                Customer.updateOne({email:req.body.email}, {$set : {tableStatus : 'INQUEUE'}}).exec()
                    .then( result => {
                        client.messages.create({
                            to : `${req.body.phoneNumber}`,
                            from : '17047538151',
                            body : 'Welcome"' + req.body.userName + '"to Awesome Food. Thank you for your patience. Once a table is ready you will receive a message'
                        });
                        res.status(200).json({
                            message : 'Putting user in queue',
                            customerDetails : {result}
                        })
                    }).catch(err => {
                    res.status(500).json({
                        message : 'Error putting user in the queue',
                        error : err
                    })
                });
            }
        })
}

router.post('/checkOut', (req,res,next) => {
   console.log('Inside checkout user' , req.body);
   Reservation.updateOne({tableNumber:req.body.tableNumber} , {$set :{customerName:'', status:'READY'}}).exec();
       //send a twilio message for user feedback
    client.messages.create({
        to : `${req.body.phoneNumber}`,
        from : '17047538151',
        body : 'Thank you for your visit. How would you rate our service? Respond back with Yes or No'
    });
});



router.post('/schedule', (req,res,next)=>{

});

module.exports = router;
