<?php
/**
 * The template file for Agent bios
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 
?>
<?php // Setup Agent Data
  
  $agentData = get_fields();
  $socialKeys = array( 'facebook', 'twitter', 'pinterest', 'instagram' ); 
?>
<article id="agent-<?php the_ID(); ?>" <?php post_class( 'agent' ); ?>>
  <header class="page-header agent-header container">
  <?php if ( get_field( 'headline' ) ) : ?>
    <h1 class="page-title page-headline agent-title agent-headline"><?php the_field( 'headline' ); ?></h1>
  <?php else : ?>
    <h1 class="page-title agent-title"><?php the_title(); ?></h1>
  <?php endif; ?>
  </header>
  <?php if ( $agentData[ 'photo' ] || $agentData[ 'phone_number' ] || $agentData[ 'email_address' ] ) : ?>
  <div class="agent-info-wrapper">
    <div class="agent-info container">
    <?php if ( !empty( $agentData[ 'photo' ] ) ) : ?>
      <figure class="agent-photo">
        <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $agentData['photo']['sizes']['agent-bio'] ); ?>">
          <noscript><img src="<?php echo esc_url( $agentData['photo']['sizes']['agent-bio'] ); ?>" height="<?php echo $agentData['photo']['sizes']['agent-bio-height']; ?>" width="<?php echo $agentData['photo']['sizes']['agent-bio-width']; ?>" class="no-js visuallyhidden"></noscript>
        </span>
      </figure>
    <?php endif; ?>
    
    <?php if ( $agentData['phone_number'] || $agentData['email_address'] || $agentData['twitter'] || $agentData['facebook'] || $agentData['instagram'] || $agentData['pinterest'] ) : ?>
      <ul class="agent-details">
      <?php if ( $agentData['phone_number'] ) : ?>
        <li class="agent-meta">
          <span class="agent-meta-title">Phone:</span>
          <a href="tel:<?php echo $agentData['phone_number']; ?>" class="agent-meta"><?php echo $agentData['phone_number']; ?></a>
        </li>
      <?php endif; ?>
        
      <?php if ( $agentData['email_address'] ) : ?>
        <li class="agent-meta">
          <span class="agent-meta-title">Email:</span>
          <a href="mailto:<?php echo $agentData['email_address']; ?>" class="agent-meta"><?php echo $agentData['email_address']; ?></a>
        </li>
      <?php endif; ?>
        
      <?php if ( $agentData['twitter'] || $agentData['facebook'] || $agentData['instagram'] || $agentData['pinterest'] ) : ?>
        <li class="agent-meta">
          <span class="agent-meta-title">Social:</span>
          <ul class="agent-social">
        <?php foreach( $socialKeys as $social ) : 
        ?>
          <?php if ( !empty( $agentData[ $social ] ) ) :
            $socialField = get_field_object( $social ); ?>
            <li class="social social-<?php echo $social; ?>">
              <a href="<?php echo $socialField['prepend'] . $agentData[ $social ]; ?>" class="icon icon-<?php echo $social; ?> "><?php the_title(); ?> on <?php echo ucwords( $social ); ?>.</a>
            </li>
          <?php endif; ?>
        <?php endforeach; ?>
          </ul>
        </li>
      <?php endif; ?>
      </ul>
    <?php endif; ?>
    </div>
  </div>
  <?php endif; ?>
  <div class="agent-contact small-container">
    <header class="section-header">
      <h3 class="section-title">Contact <?php echo $agentData['first_name']; ?> to:</h3>
    </header>
    <ul class="agent-contact-links">
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/buying' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>" class="cta">Buy a House</a>
      </li>
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/selling' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>" class="cta">Sell Your House</a>
      </li>
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/selling-to-buy' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>" class="cta">Selling to Buy</a>
      </li>
    </ul>
  </div>
  <div class="page-content agent-content small-container">
    <?php echo $agentData['bio']; ?>
  </div>
</article><!-- /#page-<?php the_ID(); ?> -->