<?php
/**
 * Pagination
 *
 * @param a query object (optional)
 *
 * @uses global $wp_query, $wp_rewrite
 * @uses paginate_links
 *
 * @returns array
 * @package Scout Realty
 * @since 0.1.0
 */
 
function scout_pagination($queryObj = NULL) {

  global $wp_query, $wp_rewrite;

  if ($queryObj == NULL) {
    $queryObj = $wp_query;
  }


  if ( $queryObj->max_num_pages > 1 ) :
      $queryObj->query_vars['paged'] > 1 ? $current = $queryObj->query_vars['paged'] : $current = 1;
    $pagination = array(
      'base' => @add_query_arg('paged','%#%'),
      'format' => '?paged=%#%',
      'total' => $queryObj->max_num_pages,
      'current' => $current,
      'show_all' => false,
      'end_size' => 1,
      'mid_size' => 2,
      'prev_next' => true,
      'prev_text' => __('Previous Page'),
      'next_text' => __('Next Page'),
      'type' => 'array',
      );
    
    $page_count = '<span class="page-numbers page-count">';
    
    $page_count .= $current == 1 ? 1 : ( ( $current - 1 ) * $queryObj->query_vars['posts_per_page'] ) + 1;
    
    $page_count .= '-';
    
    $page_count .= $current * $queryObj->query_vars['posts_per_page'];
    
    $page_count .= ' <span>of</span> ';
    $page_count .= $queryObj->found_posts;
    $page_count .= '</span>';
    
    if( !empty($queryObj->query_vars['s']) )
      $pagination['add_args'] = array( 's' => $queryObj->get( 's' ) );
        

    $paginatedLinks = paginate_links( $pagination );
        
    
    if  ( $current == 1 ) :
      //array_unshift( $paginatedLinks, $page_count );
    else :
      $prevLink = array_shift( $paginatedLinks );
      //array_unshift( $paginatedLinks, $page_count );
      array_unshift( $paginatedLinks, $prevLink );
    endif;
    
    return $paginatedLinks;
    
  endif;
}
