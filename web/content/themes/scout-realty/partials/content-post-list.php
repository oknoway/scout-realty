<?php
/**
 * The template file for Post List content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
// Extra post classes.

$postClasses = array( 'post-list' );

// Featured Image
if ( has_post_thumbnail() ) :

  $featuredImg = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), 'post-list' );

endif;

?>
<article id="post-<?php the_ID(); ?>" <?php post_class( $postClasses ); ?>>
  <a href="<?php the_permalink(); ?>">
    <div class="post-meta">
      <a href="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" class="blog-archive-link">Blog</a>
      <time datetime="<?php the_time( 'r' ); ?>" class="post-date"><span><?php the_time( 'd' ); ?></span><?php the_time( 'M' ); ?></time>
    </div>
    
    <?php if ( !empty( $featuredImg ) ) : ?>
    <figure class="featured-img half post-img">
      <span class="fake-img" style="background-image:url('<?php echo $featuredImg[0]; ?>');"><img src="<?php echo $featuredImg[0]; ?>" class="visuallyhidden" /></span>
    </figure>
    <?php endif; ?>
    
    <div class="post-content-wrapper">
      <header class="post-header">
      
      <?php if ( get_field( 'region' ) ) :
        
        $postRegion = get_field( 'region' );

        foreach( $postRegion as $region ) : ?>
        <a href="<?php echo get_term_link( $region ); ?>" class="post-region post-location"><?php echo $region->name; ?></a>
        <?php endforeach;
      endif;
      
      if ( get_field( 'neighborhood' ) ) :
        
        $postNeighborhood = get_field( 'neighborhood' );
      ?>
      <a href="<?php echo get_the_permalink( $postNeighborhood->ID ); ?>" class="post-neighborhood post-location"><?php echo $postNeighborhood->post_title; ?></a>
  
      <?php endif; ?>
      
        <h4 class="post-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h4>
      </header>
      
      <div class="post-except post-content">
        <?php the_excerpt(); ?>
      </div><!-- /.post-content -->
    </div><!-- /.post-content-wrapper -->
  </a>
</article><!-- /#post-<?php the_ID(); ?> -->