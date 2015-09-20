(function(global) {
  'use strict';
  // Allows development without connecting to an external display
  var isDev = global.isDev;
  var DisplayController = function() {};
  global.DisplayController = DisplayController;
  global.DisplayController.prototype = {

    DISPLAY_WINDOW_ID: 'displayWindow',

    toggleDisplay: function(event) {
      // Hide current display window if it's showing
      var currentDisplay = chrome.app.window.get(this.DISPLAY_WINDOW_ID);
      // TODO: Query for external monitor each time
      if (currentDisplay) {
        if(this._isShowingDisplay) {
          currentDisplay.hide();
          this._isShowingDisplay = false;
          event.target.textContent = 'Show';
          return;
        } else {
          currentDisplay.show();
          this._isShowingDisplay = true;
          event.target.textContent = 'Stop';
          return;
        }
      }

      // TODO: Move non toggle code to own methods
      // Find the first enabled external monitor (async)
      var externalDisplayInfo, queueMoveToExternalDisplay = false;
      chrome.system.display.getInfo(function(displayInfos) {
        for (var i = displayInfos.length - 1; i >= 0; i--) {
          if (isDev || !displayInfos[i].isPrimary && displayInfos[i].isEnabled) {
            externalDisplayInfo = displayInfos[i];
            break;
          }
        }
      });

      // Create a hidden display window
      chrome.app.window.create('build/display.html',
        {
          id: this.DISPLAY_WINDOW_ID,
          alwaysOnTop: !isDev && true,
          frame: 'none',
          focused: false,
          hidden: true,
          resizable: false,
          state: 'maximized',
          visibleOnAllWorkspaces: true
        },
        (function(displayWindow) {
          if (externalDisplayInfo)  {
            this._moveToExternalDisplayOnLoad(displayWindow, externalDisplayInfo);
          } else {
            queueMoveToExternalDisplay = true;
          }
      }).bind(this));

      event.target.textContent = 'Stop';
    },

    _isShowingDisplay: false,

    // Showing after the window contents loads reduces chance of white
    // flash due to page loading
    _moveToExternalDisplayOnLoad: function(displayWindow, externalDisplayInfo) {
      var args = arguments, self = this;
      displayWindow.contentWindow.addEventListener('load', function(){
        self._moveToExternalDisplay.apply(self, args);
      });
    },

    _moveToExternalDisplay: function(displayWindow, externalDisplayInfo) {
        displayWindow.outerBounds.left = externalDisplayInfo.bounds.left;
        displayWindow.maximize();
        displayWindow.show(false);
    }

  };
})(this);
