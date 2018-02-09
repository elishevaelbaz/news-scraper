var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/newsScraper", {
  useMongoClient: true
});

// Routes

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
  });


app.get("/saved", function(req, res) {
    res.sendFile(path.join(__dirname, "public/savedArticles.html"));
});

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/technology").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:

        let counter = 0;
        // var dataArr = [];
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // there are two different html layouts for aricles (that I know of)
      // Add the text and href of every link, and save them as properties of the result object
      
       // if ($(this).children("figure.media")){
       //  console.log("bye")
        // var media = $(this).children("figure.media");
        // var storyBody = $(this).children("div.story-body");
        // var h2Headline = storyBody.children("h2");
        // result.url = h2Headline.children("a").attr("href");
        // result.headline = h2Headline.children("a").text();

        // result.summary = storyBody.children("p.summary").text();
      // }
      // else{
      //   console.log("hello")
        var storyDiv = $(this).children("div.story-body")
        result.url = storyDiv.children("a").attr("href")
        var metaDiv = storyDiv.children("a").children("div.story-meta")
        result.headline = metaDiv.children("h2").text()
        result.summary = metaDiv.children("p.summary").text();
      // }

      
      

      // console.log("result.headline: ", i)
      // console.log(result.headline)
      // console.log(result.url)
      // console.log(result.summary)

      // result.url = $(this).children("a").attr("href");
      
      // console.log(result.url)
      // result.summary = $(this).children("p.summary").text();
      // console.log(result.summary)


      // Create a new Article using the `result` object built from scraping
     if (result.headline && result.url){


      // if (! db.Article.findOne({ url: result.url })){
        // console.log("-----------------------------")
        // // console.log(db.Article.findOne({ "url": "A Guide to Snapchat For People Who Don't Get Snapchat"}))
        // var test = db.Article.findOne({url: result.url})
        // console.log(test)
        // console.log(test.model.schema.Schema)


        // console.log(Query)
        // console.log(test.Query.Schema.obj.url)





      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
          counter++;
          // dataArr.push(dbArticle)
          console.log("added " + counter + " new items")
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
        // console.log(result)
        // console.log("added " + incr + " new items")
      }
          

    });


    // If we were able to successfully scrape and save an Article, send a message to the client
    res.sendFile(path.join(__dirname, "public/index.html"));

  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, and update it's isSaved propertypopulate it with it's note
app.put("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that updates the matching one in our db...
  db.Article.update({ _id: req.params.id}, {$set: {isSaved: true}})

    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});




// route for deleting an article
  app.delete("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that updates the matching one in our db...
    db.Article.remove({ _id: req.params.id})

    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
