import { animate, splitText } from 'animejs';

const heroName = document.querySelector('.h-name');

if (heroName) {
  const observer = new MutationObserver(() => {
    const name = heroName.textContent.trim();

    if (!name) return;

    observer.disconnect();

    // Preserve the original name before animating.
    heroName.textContent = name;

    animate(heroName, {
      duration: 1000,
      ease: 'out',
      onBegin: () => {
        heroName.style.visibility = 'visible';
      },
    });
  });

  observer.observe(heroName, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}