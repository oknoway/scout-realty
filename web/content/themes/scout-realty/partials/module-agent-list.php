<?php
/**
 * The template file for Agents list module
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>
<?php // Setup Agent Data
  
  $agentData = get_fields(); ?>

<article id="agent-<?php the_ID(); ?>" <?php post_class( 'agent-list post-column' ); ?>>
<?php if ( $agentData[ 'agent_type' ] == 'agent' ) : ?>
  <a href="<?php the_permalink(); ?>">
<?php endif; ?>

<?php if ( !empty( $agentData[ 'photo' ] ) ) : ?>
  <figure class="agent-photo column-photo">
    <span class="fake-img" style="background-image:url('<?php echo $agentData[ 'photo' ]['sizes']['one-third']; ?>');"><img src="<?php echo $agentData[ 'photo' ]['sizes']['one-third']; ?>" height="<?php echo $agentData[ 'photo' ]['sizes']['one-third-height']; ?>" width="<?php echo $agentData[ 'photo' ]['sizes']['one-third-width']; ?>" alt="<?php echo $agentData[ 'photo' ]['title']; ?>" class="visuallyhidden"></span>
  </figure>
<?php endif; ?>

  <h4 class="post-title agent-name column-title"><?php the_title(); ?></h4>
  
  <div class="post-excerpt agent-bio column-content"><?php the_excerpt(); ?></div>

<?php if ( $agentData[ 'agent_type' ] == 'agent' ) : ?>
  </a>
<?php endif; ?>
</article><!-- /#agent-<?php the_ID(); ?> -->