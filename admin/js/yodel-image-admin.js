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

  // https://atimmer.github.io/wordpress-jsdoc/wp.media.html
  // https://www.ibenic.com/extending-wordpress-media-uploader-custom-tab/
  // https://annaschneider.me/blog/adding-custom-content-with-javascript-to-wordpress-media-modals/
  // https://wordpress.stackexchange.com/questions/270008/wp-media-edit-attachment-screen

  $(function () {
    // const buttonHtml = `Yodel Image <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

    // $("#wp-media-grid > a").after(
    //   $(
    //     `<button class="button" style="position: relative; top: -3px; vertical-align: inherit; margin-left: 8px;">${buttonHtml}</button>`
    //   )
    // );

    if (wp.media) {
      const SelectFrame = wp.media.view.MediaFrame.Select;
      wp.media.view.MediaFrame.Select = yodelImageExtendMediaFrame(
        SelectFrame,
        "yodel-image-select"
      );

      const PostFrame = wp.media.view.MediaFrame.Post;
      wp.media.view.MediaFrame.Post = yodelImageExtendMediaFrame(
        PostFrame,
        "yodel-image-post"
      );
    }
  });

  function yodelImageExtendMediaFrame(Frame, id) {
    const buttonHtml = `Yodel Image <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

    return Frame.extend({
      initialize: function () {
        Frame.prototype.initialize.apply(this, arguments);

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
        Frame.prototype.browseRouter.apply(this, arguments);

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

            // Generate HTML using the template and the data
            // this.$el.html(
            //   this.template({
            //     frame: "Select",
            //   })
            // );

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
})(jQuery);
