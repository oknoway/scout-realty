<?php
/**
 * The template file for Hero module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>
<?php // setup hero images
  
if ( get_field( 'gallery' ) ) :

  $heroImgs = get_field( 'gallery' );
  
elseif ( has_post_thumbnail() ) :

  $featuredImg = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'hero' );
  
  $featuredImg['hero'] = $featuredImg[0];
  $featuredImg['hero-width'] = $featuredImg[1];
  $featuredImg['hero-height'] = $featuredImg[2];
  
  $heroImgs = array();
  $heroImgs[0]['sizes'] = $featuredImg;

endif; ?>

<?php if ( !empty( $heroImgs ) ) : ?>
<div class="hero-wrapper gallery">
<?php foreach ( $heroImgs as $heroImg ) : ?>

  <figure class="hero-img">
    <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $heroImg[ 'sizes' ][ 'hero' ] ); ?>">
      <noscript><img src="<?php echo esc_url( $heroImg[ 'sizes' ][ 'hero' ] ); ?>" alt="<?php echo apply_filters( 'title', $heroImg[ 'title' ] ); ?>" height="<?php echo $heroImg[ 'sizes' ][ 'hero-height' ]; ?>" width="<?php echo $heroImg[ 'sizes' ][ 'hero-width' ]; ?>" class="no-js visuallyhidden"></noscript>
    </span>
  </figure>

<?php endforeach; ?>
</div>
<?php endif; ?>


