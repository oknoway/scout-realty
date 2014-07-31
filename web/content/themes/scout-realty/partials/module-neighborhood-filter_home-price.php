<?php
/**
 * The template file for Neighborhood Filter Module Home Price
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<section class="neighborhood-filters">
  <form action="<?php echo get_post_type_archive_link( 'scout_neighborhoods' ); ?>" method="get">
  
    <!-- Avg. Home Price Filter -->
    <fieldsection class="neighborhood-filter-criterion-wrapper">
      <label>Average Home Price</label>
      <select name="average_home_price" class="neighborhood-filter-criterion">
        <option value="0">View all Prices&hellip;</option>
        <option value="300000">Up to $300,000</option>
        <option value="400000">Up to $400,000</option>
        <option value="500000">Up to $500,000</option>
        <option value="600000">Up to $600,000</option>
        <option value="700000">Up to $700,000</option>
        <option value="800000">Up to $800,000</option>
        <option value="900000">Up to $900,000</option>
        <option value="1000000">Up to $1 million</option>
        <option value="9999999">$1 million and up</option>
      </select>
    </fieldsection>
  
    <button type="submit" class="btn submit-btn">Find Neighborhoods</button>
    
  </form>
</section>