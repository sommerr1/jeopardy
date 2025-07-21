import React from 'react';

interface LevelImageProps {
  src: string;
  alt: string;
}

export const LevelImage: React.FC<LevelImageProps> = ({ src, alt }) => (
  <div className="level-image">
    <img
      src={src}
      alt={alt}
      className="w-[360px] h-[360px] object-contain rounded-xl shadow-lg"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  </div>
); 