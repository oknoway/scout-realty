<?php
/**
 * The template file for the default Sidebar
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<div class="sidebar archive-sidebar">
<?php if ( is_archive() || is_home() ) : ?>
  <form action="<?php echo esc_url( get_permalink( get_option( 'page_for_posts' ) ) ); ?>" method="get" accept-charset="utf-8">

    <?php get_template_part( 'partials/module', 'category-list' ); ?>
  
    <?php get_template_part( 'partials/module', 'post-filter' ); ?>

    <input type="submit" value="Submit" class="no-js">
    
  </form>
<?php endif; ?>
</div>
