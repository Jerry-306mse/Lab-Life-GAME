
/* Lab Life — boot + animation loop. */
(function () {
  'use strict';

  function boot() {
    if (!window.Game || !window.LabUI || !window.LabArt) {
      console.error('Lab Life failed to load one of its modules.');
      return;
    }
    window.LabUI.init();

    let last = 0;
    function loop(ts) {
      // 30fps is plenty for this pixel scene and keeps low-end laptops cool.
      if (!last || ts - last > 32) {
        last = ts;
        try {
          window.LabUI.tick(ts);
        } catch (err) {
          console.error(err);
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window.addEventListener('beforeunload', function () {
      if (window.Game.state && !window.Game.state.ended) {
        try { window.Game.save(); } catch (e) { /* ignore */ }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

