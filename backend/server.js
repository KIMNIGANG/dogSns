const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const client = new vision.ImageAnnotatorClient(
  {keyFilename: './key-file.json'}
);

app.post('/api/process-image', async (req, res) => {
  try {
    const { image } = req.body;
    const [result] = await client.labelDetection({ image: { content: image } });
    const labels = result.labelAnnotations.map((label) => label.description);

    console.log(labels);

    const snsSentence = await generateSnsSentence(labels);

    res.json({ labels, snsSentence });
  } catch (error) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(error);
    console.error('Error processing the image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function generateSnsSentence(labels) {
  const prompt = `Write an SNS sentence from a dog's point of view about a photo with these features: ${labels.join(', ')}.`;
  const response = await openai.createCompletion({
    model: 'text-davinci-003', // You can choose a different model if you prefer
    prompt: prompt,
    max_tokens: 50, // Limit the response length, adjust as needed
    // n: 1,
    // stop: null,
    temperature: 0.7, // Adjust the creativity of the generated text, 0.7 is a balanced value
  });

  console.log(response);
  return response.data.choices[0].text.trim();
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
