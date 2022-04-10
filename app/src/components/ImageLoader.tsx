import ImgixClient from '../api/ImgixClient';
import { useEffect, useState } from 'react';
import LazyLoad from 'react-lazyload';

export interface ImageProps {
  img: string;
  alt: string;
  w: number;
  q?: number;
  classN?: string;
  lazy?: boolean | undefined;
}

export const ImageLoader = ({ img, alt, w, q, classN, lazy }: ImageProps) => {
  const [image, setImage] = useState<string>();
  let [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
      setIsLocal(true);
    } else {
      setIsLocal(false);
      const url = ImgixClient.buildURL(window.location.origin.toString() + img, { w: w, fm: 'jpg', q: 50 });
      console.log(window.location.origin.toString() + img);
      setImage(url);
    }
  }, [img, w]);

  if (!lazy) {
    return <img className={classN + ' w-full'} src={isLocal ? img : image} alt={alt} />;
  } else {
    return (
      <LazyLoad classNamePrefix={' w-full border-grayNFT border-5  LazyLoad'}>
        <img className={classN + ' w-full'} src={isLocal ? img : image} alt={alt} />
      </LazyLoad>
    );
  }
};

export default ImageLoader;
