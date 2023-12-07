const fs = require("fs/promises");
const { readFile } = require("fs/promises");
const { writeFile } = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const ejs = require('ejs');
const {formidable} = require('formidable');

const controller = {
    getHomepage: async (request, response) => {
    //const database = fs.readFile("database/data.json")
    const pPath = path.join(__dirname,"..","/database/data.json");
    const db = await fs.readFile(pPath, "utf8", (err,data) => {
        if(err){
            return;
        }
    });
    const parsedDB = JSON.parse(db);
    let objArr = [];
    const folderPath = path.join(__dirname, "..", "src", "views", "index.ejs");
    parsedDB.forEach(parsedDB => {
        const newObj = {
            username : parsedDB.username
        }
        objArr.push(newObj);
       
    })
    const data = {
        contents : objArr
    }


    ejs.renderFile(folderPath, data, {}, function(err, newHtml){
        response.end(newHtml);
    });
  },
  sendFormData: (request, response) => {
    const username = (request.url.split("?")[1]).split("=")[1];
    //console.log(username);
    const folderPath = path.join(__dirname, "..", "src", "views", "form.ejs");
    const data = {
        names: [username]
    }
    ejs.renderFile(folderPath, data, {}, function(err, newHtml){
    response.writeHead(200, DEFAULT_HEADER);
    response.end(newHtml);
    });
  },
  getFeed: async (request, response) => {
    // console.log(request.url); try: http://localhost:3000/feed?username=john123
    const username = (request.url.split("?")[1]).split("=")[1];

    const database = await readFile("database/data.json");
    const arr = JSON.parse(database);
    const foundUser = arr.find(user => user.username === username);
    console.log(foundUser.photos);
    const folderPath = path.join(__dirname, "..", "src", "views", "feed.ejs");
    const data = {
        username: foundUser.username,
        followers: foundUser.stats.followers,
        posts:foundUser.stats.posts,
        following : foundUser.stats.following,
        photos: foundUser.photos,
        discript : foundUser.description
        
    }
    ejs.renderFile(folderPath, data, {}, function(err, newHtml){
        response.end(newHtml);
    });
  },
  uploadImages: async (request, response) => {
    var i = 0;
    const username = (request.url.split("?")[1]).split("=")[1]; 
    const form = formidable({keepExtensions: true});
    form.uploadDir = path.join(__dirname, "..", "src", "photos", username);
    let fields;
    let files;
    [fields, files] = await form.parse(request);
    console.log("Files:", files);
    const filename = files.multipleFiles[0].newFilename;
    console.log(filename);
    const getData = await readFile("database/data.json", "utf8");
    const database = JSON.parse(getData);
    console.log(database);
    const profiles = database.find(data => data.username === username);
    profiles.photos.push(filename);
    await writeFile("database/data.json", JSON.stringify(database))
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ fields, files }, null, 2));
    return;
  },
};

module.exports = controller;
