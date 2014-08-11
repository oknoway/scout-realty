<?php
/**
 * The template file for the Category List module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<?php // List Categories
$categoryArgs = array(
 
);

$categories = get_categories( $categoryArgs ); 

if ( !empty( $categories ) ) : ?>
  <nav class="category-navigation">
    <header class="navigation-header section-header">
      <h5 class="navigation-title">Post Categories</h5>
    </header>
    <ul>
    <?php foreach ( $categories as $category ) : ?>
      <li class="category-archive-item"><a href="<?php echo get_category_link( $category->term_id ); ?>" title="<?php sprintf( __( "View all posts in %s" ), $category->name ); ?>" class="category-archive-link"><?php echo $category->name; ?></a></li>
    
    <?php endforeach; ?>
    </ul>
  </nav>
<?php endif; ?>
