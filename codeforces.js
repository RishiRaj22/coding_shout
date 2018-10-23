window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

var statuses = [].slice.call(document.getElementsByClassName("status-cell")).filter(it => it.getAttribute("waiting") === "true");
var s = function() {
  statuses.forEach((st,i,ob) => {
    var wait =
      st.getElementsByClassName("verdict-waiting").length > 0 ||
      st.getElementsByTagName("span").length === 0;
    if(wait === false) {
      var verdict = st.innerText;
      var time = [].slice.call(st.parentElement.getElementsByClassName("time-consumed-cell"))[0].innerText;
      var mem  = [].slice.call(st.parentElement.getElementsByClassName("memory-consumed-cell"))[0].innerText
      browser.runtime.sendMessage({
        verdict: verdict,
        time: time,
        mem: mem,
        id: st.getAttribute("submissionid")
      });
      ob.splice(statuses.indexOf(st),1)
    }
  });
  setTimeout(s,100);
};
s();