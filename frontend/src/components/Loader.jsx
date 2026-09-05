import { useEffect, useState } from 'react';

export default function Loader() {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFading(true), 900);
    const t2 = setTimeout(() => {
      document.body.classList.remove('rw-loading');
    }, 1500);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('rw-loading');
  }, []);

  return (
    <div className={`rw-loader ${fading ? 'rw-loader--fade' : ''}`} aria-hidden="true">
      <div className="rw-loader__inner">
        <div className="rw-loader__mark">
          <div className="rw-loader__ring" />
          <div className="rw-loader__diamond" />
        </div>
        <div className="rw-loader__word">RAAJWARASA</div>
        <div className="rw-loader__line" />
        <div className="rw-loader__tag">PRESERVING THE PAST</div>
      </div>
    </div>
  );
}