import { SanityDocument } from '@sanity/client';
import sanityClient, { sanityClientRefresh, sanityClientToken } from './client';

export interface IListenSanity {
    type: string;
    fields?: string;
}

export enum ETransitionListenSanity {
    UPDATE = 'update',
    CREATE = 'appear',
} 

export const listen = (data: IListenSanity, callback: (result: SanityDocument<any>) => void) => {
    try {
        return sanityClient()
            .listen(`*[_type == "${data.type}"]`, {}, { includeResult: true })
            .subscribe((update) => {
                if (update.type === 'mutation') {
                    if (update.result && typeof callback === 'function') {
                        // To know if its an create or update
                        update.result['transition'] = update.transition;
                        callback(update.result);
                    }
                }
            });
    } catch (e) {
        console.error('sanityClient.listen', e);
        throw e;
    }
};

export interface IReadSanity {
    type: string;
    fields: string;
    order?: string;
    more_filter?: string;
    limit?: string;
}

export const read = async (data: IReadSanity, withFreshData?: boolean) => {
    const order = data.order ? ` | order(${data.order})` : '';
    const more_filter = data.more_filter ? data.more_filter : '';
    const limit = data.limit ? data.limit : '';

    const _sanityClient = withFreshData ? sanityClientRefresh : sanityClient;
    try {
        return await _sanityClient().fetch(
            `*[_type == "${data.type}"${more_filter}] ${order}{
            ${data.fields}
        }${limit}`
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const readNecro = async (data: IReadSanity, withFreshData?: boolean) => {

    const order = data.order ? ` | order(${data.order})` : '';
    const more_filter = data.more_filter ? data.more_filter : '';
    const limit = data.limit ? data.limit : '';

    const _sanityClient = withFreshData ? sanityClientRefresh : sanityClient;
    try {
        return await _sanityClient().fetch(
            `*[_type == "${data.type}"${more_filter}] ${order}{
            ${data.fields}
        }[0..500]`
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const readListing = async (data: IReadSanity, withFreshData?: boolean) => {
    const more_filter = data.more_filter ? data.more_filter : '';

    const _sanityClient = withFreshData ? sanityClientRefresh : sanityClient;
    try {
        return await _sanityClient().fetch(
            `*[_type == "${data.type}"${more_filter}] | order(tax) {
            ${data.fields}
        }`
        );
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const create = async (fields: any) => {
    //console.debug("create");

    try {
        return await sanityClientToken().create(fields);
        //.then((res) => {console.log(`Document created, ID is ${res._id}`);});
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const createOr = async (fields: any) => {
    //console.debug("create");
    try {
        return await sanityClientToken()
            .createIfNotExists(fields)
            .then((res) => {
                //console.log(`Document created, ID is ${res._id}`);
                //console.log("OK....")
                sanityClientToken()
                    .patch(res._id)
                    .set({ public: true })
                    .commit() // Perform the patch and return a promise
                    .then((r) => {
                        //console.log('Document has been updated:')
                        //console.log(r)
                    })
                    .catch((err) => {
                        //console.error('Oh no, the update failed: ', err.message)
                    });
            })
            .catch((err) => {
                //console.error('Oh no, the update failed: ', err.message)
            });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const uploadImage = async (filePath: string) => {
    //console.debug("uploadImage");

    try {
        const img = await fetch(filePath);
        const imgBlob = await img.blob();
        return await sanityClientToken().assets.upload('image', imgBlob, { contentType: 'image/png', filename: 'someText.png' });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export interface IUpdateSanity {
    _id: string;
    fields: {};
}
export const update = async (data: IUpdateSanity) => {
    //console.debug("update");

    return await sanityClientToken()
        .patch(data._id) // Document ID to patch
        .set(data.fields) // Shallow merge
        .commit() // Perform the patch and return a promise
        .then((updated) => {
            //console.log("updated",updated)
        })
        .catch((err) => {
            console.error('Update failed: ', err.message);
        });
};
