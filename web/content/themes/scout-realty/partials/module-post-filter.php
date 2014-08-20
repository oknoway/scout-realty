<?php
/**
 * The template file for the Post Filter module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<?php // Neighborhood Filter
$neighborhoodPostArgs = array(
  'post_type' => 'scout_neighborhoods',
  'posts_per_page' => -1,
  'orderby' => 'title',
  'order' => 'ASC',
);

$neighborhoods = get_posts( $neighborhoodPostArgs ); 

if ( !empty( $neighborhoods ) ) : ?>
<nav class="post-filter">
  <header class="post-filter-header section-header">
    <h5 class="post-filter-title">Portland Neighborhoods</h5>
  </header>
  <select id="neighborhood-post-filter" name="neighborhood_posts" class="neighborhood-post-filter post-filter">
    <option selected >View all Neighborhoods&hellip;</option>
  <?php foreach ( $neighborhoods as $neighborhood ) : ?>
    <option value="<?php echo $neighborhood->post_name; ?>"><?php echo apply_filters( 'the_title', $neighborhood->post_title ); ?></option>
  <?php endforeach; ?>
  </select>
</nav>
<?php endif; ?>

<?php // Author Filter
$authorArgs = array (
  'exclude' => array( 1 )
);

$authors = get_users( $authorArgs );

if ( !empty( $authors ) ) : ?>
<nav class="post-filter">
  <header class="post-filter-header section-header">
    <h5 class="post-filter-title">Authors</h5>
  </header>
  <form action="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" method="get" accept-charset="utf-8">
    <select id="author-post-filter" name="author_name" class="author-post-filter post-filter">
      <option selected>View all Authors&hellip;</option>
    <?php foreach ( $authors as $author ) :
      if ( count_user_posts( $author->data->ID ) > 0 ) : ?>
      <option value="<?php echo $author->data->user_nicename; ?>"><?php echo $author->data->display_name; ?></option>
      <?php endif;
    endforeach; ?>
    </select>
    <input type="submit" value="Submit" class="no-js">
  </form>
</nav>
<?php endif; ?>


