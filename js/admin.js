

// Initialize the Contentful Management client
const client = contentfulManagement.createClient({
  accessToken: 'CFPAT-mre5NPqoSgiFVh3avbOmoxDD4tT9Dh2pvpTBIbxjCTs' // Your CMA token
});

document.getElementById('uploadForm').addEventListener('submit', function (e) {
  e.preventDefault();

  client.getSpace('ov6ngems1edo') // Replace with your Space ID
    .then((space) => space.getEnvironment('master')) // Replace with your Environment ID or alias
    .then(async (environment) => {
      
      // 1. Upload the Image
      const imageFile = e.target.keyboardImage.files[0];
      const imageAsset = await environment.createAssetFromFiles({
        fields: {
          title: { 'en-US': e.target.keyboardName.value + ' Image' },
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
      const audioFile = e.target.keyboardAudio.files[0];
      const audioAsset = await environment.createAssetFromFiles({
        fields: {
          title: { 'en-US': e.target.keyboardName.value + ' Audio' },
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
      if (e.target.keyboardVideo.files.length > 0) {
        const videoFile = e.target.keyboardVideo.files[0];
        videoAsset = await environment.createAssetFromFiles({
          fields: {
            title: { 'en-US': e.target.keyboardName.value + ' Video' },
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
          title: { 'en-US': e.target.keyboardName.value },
          description: { 'en-US': e.target.keyboardDescription.value },
          rating: { 'en-US': e.target.keyboardRating.value },
          image: { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } },
          audio: { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } },
          video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
        },
      });

      await entry.publish();

      alert('Keyboard uploaded successfully!');
    })
    .catch(console.error);
});
