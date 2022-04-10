import ImgixClient from '@imgix/js-core';
import { IMGIX_TOKEN } from 'config';

export default new ImgixClient({
  domain: 'mortuary.imgix.net',
  secureURLToken: IMGIX_TOKEN,
});
