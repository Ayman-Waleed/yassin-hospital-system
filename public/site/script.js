// ===== SLIDER =====
let current = 0;
const track = document.getElementById('sliderTrack');
const dots = document.querySelectorAll('.dot');
const total = 3;

function goToSlide(index) {
  current = index;
  track.style.transform = `translateX(${current * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
}

// Auto-play every 4 seconds
setInterval(() => {
  goToSlide((current + 1) % total);
}, 4000);