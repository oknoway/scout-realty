<?php
/**
 * The template file for Archives
 *
 * @package Scout Realty
 * @since 0.1.0
 */

get_header(); ?>
 
  <div id="primary" class="content-area">
    <div id="content" class="site-content" role="main">
      <?php // Build page title
        if ( is_neighborhood_archive() ) : ?>
      <header class="page-header">
        <h1 class="page-title">Find Your Next Neighborhood</h1>
      </header>
      <?php endif; ?>

      <?php get_template_part( 'partials/module', 'neighborhood-filter' ); ?>

    <?php if ( have_posts() ) : ?>
    
      <section class="page-section neighborhood-list-wrapper">
        <header class="section-header">
          <?php get_template_part( 'partials/module', 'neighborhood-sort' ); ?>
        </header>
          
       <?php /* Start the Loop */ ?>
       <?php while ( have_posts() ) : the_post(); ?>
 
        <?php get_template_part( 'partials/content', 'neighborhood-list' ); ?>
 
       <?php endwhile; ?>
       <footer class="section-footer">
         <?php get_template_part( 'partials/module', 'pagination' ); ?>
       </footer>
      </section><!-- /.page-section -->
     <?php else : ?>
 
       <?php get_template_part( 'partials/no-results', 'neighborhoods' ); ?>
 
     <?php endif; ?>
 
     </div><!-- #content -->
   </div><!-- #primary -->
 
 <?php get_footer(); ?>
