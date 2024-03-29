<?php
/**
 * Scout Realty functions and definitions
 *
 * @package Scout Realty
 * @since 0.1.0
 */

// Useful global constants
define( 'SCOUT_VERSION', '0.1.0' );


/**
 * Set the content width based on the theme's design and stylesheet.
 */
 
if ( ! isset( $content_width ) )
  $content_width = 1280; /* pixels */


if ( ! function_exists( 'scout_setup' ) ) :
 /**
  * Set up theme defaults and register supported WordPress features.
  *
  * @uses load_theme_textdomain() For translation/localization support.
  * @uses add_theme_support() For adding theme features.
  * @uses add_image_size() For adding image sizes.
  *
  * @since 0.1.0
  */
  
  function scout_setup() {
     
    /**
     * Custom functions that act independently of the theme templates
     */
    require( get_template_directory() . '/includes/nav-walker.php' );
    
    require( get_template_directory() . '/includes/pagination.php' );
    
    /**
     * Makes Scout Realty available for translation.
     *
     * Translations can be added to the /lang directory.
     * If you're building a theme based on Scout Realty, use a find and replace
     * to change 'scout' to the name of your theme in all template files.
     */
    load_theme_textdomain( 'scout', get_template_directory() . '/languages' );
    
    /**
     * HTML5 Semantic Markup
     */
    add_theme_support( 'html5' );
    
    /**
     * Enable support for Post Thumbnails & images in media
     */
     
    add_post_type_support( 'attachment:audio', 'thumbnail' );
    add_post_type_support( 'attachment:video', 'thumbnail' );
     
    add_theme_support( 'post-thumbnails', array( 'post', 'page', 'attachment:audio', 'attachment:video' ) );
    
    /**
     * Custom image sizes
     */
    add_image_size( 'agent-bio', 386, 290, true );
    add_image_size( 'one-third', 245, 185, true );
    add_image_size( 'post-list', 395, 264, true );
    add_image_size( 'thin-banner', 1200, 300, true );
    add_image_size( 'full-width', 1200, 500, true );
    add_image_size( 'hero-half', 1200, 650, true );
    add_image_size( 'hero', 2000, 1200, true );
    
    /**
     * Enable support for Post Formats
     */
    //add_theme_support( 'post-formats', array( 'aside', 'image', 'video', 'quote', 'link' ) );
    
    /**
     * Register Navigation menus
     */
    register_nav_menus( array(
      'main-nav' => __( 'Primary Navigation', 'scout' ),
      'social' => __( 'Social Links', 'scout' ),
      'footer-nav' => __( 'Footer Navigation', 'scout' ),
    ) );
    
    /**
     * Add custom Post Types
     */
    scout_post_types();
    
    /**
     * Add custom Taxonomies
     */
    scout_taxonomies();
    
    /**
     * Remove extraneous things
     */
    add_action( 'wp_head', 'remove_widget_action', 1);
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'index_rel_link' );
    remove_action( 'wp_head', 'parent_post_rel_link', 10, 0 );
    remove_action( 'wp_head', 'start_post_rel_link', 10, 0 );
    remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10, 0 );
    remove_action( 'wp_head', 'feed_links_extra', 3 );
    remove_filter( 'the_content', 'prepend_attachment' );
    
    function remove_widget_action() {
      global $wp_widget_factory;
      
      remove_action( 'wp_head', array($wp_widget_factory->widgets['WP_Widget_Recent_Comments'], 'recent_comments_style') );
    }
  }
endif; // scout_setup

add_action( 'after_setup_theme', 'scout_setup' );


if ( ! function_exists( 'scout_widgets_init' ) ) :
  /**
   * Register widgetized area and update sidebar with default widgets
   *
   * @uses register_sidebar to register sidebars
   *
   * @since 0.1.0
   */

  function scout_widgets_init() {
    register_sidebar( array(
      'name'          => __( 'Sidebar', 'scout' ),
      'id'            => 'sidebar-1',
      'before_widget' => '<div id="%1$s" class="widget-container %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h5 class="widget-title">',
      'after_title'   => '</h5>',
    ) );
    register_sidebar( array(
      'name'          => __( 'Home Search', 'scout' ),
      'id'            => 'home-search-sidebar',
      'class'         => 'container',
      'before_widget' => '<div id="%1$s" class="widget-container %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h5 class="widget-title">',
      'after_title'   => '</h5>',
    ) );
    register_sidebar( array(
      'name'          => __( 'Header', 'scout' ),
      'id'            => 'header-sidebar',
      'before_widget' => '',
      'after_widget'  => '',
      'before_title'  => '',
      'after_title'   => '',
    ) );
    register_sidebar( array(
      'name'          => __( 'Footer', 'scout' ),
      'id'            => 'footer-sidebar',
      'class'         => 'container',
      'before_widget' => '<div id="%1$s" class="widget-container %2$s">',
      'after_widget'  => '</div>',
      'before_title'  => '<h5 class="widget-title">',
      'after_title'   => '</h5>',
    ) );
  }
