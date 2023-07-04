<?php

/**
 * Plugin Name: Gaprency Location Search
 * Version: 1.0.0
 * Description: Injects Location Search with Autosuggestions from Google Maps API, then loads Gparency Marketplace App based on selected location 
 * Author: James500Dev
 * Author URI:  https://500designs.com
 * Text Domain: gaprency-location-search
 */

// Define plugin paths for easier referencing
define('GAPRENCY_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('GAPRENCY_PLUGIN_URL', plugin_dir_url(__FILE__));

function gaprency_enqueue_assets() {
    // Path to asset manifest file
    $manifest_path = GAPRENCY_PLUGIN_PATH . 'app/build/asset-manifest.json';

    // Check if the manifest file exists
    if (!file_exists($manifest_path)) {
        return;
    }

    // Read the manifest file
    $manifest_json = file_get_contents($manifest_path);
    $manifest = json_decode($manifest_json, true);

    // Check if required keys are available
    if (!isset($manifest['files']) || !isset($manifest['entrypoints'])) {
        return;
    }

    $files = $manifest['files'];
    $entrypoints = $manifest['entrypoints'];

    foreach ($entrypoints as $entrypoint) {
        $file = ltrim($entrypoint, '/');

        if (!isset($files[$file])) {
            continue;
        }

        $file_path = GAPRENCY_PLUGIN_URL . 'app/build/' . $file;
        if (preg_match('/\.css$/', $file)) {
            wp_enqueue_style('gaprency_' . md5($file), $file_path, [], null);
        } elseif (preg_match('/\.js$/', $file)) {
            wp_enqueue_script('gaprency_' . md5($file), $file_path, [], null, true);
        }
    }
}

function gaprency_render_app($atts) {
    // // Enqueue necessary assets
    // gaprency_enqueue_assets();
    // Call gaprency_enqueue_assets on the wp_enqueue_scripts action
    add_action('wp_enqueue_scripts', 'gaprency_enqueue_assets');

    // Return the HTML where the React app will hook into
    return '<div id="root"></div>';
}

add_shortcode('gaprency_search_app', 'gaprency_render_app');


// Google Maps API Proxy endpoint
function gaprency_proxy_api_call(WP_REST_Request $request) {
    // Your Google API key
    $google_api_key = 'AIzaSyCl-7pJgI-AXJmpjtYmrJvKtL7p6bP4_W0';

    // Fetch parameters from the request
    $endpoint = $request->get_param('endpoint');
    $parameters = $request->get_params();

    // Remove the endpoint from parameters array
    unset($parameters['endpoint']);

    // Append the API key to the parameters
    $parameters['key'] = $google_api_key;

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
