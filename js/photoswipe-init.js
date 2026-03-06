// PhotoSwipe v5 lightbox init (ESM via CDN).
// Galleries: .pswp-gallery (supports grids + flow rails).
// Captions read from data-pswp-caption on the <a> element.

import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js';

function getCaption(slide) {
  const el = slide?.data?.element;
  if (!el) return '';
  const cap = el.getAttribute('data-pswp-caption') || '';
  return cap;
}

function initCaption(lightbox) {
  lightbox.on('uiRegister', function() {
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: '<div class="pswp__custom-caption" aria-live="polite"></div>',
      onInit: (el, pswp) => {
        const update = () => {
          const slide = pswp.currSlide;
          const cap = getCaption(slide);
          el.innerHTML = cap ? cap : '';
          el.style.display = cap ? 'block' : 'none';
        };
        pswp.on('change', update);
        update();
      }
    });
  });
}

const galleries = document.querySelectorAll('.pswp-gallery');
if (galleries.length) {
  galleries.forEach((galleryEl) => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: galleryEl,
      children: 'a',
      pswpModule: () => import('https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js')
    });

    initCaption(lightbox);
    lightbox.init();
  });
}
