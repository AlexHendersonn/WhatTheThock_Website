const contentfulManagement = require('contentful-management');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const client = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  });

  const formData = JSON.parse(event.body);

  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID || 'master');

    const createAsset = async (file, title) => {
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

    const imageAsset = await createAsset(formData.keyboardImage, `${formData.keyboardName} Image`);
    const audioAsset = await createAsset(formData.keyboardAudio, `${formData.keyboardName} Audio`);
    const videoAsset = await createAsset(formData.keyboardVideo, `${formData.keyboardName} Video`);

    const entry = await environment.createEntry('keyboard', {
      fields: {
        title: { 'en-US': formData.keyboardName },
        description: { 'en-US': formData.keyboardDescription },
        rating: { 'en-US': parseInt(formData.keyboardRating) },
        image: imageAsset ? { 'en-US': { sys: { id: imageAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
        audio: audioAsset ? { 'en-US': { sys: { id: audioAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
        video: videoAsset ? { 'en-US': { sys: { id: videoAsset.sys.id, linkType: 'Asset', type: 'Link' } } } : undefined,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Entry created successfully!', entry }),
    };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
