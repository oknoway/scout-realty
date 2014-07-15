<?php
/**
 * The template file for Related Posts
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>
<?php // Determine what type of Related Posts we need
  
  global $excludedPosts;
  
  $relatedPostsArgs = array(
    'posts_per_page' => 3,
  );
  
  $relatedPostsHeadline = null;

  // If this page has specified a 'Related Posts Category', get posts from that category.
  if ( get_field( 'related_posts_category' ) || get_sub_field( 'related_posts_category' )) :
    
    $relatedCategory = null;
    
    if ( get_field( 'related_posts_category' ) ) :
    
      $relatedCategory = get_field( 'related_posts_category' );
      
    elseif ( get_sub_field( 'related_posts_category' ) ) :
    
      $relatedCategory = get_sub_field( 'related_posts_category' );
      
    endif;
    
    $relatedTerm = get_term( intval( $relatedCategory[0] ), 'category' );
    
    if ( !empty( $relatedTerm ) ) :
      
      $relatedPostsArgs[ 'cat' ] = $relatedTerm->term_id;
      
      $relatedPostsHeadline = 'Recent ' . $relatedTerm->name . ' Posts';
      
    endif;

  // If this is an Agent bio page, show posts associated with that agent.
  elseif ( get_post_type() == 'scout_agents' ) :
  
    $relatedPostsArgs[ 'meta_key' ] = 'agent';
    $relatedPostsArgs[ 'meta_value' ] = $post->ID;
  
    $relatedPostsHeadline = get_field( 'first_name' ) . '&rsquo;s Recent Blog Posts';
    
  elseif ( get_post_type() == 'scout_neighborhoods' ) :
  
    $relatedPostsArgs[ 'meta_key' ] = 'neighborhood';
    $relatedPostsArgs[ 'meta_value' ] = $post->ID;
  
    $relatedPostsHeadline = 'Recent ' . get_the_title() . ' Posts';
    
  endif;
  
  // If there are any posts that need to be excluded, exclude them.
  if ( !empty( $excludedPosts ) ) :
    
    $relatedPostsArgs[ 'post__not_in' ] = $excludedPosts;
    
  endif;
  
  $relatedPosts = new WP_Query( $relatedPostsArgs );
  
  if ( $relatedPosts->have_posts() ) : ?>
  <section class="page-section related-posts container">
    <header class="section-header related-posts-header">
      <h3 class="section-title related-posts-title">
        <?php echo ( !empty( $relatedPostsHeadline ) ) ? $relatedPostsHeadline : 'Recently From Our Blog'; ?>
      </h3>
    </header>
    <?php while ( $relatedPosts->have_posts() ) : $relatedPosts->the_post();
      
      get_template_part( 'partials/content', 'post-list' );
      
    endwhile;
      wp_reset_postdata();
  endif;
?>