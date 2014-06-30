<?php
/**
 * The template file for Neighborhood Map
 *
 * @package Scout Realty
 * @since 0.1.0
 */

$map = get_field('map');

$leafletData = array(
  'zoom_level' => $map->zoom_level,
  'lat' => $map->center->lat,
  'lng' => $map->center->lng
);


$dataAtts = null;

foreach ( $leafletData as $i=>$att ) :

  $dataAtts .= ' data-leaflet-' . $i . '="' . $att . '"';

endforeach;

?>
<div id="neighborhood-map-<?php the_ID(); ?>" class="neighborhood-map" <?php echo $dataAtts; ?>>

</div>
