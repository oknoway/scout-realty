<?php
/**
 * The template file for Agents archive page
 *
 * @package Scout Realty
 * @since 0.1.0
 */
?>

<?php // Agents

if ( have_rows( 'agent_order' ) ) : ?>
<section class="page-section agents-archive">
  <header class="section-header">
    <h3 class="section-title">Our Agents</h3>
  </header>
  <?php while ( have_rows( 'agent_order' ) ) : the_row();
    
    $agent = get_sub_field( 'agent' );
    $isFindAgentLink = get_sub_field( 'agent_or_link' );
    
    if ( $isFindAgentLink ) :
      get_sub_field( 'link_headline' );
      get_sub_field( 'link_content' );
      get_sub_field( 'link_button' );
      get_sub_field( 'page_link' ); ?>
      
    
      <article <?php post_class( 'post-column find-an-agent' ); ?>>
      <?php if ( get_sub_field( 'link_headline' ) ) : ?>
        <h4 class="post-title column-title"><?php the_sub_field( 'link_headline' ); ?></h4>
      <?php endif; ?>
      
      <?php if ( get_sub_field( 'link_content' ) ) : ?>
        <div class="post-excerpt column-content"><?php the_sub_field( 'link_content' ); ?></div>
      <?php endif; ?>
      
      <?php if ( get_sub_field( 'link_button' ) && get_sub_field( 'page_link' ) ) : ?>
        <a href="<?php the_sub_field( 'page_link' ); ?>" class="btn"><?php the_sub_field( 'link_button' ); ?></a>
      <?php endif; ?>
      
      </article><!-- /.find-an-agent ?> -->    
    
    <?php elseif ( $agent ) :
      $post = $agent;
      setup_postdata( $post );
      
      get_template_part( 'partials/module', 'agent-list' );
      
      wp_reset_postdata();
    endif;
  endwhile; ?>
</section><!-- /.agents-archive -->
<?php endif; ?>

<?php // Team

if ( have_rows( 'team_order' ) ) : ?>
<section class="page-section agents-archive team-archive">
  <header class="section-header">
    <h3 class="section-title">Our Team</h3>
  </header>
  <?php while ( have_rows( 'team_order' ) ) : the_row();
    
    $teamMember = get_sub_field( 'member' );
    
    if ( $teamMember ) :
      $post = $teamMember;
      setup_postdata( $post );
      
      get_template_part( 'partials/module', 'agent-list' );
      
      wp_reset_postdata();
    endif;
  endwhile; ?>
</section><!-- /.team-archive -->
<?php endif; ?>
