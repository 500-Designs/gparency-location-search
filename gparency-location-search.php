<?php

/**
 * Plugin Name: Gaprency Location Search
 * Version: 1.5.0
 * Description: Injects Location Search with Autosuggestions from Google Maps API, then loads Gparency Marketplace App based on selected location 
 * Author: James500Dev
 * Author URI:  https://500designs.com
 * Text Domain: gaprency-location-search
 */

// Define plugin paths for easier referencing
define('GAPRENCY_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('GAPRENCY_PLUGIN_URL', plugin_dir_url(__FILE__));

function gaprency_enqueue_assets() {
    // Check if it's the front page
    if (!is_front_page()) {
        return;
    }

    // Locate JS file
    $dir_js = GAPRENCY_PLUGIN_PATH . 'app/build/static/js/';
    $files_js = scandir($dir_js);
    $app_js = preg_grep('/^main\..*\.js$/', $files_js);
    $app_js = GAPRENCY_PLUGIN_URL . 'app/build/static/js/' . array_shift($app_js);

    // Locate CSS file
    $dir_css = GAPRENCY_PLUGIN_PATH . 'app/build/static/css/';
    $files_css = scandir($dir_css);
    $app_css = preg_grep('/^main\..*\.css$/', $files_css);
    $app_css = GAPRENCY_PLUGIN_URL . 'app/build/static/css/' . array_shift($app_css);

    // Enqueue JS and CSS
    wp_enqueue_script('gaprency_app', $app_js, array(), '1.0.0', true);
    wp_enqueue_style('gaprency_app', $app_css, array(), '1.0.0');
    wp_localize_script('wp-env-script', 'wpEnv', array(
        'environment' => defined('WP_ENVIRONMENT_TYPE') ? WP_ENVIRONMENT_TYPE : 'unknown',
    ));
}

// Enqueue scripts and styles on the front end
add_action('wp_enqueue_scripts', 'gaprency_enqueue_assets');

function gaprency_render_app($atts) {
    // Return the HTML where the React app will hook into
    return '<div id="root"></div>';
}

add_shortcode('gaprency_search_app', 'gaprency_render_app');

// Google Maps API Proxy endpoint
function gaprency_proxy_api_call(WP_REST_Request $request) {
    // Your Google API key
    // $google_api_key = 'AIzaSyCl-7pJgI-AXJmpjtYmrJvKtL7p6bP4_W0';
    $google_api_key = 'AIzaSyCTOFMGUs30v-cHkBMip0lq1dCTMAJsG6Y';

    // Fetch parameters from the request
    $endpoint = $request->get_param('endpoint');
    $parameters = $request->get_params();

    // Remove the endpoint from parameters array
    unset($parameters['endpoint']);

    // Append the API key to the parameters
    $parameters['key'] = $google_api_key;

    // Restrict the search to the United States
    $parameters['components'] = 'country:US';

    // Build the API URL
    $url = 'https://maps.googleapis.com/maps/api/' . $endpoint . '?' . http_build_query($parameters);

    // Send a GET request to the Google API
    $response = wp_remote_get($url);

    // Forward the response from the Google API back to the client
    return rest_ensure_response(json_decode(wp_remote_retrieve_body($response)));
}

add_action('rest_api_init', function () {
    register_rest_route('gaprency/v1', '/proxy', [
        'methods' => 'GET',
        'callback' => 'gaprency_proxy_api_call',
    ]);
});
