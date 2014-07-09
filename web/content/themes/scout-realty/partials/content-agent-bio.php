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
<article id="agent-<?php the_ID(); ?>" <?php post_class( 'main-page-content agent' ); ?>>
  <header class="page-header agent-header">
  <?php if ( get_field( 'headline' ) ) : ?>
    <h1 class="page-title page-headline agent-title agent-headline"><?php the_field( 'headline' ); ?></h1>
  <?php else : ?>
    <h1 class="page-title agent-title"><?php the_title(); ?></h1>
  <?php endif; ?>
  </header>
  <?php if ( $agentData[ 'photo' ] || $agentData[ 'phone_number' ] || $agentData[ 'email_address' ] ) : ?>
  <div class="agent-info-wrapper">
    <div class="agent-info">
    <?php if ( !empty( $agentData[ 'photo' ] ) ) : ?>
      <figure class="agent-photo">
        <span class="fake-img" style="background-image:url('<?php echo $agentData['photo']['sizes']['one-third']; ?>');"><img src="<?php echo $agentData['photo']['sizes']['one-third']; ?>" height="<?php echo $agentData['photo']['sizes']['one-third-height']; ?>" width="<?php echo $agentData['photo']['sizes']['one-third-width']; ?>" alt="<?php echo $agentData['photo']['title']; ?>" class="visuallyhidden"></span>
      </figure>
    <?php endif; ?>
    
    <?php if ( $agentData['phone_number'] || $agentData['email_address'] || $agentData['twitter'] || $agentData['facebook'] || $agentData['instagram'] || $agentData['pinterest'] ) : ?>
      <ul class="agent-details">
      <?php if ( $agentData['phone_number'] ) : ?>
        <li>
          <span class="agent-meta-title">Phone:</span>
          <a href="tel:<?php echo $agentData['phone_number']; ?>" class="agent-meta"><?php echo $agentData['phone_number']; ?></a>
        </li>
      <?php endif; ?>
        
      <?php if ( $agentData['email_address'] ) : ?>
        <li>
          <span class="agent-meta-title">Email:</span>
          <a href="mailto:<?php echo $agentData['email_address']; ?>" class="agent-meta"><?php echo $agentData['email_address']; ?></a>
        </li>
      <?php endif; ?>
        
      <?php if ( $agentData['twitter'] || $agentData['facebook'] || $agentData['instagram'] || $agentData['pinterest'] ) : ?>
        <li>
          <span class="agent-meta-title">Social:</span>
          <ul class="agent-social">
        <?php foreach( $socialKeys as $social ) : 
        ?>
          <?php if ( !empty( $agentData[ $social ] ) ) :
            $socialField = get_field_object( $social ); ?>
            <li>
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
  <div class="agent-contact">
    <header class="section-header">
      <h2 class="section-title">Contact <?php echo $agentData['first_name']; ?> to:</h2>
    </header>
    <ul class="agent-contact-links">
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/buying' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>">Buy a House</a>
      </li>
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/selling' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>">Sell Your House</a>
      </li>
      <li>
        <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'contact-us/selling-to-buy' ) ) . '?agent=' . urlencode( get_the_title() ) ); ?>">Selling to Buy</a>
      </li>
    </ul>
  </div>
  <div class="page-content agent-content">
    <?php echo $agentData['bio']; ?>
  </div>
</article><!-- /#page-<?php the_ID(); ?> -->