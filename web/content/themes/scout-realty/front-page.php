<?php
/**
 * The front page template file
 *
 * @package Scout Realty
 * @since 0.1.0
 */

get_header(); ?>

  <div id="primary" class="content-area">
    <div id="content" class="site-content" role="main">

    <?php if ( have_posts() ) :
      $excludedPosts = array(); ?>

      <?php /* Start the Loop */ ?>
      <?php while ( have_posts() ) : the_post(); ?>
        <div class="home-content-wrapper">
          <?php get_template_part( 'partials/content', 'page' ); ?>
        </div>
        
       <?php // Featured Home
         
         $featuredHomeArgs = array(
           'posts_per_page' => 1,
           'category_name' => 'featured-home',
           'orderby' => 'date',
         );
         
         $featuredHome = new WP_Query( $featuredHomeArgs );
         
         while ( $featuredHome->have_posts() ) : $featuredHome->the_post();
          
          $excludedPosts[] = $post->ID;
          
          get_template_part( 'partials/content', 'featured-home' );
         
         endwhile;
         
         wp_reset_postdata(); ?>

         <?php while ( have_rows('content_section') ) : the_row();

           if( get_row_layout() == 'multi_column' ): ?>
           
           <div class="container post-column-wrapper">
             
            <?php while( have_rows('column') ) : the_row();
  
              get_template_part( 'partials/content', 'post-column' );
        
            endwhile; ?>
            
          </div>
          
          <?php elseif ( get_sub_field( 'appearance' ) == 'recent-posts' ) :
            
           get_template_part( 'partials/module', 'related-posts' );

          else :

           get_template_part( 'partials/content', 'block' );
           
          endif;
  
         endwhile; ?>

      <?php endwhile; ?>

    <?php else : ?>

      <?php get_template_part( 'no-results', 'index' ); ?>

    <?php endif; ?>

    </div><!-- #content -->
  </div><!-- #primary -->

<?php get_footer(); ?>