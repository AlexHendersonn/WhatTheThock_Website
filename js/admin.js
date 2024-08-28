document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
        // Initialize the Contentful Management client
        const client = contentfulManagement.createClient({
            accessToken: 'CFPAT-mre5NPqoSgiFVh3avbOmoxDD4tT9Dh2pvpTBIbxjCTs'
        });

        // Fetch the space
        const space = await client.getSpace('ov6ngems1edo');
        
        // Fetch the environment (e.g., 'master' or any other environment ID you are using)
        const environment = await space.getEnvironment('WhatTheThock');

        const form = e.target;

        // 1. Upload the Image
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

        // 2. Upload the Audio
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
                image: { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } },
                audio: { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } },
                video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
            },
        });

        await entry.publish();

        alert('Keyboard uploaded successfully!');
    } 
);
