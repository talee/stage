(function(){
  'use strict';

  var controls = document.querySelector('#controls');
  controls.showDisplay = function() {
    chrome.app.window.create('build/display.html',
      {
        id: 'displayWindow',
        alwaysOnTop: true,
        frame: 'none',
        focused: false,
        hidden: true,
        resizable: false,
        state: 'maximized',
        visibleOnAllWorkspaces: true
      },
      function(displayWindow) {
        displayWindow.contentWindow.addEventListener('load', function(){
          displayWindow.outerBounds.left = 1930;
          displayWindow.maximize();
          displayWindow.show(false);
        });
    });
  };
})();
