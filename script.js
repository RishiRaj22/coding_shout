"use strict";
var listening = [];

window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

var speak = (function(text) {
    if(browser.tts) {
        browser.tts.speak(text);
    } else {
        speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
});

function fetch_result(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.codechef.com/get_submission_status/" + id, true);
    xhr.send();
    xhr.onload = function(e) {
        var result = JSON.parse(xhr.response);
        if(result.result_code === 'wait') {
            setTimeout(function() {
                fetch_result(id);
            },200);
        } else {
            browser.storage.sync.get({
                sound: 'tts',
                type: 'all'
              }, function(items) {
                var sound = items.sound;
                var type = items.type;
                if(result.result_code === 'time') {
                    result.result_code = 'Time limit exceeded';
                }
                if(result.result_code === 'partial_accepted') {
                    result.result_code = 'Partially accepted';
                }
                if(sound === "tts") {
                    var message = result.result_code;
                    if(type === "all") {
                        if(result.score !== null || result.time !== null) {
                            message += ",";
                        }
                        if(result.score !== null) {
                            message += "score " + result.score + ",";
                        }
                        if(result.time !== null) {
                            message += "time "+ result.time + " seconds";
                        }
                    }
                    speak(message);
                } else {
                    browser.notifications.create(id, {
                        type: "basic",
                        iconUrl: "icon_128.png",
                        title: result.result_code,
                        message: (result.score === null ? "Took " : "Scored " + result.score + " and took ") +  + result.time + " seconds"
                    }) 
                }
              });
            listening.splice(listening.indexOf(id),1);
        }
    };
}
browser.webRequest.onBeforeRequest.addListener(function (request) {
    var url = request.url;
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
