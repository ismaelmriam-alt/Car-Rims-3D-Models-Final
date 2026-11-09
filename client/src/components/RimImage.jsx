const photoByProduct = {
  'apex-vortex-10': 'apex-vortex-10.jpg',
  'kuro-grid-mesh': 'kuro-grid-mesh.jpg',
  'voltra-split-five': 'voltra-split-five.jpg',
  'stratos-deep-six': 'stratos-deep-six.jpg',
  'apex-razor-5': 'apex-razor-5.jpg',
  'nightline-spiral-12': 'nightline-spiral-12.jpg',
  'kuro-hex-mesh': 'kuro-hex-mesh.jpg',
  'voltra-fork-y': 'voltra-fork-y.jpg',
  'stratos-circuit-s': 'stratos-circuit-s.jpg',
  'nightline-lip-eight': 'nightline-lip-eight.jpg',
};

export default function RimImage({
  productSlug,
  productName = 'Alloy wheel',
  showCaption = false,
  className = '',
  size = 340,
}) {
  const photo = photoByProduct[productSlug];
  if (!photo) throw new Error(`No real-wheel photo configured for product "${productSlug}".`);

  return (
    <span className={`rim-img ${className}`} style={{ width: size, height: size }}>
      <img
        className="rim-img__photo"
        src={`/media/real-rims/${photo}`}
        alt={`Representative real-world alloy wheel photograph for ${productName}`}
        width={size}
        height={size}
        loading="lazy"
      />
      {showCaption && <span className="rim-img__caption">REAL WHEEL PHOTO · VISUAL REFERENCE</span>}
    </span>
  );
}
