<?php
/**
 * The template file for post content
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
 
// Post meta

$postMeta = get_fields();

$agentData = null;

if ( $postMeta[ 'agent' ] ) : 

  $agentData = get_fields( $postMeta[ 'agent' ]->ID );

else :
  
  $agentPostArgs = array(
    'posts_per_page' => 1,
    'post_type' => 'scout_agents',
    'meta_key' => 'wordpress_user',
    'meta_value' => get_the_author_id()
  );
  
  $agentPosts = get_posts( $agentPostArgs );

  foreach ( $agentPosts as $agentPost ) :

    $postMeta[ 'agent' ] = $agentPost;
    $agentData = get_fields( $agentPost->ID );

  endforeach;

endif;

$addressKeys = array( 'street_address', 'city', 'state', 'zip' ); 


// Extra post classes.

$postClasses = array( 'post-detail' );

?>

<article id="post-<?php the_ID(); ?>" <?php post_class( $postClasses ); ?>>
  <?php get_template_part( 'partials/module', 'hero' ); ?>
  
  <div class="post-content-wrapper">
    <header class="post-header">
      <?php get_template_part( 'partials/module', 'breadcrumb ' ); ?>
    <?php if ( !empty( $postMeta[ 'headline' ] ) ) : ?>
      <h1 class="post-title post-headline"><?php echo $postMeta[ 'headline' ]; ?></h1>
    <?php else : ?>
      <h1 class="post-title"><?php the_title(); ?></h1>
    <?php endif; ?>
    
    <?php if ( $postMeta[ 'price' ] || $postMeta[ 'street_address' ] ) : ?>
    
      <div class="listing-meta-wrapper">
      <?php if ( $postMeta[ 'price' ] ) : ?>
        <span class="listing-meta price">$<?php echo $postMeta[ 'price' ]; ?></span>
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
    
    <?php if ( $postMeta[ 'rmls_id' ] || $postMeta[ 'rmls_url' ] || $postMeta[ 'neighborhood' ] ) : ?>
    
      <div class="listing-meta-wrapper">
      <?php if ( $postMeta[ 'rmls_id' ] ) : ?>
        <span class="listing-meta listing-id">Listing ID: <?php echo $postMeta[ 'rmls_id' ]; ?></span>
      <?php endif; ?>
      
      <?php if ( $postMeta[ 'rmls_url' ] ) : ?>
        <a href="<?php echo esc_url( $postMeta[ 'rmls_url' ] ); ?>" class="listing-meta listing-url">View Listing Profile</a>
      <?php endif; ?>

      <?php if( !empty( $postMeta[ 'neighborhood' ] ) ) : ?>
        <a href="<?php echo get_the_permalink( $postMeta[ 'neighborhood' ]->ID ); ?>" class="listing-meta listing-neighborhood post-neighborhood">Learn more about the <?php echo $postMeta[ 'neighborhood' ]->post_title; ?> neighborhood.</a>
      <?php endif; ?>
        
      </div>
    <?php endif; ?>
    
    <?php if ( get_field( 'agent' ) ) : ?>
      <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/buying' ) ) . '?agent=' . urlencode( get_the_title( $postMeta[ 'agent' ]->ID ) ) ) . '&listing=' . urlencode( $postMeta[ 'rmls_id' ] ); ?>" class="agent-contact cta">Contact <?php echo ( get_field( 'first_name', $postMeta[ 'agent' ]->ID ) ) ? get_field( 'first_name', $postMeta[ 'agent' ]->ID ) : get_the_title( $postMeta[ 'agent' ]->ID ); ?> about this home</a>
    <?php endif; ?>
    
      <div class="post-meta">
        <time datetime="<?php the_time( 'r' ); ?>" class="post-date">Posted <span><?php the_time( 'M d, Y' ); ?></span></time>
        
      <?php if ( !empty( $agentData ) ) : ?>
        <a href="<?php echo get_permalink( $postMeta[ 'agent' ] ); ?>" class="post-author">
      <?php if ( !empty( $agentData[ 'photo' ] ) ) : ?>
        <figure class="agent-photo">
          <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $agentData['photo']['sizes']['one-third'] ); ?>">
            <noscript><img src="<?php echo esc_url( $agentData['photo']['sizes']['one-third'] ); ?>" height="<?php echo $agentData['photo']['sizes']['one-third-height']; ?>" width="<?php echo $agentData['photo']['sizes']['one-third-width']; ?>" class="no-js visuallyhidden"></noscript>
          </span>
        </figure>
      <?php endif; ?>
         By <?php echo get_the_title( $postMeta[ 'agent' ]->ID ); ?></a>
      <?php else : ?>
      <!-- no linked agent -->
        <span class="post-author">By <?php the_author(); ?></span>
      <?php endif; ?>
      </div>
    </header>
    <div class="post-content">
      <?php the_content(); ?>
    </div>
  </div>
</article><!-- /#page-<?php the_ID(); ?> -->