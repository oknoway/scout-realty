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
  <form action="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" method="get" accept-charset="utf-8">
    <select id="neighborhood-post-filter" name="in_neighborhood" class="neighborhood-post-filter post-filter">
      <option value="" <?php if ( !isset( $_GET['in_neighborhood'] ) ) echo 'selected'; ?>>View all Neighborhoods&hellip;</option>
    <?php foreach ( $neighborhoods as $neighborhood ) :
      $selected = ( $_GET['in_neighborhood'] == $neighborhood->ID) ? 'selected' : NULL;
    ?>
      <option value="<?php echo $neighborhood->ID; ?>" <?php echo $selected; ?>><?php echo apply_filters( 'the_title', $neighborhood->post_title ); ?></option>
    <?php endforeach; ?>
    </select>
    <button type="submit" class="btn no-js">Filter Posts by Neighborhood</button>
  </form>
</nav>
<?php endif; ?>

<?php // Agent Filter
$agentPostArgs = array(
  'post_type' => 'scout_agents',
  'posts_per_page' => -1,
  'orderby' => 'title',
  'order' => 'ASC',
);

$agents = get_posts( $agentPostArgs ); 


if ( !empty( $agents ) ) : ?>
<nav class="post-filter">
  <header class="post-filter-header section-header">
    <h5 class="post-filter-title">Agents</h5>
  </header>
  <form action="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" method="get" accept-charset="utf-8">
    <select id="author-post-filter" name="by_agent" class="author-post-filter post-filter">
      <option value="" <?php if ( !isset( $_GET['by_agent'] ) ) echo 'selected'; ?>>View all Agents&hellip;</option>
    <?php foreach ( $agents as $agent ) :
      $selected = ( $_GET['by_agent'] == $agent->ID) ? 'selected' : NULL; ?>
      <option value="<?php echo $agent->ID; ?>" <?php echo $selected; ?>><?php echo apply_filters( 'the_title', $agent->post_title ); ?></option>
    <?php endforeach; ?>
    </select>
    <button type="submit" class="btn no-js">Filter Posts by Agent</button>
  </form>
</nav>
<?php endif; ?>


