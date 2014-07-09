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

  <?php get_template_part( 'partials/module', 'category-list' ); ?>

  <?php get_template_part( 'partials/module', 'post-filter' ); ?>

<?php endif; ?>
</div>
