<?php
/**
 * The template file for the Pagination Module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<?php $pagination = scout_pagination(); 
if ( $pagination ) : ?>
  <nav class="pagination">
    <ul>
    <?php foreach( $pagination as $paginationLink ) : ?>
      <li><?php echo $paginationLink; ?></li>
    <?php endforeach; ?>
    </ul>
  </nav>
<?php endif; ?>