endif; // scout_widgets_init

add_action( 'widgets_init', 'scout_widgets_init' );

if ( ! function_exists( 'scout_wp_nav_menu_args' ) ) :
  /**
   * Filter wp_nav_menu
   *
   * @param $args
   *
   * @since 0.1.0
   */

  function scout_wp_nav_menu_args( $args = '' ) {
    $args['link_before'] = '<span class="item-wrapper">';
    $args['link_after'] = '</span>';
    $args['walker'] = new Menu_With_Description;
  
    return $args;
  }
endif; // scout_wp_nav_menu_args


add_filter( 'wp_nav_menu_args', 'scout_wp_nav_menu_args' );



if ( ! function_exists( 'scout_scripts_styles' ) ) :
  /**
   * Enqueue scripts and styles.
   *
   * @uses wp_enqueue_script
   * @uses wp_enqueue_style
   *
   * @since 0.1.0
   */
   
  function scout_scripts_styles() {
    if ( !is_admin() ) {
      $postfix = ( defined( 'SCRIPT_DEBUG' ) && true === SCRIPT_DEBUG ) ? '' : '.min';
      
      wp_register_script( 'google-maps', 'https://www.google.com/maps/api/js?v=3.exp&amp;key=AIzaSyD7CaOXb1xCmve_O4_FVNUcX9fpxbDkiyg', array(), SCOUT_VERSION, false );
      
      if ( is_neighborhood_archive() || get_post_type() == 'scout_neighborhoods' ) {
        
        wp_enqueue_script( 'google-maps' );
      }
      
      
      wp_enqueue_script( 'scout', get_template_directory_uri() . "/assets/js/scout_realty{$postfix}.js", array(), SCOUT_VERSION, true );
      wp_enqueue_script( 'scout-head', get_template_directory_uri() . "/assets/js/head{$postfix}.js", array(), SCOUT_VERSION, false );
      
      //wp_enqueue_script( 'leaflet.shpfile', get_template_directory_uri() . "/assets/js/vendor/leaflet.shpfile.js", array(), SCOUT_VERSION, true );
      
      if ( defined( 'LIVERELOAD' ) && true === LIVERELOAD ) {
        wp_enqueue_script( 'livereload', 'http://' . $_SERVER['HTTP_HOST'] . ':35729/livereload.js', array(), NULL, true );
      }
      
      wp_enqueue_style( 'scout', get_template_directory_uri() . "/assets/css/scout_realty{$postfix}.css", array(), SCOUT_VERSION );
    }
  }
endif; // scout_scripts_styles

add_action( 'wp_enqueue_scripts', 'scout_scripts_styles' );


if ( ! function_exists( 'scout_admin_scripts_styles' ) ) :
  /**
   * Enqueue admin scripts and styles.
   *
   * @uses wp_enqueue_script
   * @uses wp_enqueue_style
   *
   * @since 0.1.0
   */

  function scout_admin_scripts_styles() {
    $postfix = ( defined( 'SCRIPT_DEBUG' ) && true === SCRIPT_DEBUG ) ? '' : '.min';

    wp_enqueue_script( 'scout-admin', get_template_directory_uri() . "/assets/js/admin{$postfix}.js", array(), SCOUT_VERSION, true );

    wp_enqueue_style( 'scout-admin', get_template_directory_uri() . "/assets/css/admin{$postfix}.css", array(), SCOUT_VERSION );
  }
endif; // scout_admin_scripts_styles

add_action( 'admin_enqueue_scripts', 'scout_admin_scripts_styles' );


