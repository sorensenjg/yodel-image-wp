<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://useyodel.com
 * @since             1.0.0
 * @package           Yodel_Image
 *
 * @wordpress-plugin
 * Plugin Name:       Yodel Image
 * Plugin URI:        https://useyodel.com/   
 * Description:       Yodel Image provides AI generated images and attributes, image optimization, magic background removal, and a comprehensive image editor.
 * Version:           1.2.2
 * Author:            Yodel
 * Author URI:        https://useyodel.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       yodel-image
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
} 

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'YODEL_IMAGE_VERSION', '1.2.2' );        
define( 'YODEL_IMAGE_BASENAME',  plugin_basename( __FILE__ ) ); 
define( 'YODEL_IMAGE_API_URL', ( defined( 'WP_ENVIRONMENT_TYPE' ) && WP_ENVIRONMENT_TYPE === 'local' ) ? 'http://localhost:3000' : 'https://useyodel.com' );
define( 'YODEL_STRIPE_PUBLIC_KEY', 'pk_test_51QGV3JGLDYFcTbL6RDRzbippD9ZX7RFZHM4CHwytnKG5SS0GK57rO2JBipYomjdYM88B0orWEBLYN9LcSp7wTasG00htyMh4Sn' );  

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-yodel-image-activator.php
 */
function activate_yodel_image() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-yodel-image-activator.php';
	Yodel_Image_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-yodel-image-deactivator.php
 */
function deactivate_yodel_image() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-yodel-image-deactivator.php';
	Yodel_Image_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_yodel_image' );
register_deactivation_hook( __FILE__, 'deactivate_yodel_image' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-yodel-image.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_yodel_image() {

	$plugin = new Yodel_Image();
	$plugin->run();

}
run_yodel_image();
