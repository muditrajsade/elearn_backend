
let x = require('express');
let p = require('path');
let cors = require('cors');
let mong = require('mongoose');
let bdp = require('body-parser');
let u = require('./models/users');
let fs = require('fs');
let multer = require('multer');
let vdt = require('./models/video_thumbnail');
const { ObjectId } = require('mongodb');

let app = x();



app.use(
    cors({
        origin: '*',
    })
  );
app.use(x.json());
const port = 8000;

app.use(bdp.urlencoded({extended:true}));
let uri = "mongodb+srv://muditrajsade:" + encodeURIComponent("Smr123bunny$#") + "@cluster0.oco2p.mongodb.net/ELEARN_DATABASE?retryWrites=true&w=majority&appName=Cluster0";
let cons = mong.createConnection(uri);
let gfs;
let imgs;
cons.once('open', () => {
    // Initialize GridFS stream
    gfs = new mong.mongo.GridFSBucket(cons.db, {
        bucketName: "uploads" // Set the bucket name
    });
    imgs = new mong.mongo.GridFSBucket(cons.db, {
        bucketName: "thumbnails" // Set the bucket name
    });
    console.log('GridFS bucket for videos is initialized');
    console.log('GridFS bucket for images is initialized');

});
const upload = multer({ dest: 'uploads/' });
const thmb_upload = multer({dest : 'thumbnails'});

app.get('/', function(req, res){
    console.log("hi");
    res.sendFile(p.join(__dirname,'/a.html')); 
});


app.post("/create_account",async function(req,res){

    try{
        let yher = "mongodb+srv://muditrajsade:" + encodeURIComponent("Smr123bunny$#") + "@cluster0.oco2p.mongodb.net/ELEARN_DATABASE?retryWrites=true&w=majority&appName=Cluster0";
        await mong.connect(yher);
        console.log(req.body);
        let user = u();
        user.full_name = req.body.full_name;
        user.email = req.body.email;
        user.pwd = req.body.pwd;
        user.save();
    
        res.status(200).json({message:'successfull'});
    }
    catch(e){
        res.status(300).json({message:'unsuccessfull'});

    }




   

})

app.post('/upload/:p/:tittle',upload.fields([{name:'videofile'},{name:'thumbnail'}]),async function(req,res){

    let cv = req.params.p;
    console.log(req);

    // Create a read stream for the uploaded file
    const readStream = fs.createReadStream(req.files.thumbnail[0].path);

    // Define the filename to be used in GridFS
    let filename = req.params.tittle;

    let r = imgs.openUploadStream(filename);
    let k = null;

    let j = new Promise(function(resolve,reject){
        readStream.pipe(r)
        .on('error', err => {
            console.error('Error uploading file to GridFS:', err);
            res.status(500).json({ error: 'Internal server error' });
        })
        .on('finish', () => {
            console.log('File uploaded to GridFS successfully');
            // Clean up the temporary file
            fs.unlink(req.files.thumbnail[0].path, err => {
                if (err) {
                    console.error('Error deleting temporary file:', err);
                }
            });
            resolve(r.id);

            
            
        });

    })

    // Pipe the read stream to GridFS to save the file
    k = await j;
    

    let x = null;

    

    const read_video_stream = fs.createReadStream(req.files.videofile[0].path);
    let gvcx = req.params.tittle;
    let fxa = gfs.openUploadStream(gvcx);

    let sa = new Promise(function(resolve,reject){
        read_video_stream.pipe(fxa)
        .on('error', err => {
            console.error('Error uploading file to GridFS:', err);
            res.status(500).json({ error: 'Internal server error' });
        })
        .on('finish', () => {
            console.log('File uploaded to GridFS successfully');
            // Clean up the temporary file
            fs.unlink(req.files.videofile[0].path, err => {
                if (err) {
                    console.error('Error deleting temporary file:', err);
                }
            });
            resolve(fxa.id);
        });

    })
    x = await sa;

    let yher = "mongodb+srv://muditrajsade:" + encodeURIComponent("Smr123bunny$#") + "@cluster0.oco2p.mongodb.net/ELEARN_DATABASE?retryWrites=true&w=majority&appName=Cluster0";
    await mong.connect(yher);

    let new_vid_thumb = new vdt();
    new_vid_thumb.user = cv.toString();
    new_vid_thumb.video = x.toString();
    new_vid_thumb.thumbnail = k.toString();
    await new_vid_thumb.save();
    
    let ffv = encodeURI(cv)
    
    res.status(200).json({message:'successfull'});
    console.log("uploaded");
})

const readFilesToBuffers = async (files) => {
    const buffers = [];
  
    for (const file of files) {
      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        const readStream = imgs.openDownloadStream(file._id);
  
        readStream.on('data', chunk => chunks.push(chunk));
        readStream.on('end', () => resolve(Buffer.concat(chunks)));
        readStream.on('error', reject);
      });
      
      buffers.push(buffer);

    }
  
    return buffers;
  };


app.post('/search',async function(req,res){

    let val = (req.body.tittle)
    

    let r = await imgs.find({filename:val}).toArray();

    let len = r.length;
    

    let g = [];

    for(k=0;k<len;k++){
        console.log(k);
        let t = (r[k]._id).toString();
        g.push(t);
    }



    console.log(g);


    const buffers = await readFilesToBuffers(r);
    let bffr = [];

    for(i = 0;i<len;i++){
        let h = [];
        h.push(buffers[i].toString('base64'));
        h.push(g[i]);
        bffr.push(h);

    }



    // Send buffers array as response
    res.json(bffr);




})

app.post('/get_video',async function(req,res){
    let c = req.body.thmb;
    let yher = "mongodb+srv://muditrajsade:" + encodeURIComponent("Smr123bunny$#") + "@cluster0.oco2p.mongodb.net/ELEARN_DATABASE?retryWrites=true&w=majority&appName=Cluster0";
    await mong.connect(yher);

    let ans = await vdt.findOne({thumbnail : c});

    //console.log(ans);

    let video_id = ans.video;

    let i = new ObjectId(video_id);

    let x = await gfs.find({_id : i}).toArray();
    const readStream = gfs.openDownloadStream(x[0]._id);

    let videoData = [];
    readStream.on('data', chunk => videoData.push(chunk));
    readStream.on('end', () => {
      const buffer = Buffer.concat(videoData);
      res.json({ data: Array.from(buffer) }); // Send buffer as an array of numbers
    });
    readStream.on('error', err => {
      console.error(err);
      res.status(500).send('Error occurred while fetching the video.');
    });




      
    

    
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});