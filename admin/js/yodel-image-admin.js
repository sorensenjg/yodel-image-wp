(function ($) {
  "use strict";

  /**
   * All of the code for your admin-facing JavaScript source
   * should reside in this file.
   *
   * Note: It has been assumed you will write jQuery code here, so the
   * $ function reference has been prepared for usage within the scope
   * of this function.
   *
   * This enables you to define handlers, for when the DOM is ready:
   *
   * $(function() {
   *
   * });
   *
   * When the window is loaded:
   *
   * $( window ).on('load', function() {
   *
   * });
   *
   * ...and/or other possibilities.
   *
   * Ideally, it is not considered best practice to attach more than a
   * single DOM-ready or window-load handler for a particular page.
   * Although scripts in the WordPress core, Plugins, and Themes may be
   * practicing this, we should strive to set a better example in our own work.
   */

  // https://codex.wordpress.org/Javascript_Reference/wp.media
  // https://atimmer.github.io/wordpress-jsdoc/wp.media.html
  // https://www.ibenic.com/extending-wordpress-media-uploader-custom-tab/
  // https://annaschneider.me/blog/adding-custom-content-with-javascript-to-wordpress-media-modals/
  // https://wordpress.stackexchange.com/questions/270008/wp-media-edit-attachment-screen
  // https://wordpress.stackexchange.com/questions/269099/how-to-capture-the-selectiontoggle-event-fired-by-wp-media

  $(function () {
    new YodelImage();
  });

  class YodelImage {
    constructor() {
      this.media = wp.media;

      this.initialize();
    }

    initialize() {
      if (!this.media) {
        return;
      }

      this.extendMediaFrameSelectView();
      this.extendMediaFramePostView();
      // this.extendTest();

      // // Override the default media frame
      // wp.media.view.MediaFrame.Post = wp.media.view.MediaFrame.Post.extend({
      //   initialize: function () {
      //     wp.media.view.MediaFrame.Post.__super__.initialize.apply(
      //       this,
      //       arguments
      //     );
      //     // Add custom settings or modify existing ones here
      //     this.on("toolbar:create:selection", this.addCustomButton, this);
      //   },

      //   /**
      //    * Add a custom button to the media toolbar
      //    */
      //   addCustomButton: function (view) {
      //     view.set("toolbar", [
      //       {
      //         text: "Custom Action",
      //         className: "button button-primary",
      //         click: this.customAction.bind(this),
      //       },
      //     ]);
      //   },

      //   /**
      //    * Define the custom action to be performed
      //    */
      //   customAction: function () {
      //     // Your custom action logic here
      //     alert("Custom Action Clicked!");
      //   },
      // });

      // // Add a custom state or modify existing states if needed
      // var originalStates = wp.media.view.MediaFrame.Post.prototype.states.models;
      // // Example: Adding a new state
      // wp.media.view.MediaFrame.Post.prototype.states.add([
      //   new wp.media.controller.Library({
      //     id: "my-custom-state",
      //     title: "My Custom State",
      //     priority: 20,
      //     library: wp.media.query(),
      //     filterable: "all",
      //     multiple: true,
      //     editable: true,
      //   }),
      // ]);
    }

    extendMediaFrameSelectView() {
      const id = "yodel-image-select";
      const buttonHtml = `Yodel Image <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

      const View = this.media.view.MediaFrame.Select;

      this.media.view.MediaFrame.Select = View.extend({
        initialize: function () {
          View.prototype.initialize.apply(this, arguments);

          // this.states.add({
          //   id: "yodel_image",
          // });

          this.on(
            "open",
            function () {
              const event = new CustomEvent(`${id}:content:rendered`);
              document.dispatchEvent(event);
            },
            this
          );

          this.on(
            "close",
            function () {
              const event = new CustomEvent("yodel-image-modal:closed");
              document.dispatchEvent(event);
            },
            this
          );

          this.on(
            "content:render:yodel_image",
            this.renderYodelImageContent,
            this
          );
        },
        browseRouter: function (routerView) {
          View.prototype.browseRouter.apply(this, arguments);

          // Add the new tab to the router view
          routerView.set({
            yodel_image: {
              html: buttonHtml,
              priority: 100,
            },
          });
        },
        renderYodelImageContent: function () {
          const YodelImageView = wp.media.View.extend({
            id: `${id}-media-content`,
            className: "yodel-image",
            template: wp.template("yodel-image-media-content"),
            attributes: {
              tabindex: "0", // Allows the element to receive focus
            },
            events: {
              keydown: function (event) {
                if (event.key === "Escape" || event.keyCode === 27) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              },
            },
            render: function () {
              wp.media.View.prototype.render.apply(this, arguments);

              // Delay the focus to ensure the element is rendered and attached
              requestAnimationFrame(() => {
                if (this.el) {
                  this.el.focus();
                }
              });

              // Dispatch your custom event when the media frame closes
              requestAnimationFrame(() => {
                const event = new CustomEvent(`${id}:content:rendered`);
                document.dispatchEvent(event);
              });

              return this;
            },
          });

          // Create an instance of the view
          const yodelView = new YodelImageView();

          // Set the content of the frame
          this.content.set(yodelView);
        },
      });
    }

    extendMediaFramePostView() {
      const id = "yodel-image-post";
      const buttonHtml = `Yodel Image <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

      const View = this.media.view.MediaFrame.Select;

      this.media.view.MediaFrame.Select = View.extend({
        initialize: function () {
          View.prototype.initialize.apply(this, arguments);

          this.on(
            "open",
            function () {
              const event = new CustomEvent(`${id}:content:rendered`);
              document.dispatchEvent(event);
            },
            this
          );

          this.on(
            "close",
            function () {
              const event = new CustomEvent("yodel-image-modal:closed");
              document.dispatchEvent(event);
            },
            this
          );

          this.on(
            "content:render:yodel_image",
            this.renderYodelImageContent,
            this
          );
        },
        browseRouter: function (routerView) {
          View.prototype.browseRouter.apply(this, arguments);

          // Add the new tab to the router view
          routerView.set({
            yodel_image: {
              html: buttonHtml,
              priority: 100,
            },
          });
        },
        renderYodelImageContent: function () {
          const YodelImageView = wp.media.View.extend({
            id: `${id}-media-content`,
            className: "yodel-image",
            template: wp.template("yodel-image-media-content"),
            attributes: {
              tabindex: "0", // Allows the element to receive focus
            },
            events: {
              keydown: function (event) {
                if (event.key === "Escape" || event.keyCode === 27) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              },
            },
            render: function () {
              wp.media.View.prototype.render.apply(this, arguments);

              // Delay the focus to ensure the element is rendered and attached
              requestAnimationFrame(() => {
                if (this.el) {
                  this.el.focus();
                }
              });

              // Dispatch your custom event when the media frame closes
              requestAnimationFrame(() => {
                const event = new CustomEvent(`${id}:content:rendered`);
                document.dispatchEvent(event);
              });

              return this;
            },
          });

          // Create an instance of the view
          const yodelView = new YodelImageView();

          // Set the content of the frame
          this.content.set(yodelView);
        },
      });
    }

    extendTest() {
      const View = this.media.view.MediaFrame.EditAttachments;

      this.media.view.MediaFrame.EditAttachments = View.extend({
        initialize: function () {
          View.prototype.initialize.apply(this, arguments);

          // Additional customizations
          // console.log("Context:", this);
          // console.log("Args:", arguments);

          // Add a custom panel or modify existing ones
          // this.addCustomSettingsPanel();
        },
        addCustomSettingsPanel: function () {
          // Create a new view for the custom settings
          const CustomSettingsView = wp.media.View.extend({
            tagName: "div",
            className: "yodel-custom-settings",
            template: wp.media.template("yodel-custom-settings-template"),

            initialize: function () {
              wp.media.View.prototype.initialize.apply(this, arguments);
            },

            render: function () {
              this.$el.html(this.template());
              return this;
            },
          });

          // Instantiate and render the custom settings view
          const customSettings = new CustomSettingsView();
          customSettings.render();

          // Append the custom settings panel to the attachment details
          this.$el
            .find(".attachment-display-settings")
            .append(customSettings.el);
        },
        render: function () {
          View.prototype.render.apply(this, arguments);

          const container = $(
            '<div id="yodel-image-select-media-content">Hello Yodel Sidebar!</div>'
          );
          this.$el.find(".attachment-info").replaceWith(container);

          return this;
        },
      });
    }
  }
})(jQuery);
