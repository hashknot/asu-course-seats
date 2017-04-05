#!/usr/bin/env phantomjs

/* Update the body of this function to your liking. */
var onSeatsFetched = function(seats) {
  /*
   * seats.open     : Open seats count (Number).
   * seats.total    : Total seats count (Number).
   * seats.reserved : Are the open seats reserved (bool).
   *
   */
  console.log(subject + number + ': ' + seats.open  + "/" + seats.total + (seats.reserved ? " (reserved)": ""));
}

var system = require('system');
var args = system.args;

subject = args[1];
number = args[2];
homePage = 'https://webapp4.asu.edu/catalog/Home.ext';

onLoadRegistered = false;
var page = require('webpage').create();
page.settings.userAgent = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0';
page.viewportSize = {
    width: 1600,
    height: 1000
};

page.onConsoleMessage = function(msg) {
    // Uncomment the following line to get webpage's console output
    // console.log(msg);
};


var fillForm = function(subject, number){
  document.getElementById("subjectEntry").value = subject;
  document.getElementById("catalogNbr").value = number;
  document.getElementById("searchTypeAllClass").click();
  document.getElementById("submitForm").click();
  console.log('Form submitted');
};

var getSeats = function(){
  console.log('Parsing results');
  var seats = document.getElementsByClassName("availableSeatsColumnValue")[0].textContent.replace(/\s/g, '').split('of');
  var reserved = false;
  if(document.getElementsByClassName("rsrvtip").length != 0) {
    reserved = true;
  }
  console.log("Available  seats: " + seats[0] + " of " + seats[1] + (reserved ? " (reserved)" : ""));
  var result = {
      "open" : seats[0],
      "total" : seats[1],
      "reserved" : reserved
  }
  return result;
}

page.open(homePage, function(status) {
  if(status !== "success") {
    console.log("Error!");
    phantom.exit();
  }
  page.evaluate(fillForm, subject, number);
  var seats = undefined;
  var retries = 0;
  setInterval(function() {
    if(retries > 200) {
      phantom.exit();
    }
    if(page.url !== homePage) {
      if(!seats){
        seats = page.evaluate(getSeats);
      }
      else {
        onSeatsFetched(seats);
        phantom.exit();
      }
    }
    retries++;
  }, 50);
});
