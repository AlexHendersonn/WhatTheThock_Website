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

            async function uploadFile(file, title) {
                if (!file) {
                    console.log(`No file provided for ${title}`);
                    return null;
                }
                console.log(`Uploading ${title}...`);
                
                // Step 1: Upload the file
                const upload = await space.createUpload({ file });
                console.log(`${title} uploaded successfully, upload ID: ${upload.sys.id}`);

                // Step 2: Create an asset with the uploaded file
                const asset = await environment.createAsset({
                    fields: {
                        title: {
                            'en-US': title
                        },
                        file: {
                            'en-US': {
                                contentType: file.type,
                                fileName: file.name,
                                uploadFrom: {
                                    sys: {
                                        type: "Link",
                                        linkType: "Upload",
                                        id: upload.sys.id
                                    }
                                }
                            }
                        }
                    }
                });

                console.log(`Asset created for ${title}, processing...`);
                await asset.processForAllLocales();
                console.log(`Asset processed for ${title}`);
                
                // Wait for the asset to be in a ready state
                let processedAsset = await environment.getAsset(asset.sys.id);
                while (processedAsset.fields.file['en-US'].url === undefined) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    processedAsset = await environment.getAsset(asset.sys.id);
                }
                console.log(`Asset ready for ${title}`);

                return processedAsset;
            }

            // Upload Image
            const imageAsset = await uploadFile(e.target.keyboardImage.files[0], e.target.keyboardName.value + ' Image');
            
            // Upload Audio
            const audioAsset = await uploadFile(e.target.keyboardAudio.files[0], e.target.keyboardName.value + ' Audio');
            
            // Upload Video (if provided)
            const videoAsset = await uploadFile(e.target.keyboardVideo.files[0], e.target.keyboardName.value + ' Video');

            // Create the Keyboard Entry
            console.log('Creating keyboard entry...');
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
            
            console.log('Keyboard entry created successfully');
            alert('Keyboard uploaded successfully!');
        } catch (error) {
            console.error('Error during upload process:', error);
            if (error.name === 'AccessTokenInvalid') {
                alert('Invalid access token. Please check your Contentful credentials.');
            } else if (error.name === 'NotFound') {
                alert('Space or environment not found. Please check your space ID and environment.');
            } else {
                alert('There was an error uploading the data: ' + error.message);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeContentfulUpload();
});