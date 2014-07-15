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


{"zoom_level":16,"center":{"lat":45.47204939555312,"lng":-122.5869083404541},"markers":{}}


https://www.google.com/maps/place/Arbor+Lodge/@45.5717544,-122.6932675,15z/data=!4m2!3m1!1s0x5495a7a3b74d15c1:0xf60b1b34aa1f920b

*/

$neighborhoodArgs = array(
  'post_type' => 'scout_neighborhoods',
  'meta_key' => 'google_maps_url',
  'posts_per_page' => -1
);

$neighborhoodPosts = new WP_Query( $neighborhoodArgs );

while ( $neighborhoodPosts->have_posts() ) : $neighborhoodPosts->the_post();
  echo 'Neighborhood: ' . get_the_title() . "\n";

    echo 'Google Maps URL: ' . get_field( 'google_maps_url' ) . "\n";
  
  $googleUrlParts = parse_url( get_field( 'google_maps_url' ) );
  
  
  $firstMarker = strpos( $googleUrlParts['path'], '@' );
  $secondMarker = strpos( $googleUrlParts['path'], 'z/', $firstMarker );
  
  $relevantParts = substr( $googleUrlParts['path'], $firstMarker + 1, $secondMarker - $firstMarker -1 );
  
  $relevantParts = explode( ',', $relevantParts );
  
  $finalString = '{"zoom_level":' . $relevantParts[2] . ',"center":{"lat":' . $relevantParts[0] . ',"lng":' . $relevantParts[1] . '},"markers":{}}';
  
  echo 'looks like: ' . $finalString . "\n";
  
	//update_post_meta( get_the_id(), 'map', $finalString );

  //update_field( 'field_53a25fab352e7', $finalString, get_the_id() );

  //update_field( 'field_53a25fab352e7', $finalString, get_the_id() );
  //$updatePost = array( 'ID' => get_the_id(), );
  //wp_update_post( $updatePost );
  //
endwhile;


?>