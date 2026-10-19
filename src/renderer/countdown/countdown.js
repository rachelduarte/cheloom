const api = window.cheloom;
const n = document.getElementById('n');
let left = 3;
const timer = setInterval(() => {
  left -= 1;
  if (left === 0) {
    clearInterval(timer);
    api.countdownDone();
    return;
  }
  n.textContent = left;
  n.style.animation = 'none';
  void n.offsetWidth; // reinicia la animación
  n.style.animation = '';
}, 1000);
const cancel = () => {
  clearInterval(timer);
  api.countdownCancel();
};
addEventListener('keydown', (e) => e.key === 'Escape' && cancel());
document.querySelector('.ring').addEventListener('click', cancel);
