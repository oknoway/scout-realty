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
$columnImg = get_sub_field( 'column_image' ); ?>

<article class="post-column">
  <figure class="column-img post-img">
    <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $columnImg[ 'sizes' ][ 'one-third' ] ); ?>">
    <noscript><img src="<?php echo esc_url( $columnImg[ 'sizes' ][ 'one-third' ] ); ?>" alt="<?php echo apply_filters( 'title', $columnImg[ 'title' ] ); ?>" height="<?php echo $columnImg[ 'sizes' ][ 'one-third-height' ]; ?>" width="<?php echo $columnImg[ 'sizes' ][ 'one-third-width' ]; ?>" class="no-js visuallyhidden"></noscript>
    </span>
  </figure>
  <header class="column-header">
    <h4 class="column-title"><?php echo apply_filters( 'the_title', get_sub_field( 'column_headline' ) ); ?></h4>
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
