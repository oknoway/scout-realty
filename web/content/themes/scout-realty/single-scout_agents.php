<?php
/**
 * The template file for Agents
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
 
         <?php get_template_part( 'partials/content', 'agent-bio' ); ?>

         <?php get_template_part( 'partials/module', 'related-posts' ); ?>
 
       <?php endwhile; ?>
 
     <?php else : ?>
 
       <?php get_template_part( 'no-results', 'index' ); ?>
 
     <?php endif; ?>
 
     </div><!-- #content -->
   </div><!-- #primary -->
 
 <?php get_footer(); ?>