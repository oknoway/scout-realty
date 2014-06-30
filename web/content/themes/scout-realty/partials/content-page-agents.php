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
    
    if ( $agent ) :
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
