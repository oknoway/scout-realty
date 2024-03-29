<?php
/**
 * The template file for page content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>

<article id="page-<?php the_ID(); ?>" <?php post_class( 'main-page-content container' ); ?>>
  <header class="page-header">
  <?php if ( get_field( 'headline' ) ) : ?>
    <h1 class="page-title page-headline"><?php the_field( 'headline' ); ?></h1>
  <?php else : ?>
    <h1 class="page-title"><?php the_title(); ?></h1>
  <?php endif; ?>
  </header>
  
  <?php if ( get_field( 'subhead' ) ) : ?>
  <div class="page-subhead">
    <?php the_field( 'subhead' ); ?>
  </div>
  <?php endif; ?>
  
  <div class="page-content">
    <?php the_content(); ?>
  </div>
</article><!-- /#page-<?php the_ID(); ?> -->