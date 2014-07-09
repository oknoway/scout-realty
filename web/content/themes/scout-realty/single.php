<?php
/**
 * The template file for Single Post
 *
 * @package Scout Realty
 * @since 0.1.0
 */

 get_header(); ?>
 
   <div id="primary" class="content-area">
     <div id="content" class="site-content" role="main">
 
     <?php if ( have_posts() ) : ?>
 
       <?php /* Start the Loop */ ?>
       <?php while ( have_posts() ) : the_post(); ?>

         <?php get_template_part( 'partials/content', 'post' ); ?>
 
       <?php endwhile; ?>
 
     <?php else : ?>
 
       <?php get_template_part( 'no-results', 'index' ); ?>
 
     <?php endif; ?>
 
     </div><!-- #content -->
   </div><!-- #primary -->
 
 <?php get_footer(); ?>