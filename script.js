"use strict";
var listening = [];

// For cross-browser compatibility
window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

// For cross-browser Text to Speech
var speak = (function(text) {
    if(browser.tts) {
        browser.tts.speak(text);
    } else {
        speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
});

/**
 * Fetch the result of codechef submission
 * @param {string} id The ID of the codechef submission whose result is to be fetched
 */
function fetch_codechef_result(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.codechef.com/get_submission_status/" + id, true);
    xhr.send();
    xhr.onload = function(e) {
        var result = JSON.parse(xhr.response);
        if(result.result_code === 'wait') {
            setTimeout(function() {
                fetch_codechef_result(id);
            },200);
        } else {
            browser.storage.sync.get({
                sound: 'tts',
                type: 'all'
              }, function(items) {
                var sound = items.sound;
                var type = items.type;
                if(result.result_code === 'time') {
                    result.result_code = 'Time Limit Exceeded';
                }
                result.result_code = result.result_code
                    .split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
                notify(result.result_code,result.score,result.time,null,result.id);
              });
            listening.splice(listening.indexOf(id),1);
        }
    };
}

/**
 * Handles messages sent from content-scripts running on Codeforces and AtCoder
 * @param {Object} request Contains verdict, time taken, memory consumed by the submission
 * @param {*} sender
 * @param {*} sendResponse
 */
function handleMessage(request, sender, sendResponse) {
    var verdict = request.verdict;
    var time = request.time;
    var mem = request.mem;
    var id = request.id;
    var score = request.score;
    notify(verdict,score,time,mem,id);
}

/**
 * Notifies about the result of the submission
 * @param {string} verdict The result of the submission.
 * @param {*} score The score obtained through the submission (optional)
 * @param {*} time The time taken in code execution (optional)
 * @param {*} mem The memory required in code execution (optional)
 * @param {string} id The id of the submission (optional)
 */
function notify(verdict,score,time,mem,id) {
    var details = [];
    if (score != null && typeof score != 'undefined') {
        details.push("Score " + score);
    }
    if (time != null && typeof time != 'undefined') {
        details.push("Time taken " + time);
    }
    if (mem != null && typeof mem != 'undefined') {
        details.push("Memory used " + mem);
    }
    details = details.join("\n");
    browser.storage.sync.get({
      sound: 'tts',
      type: 'all'
    }, function(items) {
      var sound = items.sound;
      var type = items.type;
      if(sound === "tts") {
          var message = verdict;
          if(type === "all") {
              message += "\n"+details;
          }
          speak(message);
      } else {
        //If ID is there, use that for a unique ID or else generate a random one
        if(typeof id == 'undefined') {
            id = Math.random().toString(36);
        }
          browser.notifications.create(id, {
              type: "basic",
              iconUrl: "icon_128.png",
              title: verdict,
              message: details
          })
      }
    });
}

browser.runtime.onMessage.addListener(handleMessage);

/**
 * As soon as there is a request for the result of a submission from Codechef,
 * start fetching the result for that particular ID
 */
browser.webRequest.onBeforeRequest.addListener(function (request) {
    var url = request.url;
    var arr = url.split("/");
    var id = arr[arr.length - 1];
    if(id === "") {
        id = arr[arr.length-2];
    }
    if(!listening.includes(id)) {
        listening.push(id);
        fetch_codechef_result(id);
    }
},{"urls":["*://*.codechef.com/submit/complete/*"]})
