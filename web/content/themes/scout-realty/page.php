<?php
/**
 * The template file for pages
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

        <?php get_template_part( 'partials/content', 'page' ); ?>
        
        <?php if ( locate_template( 'partials/content-page-' . $post->post_name . '.php') != '') :
         
          get_template_part( 'partials/content', 'page-' . $post->post_name );
         
        endif; ?>

        <?php while ( have_rows('content_section') ) : the_row();

          get_template_part( 'partials/content', 'block' );

        endwhile; ?>

      <?php endwhile; ?>

    <?php else : ?>

      <?php get_template_part( 'no-results', 'index' ); ?>

    <?php endif; ?>

    </div><!-- #content -->
  </div><!-- #primary -->

<?php get_footer(); ?>