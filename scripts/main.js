(function(){
  'use strict';

  var controls = document.querySelector('#controls');
  controls.showDisplay = function() {
    chrome.app.window.create('build/display.html',
      {
        id: 'displayWindow',
        alwaysOnTop: true,
        frame: 'none',
        state: 'fullscreen',
        visibleOnAllWorkspaces: true
      },
      function(displayWindow) {

    });
  };
})();