if ( ! function_exists( 'scout_header_meta' ) ) :
  /**
   * Add humans.txt to the <head> element.
   *
   * @uses apply_filters
   *
   * @since 0.1.0
   */
   
  function scout_header_meta() {
    $humans = '<link type="text/plain" rel="author" href="' . get_template_directory_uri() . '/humans.txt" />';
    
    $selectivizr = '<!--[if (gte IE 6)&(lte IE 8)]>';
    $selectivizr .= '<script type="text/javascript" src="' . get_template_directory_uri() . '/assets/js/vendor/selectivizr.js"></script>';
    $selectivizr .= '<![endif]-->';
    
    echo apply_filters( 'scout_humans', $humans );
    
    echo apply_filters( 'scout_selectivizr', $selectivizr );
  }
endif; // scout_header_meta

add_action( 'wp_head', 'scout_header_meta' );


if ( ! function_exists( 'scout_post_types' ) ):
  /**
   * Register Custom Post Types
   *
   * @uses register_post_types
   *
   * @since 0.1.0
   */
   
  function scout_post_types() {
    $labels = array(
      'name'                 => _x('Neighborhood', 'post type general name'),
      'singular_name'        => _x('Neighborhood', 'post type singular name'),
      'menu_name'            => __('Neighborhoods'),
      'add_new'              => _x('Add New', 'neighborhood'),
      'add_new_item'         => __('Add New Neighborhood'),
      'edit_item'            => __('Edit Neighborhood'),
      'new_item'             => __('New Neighborhood'),
      'all_items'            => __('All Neighborhoods'),
      'view_item'            => __('View Neighborhood'),
      'search_items'         => __('Search Neighborhoods'),
      'not_found'            => __('No neighborhood found'),
      'not_found_in_trash'   => __('No neighborhoods found in Trash'),
      'parent_item_colon'    => '',
    );

    $args = array(
      'label'                => __('Neighborhoods'),
      'labels'               => $labels,
      'public'               => true,
      'publicly_queryable'   => true,
      'show_ui'              => true,
      'show_in_menu'         => true,
      'show_in_nav_menus'    => true,
      'query_var'            => 'neighborhood',
      'rewrite'              => array(
        'slug'                 => 'neighborhoods',
        'hierarchical'         => false
      ),
      'has_archive'          => 'neighborhoods',
      'capability_type'      => 'post',
      'hierarchical'         => false,
      'menu_position'        => null,
      'taxonomies'           => array( 'scout_region', 'scout_quality' ),
      //'register_meta_box_cb' => 'add_post-type_metaboxes',
      'supports'             => array( 'title','editor','thumbnail','excerpt' )
    );

    register_post_type( 'scout_neighborhoods', $args );

    $labels = array(
      'name'                 => _x('Agent', 'post type general name'),
      'singular_name'        => _x('Agent', 'post type singular name'),
      'menu_name'            => __('Agents'),
      'add_new'              => _x('Add New', 'agent'),
      'add_new_item'         => __('Add New Agent'),
      'edit_item'            => __('Edit Agent'),
      'new_item'             => __('New Agent'),
      'all_items'            => __('All Agents'),
      'view_item'            => __('View Agent'),
      'search_items'         => __('Search Agents'),
      'not_found'            => __('No agent found'),
      'not_found_in_trash'   => __('No agents found in Trash'),
      'parent_item_colon'    => '',
    );

    $args = array(
      'label'                => __('Agents'),
      'labels'               => $labels,
      'public'               => true,
      'publicly_queryable'   => true,
      'show_ui'              => true,
      'show_in_menu'         => true,
      'show_in_nav_menus'    => true,
      'query_var'            => 'agent',
      'rewrite'              => array(
        'slug'                 => 'agents',
        'hierarchical'         => false
      ),
      'has_archive'          => false,
      'capability_type'      => 'post',
      'hierarchical'         => false,
      'menu_position'        => null,
      'supports'             => array( 'title','editor','thumbnail','excerpt' )
    );

    register_post_type( 'scout_agents', $args );
  }
endif; // scout_post_types


