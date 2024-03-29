<?php
/**
 * The template file for Neighborhood content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>

<?php get_template_part( 'partials/module', 'hero' ); ?>

<article id="neighborhood-<?php the_ID(); ?>" <?php post_class( 'main-page-content neighborhood-detail' ); ?>>


  <div class="neighborhood-content-wrapper">
  
  <?php if ( get_field('map') ) : ?>
    <?php get_template_part( 'partials/module', 'neighborhood-map' ); ?>
  <?php endif; ?>
  
    <header class="neighborhood-header">
      <h1 class="neighborhood-title"><?php the_title(); ?></h1>
    </header>
  
    <div class="neighborhood-meta">
    
    <?php if ( has_term( '', 'scout_region' ) ) : ?>
      <span class="neighborhood-regions"><?php the_terms( $post->ID, 'scout_region', '', ' / ' ); ?></span>
    <?php endif; ?>
    
    <?php if ( get_field( 'average_home_price' ) ) : ?>
      <span class="neighborhood-meta-key">Average Home Price:</span> <span class="avg-home-price">$<?php  echo number_format( get_field( 'average_home_price' ) ); ?></span>
    <?php endif; ?>
    
    <?php if ( has_term( '', 'scout_quality' ) ) : ?>
      <span class="neighborhood-meta-key">Neighborhood Features: <span class="neighborhood-qualities"><?php the_terms( $post->ID, 'scout_quality', '', ', ' ); ?></span>
    <?php endif; ?>
    
    </div><!-- /.neighborhood-meta -->
    
    <div class="neighborhood-content">
      <?php the_content(); ?>
    </div><!-- /.neighborhood-content -->
  </div><!-- /.neighborhood-content-wrapper -->
</article><!-- /#neighborhood-<?php the_ID(); ?> -->