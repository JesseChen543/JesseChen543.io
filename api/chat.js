// This is a serverless function for Vercel
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user's message from the request body
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Load FAQ data
    let faqData;
    try {
      const faqPath = path.join(process.cwd(), 'data', 'faq.json');
      const faqContent = fs.readFileSync(faqPath, 'utf8');
      faqData = JSON.parse(faqContent);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      // Continue even if we can't load the FAQ data
      faqData = { faqs: [] };
    }

    // The OpenAI API key is automatically loaded from environment variables
    // Make sure you've set OPENAI_API_KEY in your Vercel project settings
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are Jesse Chen's personal assistant AI for his portfolio website. 
            ONLY respond based on information contained in Jesse's faq.json file, which I'll provide below. 
            If the user's question doesn't relate to information in the faq.json file, 
            politely explain that you can only answer questions related to Jesse's background, 
            skills, projects, and professional experience.
            
            Be professional yet conversational, and structure responses clearly using the same section headers 
            found in the faq.json answers (like BACKGROUND:, SKILLS:, PROJECT EXAMPLE:, etc.).
            
            Do NOT answer questions about topics not covered in the faq.json content or make up information.
            If uncertain, politely suggest the user explore other sections of Jesse's portfolio.
            
            Here is the FAQ data (JSON format):
            ${JSON.stringify(faqData.faqs, null, 2)}`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return res.status(500).json({ error: 'Error from OpenAI API', details: data.error });
    }

    const aiResponse = data.choices[0].message.content;
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
