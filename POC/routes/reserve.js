const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../auth/check-auth');

const readyStatus = 'READY';
const reservedStatus = 'RESERVED';
const inqueueStatus = 'INQUEUE';

const twilio = require('twilio');
const accountSid = 'AC9388262777de3186753ee81fb05b8ec5';
const authToken = 'a5917e21f65e2698c8066dc4bdd259d5';
const client = new twilio(accountSid, authToken);

const Reservation = require('../models/reservation');
const Customer = require('../models/users');

router.get('/readFreeTables', checkAuth, (req,res,next) => {
    Reservation.find({status : readyStatus}).exec()
        .then( readyTables => {
            console.log('List if available tables' , readyTables);
            res.status(200).json({
                tableCount : readyTables.length,
                tableData : readyTables
            })
        }).catch( err => {
            res.status(500).json({
                message : 'Error reading free data',
                error : err
            })
    });
});

router.get('/readReservedTables',checkAuth, (req,res,next) => {
   Reservation.find({status : reservedTables}).exec()
       .then( reservedTables => {
           console.log('List of reserved tables' , reservedTables);
           res.status(200).json({
               tableCount : reservedTables.length,
               tableData : reservedTables
           })
       })
       .catch( err => {
           res.status(500).json({
               message : 'Error reading reserved tables',
               error: err
           })
       });
});

//lists out the customers who are in queue
router.get('/inqueue',(req,res,next) => {
    console.log('Checking customers inqueue');
    Customer.find({status:inqueueStatus}).exec()
        .then( inqueueCustomers => {
            res.status(200).json({inqueueCustomers});
        }).catch(err => {
            res.status(500).json({
                message : 'Error loading customers inqueue',
                error : err
            });
    });
});

router.post('/inbound', (req,res,next) => {
    console.log('Inbound message is getting in');
    let body = req.body.Body;
    let from = req.body.from;
    let to = req.body.to;
    Customer.findOne({phoneNumber : req.body.from}).exec()
        .then( foundCustomer => {
            console.log('Does the customer exists ?', foundCustomer.length);
            if(foundCustomer.length == 1) {
                if (body == 'Reserve') {

                } else {
                    client.messages.create({
                        to :`${from}`,
                        from :`${to}`,
                        body : 'Do you wish to make a reservation? Please send message Reserve to the same number.'
                    });
                }
            }else{
                //create new customer first
                client.messages.create({
                    to :`${from}`,
                    from :`${to}`,
                    body : 'Welcome new customer. Enter your name to continue.'
                })
            }
        });
});

router.post('/createTables', (req,res,next) => {
   const newTable = new Reservation({
     _id : mongoose.Types.ObjectId(),
     tableNumber : req.body.tableNumber,
     status : req.body.status,
     noOfSeats : req.body.noOfSeats
   });
   newTable.save()
       .then( result => {
           console.log('Table created', result);
           res.status(201).json({
               message : 'New table ready',
               tableDetails : {
                   tableNumber : result.tableNumber,
                   tableStatus : result.status,
                   noOfSeats : result.noOfSeats
               }
           })
       }).catch( err => {
           console.log('Error addding table');
           res.status(500).json({
               message : 'Error adding table',
               error : err
           })
       });
});

router.post('/makeBooking', (req,res,next) => {

});

module.exports = router;