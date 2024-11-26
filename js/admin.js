document.addEventListener('DOMContentLoaded', function () {
    async function initializeContentfulUpload() {
        const client = contentfulManagement.createClient({
            accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN, // Use environment variable
        });

        document.getElementById('uploadForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const loadingIndicator = document.createElement('div');
            loadingIndicator.textContent = 'Uploading and processing files...';
            document.body.appendChild(loadingIndicator);

            try {
                const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
                const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID || 'master');

                const uploadFile = async (file, title) => {
                    if (!file) return null;

                    const upload = await space.createUpload({ file });
                    const asset = await environment.createAsset({
                        fields: {
                            title: { 'en-US': title },
                            file: {
                                'en-US': {
                                    contentType: file.type,
                                    fileName: file.name,
                                    uploadFrom: { sys: { type: 'Link', linkType: 'Upload', id: upload.sys.id } },
                                },
                            },
                        },
                    });

                    await asset.processForAllLocales();
                    await asset.publish();
                    return asset;
                };

                const imageAsset = await uploadFile(e.target.keyboardImage.files[0], e.target.keyboardName.value + ' Image');
                const audioAsset = await uploadFile(e.target.keyboardAudio.files[0], e.target.keyboardName.value + ' Audio');
                const videoAsset = await uploadFile(e.target.keyboardVideo.files[0], e.target.keyboardName.value + ' Video');

                const entry = await environment.createEntry('keyboard', {
                    fields: {
                        title: { 'en-US': e.target.keyboardName.value },
                        description: { 'en-US': e.target.keyboardDescription.value },
                        rating: { 'en-US': parseInt(e.target.keyboardRating.value) },
                        image: imageAsset ? { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                        audio: audioAsset ? { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                        video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                    },
                });

                alert('Keyboard uploaded successfully!');
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred: ' + error.message);
            } finally {
                document.body.removeChild(loadingIndicator);
            }
        });
    }

    initializeContentfulUpload();
});
