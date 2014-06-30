<?php
/**
 * The template file for Neighborhood content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
// Extra post classes.

$postClasses = array();

if ( is_neighborhood_archive() ) :
  $postClasses[] = 'neighborhood-list';
elseif ( is_single() ) :
  $postClasses[] = 'main-page-content';
endif;

// Build the headline

$headline = null;

$headline .= is_neighborhood_archive() ? '<h3 class="neighborhood-title">' : '<h1 class="neighborhood-title">';
$headline .= is_neighborhood_archive() ? '<a href="' . get_the_permalink() . '">' : null;
$headline .= get_the_title(  );
$headline .= is_neighborhood_archive() ? '</a>' : null;
$headline .= is_neighborhood_archive() ? '</h3>' : '</h1>';

?>
<article id="neighborhood-<?php the_ID(); ?>" <?php post_class( $postClasses ); ?>>
  
  <header class="neighborhood-header">
    <?php echo $headline ?>
  </header>
  
  <div class="neighborhood-content-wrapper">
  
    <div class="neighborhood-meta">
    
    <?php if ( has_term( '', 'scout_region' ) ) : ?>
      <span class="neighborhood-regions"><?php the_terms( $post->ID, 'scout_region', '', ' / ' ); ?></span>
    <?php endif; ?>
    
    <?php if ( get_field( 'average_home_price' ) ) : ?>
      <span class="neighborhood-meta-key">Average Home:</span> <span class="avg-home-price">$<?php the_field( 'average_home_price' ); ?></span>
    <?php endif; ?>
    
    <?php if ( has_term( '', 'scout_quality' ) ) : ?>
      <span class="neighborhood-meta-key">Unique Qualities: <span class="neighborhood-qualities"><?php the_terms( $post->ID, 'scout_quality', '', ', ' ); ?></span>
    <?php endif; ?>
    
    </div><!-- /.neighborhood-meta -->
    
    <?php if ( get_field('map') ) : ?>
      <?php get_template_part( 'partials/module', 'neighborhood-map' ); ?>
    <?php endif; ?>
    <div class="neighborhood-content">
      <?php the_content(); ?>
    </div><!-- /.neighborhood-content -->
  </div><!-- /.neighborhood-content-wrapper -->
</article><!-- /#neighborhood-<?php the_ID(); ?> -->