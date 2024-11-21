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

  $(function () {
    const Frame = wp.media.view.MediaFrame.Select;

    wp.media.view.MediaFrame.Select = Frame.extend({
      initialize: function () {
        Frame.prototype.initialize.apply(this, arguments);

        const YodelImageState = wp.media.controller.State.extend({
          defaults: _.defaults(
            {
              id: "yodel_image",
              title: `Yodel Image`,
              routerName: "yodel_image",
              content: "yodel_image",
              priority: 100,
            },
            wp.media.controller.State.prototype.defaults
          ),
          // insert: function () {
          //   console.log("Inserted Yodel Image:", this);
          //   this.frame.close();
          // },
        });

        this.states.add([new YodelImageState()]);

        // Handle the content rendering for the new tab
        this.on(
          "content:render:yodel_image",
          this.renderYodelImageContent,
          this
        );
      },
      browseRouter: function (routerView) {
        Frame.prototype.browseRouter.apply(this, arguments);

        // Add the new tab to the router view
        routerView.set({
          yodel_image: {
            html: `Yodel Image <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
            priority: 100,
          },
        });
      },
      // browseContent: function (contentView) {
      //   Frame.prototype.browseContent.call(this, contentView);

      //   // if (activeTab === "yodel_image") {
      //   //   const yodelImageContent = new wp.media.view.YodelImageTabContent();
      //   //   this.content.set(yodelImageContent);
      //   // } else {
      //   //   Frame.prototype.browseContent.apply(this, arguments);
      //   // }

      //   console.log("browseContent:", contentView);
      // },
      renderYodelImageContent: function () {
        // Define the view for Yodel Image content
        const YodelImageView = wp.media.View.extend({
          id: "yodel-image-media",
          className: "yodel-image-media-content",
          template: wp.template("yodel-image-media"),
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

            // Set focus to the view to capture keyboard events
            this.$el.focus();

            // Dispatch the custom event after rendering
            setTimeout(() => {
              const event = new CustomEvent("yodelImageMedia:content:rendered");
              document.dispatchEvent(event);
            }, 200);

            return this;
          },
        });

        // Create an instance of the view
        const yodelView = new YodelImageView();

        // Set the content of the frame
        this.content.set(yodelView);
      },
    });

    // Add a custom template
    $("body #wpfooter").after(`
      <script type="text/html" id="tmpl-yodel-image-media"></script>   
    `);
  });
})(jQuery);
