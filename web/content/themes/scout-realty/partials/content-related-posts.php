<?php
/**
 * The template file for Related Posts
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>
<?php // Determine what type of Related Posts we need
  
  $relatedPostsArgs = array(
    'posts_per_page' => 3,
  );
  
  $relatedPostsHeadline = null;
  
  // If this page has specified a 'Related Posts Category', get posts from that category.
  if ( get_field( 'related_posts_category' ) ) :
    
    if ( term_exists( get_field( 'related_posts_category' ), 'category' ) ) :
    
      $relatedPostsArgs[ 'category' ] = get_field( 'related_posts_category' );
      
    endif;

  // If this is an Agent bio page, show posts associated with that agent.
  elseif ( get_post_type() == 'scout_agents' ) :
  
    $relatedPostsArgs[ 'meta_key' ] = 'agent';
    $relatedPostsArgs[ 'meta_value' ] = $post->ID;
  
    $relatedPostsHeadline = get_field( 'first_name' ) . '&rsquo;s Recent Blog Posts';
    
  endif;
  
  // If there are any posts that need to be excluded, exclude them.
  if ( !empty( $excludedPosts ) ) :
    
    $relatedPostsArgs[ 'posts__not_in' ] = $excludedPosts;
    
  endif;
  
  $relatedPosts = new WP_Query( $relatedPostsArgs );
  
  if ( $relatedPosts->have_posts() ) : ?>
  <section class="page-section related-posts">
    <header class="section-header related-posts-header">
      <h3 class="section-title related-posts-title">
        <?php echo ( !empty( $relatedPostsHeadline ) ) ? $relatedPostsHeadline : 'Recent Blog Posts'; ?>
      </h3>
    </header>
    <?php while ( $relatedPosts->have_posts() ) : $relatedPosts->the_post();
      
      get_template_part( 'partials/content', 'post-list' );
      
    endwhile;
      wp_reset_postdata();
  endif;
?>