if ( ! function_exists( 'scout_taxonomies' ) ):
  /**
   * Register Custom Taxonomies
   *
   * @uses register_taxonomy
   *
   * @since 0.1.0
   */

  function scout_taxonomies() {

    $labels = array(
      'name'              => _x( 'Regions', 'taxonomy general name' ),
      'singular_name'     => _x( 'Region', 'taxonomy singular name' ),
      'search_items'      => __( 'Search Regions' ),
      'all_items'         => __( 'All Regions' ),
      'parent_item'       => __( 'Parent Region' ),
      'parent_item_colon' => __( 'Parent Region:' ),
      'edit_item'         => __( 'Edit Region' ),
      'update_item'       => __( 'Update Region' ),
      'add_new_item'      => __( 'Add New Region' ),
      'new_item_name'     => __( 'New Region Name' ),
      'menu_name'         => __( 'Region' ),
    );
  
    $args = array(
      'hierarchical'      => false,
      'labels'            => $labels,
      'show_ui'           => true,
      'show_admin_column' => true,
      'query_var'         => 'region',
      'rewrite'           => array( 'slug' => 'region' ),
    );
  
    register_taxonomy( 'scout_region', array( 'posts', 'scout_neighborhoods' ), $args );

    $labels = array(
      'name'              => _x( 'Features', 'taxonomy general name' ),
      'singular_name'     => _x( 'Feature', 'taxonomy singular name' ),
      'search_items'      => __( 'Search Features' ),
      'all_items'         => __( 'All Features' ),
      'parent_item'       => __( 'Parent Feature' ),
      'parent_item_colon' => __( 'Parent Feature:' ),
      'edit_item'         => __( 'Edit Feature' ),
      'update_item'       => __( 'Update Feature' ),
      'add_new_item'      => __( 'Add New Feature' ),
      'new_item_name'     => __( 'New Feature Name' ),
      'menu_name'         => __( 'Feature' ),
    );
  
    $args = array(
      'hierarchical'      => false,
      'labels'            => $labels,
      'show_ui'           => true,
      'show_admin_column' => true,
      'query_var'         => 'feature',
      'rewrite'           => array( 'slug' => 'feature' ),
    );
  
    register_taxonomy( 'scout_quality', array( 'scout_neighborhoods' ), $args );
  }
  
endif; // scout_taxonomies


if ( ! function_exists( 'scout_add_query_vars' ) ) :
  /**
   * Some loops need to be filtered.
   *
   * @param $vars
   *
   * @return nothing
   */
   

  function scout_add_query_vars( $vars ){
    $vars[] = 'average_home_price';
    $vars[] = 'sort';
    $vars[] = 'in_neighborhood';
    
    return $vars;
  }
  
endif; //scout_add_query_vars

add_filter( 'query_vars', 'scout_add_query_vars' );


if ( ! function_exists( 'scout_query_filter' ) ) :
  /**
   * Some loops need to be filtered.
   *
   * @param $query
   *
   * @uses is_admin
   * @uses is_main_query
   * @uses is_post_type_archive
   *
   * @return nothing
   */
   
  function scout_query_filter( $query ) {
    
    // don't filter the admin
    if ( is_admin() )
      return $query;
    
    // only filter the main query
    if ( $query->is_main_query() ) :

      // filter for neighborhood archive page
      if ( is_neighborhood_archive() ) :
      
        $query->set( 'posts_per_page', 5 );
        
        if ( !get_query_var( 'order' ) ) :
          $query->set( 'order', 'ASC' );
        endif;

        if ( !get_query_var( 'orderby' ) ) :
          $query->set( 'orderby', 'title' );
        endif;
        
        //var_dump( $query );
        //die();
        
      endif;
      
      if( isset($_GET['neighborhood_posts']) ) :
        
        $meta_query = $query->get('meta_query');
        
        $neighborhoodPost = get_page_by_title( $_GET['neighborhood_posts'], OBJECT, 'scout_neighborhoods' );
        
        $meta_query[] = array(
          'key' => 'neighborhood',
          'value' => '"' . $neighborhoodPost->ID . '"',
          'compare' => 'LIKE',
          'type' => 'NUMERIC',
        );
        
        $query->set('meta_query', $meta_query);
      
        //var_dump( $query );
        //die();
      
      endif;
      
      if ( get_query_var( 'average_home_price' ) ) :
        $meta_query = $query->get('meta_query');
        
        $meta_query[] = array(
          'key' => 'average_home_price',
          'value' => get_query_var( 'average_home_price' ),
          'compare' => '<=',
          'type' => 'NUMERIC',
        );
        
        $query->set('meta_query', $meta_query);
      
        //var_dump( $query );
        //die();
        
      endif;
      
      if ( get_query_var( 'sort' ) ) :
        
        $query->set( 'meta_key', 'average_home_price' );
        $query->set( 'orderby', 'meta_value_num' );
        
        if ( get_query_var( 'sort' ) == 'highest' ) :
          $query->set( 'order', 'DESC' );
        elseif ( get_query_var( 'sort' ) == 'lowest' ) :
          $query->set( 'order', 'ASC' );
        endif;
          
        //var_dump( $query );
        //die();
        
      endif;
      
      if ( get_query_var( 'in_neighborhood' ) ) :
          
        $meta_query = $query->get('meta_query');
        
        $meta_query[] = array(
          'key' => 'neighborhood',
          'value' => get_query_var( 'in_neighborhood' ),
          'compare' => '=',
        );
        
        $query->set('meta_query', $meta_query);

      endif;
      
      if ( get_query_var( 'by_agent' ) ) :
          
        $meta_query = $query->get('meta_query');
        
        $meta_query[] = array(
          'key' => 'agent',
          'value' => get_query_var( 'by_agent' ),
          'compare' => '=',
        );
        
        $query->set('meta_query', $meta_query);

      endif;
      
    endif;
    
    return $query;
  }
