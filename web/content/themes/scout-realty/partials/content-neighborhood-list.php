<?php
/**
 * The template file for Neighborhood content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>
<article id="neighborhood-<?php the_ID(); ?>" <?php post_class( 'neighborhood-list' ); ?>>
  
  <header class="neighborhood-header">
    <h3 class="neighborhood-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
  </header>
  
  <div class="neighborhood-content-wrapper">
    <?php if ( get_field('map') ) : ?>
      <?php get_template_part( 'partials/module', 'neighborhood-map' ); ?>
    <?php endif; ?>

    <div class="neighborhood-meta">
    
    <?php if ( has_term( '', 'scout_region' ) ) : ?>
      <div class="neighborhood-regions"><?php the_terms( $post->ID, 'scout_region', '', ' / ' ); ?></div>
    <?php endif; ?>
    
    <?php if ( has_term( '', 'scout_quality' ) ) : ?>
      <div class="neighborhood-meta-key">Unique Qualities: <span class="neighborhood-qualities"><?php the_terms( $post->ID, 'scout_quality', '', ', ' ); ?></span></div>
    <?php endif; ?>
    
    <?php if ( get_field( 'average_home_price' ) ) : ?>
      <div class="neighborhood-meta-key">Average Home: <span class="avg-home-price">$<?php the_field( 'average_home_price' ); ?></span></div>
    <?php endif; ?>
    
    </div><!-- /.neighborhood-meta -->
    
    <div class="neighborhood-content">
      <?php the_content(); ?>
    </div><!-- /.neighborhood-content -->
  </div><!-- /.neighborhood-content-wrapper -->
</article><!-- /#neighborhood-<?php the_ID(); ?> -->