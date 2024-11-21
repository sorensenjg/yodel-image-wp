<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://useyodel.com
 * @since      1.0.0
 *
 * @package    Yodel_Image
 * @subpackage Yodel_Image/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Yodel_Image
 * @subpackage Yodel_Image/admin
 * @author     Yodel <contact@useyodel.com>
 */
class Yodel_Image_Admin { 

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	private $api_url;
	private $stripe_public_key;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version, $api_url, $stripe_public_key ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;
		$this->api_url = $api_url; 
		$this->stripe_public_key = $stripe_public_key; 

		add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
        add_action( 'wp_ajax_yodel_image_update_options', array( $this, 'update_options' ) ); 

	} 

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() { 

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Yodel_Image_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Yodel_Image_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/yodel-image-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Yodel_Image_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Yodel_Image_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		$build_dir = plugin_dir_path(__DIR__) . 'build/';
        $build_url = plugins_url('build/', __DIR__);

        if (!is_dir($build_dir)) {
            return;
        }

        $asset_file = file_exists($build_dir . 'index.asset.php') ? include($build_dir . 'index.asset.php') : null;
        
        $files = scandir($build_dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;

            $file_path = $build_dir . $file;
            $file_url = $build_url . $file;

            if (is_file($file_path)) {
                $file_info = pathinfo($file);
                $ext = $file_info['extension'];
                $filename = $file_info['filename'];
                $handle = "{$this->plugin_name}-{$filename}";     
                
                if ($ext === 'js') { 
                    $deps = $asset_file['dependencies'] ?? [];
                    $version = $asset_file['version'] ?? filemtime($file_path);

                    wp_enqueue_script($handle, $file_url, $deps, $version, true);
                } elseif ($ext === 'css') {
					// exclude rtl.css
					if (strpos($file, '-rtl.css') !== false) continue;
					

                    wp_enqueue_style($handle, $file_url, [], filemtime($file_path));
                }
            }
        } 

        wp_localize_script($this->plugin_name . '-index', 'yodelImageAdmin', [ 
            'config' => array(
				'version' 			=> $this->version,   
				'rootId' 			=> 'yodel-image-admin', 
				'apiUrl'			=> $this->api_url, 
				'ajaxUrl' 			=> admin_url('admin-ajax.php'),     
				'ajaxNonce' 		=> wp_create_nonce('yodel-image-nonce'),  
				'restUrl' 			=> esc_url(rest_url('wp/v2')),
				'restNonce' 		=> wp_create_nonce('wp_rest'),
				'stripePublicKey' 	=> $this->stripe_public_key,  
            ),
			'settings' => array(
				'apiKey'			=> get_option('yodel_image_api_key'),  
			) 
        ]);

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/yodel-image-admin.js', array( 'jquery', 'media-views' ), $this->version, true );
	}

	public function register_admin_menu() {
		$icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>';

		add_menu_page(  
			'Yodel Image',
			'Yodel Image',
			'manage_options',
			$this->plugin_name, 
			array( $this, 'admin_menu_root_html' ),
			'data:image/svg+xml;base64,' . base64_encode( $icon ),
			99
		);  
	}

	public function admin_menu_root_html() { 
		?>
		<div id="yodel-image-admin"></div>  	 
		<?php 
	} 

	public function update_options() { 
		check_ajax_referer( 'yodel-image-nonce', 'nonce' ); 

		$options = $_POST; 
        unset($options['action'], $options['nonce']); 

		foreach ( $options as $key => $value ) { 
			update_option( $key, $value );
		}

		wp_send_json_success( array( 'message' => 'Options updated successfully' ) );
    }

}