endif; //scout_query_filter

add_filter( 'pre_get_posts', 'scout_query_filter' );


if ( ! function_exists( 'scout_body_class' ) ) :
  /**
   * Some extra classes for the body.
   *
   * @param $classes
   *
   *
   * @return $classes
   */

  function scout_body_class( $classes ) {
    global $post;
    
    $postType = ( get_query_var( 'post_type' ) ) ? get_query_var( 'post_type' ) : 1;
    
    if ( is_page() )
      $classes[] = $post->post_type . '-' . $post->post_name;
      
    if ( is_page() && $post->post_parent > 0 )
      $classes[] = 'parent-page-' . basename( get_permalink( $post->post_parent ) );

    return $classes;
  }
endif; // scout_body_class

add_filter( 'body_class', 'scout_body_class' );

if ( ! function_exists( 'scout_post_class' ) ) :
  /**
   * Some extra classes for the body.
   *
   * @param $classes
   *
   *
   * @return $classes
   */

  function scout_post_class( $classes ) {
    global $post;
    
    if ( get_field( 'gallery', $post->ID ) || has_post_thumbnail( $post->ID ) )
      $classes[] = 'has-post-img';

    return $classes;
  }
endif; // scout_post_class

add_filter( 'post_class', 'scout_post_class' );


if ( ! function_exists( 'custom_img_sizes' ) ):

  /**
   * Add Custom Image Sizes to admin
   *
   * @param array
   *
   * @uses array_merge
   * @uses add_filter
   *
   * @since 0.1.0
   */

  function custom_img_sizes( $sizes ) {
    return array_merge( $sizes, array(
      'hero' => __( 'Hero Image' ),
      'hero-half' => __( 'Hero Image - Half size' ),
      'one-third' => __( 'One Third of a Page' ),
      'post-list' => __( 'Image in a Post Listing' ),
      'full-width' => __( 'A full-width banner image' ),
      'thin-banner' => __( 'A full-width banner, but shorter' ),
      'agent-bio' => __( 'An agent photo' ),
    ) );
  }
  
  add_filter( 'image_size_names_choose', 'custom_img_sizes' );

endif; // custom_img_sizes


if ( ! function_exists( 'is_neighborhood_archive' ) ) :
  /**
   * Check if this is a neighborhood archive page.
   *
   * @uses get_query_var
   * @uses is_archive
   *
   * @return boolean
   */

  function is_neighborhood_archive( ) {
    
    $postType = ( get_query_var( 'post_type' ) ) ? get_query_var( 'post_type' ) : 1;
    
    if ( is_archive() && ( $postType == 'scout_neighborhoods' ) ) :
      
      return true;

    else :
      
      return false;
      
    endif;
  }
endif; // is_neighborhood_archive

function ellipses_excerpt( $more ) {
  return '&hellip;';
}

add_filter('excerpt_more', 'ellipses_excerpt');

function excerpt_length( $length ) {
	return 20;
}
add_filter( 'excerpt_length', 'excerpt_length', 999 );



// acf post object filter
function scout_post_object_query( $args, $field, $post )
{
    // modify the order
    //$args['orderby'] = 'title';
 
    return $args;
}
 
// filter for every field
add_filter('acf/fields/post_object/query', 'scout_post_object_query', 10, 3);

