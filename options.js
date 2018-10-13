// Saves options to chrome.storage
function save_options() {
    var sound = document.getElementById('sound').value;
    chrome.storage.sync.set({
      sound: sound
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = ' ';
      }, 750);
    });
  }
  

  function restore_options() {
    chrome.storage.sync.get({
      sound: 'tts'
    }, function(items) {
      document.getElementById('sound').value = items.sound;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);