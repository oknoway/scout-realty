<?php
/**
 * The template file for Neighborhood Sort Module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>
<?php $currentURL = $_SERVER['REQUEST_URI'];
  $currentURL .= ( empty( $_SERVER['QUERY_STRING'] ) ) ? '?&amp;' : '&amp;';
?>
<section class="neighborhood-sort">
Sort Results:
  <a href="<?php echo $currentURL; ?>orderby=title&amp;order=ASC">A to Z</a>
  <a href="<?php echo $currentURL; ?>orderby=title&amp;order=DESC">Z to A</a>
  <a href="<?php echo $currentURL; ?>meta_key=average_home_price&amp;orderby=meta_value&amp;order=ASC">Low to High</a>
  <a href="<?php echo $currentURL; ?>meta_key=average_home_price&amp;orderby=meta_value&amp;order=DESC">High to Low</a>
</section>
