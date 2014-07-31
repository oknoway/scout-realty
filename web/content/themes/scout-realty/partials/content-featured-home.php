<?php
/**
 * The template file for Featured Homes
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
 
// Post meta

$postMeta = get_fields();

$addressKeys = array( 'street_address', 'city', 'state', 'zip' ); 


// Extra post classes.

$postClasses = array( 'featured-home', 'post-detail' );

?>

<article id="post-<?php the_ID(); ?>" <?php post_class( $postClasses ); ?>>
  <?php get_template_part( 'partials/module', 'hero' ); ?>
  
  <div class="post-content-wrapper">
    <header class="post-header">
    <?php if ( !empty( $postMeta[ 'headline' ] ) ) : ?>
      <h1 class="post-title post-headline"><a href="<?php the_permalink(); ?>"><?php echo $postMeta[ 'headline' ]; ?></a></h1>
    <?php else : ?>
      <h1 class="post-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1>
    <?php endif; ?>
    </header>
    
    <?php if ( $postMeta[ 'price' ] || $postMeta[ 'region' ] || $postMeta[ 'neighborhood' ] || $postMeta[ 'street_address' ] ) : ?>
    
      <div class="listing-meta-wrapper">
      <?php if ( $postMeta[ 'price' ] ) : ?>
        <span class="listing-meta price">$<?php echo $postMeta[ 'price' ]; ?></span>
      <?php endif; ?>
  
      <?php if( $postMeta[ 'neighborhood' ] ) : ?>
        <a href="<?php echo get_the_permalink( $postMeta[ 'neighborhood' ]->ID ); ?>" class="listing-meta listing-neighborhood"><?php echo $postMeta[ 'neighborhood' ]->post_title; ?></a>
      <?php endif; ?>
      
      <?php if ( $postMeta[ 'street_address' ] || $postMeta[ 'city' ] || !$postMeta[ 'state' ] || $postMeta[ 'zip' ] ) : ?>
        <div class="listing-meta address listing-address">
          
        <?php foreach( $addressKeys as $addressKey ) : ?>
          <?php if ( !empty( $postMeta[ $addressKey ] ) ) : ?>
            <span class="address-field address-<?php echo $addressKey; ?>"><?php echo ( $addressKey == 'city') ? $postMeta[ $addressKey ] . ', ' : $postMeta[ $addressKey ]; ?></span>
          <?php endif; ?>
        <?php endforeach; ?>
  
        </div>
        <?php endif; ?>
  
      </div>
    <?php endif; ?>
    
    
    <div class="post-excerpt">
      <?php the_excerpt(); ?>
    </div>
    
    <footer class="post-footer">
      <a href="<?php the_permalink(); ?>" class="cta">View Featured Home</a>
    </footer>
  </div>
</article><!-- /#post-<?php the_ID(); ?> -->