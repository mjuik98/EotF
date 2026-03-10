export function setupCharacterCardFx({
  card,
  resolveById,
} = {}) {
  if (!card || typeof card.addEventListener !== 'function') return () => {};

  const onMouseMove = (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const angle = Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2),
    ) * 180 / Math.PI;

    card.style.transform = `perspective(600px) rotateX(${((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10}deg) rotateY(${((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10}deg)`;

    const foil = resolveById?.('cardFoil');
    if (foil) {
      foil.style.background = `conic-gradient(from ${angle}deg at ${x}% ${y}%,#ff000015,#ff7f0015,#ffff0015,#00ff0015,#0000ff15,#8b00ff15,#ff007f15,#ff000015)`;
    }
  };

  const onMouseLeave = () => {
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
    const foil = resolveById?.('cardFoil');
    if (foil) foil.style.background = 'none';
  };

  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);

  return () => {
    card.removeEventListener?.('mousemove', onMouseMove);
    card.removeEventListener?.('mouseleave', onMouseLeave);
  };
}
