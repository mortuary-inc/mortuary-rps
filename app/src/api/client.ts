import sanityClient from '@sanity/client';
import { SANITY_ENCRYPTION_SECRET, SANITY_PROJECT_ID, SANITY_STUDIO_API_DATASET } from 'config';

const conf = {
    projectId: SANITY_PROJECT_ID, // find this at manage.sanity.io or in your sanity.json
    dataset: SANITY_STUDIO_API_DATASET,
    useCdn: true,
    apiVersion: '2021-11-26', // use a UTC date string
};

export const sanityClientToken = () =>
    sanityClient({
        ...conf,
        token: SANITY_ENCRYPTION_SECRET,
    });

export const sanityClientRefresh = () =>
    sanityClient({
        ...conf,
        useCdn: false,
    });

const _sanityClient = () => sanityClient(conf);
export default _sanityClient;
