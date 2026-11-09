// Digital-speedometer style price: ghost "8" segments behind lit red digits.
export default function SpeedoPrice({ value, size = 'md', per = '/ wheel' }) {
  const digits = String(Math.round(value));
  return (
    <div className={`speedo speedo--${size}`} aria-label={`Price ${digits} US dollars ${per}`}>
      <span className="speedo__cur">$</span>
      <span className="speedo__digits">
        <span className="speedo__ghost" aria-hidden="true">{'8'.repeat(Math.max(3, digits.length))}</span>
        <span className="speedo__val">{digits.padStart(Math.max(3, digits.length), ' ')}</span>
      </span>
      <span className="speedo__unit">{per}</span>
    </div>
  );
}
