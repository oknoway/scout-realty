<?php

/*
stdClass Object
(
    [zoom_level] => 16
    [center] => stdClass Object
        (
            [lat] => 45.472049395553
            [lng] => -122.58690834045
        )

    [markers] => stdClass Object
        (
        )

)

*/

$neighborhoodArgs = array(
  'post_type' => 'scout_neighborhood',
  'meta_key' => 'google_maps_url'
);

$neighborhoodPosts = new WP_Query( $neighborhoodArgs );

while ( $neighborhoodPosts->have_posts() ) : $neighborhoodPosts->the_post();


  echo 'Neighborhood: ' . $post->post_name . "\n";
  echo 'Google Maps URL: ' . get_field( 'google_maps_url' ) . "\n";


endwhile;


/*
$kidsBikePage = get_page_by_title( 'Kids Bike', 'OBJECT', 'nutcase_helmet_type' );
$lilNuttySnBPage = get_page_by_title( 'Little Nutty Snow & Bike', 'OBJECT', 'nutcase_helmet_type' );

if ( $kidsBikePage ) {
	$kidsBikeID = $kidsBikePage->ID;
} else {
	$kidsBike = array(
		'post_status' => 'publish',
		'post_type' => 'nutcase_helmet_type',
		'post_parent' => 32,
		'post_title' => 'Kids Bike'
	);

	$kidsBikeID = wp_insert_post( $kidsBike );
}

if ( $lilNuttySnBPage ) {
	$lilNuttySnBID = $lilNuttySnBPage->ID;
} else {
	$lilNuttySnB = array(
		'post_status' => 'publish',
		'post_type' => 'nutcase_helmet_type',
		'post_parent' => 32,
		'post_title' => 'Little Nutty Snow & Bike'
	);
	
	$lilNuttySnBID = wp_insert_post( $lilNuttySnB );
}


foreach ($affectedPosts as $postToUpdate) {
	$newPost = array();
	
	$newPost['ID'] = $postToUpdate['ID'];
	$newPost['post_content'] = $postToUpdate['post_content'];
	
	wp_update_post( $newPost );
	
	update_post_meta( $postToUpdate['ID'], 'nutcase_product_sku', $postToUpdate['nutcase_product_sku'] );
	update_post_meta( $postToUpdate['ID'], 'nutcase_product_price', $postToUpdate['nutcase_product_price'] );
	
	echo 'Updated Helmet ID: ' . $postToUpdate['ID'] . "\n";
	
	if (isset($postToUpdate['product_category'])) {
			
		if ($postToUpdate['product_category'] == 'Kids Bike') {
			
			p2p_type( 'helmets_to_helmetType' )->connect( $postToUpdate['ID'], $kidsBikeID, array(
				'date' => current_time('mysql')
			) );
			
		}
		
		if ($postToUpdate['product_category'] == 'Little Nutty Snow & Bike') {
			p2p_type( 'helmets_to_helmetType' )->connect( $postToUpdate['ID'], $lilNuttySnBID, array(
				'date' => current_time('mysql')
			) );
		}
		
		echo 'Added Helmet ID: ' . $postToUpdate['ID'] . ' to product category: ' . $postToUpdate['product_category'] . "\n";

	}
	
}
*/

?>