<?php
/**
 * The template file for Post List content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
 
// Post meta

$postMeta = get_fields();
$addressKeys = array( 'street_address', 'city', 'state', 'zip' ); 


// Extra post classes.

$postClasses = array( 'post-list' );

// Featured Image
if ( has_post_thumbnail() ) :

  $featuredImg = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'post-list' );

endif;

?>
<article id="post-<?php the_ID(); ?>" <?php post_class( $postClasses ); ?>>
  <div class="post-meta">
    <a href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" class="blog-archive-link">Blog</a>
    <time datetime="<?php the_time( 'r' ); ?>" class="post-date"><span><?php the_time( 'd' ); ?></span><?php the_time( 'M' ); ?></time>
  </div>
  
  <?php if ( !empty( $featuredImg ) ) : ?>
  <figure class="featured-img half post-img">
    <a href="<?php the_permalink(); ?>">
      <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url($featuredImg[0] ); ?>">
        <noscript><img src="<?php echo esc_url( $featuredImg[0] ); ?>" height="<?php echo $featuredImg[1]; ?>" width="<?php echo $featuredImg[2]; ?>" class="no-js visuallyhidden"></noscript>
      </span>
      
    <?php if ( !empty( $postMeta['price'] ) ) : ?>
      <figcaption class="home-price">$<?php echo number_format( $postMeta['price'] ); ?></figcaption>
    <?php endif; ?>
    </a>
  </figure>
  <?php endif; ?>
  
  <div class="post-content-wrapper">
    <header class="post-header">
    
    <?php if ( !empty( $postMeta[ 'region' ] ) ) :

      foreach( $postMeta[ 'region' ] as $region ) : ?>
      <a href="<?php echo get_term_link( $region ); ?>" class="post-region post-location"><?php echo $region->name; ?></a>
      <?php endforeach;
    endif;
    
    if ( !empty( $postMeta[ 'neighborhood' ] ) ) : ?>
      <a href="<?php echo get_the_permalink( $postMeta[ 'neighborhood' ]->ID ); ?>" class="post-neighborhood post-location"><?php echo $postMeta[ 'neighborhood' ]->post_title; ?></a>

    <?php endif; ?>
    
      <h4 class="post-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
      
    <?php if ( !empty( $postMeta[ 'street_address' ] ) || !empty( $postMeta[ 'city' ] ) || !empty( $postMeta[ 'state' ] ) || !empty( $postMeta[ 'zip' ] ) ) : ?>
      <div class="address post-address">
        
      <?php foreach( $addressKeys as $addressKey ) : ?>
        <?php if ( !empty( $postMeta[ $addressKey ] ) ) : ?>
          <span class="address-field address-<?php echo $addressKey; ?>"><?php echo ( $addressKey == 'city') ? $postMeta[ $addressKey ] . ', ' : $postMeta[ $addressKey ]; ?></span>
        <?php endif; ?>
      <?php endforeach; ?>

      </div>
      <?php endif; ?>
      
    </header>
    
    <div class="post-excerpt post-content">
      <?php the_excerpt(); ?>
    </div><!-- /.post-content -->
  </div><!-- /.post-content-wrapper -->
</article><!-- /#post-<?php the_ID(); ?> -->