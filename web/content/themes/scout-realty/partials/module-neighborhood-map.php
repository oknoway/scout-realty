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
  'lng' => $map->center->lng,
  'neighborhood' => $post->post_name
);


$dataAtts = null;

foreach ( $mapData as $i=>$att ) :

  $dataAtts .= ' data-map-' . $i . '="' . $att . '"';

endforeach;

?>

<div id="neighborhood-map-<?php the_ID(); ?>" class="neighborhood-map" <?php echo $dataAtts; ?>>

</div>
