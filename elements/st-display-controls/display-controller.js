(global => {
  'use strict';
  // Allows development without connecting to an external display
  var isDev = global.isDev;

  /**
   * Not used or called by Polymer.
   * @constructor
   */
  function DisplayController() {}
  global.DisplayController = DisplayController;
  DisplayController.prototype = {

    get DISPLAY_WINDOW_ID() {
      return 'displayWindow';
    },

    /**
     * Preemptively creates a display window and moves it to an external display
     * if one exists. Effectively the constructor in Polymer.
     */
    created() {
      Promise.all([
        // Create the display window async
        new Promise(resolve => 
          chrome.app.window.create('build/display.html',
            {
              id: this.DISPLAY_WINDOW_ID,
              alwaysOnTop: !isDev,
              frame: 'none',
              focused: false,
              hidden: true,
              resizable: false,
              state: !isDev ? 'maximized' : 'normal',
              visibleOnAllWorkspaces: true
            },
            displayWindow => {
              this._displayWindow = displayWindow;
              resolve(displayWindow);
          })
        ), 

        // Get the external display info async
        this.getExternalDisplayInfo()

     // Finally, move the new display window to the external display found
     ]).then(() => this._moveToExternalDisplayOnLoad());
    },

    /**
     * Toggles the showing of the display window and the text of the toggle
     * button
     * @param {Event} event contains the start/stop button as the target
     */
    toggleDisplay(event) {
      if (!this._toggleDisplayAndText(event.currentTarget)) {
        return;
      }
      // TODO: Else handle no display window
      // TODO: Prevent display close? Or explicitly toggle button text on close?
    },

    /**
     * Finds the first enabled external monitor and caches it.
     * @return {Promise} a promise resolved with an object containing external
     * display info, otherwise rejected with an error
     */
    getExternalDisplayInfo() {
      return new Promise((resolve, reject) => 
        chrome.system.display.getInfo(displayInfos => {
          for (var i = displayInfos.length - 1; i >= 0; i--) {
            if (isDev || !displayInfos[i].isPrimary && displayInfos[i].isEnabled) {
              resolve(this._externalDisplayInfo = displayInfos[i]);
              break;
            }
          }
          reject(new Error('Cannot find an external display.'));
        })
      );
    },

    //--------------------------------------------------------------------------
    //----------------------------  PRIVATE  -----------------------------------

    _isShowingDisplay: false,
    _displayWindow: null,
    _externalDisplayInfo: null,

    /**
     * Toggles the showing and hiding of the display window and adjusts the
     * button text accordingly. Takes in account of dynamic changes to available
     * external displays.
     * @private
     * @param {Node} button Toggle element containing text
     * @return {?AppWindow} Current display window if it exists, otherwise
     * return null
     */
    _toggleDisplayAndText: function(button) {
      // Hide current display window if it's showing
      if (this._displayWindow) {
        if(this._isShowingDisplay) {
          this._displayWindow.hide();
          this._isShowingDisplay = false;
          // Setting textContent on paper-button directly is bugged so find it
          // Note: might be bugged only for shady DOM
          button.$$('.content').textContent = 'Show';
        } else {
          // Query for external monitor each time before showing in case
          // existing monitor is disabled or not available
          this.getExternalDisplayInfo()
          .then(() => {
            this._moveToExternalDisplay(true);
            this._isShowingDisplay = true;
            button.$$('.content').textContent = 'Stop';
          });
        }
      }
      return this._displayWindow;
    },

    /**
     * Attaches an event listener to the current display window so that it will
     * move the display window to the external display on display window load.
     * Showing after the window contents loads reduces chance of white flash due
     * to page loading.
     * @private
     * @param {boolean=} opt_shouldShow Shows display window on load if true
     */
    _moveToExternalDisplayOnLoad(opt_shouldShow) {
      this._displayWindow.contentWindow.addEventListener('load', () =>
        this._moveToExternalDisplay(opt_shouldShow)
      );
    },

    /**
     * Moves the current display window to the current external display
     * immediately.
     * @private
     * @param {boolean=} opt_shouldShow Shows display window on load if true
     */
    _moveToExternalDisplay(opt_shouldShow) {
        this._displayWindow.outerBounds.left = this._externalDisplayInfo.bounds.left;
        if (!isDev) {
          this._displayWindow.maximize();
        }
        if (opt_shouldShow) {
          this._displayWindow.show(false);
        }
    }

  };
})(this);
