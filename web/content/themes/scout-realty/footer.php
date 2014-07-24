<?php
/**
 * The template for displaying the footer.
 *
 * @package Scout Realty
 * @since 0.1.0
 */
 ?>

  </div><!-- #main -->

  <footer id="colophon" class="site-footer" role="contentinfo">
  <?php if ( !is_front_page() ) : ?>
    <nav id="footer-navigation" class="navigation-footer" role="navigation">
      <?php wp_nav_menu( array( 'theme_location' => 'footer-nav', 'container_class' => 'container' ) ); ?>
    </nav><!-- #site-navigation -->
  <?php endif; ?>
    <div class="footer-wrapper container">
      <?php dynamic_sidebar( 'Footer' ); ?>
      <p class="copyright">&copy;<?php echo date('Y'); ?> <?php _e('Scout Realty', 'scout_realty') ?> <?php _e('All rights reserved', 'scout_realty') ?>.</p>
    </div>
  </footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>