// Saves options to chrome.storage
function save_options() {
    var sound = document.getElementById('sound').value;
    var type = document.getElementById('type').value;
    chrome.storage.sync.set({
      sound: sound,
      type: type
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
      sound: 'tts',
      type: 'all'
    }, function(items) {
      document.getElementById('sound').value = items.sound;
      document.getElementById('type').value = items.type;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);