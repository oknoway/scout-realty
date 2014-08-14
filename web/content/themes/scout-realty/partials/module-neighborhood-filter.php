<?php
/**
 * The template file for Neighborhood Filter Module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<section class="neighborhood-filters">
  <form method="put" action="<?php echo $_SERVER['REQUEST_URI']; ?>" class="neighborhood-filter-wrapper">
  
    <!-- Setup existing URL params -->
    <?php
      
      
    ?>
  
    <!-- Region Filter -->
    <?php
    $regionTermArgs = array();
    
    $regionTerms = get_terms( 'scout_region' );
    
    if ( !empty( $regionTerms ) && !is_wp_error( $regionTerms ) ) : ?>
    <fieldsection class="neighborhood-filter-criterion-wrapper">
      <label>Portland Region</label>
      <select name="region" class="neighborhood-filter-criterion">
        <option value="0">View all Regions&hellip;</option>
      <?php foreach( $regionTerms as $region ) : ?>
      
        <option value="<?php echo ( !empty( $region->slug ) ) ? $region->slug : NULL; ?>" <?php if ( get_query_var( 'region' ) == $region->slug ) echo 'selected'; ?>><?php echo $region->name; ?></option>
        
      <?php endforeach; ?>
      </select>
      
    </fieldsection>
    <?php endif; ?>
  
    <!-- Avg. Home Price Filter -->
    <fieldsection class="neighborhood-filter-criterion-wrapper">
      <label>Average Home Price</label>
      <select name="average_home_price" class="neighborhood-filter-criterion">
        <option value="0">View all Prices&hellip;</option>
        <option value="300000" <?php if ( get_query_var( 'average_home_price' ) == '300000' ) echo 'selected'; ?>>Up to $300,000</option>
        <option value="400000" <?php if ( get_query_var( 'average_home_price' ) == '400000' ) echo 'selected'; ?>>Up to $400,000</option>
        <option value="500000" <?php if ( get_query_var( 'average_home_price' ) == '500000' ) echo 'selected'; ?>>Up to $500,000</option>
        <option value="600000" <?php if ( get_query_var( 'average_home_price' ) == '600000' ) echo 'selected'; ?>>Up to $600,000</option>
        <option value="700000" <?php if ( get_query_var( 'average_home_price' ) == '700000' ) echo 'selected'; ?>>Up to $700,000</option>
        <option value="800000" <?php if ( get_query_var( 'average_home_price' ) == '800000' ) echo 'selected'; ?>>Up to $800,000</option>
        <option value="900000" <?php if ( get_query_var( 'average_home_price' ) == '900000' ) echo 'selected'; ?>>Up to $900,000</option>
        <option value="1000000" <?php if ( get_query_var( 'average_home_price' ) == '1000000' ) echo 'selected'; ?>>Up to $1 million</option>
        <option value="9999999" <?php if ( get_query_var( 'average_home_price' ) == '9999999' ) echo 'selected'; ?>>$1 million and up</option>
      </select>
    </fieldsection>
  
    <!-- Qualities Filter -->
    <?php
    $qualitiesTermArgs = array();
    
    $qualitiesTerms = get_terms( 'scout_quality' );
    
    if ( !empty( $qualitiesTerms ) && !is_wp_error( $qualitiesTerms ) ) : ?>
    <fieldsection class="neighborhood-filter-criterion-wrapper">
      <label>Neighborhood Features</label>
      <select name="feature" class="neighborhood-filter-criterion">
        <option value="0">View all Features&hellip;</option>
      <?php foreach( $qualitiesTerms as $quality ) : ?>
      
        <option value="<?php echo ( !empty( $quality->slug ) ) ? $quality->slug : NULL; ?>" <?php if ( get_query_var( 'feature' ) == $quality->slug ) echo 'selected'; ?>><?php echo $quality->name; ?></option>
        
      <?php endforeach; ?>
      </select>
    </fieldsection>
    <?php endif; ?>
    <button type="submit" class="btn submit-btn">Find Neighborhoods</button>
    
  </form>
  <div class="neighborhood-filter-content post-excerpt">
    <p>Average home prices are released yearly by XYZ. While prices shown are an average, actual home prices can vary greatly across a neighborhood.</p>
  </div>
</section>