(function(){
  'use strict';

  var controller = {

    DISPLAY_WINDOW_ID: 'displayWindow',

    showDisplay: function() {
      if (chrome.app.window.get(this.DISPLAY_WINDOW_ID)) {
        return;
      }

      var externalDisplayInfo, queueMoveToExternalDisplay = false;
      chrome.system.display.getInfo(function(displayInfos) {
        for (var i = displayInfos.length - 1; i >= 0; i--) {
          if (!displayInfos[i].isPrimary && displayInfos[i].isEnabled) {
            externalDisplayInfo = displayInfos[i];
            break;
          }
        }
      });

      chrome.app.window.create('build/display.html',
        {
          id: this.DISPLAY_WINDOW_ID,
          alwaysOnTop: true,
          frame: 'none',
          focused: false,
          hidden: true,
          resizable: false,
          state: 'maximized',
          visibleOnAllWorkspaces: true
        },
        (function(displayWindow) {
          if (externalDisplayInfo)  {
            this.moveToExternalDisplay(displayWindow, externalDisplayInfo);
          } else {
            queueMoveToExternalDisplay = true;
          }
      }).bind(this));

    },

    moveToExternalDisplay: function(displayWindow, externalDisplayInfo) {
      displayWindow.contentWindow.addEventListener('load', function(){
        displayWindow.outerBounds.left = externalDisplayInfo.bounds.left;
        displayWindow.maximize();
        displayWindow.show(false);
      });
    }
  };

  var controls = document.querySelector('#controls');
  controls.showDisplay = controller.showDisplay.bind(controller);
})();
