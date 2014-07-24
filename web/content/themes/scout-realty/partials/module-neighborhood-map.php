<?php
/**
 * The template file for Neighborhood Map
 *
 * @package Scout Realty
 * @since 0.1.0
 */

$map = get_field('map');

$mapData = array(
  'zoom_level' => $map->zoom_level,
  'lat' => $map->center->lat,
  'lng' => $map->center->lng
);


$dataAtts = null;

foreach ( $mapData as $i=>$att ) :

  $dataAtts .= ' data-map-' . $i . '="' . $att . '"';

endforeach;


$mapEmbedParams = array(
  'key' => 'AIzaSyD7CaOXb1xCmve_O4_FVNUcX9fpxbDkiyg',
  'center' => $map->center->lat . ',' . $map->center->lng,
  'zoom' => $map->zoom_level,
  'size' => '640x640',
  'scale' => 2,
  'maptype' => 'roadmap',
  //'style' => 'feature:administrative.neighborhood%7Cvisibility:on'
  
  //style=feature:administrative.locality|visibility:on&style=feature:administrative.neighborhood|visibility:on&style=feature:road|visibility:simplified&style=feature:transit|visibility:off&style=feature:road.highway|element:labels|visibility:on&style=feature:road.arterial|visibility:on&style=feature:road.local|visibility:simplified&style=feature:water|element:labels|visibility:off&style=feature:poi|visibility:on&style=feature:poi.business|visibility:off&style=feature:administrative.neighborhood|element:geometry.fill|color:0xda8080|visibility:on
);

$mapEmbedUrl = 'https://maps.googleapis.com/maps/api/staticmap?' . http_build_query( $mapEmbedParams );



?>

<div id="neighborhood-map-<?php the_ID(); ?>" class="neighborhood-map" <?php echo $dataAtts; ?>>

</div>
