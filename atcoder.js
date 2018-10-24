window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

var url = window.location.href;
var submissions = [].slice.call(document.getElementsByClassName("waiting-judge")).map(it => it.getAttribute("data-id"));

function fetch_atcoder_result(base_url, ids) {
    var xhr = new XMLHttpRequest();
    var url_param = [].slice.call(ids).map(it => "sids[]=" + it).join("&")
    var ids_to_refresh = []
    var url = base_url + "/status/json?" + url_param;
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function(e) {
        var result = JSON.parse(xhr.response);
        ids.forEach(function(id) {
            var obj = result[id];
            if (obj["Html"].includes("waiting-judge")) {
                /* On AtCoder, a solution can be marked as judging and WA,TLE,MLE,RE at the same time.
                 * This means that the solution is still being run on more testcases. When this happens,
                 * the running time, consumed memory and score is not yet available. Since AtCoder has
                 * partial scores, we do not report the verdict just yet. */
                ids_to_refresh.push(id);
            } else {
                var score = obj["Score"];
                var verdict = /title=\"([^\"]*)\"/g.exec(obj["Html"])[1];
                var time = /[0-9]* ms/g.exec(obj["Html"]);
                var mem = /[0-9]* KB/g.exec(obj["Html"]);
                browser.runtime.sendMessage({
                    verdict: verdict,
                    time: time ? time[0] : undefined,
                    mem: mem ? mem[0] : undefined,
                    id: id,
                    score: score
                });
            }
        });

        if (ids_to_refresh.length > 0) {
            setTimeout(function() {
                fetch_atcoder_result(base_url, ids_to_refresh);
            },500);
        }
    };
}

if (submissions.length > 0) {
    fetch_atcoder_result(url, submissions);
}
