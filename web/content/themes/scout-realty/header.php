<?php
 /**
  * The Header for our theme.
  *
  * Displays all of the <head> section and everything until <div id="main">
  *
  * @package Scout Realty
  * @since 0.1.0
  */
 ?><!DOCTYPE html>
<!--[if IE 8]><html class="no-js lt-ie9" <?php language_attributes(); ?>><![endif]-->
<!--[if gt IE 8]><!--><html class="no-js" <?php language_attributes(); ?>><!--<![endif]-->
<head>
 <meta charset="<?php bloginfo( 'charset' ); ?>" />
 <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
 <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui=1">

 <meta name="apple-mobile-web-app-title" content="Scout Realty" />
 <title><?php wp_title( '|', true, 'right' ); ?></title>
 <!-- pre -->
 <?php wp_head(); ?>
 <!-- post -->
 <style>.js .no-js { display: none; }</style>
</head>
<body <?php body_class(); ?>>
<div id="page" class="hfeed site">
 <?php do_action( 'before' ); ?>
 <header id="masthead" class="site-header" role="banner">
   <div class="container">
     <h1 class="site-title">
       <a href="<?php bloginfo('url'); ?>" title="<?php esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><?php esc_attr( get_bloginfo( 'name' ) ); ?></a>
     </h1>
     <nav id="site-navigation" class="navigation-main" role="navigation">
       <?php if ( ! dynamic_sidebar( 'Header' ) ) : ?>
         <?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
       <?php endif; // end sidebar widget area ?>
     </nav><!-- #site-navigation -->
   </div><!-- .container -->
 </header><!-- #masthead -->
 <div id="main" class="site-main">
