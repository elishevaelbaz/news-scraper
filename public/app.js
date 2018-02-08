// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {

//     <div class="panel panel-default">
//   <div class="panel-heading">
//     <h3 class="panel-title">Panel title</h3>
//   </div>
//   <div class="panel-body">
//     Panel content
//   </div>
// </div>

         // Display the apropos information on the page
      var panelDiv = $("<div>")
      panelDiv.attr("id", data[i]._id)

      // panelDiv.attr("data-num", data[i]._id)
      panelDiv.addClass("panel panel-default")

      var panelHeading = $("<div class='panel-heading' ></div>")

      var panelTitle = $("<h3 class='panel-title' ></h3>")
      
      panelTitle.text(data[i].headline)
      // panelTitle.attr("target", "_blank")
      panelTitle.attr("href", data[i].url)
      panelHeading.append(panelTitle)
      panelDiv.append(panelHeading)
      panelDiv.append("<p data-id='" + data[i]._id + "'>" + data[i].url + "</p>");
    
       // if it's saved
    if (data[i].isSaved){

    //create a delete button
      panelDiv.append("<button data-id='" + data[i]._id + "' class='btn btn-warning' id='delete-button'>" + "Delete Article" + "</button>");
      // create a note button
      panelDiv.append("<button data-id='" + data[i]._id + "' class='btn btn-success' id='note-button'>" + "Article Notes" + "</button>");
// append to the div with id articles (in index page)
      $("#saved-articles").append(panelDiv)
    }
    // if it is not saved
    else{      
    //create a save button
      panelDiv.append("<button data-id='" + data[i]._id + "' class='btn btn-primary' id='save-button'>" + "Save Article" + "</button>");
      // append to the div with id articles (in index page)
      $("#articles").append(panelDiv)
    
    }
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.headline + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#scrape-button", function(){
  $.ajax({
    method: "GET",
    url: "/scrape" 
    
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log("hello")
      console.log(data);
     
    });
});

$(document).on("click", "#save-button", function(){
  console.log(this)
  // console.log($(this).attr("data-id"))

  var id = ($(this).attr("data-id"));
  $.ajax({
    method: "PUT",
    url: "/articles/" + id
    
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log("hello")
      console.log(data);

      // $(this).closest("div.article-div").remove();
      // $("#articles").remove(this)
      $("#" + id).remove();
     
    });
});


$(document).on("click", "#delete-button", function(){
  console.log(this)
  // console.log($(this).attr("data-id"))

  var id = ($(this).attr("data-id"));
  $.ajax({
    method: "DELETE",
    url: "/articles/" + id
    
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log("hello")
      console.log(data);

      // $(this).closest("div.article-div").remove();
      // $("#articles").remove(this)
      $("#" + id).remove();
     
    });
});


$(document).on("click", "#delete-button", function(){
  console.log(this)
  // console.log($(this).attr("data-id"))

  var id = ($(this).attr("data-id"));
  $.ajax({
    method: "DELETE",
    url: "/articles/" + id
    
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log("hello")
      console.log(data);

      // $(this).closest("div.article-div").remove();
      // $("#articles").remove(this)
      $("#" + id).remove();
     
    });
});
