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

<article id="agent-<?php the_ID(); ?>" <?php post_class( 'agent-list' ); ?>>
<?php if ( $agentData[ 'agent_type' ] == 'agent' ) : ?>
  <a href="<?php the_permalink(); ?>">
<?php endif; ?>

<?php if ( !empty( $agentData[ 'photo' ] ) ) : ?>
  <figure class="agent-photo">
    <span class="fake-img" style="background-image:url('<?php echo $agentData[ 'photo' ]['sizes']['one-third']; ?>');"><img src="<?php echo $agentData[ 'photo' ]['sizes']['one-third']; ?>" height="<?php echo $agentData[ 'photo' ]['sizes']['one-third-height']; ?>" width="<?php echo $agentData[ 'photo' ]['sizes']['one-third-width']; ?>" alt="<?php echo $agentData[ 'photo' ]['title']; ?>" class="visuallyhidden"></span>
  </figure>
<?php endif; ?>

  <h4 class="post-title agent-name"><?php the_title(); ?></h4>
  
  <p class="post-excerpt agent-bio"><?php the_excerpt(); ?></p>

<?php if ( $agentData[ 'agent_type' ] == 'agent' ) : ?>
  </a>
<?php endif; ?>
</article><!-- /#agent-<?php the_ID(); ?> -->