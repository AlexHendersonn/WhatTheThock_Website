function initializeContentfulUpload() {
    const client = contentfulManagement.createClient({
        accessToken: 'CFPAT-mre5NPqoSgiFVh3avbOmoxDD4tT9Dh2pvpTBIbxjCTs'
    });

    document.getElementById('uploadForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            console.log('Fetching space and environment...');
            const space = await client.getSpace('ov6ngems1edo');
            const environment = await space.getEnvironment('master');
            console.log('Space and environment fetched successfully');

            async function uploadFile(file) {
                if (!file) {
                    console.log('No file provided');
                    return null;
                }

                console.log('Uploading file...');
                const response = await fetch('https://api.contentful.com/spaces/ov6ngems1edo/environments/master/uploads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Authorization': `Bearer CFPAT-mre5NPqoSgiFVh3avbOmoxDD4tT9Dh2pvpTBIbxjCTs`
                    },
                    body: file
                });

                if (!response.ok) {
                    throw new Error('Failed to upload file');
                }

                const upload = await response.json();
                console.log('File uploaded successfully:', upload);
                return upload.sys.id;  // Return the upload_id
            }

            async function createAndPublishAsset(uploadId, title, contentType, fileName) {
                if (!uploadId) {
                    console.log('No upload ID provided');
                    return null;
                }

                console.log('Creating asset...');
                const asset = await environment.createAsset({
                    fields: {
                        title: { 'en-US': title },
                        file: {
                            'en-US': {
                                contentType: contentType,
                                fileName: fileName,
                                uploadFrom: {
                                    sys: {
                                        type: 'Link',
                                        linkType: 'Upload',
                                        id: uploadId
                                    }
                                }
                            }
                        }
                    }
                });

                console.log('Asset created, processing...');
                await asset.processForAllLocales();
                console.log('Asset processed, publishing...');
                await asset.publish();
                console.log('Asset published successfully');
                return asset;
            }

            async function uploadAndCreateAsset(file, title, contentType) {
                const uploadId = await uploadFile(file);
                return createAndPublishAsset(uploadId, title, contentType, file.name);
            }

            // Upload Image
            const imageFile = e.target.keyboardImage.files[0];
            const imageAsset = await uploadAndCreateAsset(imageFile, e.target.keyboardName.value + ' Image', imageFile.type);

            // Upload Audio
            const audioFile = e.target.keyboardAudio.files[0];
            const audioAsset = await uploadAndCreateAsset(audioFile, e.target.keyboardName.value + ' Audio', audioFile.type);

            // Upload Video (if provided)
            let videoAsset;
            if (e.target.keyboardVideo.files.length > 0) {
                const videoFile = e.target.keyboardVideo.files[0];
                videoAsset = await uploadAndCreateAsset(videoFile, e.target.keyboardName.value + ' Video', videoFile.type);
            }

            // Create the Keyboard Entry
            console.log('Creating keyboard entry...');
            const entry = await environment.createEntry('keyboard', {
                fields: {
                    title: { 'en-US': e.target.keyboardName.value },
                    description: { 'en-US': e.target.keyboardDescription.value },
                    rating: { 'en-US': parseInt(e.target.keyboardRating.value, 10) },
                    image: imageAsset ? { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                    audio: audioAsset ? { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                    video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
                },
            });

            console.log('Keyboard entry created, publishing...');
            await entry.publish();
            console.log('Keyboard entry published successfully');
            alert('Keyboard uploaded successfully!');
        } catch (error) {
            console.error('Error during upload process:', error);
            alert('There was an error uploading the data: ' + error.message);
        }
    });
}
