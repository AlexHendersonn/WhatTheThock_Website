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
        async function uploadAndPublishAsset(file, title) {
          if (!file) {
            console.log(`No file provided for ${title}`);
            return null;
          }
          console.log(`Uploading ${title}...`);
          const asset = await environment.createAssetFromFiles({
            fields: {
              title: { 'en-US': title },
              file: {
                'en-US': {
                  contentType: file.type,
                  fileName: file.name,
                  file: file,
                },
              },
            },
          });
          console.log(`${title} uploaded, processing...`);
          await asset.process();
          console.log(`${title} processed, publishing...`);
          await asset.publish();
          console.log(`${title} published successfully`);
          return asset;
        }
        // Upload Image
        const imageAsset = await uploadAndPublishAsset(e.target.keyboardImage.files[0], e.target.keyboardName.value + ' Image');
        // Upload Audio
        const audioAsset = await uploadAndPublishAsset(e.target.keyboardAudio.files[0], e.target.keyboardName.value + ' Audio');
        // Upload Video (if provided)
        const videoAsset = await uploadAndPublishAsset(e.target.keyboardVideo.files[0], e.target.keyboardName.value + ' Video');
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