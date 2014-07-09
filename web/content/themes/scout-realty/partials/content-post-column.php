<?php
/**
 * The template file for Post Columns
 *
 * @package Scout Realty
 * @since 0.1.0
 */

?>
<?php // setup section data
$linkedPage = get_sub_field( 'page' );
$sectionImg = get_sub_field( 'section_image' ); ?>

<article class="post-column">
  <figure class="column-img">
    <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $sectionImg[ 'sizes' ][ 'one-third' ] ); ?>">
    <noscript><img src="<?php echo esc_url( $sectionImg[ 'sizes' ][ 'one-third' ] ); ?>" alt="<?php echo apply_filters( 'title', $sectionImg[ 'title' ] ); ?>" height="<?php echo $sectionImg[ 'sizes' ][ 'one-third-height' ]; ?>" width="<?php echo $sectionImg[ 'sizes' ][ 'one-third-width' ]; ?>" class="no-js visuallyhidden"></noscript>
    </span>
  </figure>
  <header class="column-header">
    <h3 class="column-title"><?php echo apply_filters( 'the_title', get_sub_field( 'column_headline' ) ); ?></h3>
  </header>
  
  <div class="column-content">
    <?php echo apply_filters( 'the_content', get_sub_field( 'column_content' ) ); ?>
  </div>
  
  <footer class="section-footer">
  
  <?php if ( get_sub_field( 'page_link_text' ) && !empty( $linkedPage ) ) : ?>
    <a href="<?php echo esc_url( get_the_permalink( $linkedPage->ID ) ); ?>" class="cta"><?php the_sub_field( 'page_link_text' ); ?></a>
  <?php endif; ?>
  
  </footer>
</article>
