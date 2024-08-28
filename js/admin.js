// This script should be run on the server-side to protect your API key
const contentfulManagement = require('contentful-management');

async function uploadToContentful(formData) {
    try {
        const client = contentfulManagement.createClient({
            accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN // Use environment variable
        });

        const space = await client.getSpace('ov6ngems1edo');
        const environment = await space.getEnvironment('master');

        // Function to create and publish an asset
        async function createAndPublishAsset(file, title) {
            const asset = await environment.createAssetFromFiles({
                fields: {
                    title: { 'en-US': title },
                    file: {
                        'en-US': {
                            contentType: file.mimetype,
                            fileName: file.originalname,
                            file: file.buffer
                        }
                    }
                }
            });

            let processedAsset = await asset.processForAllLocales();
            await processedAsset.publish();
            return processedAsset;
        }

        // Upload assets
        const imageAsset = formData.keyboardImage ? await createAndPublishAsset(formData.keyboardImage, `${formData.keyboardName} Image`) : null;
        const audioAsset = formData.keyboardAudio ? await createAndPublishAsset(formData.keyboardAudio, `${formData.keyboardName} Audio`) : null;
        const videoAsset = formData.keyboardVideo ? await createAndPublishAsset(formData.keyboardVideo, `${formData.keyboardName} Video`) : null;

        // Create the Keyboard Entry
        const entry = await environment.createEntry('keyboard', {
            fields: {
                title: { 'en-US': formData.keyboardName },
                description: { 'en-US': formData.keyboardDescription },
                rating: { 'en-US': formData.keyboardRating },
                image: imageAsset ? { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                audio: audioAsset ? { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
            }
        });

        await entry.publish();

        return { success: true, message: 'Keyboard uploaded successfully!' };
    } catch (error) {
        console.error('Error uploading data:', error);
        return { success: false, message: error.message };
    }
}

module.exports = { uploadToContentful };