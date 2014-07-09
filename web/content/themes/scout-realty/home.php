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
      <header class="page-header">
      <?php // Build page title
        if ( is_neighborhood_archive() ) : ?>
        <h1 class="page-title">Find Your Next Neighborhood</h1>
      <?php elseif ( is_home() ) : ?>
        <h1 class="page-title">The Scout Blog</h1>
      <?php endif; ?>
      </header>

      <?php //get_template_part( 'partials/module', 'neighborhood-filter' ); ?>

    <?php if ( have_posts() ) :
      
      // build archive title
      $archiveTitle = null;
      
      if ( !empty( $wp_query->query_vars['author_name'] ) ) :
        $author = get_user_by( 'slug', $wp_query->query_vars['author_name'] );
        $archiveTitle = 'Posts by ' . $author->data->display_name;
      elseif ( is_category() ) : 
        
        $archiveTitle = 'Posts in the ' . single_cat_title( '', false ) . ' category';
      elseif ( isset( $_GET['neighborhood'] ) ) :
        $neighborhoodPost = get_page_by_title( $_GET['neighborhood'], OBJECT, 'scout_neighborhoods' );

        $archiveTitle = 'Posts about the ' . apply_filters( 'the_title', $neighborhoodPost->post_title ) . ' Neighborhood';
      endif;
      
    ?>
      <section class="page-section">
        <header class="section-header">
          <?php if (!empty( $archiveTitle ) ) : ?>
          <h1 class="page-title"><?php echo apply_filters( 'the_title', $archiveTitle ); ?></h1>
          <?php endif; ?>
          <?php //get_template_part( 'partials/module', 'neighborhood-sort' ); ?>
        </header>
        <div class="archive-wrapper">
       <?php /* Start the Loop */ ?>
       <?php while ( have_posts() ) : the_post(); ?>
 
        <?php get_template_part( 'partials/content', 'post-list' ); ?>
 
       <?php endwhile; ?>
       
       <?php get_template_part( 'partials/sidebar' ); ?>

       <footer class="section-footer">
         <?php get_template_part( 'partials/module', 'pagination' ); ?>
       </footer>
      </section><!-- /.page-section -->
     <?php else : ?>
 
       <?php get_template_part( 'no-results', 'index' ); ?>
 
     <?php endif; ?>
 
     </div><!-- #content -->
   </div><!-- #primary -->
 
 <?php get_footer(); ?>
