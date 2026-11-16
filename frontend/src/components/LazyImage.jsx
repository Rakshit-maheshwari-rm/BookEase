import { useState } from 'react';

function LazyImage({ src, alt, className = '', imgClass = '', style = {} }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={className}
            style={{ position: 'relative', overflow: 'hidden', ...style }}
        >
            <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'blur(14px)',
                    transform: 'scale(1.08)',
                    opacity: loaded ? 0 : 1,
                    transition: 'opacity 0.45s ease',
                    pointerEvents: 'none',
                }}
            />

            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={imgClass}
                onLoad={() => setLoaded(true)}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                }}
            />
        </div>
    );
}

export default LazyImage;
