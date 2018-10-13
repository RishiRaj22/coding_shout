"use strict";
var listening = [];

function fetch_result(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.codechef.com/get_submission_status/" + id, true);
    xhr.send();
    xhr.onload = function(e) {
        var result = JSON.parse(xhr.response);
        if(result.result_code === 'wait') {
            setTimeout(function() {
                fetch_result(id);
            },50);
        } else {
            chrome.storage.sync.get({
                sound: 'tts'
              }, function(items) {
                  var sound = items.sound;
                if(sound === "tts") {
                    chrome.tts.speak(result.result_code);
                } else {
                    chrome.notifications.create(id, {
                        type: "basic",
                        iconUrl: "icon_128.png",
                        title: result.result_code,
                        message: "Scored " + result.score + " and took " + result.time + " seconds"
                    }) 
                }
              });
            listening.splice(listening.indexOf(id),1);
        }
    };
}
chrome.webRequest.onBeforeRequest.addListener(function (request) {
    var url = request.url;
    console.log("Request captured to " + url);
    var arr = url.split("/");
    var id = arr[arr.length - 1];
    if(id === "") {
        id = arr[arr.length-2];
    }
    if(!listening.includes(id)) {
        listening.push(id);
        fetch_result(id);
    }
},{"urls":["*://*.codechef.com/submit/complete/*"]})
