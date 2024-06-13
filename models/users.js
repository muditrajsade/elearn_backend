

let r = require('mongoose');

let u = new r.Schema({
    email:String,
    full_name:String,
    pwd : String,
    



});

module.exports = r.model('user_details',u);