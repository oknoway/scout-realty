<?php
/**
 * The template file for Content Blocks
 *
 * @package Scout Realty
 * @since 0.1.0
 */

?>
<?php // setup section data
$linkedPage = get_sub_field( 'page' );
$contactPage = get_sub_field( 'contact_page' );
$sectionImg = get_sub_field( 'section_image' ); ?>

<article class="content-section <?php echo get_sub_field( 'appearance' ); ?>">
  <figure class="section-img">
    <span class="fake-img delayed" data-delayed-background-image="<?php echo esc_url( $sectionImg[ 'sizes' ][ 'full-width' ] ); ?>">
      <noscript><img src="<?php echo esc_url( $sectionImg[ 'sizes' ][ 'full-width' ] ); ?>" alt="<?php echo apply_filters( 'title', $sectionImg[ 'title' ] ); ?>" height="<?php echo $sectionImg[ 'sizes' ][ 'full-width-height' ]; ?>" width="<?php echo $sectionImg[ 'sizes' ][ 'full-width-width' ]; ?>" class="no-js visuallyhidden"></noscript>
    </span>
  </figure>
  <div class="container">
    <header class="section-header">
      <h3 class="section-title"><?php echo apply_filters( 'the_title', get_sub_field( 'section_headline' ) ); ?></h3>
    </header>
    
    <div class="section-content">
      <?php echo apply_filters( 'the_content', get_sub_field( 'section_content' ) ); ?>
    </div>
    
    <footer class="section-footer">
    
    <?php if ( get_sub_field( 'page_link_text' ) && !empty( $linkedPage ) ) : ?>
      <a href="<?php echo esc_url( get_the_permalink( $linkedPage->ID ) ); ?>" class="cta"><?php the_sub_field( 'page_link_text' ); ?></a>
    <?php endif; ?>
    
    <?php if ( get_sub_field( 'contact_link_text' ) && !empty( $contactPage ) ) : ?>
      <a href="<?php echo esc_url( get_the_permalink( $contactPage->ID ) ); ?>" class="cta"><?php the_sub_field( 'contact_link_text' ); ?></a>
    <?php endif; ?>
    
    </footer>
  </div>
</article>
