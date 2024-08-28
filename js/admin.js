document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
        // Initialize the Contentful Management client
        const client = contentfulManagement.createClient({
            accessToken: 'CFPAT-DeIhIu9e_WTS3eW3ELuKcOveDIzOsTWwwfyCWAk-3jE'
        });

        // Fetch the space
        const space = await client.getSpace('ov6ngems1edo');
        
        // Fetch the environment (ensure this is correct, default is usually 'master')
        const environment = await space.getEnvironment('master');

        const form = e.target;

        // 1. Upload the Image
        if (form.keyboardImage.files.length > 0) {
            const imageFile = form.keyboardImage.files[0];
            const imageAsset = await environment.createAssetFromFiles({
                fields: {
                    title: { 'en-US': form.keyboardName.value + ' Image' },
                    file: {
                        'en-US': {
                            contentType: imageFile.type,
                            fileName: imageFile.name,
                            file: imageFile,
                        },
                    },
                },
            });

            await imageAsset.processForAllLocales();
            await imageAsset.publish();
        }

        // 2. Upload the Audio
        if (form.keyboardAudio.files.length > 0) {
            const audioFile = form.keyboardAudio.files[0];
            const audioAsset = await environment.createAssetFromFiles({
                fields: {
                    title: { 'en-US': form.keyboardName.value + ' Audio' },
                    file: {
                        'en-US': {
                            contentType: audioFile.type,
                            fileName: audioFile.name,
                            file: audioFile,
                        },
                    },
                },
            });

            await audioAsset.processForAllLocales();
            await audioAsset.publish();
        }

        // 3. Upload the Video (if provided)
        let videoAsset;
        if (form.keyboardVideo.files.length > 0) {
            const videoFile = form.keyboardVideo.files[0];
            videoAsset = await environment.createAssetFromFiles({
                fields: {
                    title: { 'en-US': form.keyboardName.value + ' Video' },
                    file: {
                        'en-US': {
                            contentType: videoFile.type,
                            fileName: videoFile.name,
                            file: videoFile,
                        },
                    },
                },
            });

            await videoAsset.processForAllLocales();
            await videoAsset.publish();
        }

        // 4. Create the Keyboard Entry
        const entry = await environment.createEntry('keyboard', {
            fields: {
                title: { 'en-US': form.keyboardName.value },
                description: { 'en-US': form.keyboardDescription.value },
                rating: { 'en-US': form.keyboardRating.value },
                image: { 'en-US': imageAsset ? { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } : undefined },
                audio: { 'en-US': audioAsset ? { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } : undefined },
                video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
            },
        });

        await entry.publish();

        alert('Keyboard uploaded successfully!');
    } catch (error) {
        console.error('Error uploading data:', error);
        alert('There was an error uploading the data. Please check the console for details.');
    }
});
