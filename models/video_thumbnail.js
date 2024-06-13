


let r = require('mongoose');

let vdt = new r.Schema({
    user:String,

    video:String,
    thumbnail : String
    



});

module.exports = r.model('video_thumbnails',vdt);