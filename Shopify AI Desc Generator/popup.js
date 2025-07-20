// popup.js for Chrome Extension

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PASTE YOUR API KEY HERE ---
    const GEMINI_API_KEY = "AIzaSyD-06fMeTGDsg-Sfh1aAVjRQSwYq0AqW_c"; // <--- IMPORTANT: PASTE YOUR GOOGLE GEMINI API KEY INSIDE THE QUOTES

    // Get references to all the HTML elements
    const generateBtn = document.getElementById('generateBtn');
    const descriptionOutput = document.getElementById('description-output'); // Changed from resultEl
    const copyBtn = document.getElementById('copyBtn');
    const errorMessageEl = document.getElementById('errorMessage');
    
    // Input fields
    const productNameInput = document.getElementById('productName');
    const keywordsInput = document.getElementById('keywords');
    const toneSelect = document.getElementById('tone');

    // Function to set the loading state of the button
    const setLoadingState = (isLoading) => {
        const btnText = document.getElementById('generateBtnText');
        const icon = document.getElementById('generateIcon');
        const spinner = document.getElementById('loadingSpinner');
        generateBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Generating...';
            icon.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            btnText.textContent = 'Generate Description';
            icon.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    };

    // Function to show or hide error messages
    const displayError = (message) => {
        errorMessageEl.textContent = message;
        errorMessageEl.classList.remove('hidden');
    };
    const hideError = () => {
        errorMessageEl.classList.add('hidden');
    };

    // Main function when the "Generate" button is clicked
    generateBtn.addEventListener('click', async () => {
        hideError();

        if (!GEMINI_API_KEY) {
            displayError("API Key is missing. Please add your Gemini API key to the script.");
            return;
        }

        const productName = productNameInput.value;
        const keywords = keywordsInput.value;
        const selectedTone = toneSelect.value;

        if (!productName) {
            displayError("Product Name is required.");
            return;
        }

        setLoadingState(true);
        descriptionOutput.innerHTML = '<p class="placeholder">Generating description...</p>';
        copyBtn.disabled = true;

        const prompt = `
            Generate a compelling, SEO-friendly Shopify product description for a product named "${productName}".
            
            **Instructions:**
            1.  **Tone**: Use a ${selectedTone} and engaging tone.
            2.  **Keywords**: Naturally weave in the following features and keywords: ${keywords || 'general benefits'}.
            3.  **Format**: The output must be well-structured HTML. Start with a heading (<h3> or <h4>) for a catchy title, followed by 2-3 paragraphs of descriptive text. Then, create a <ul> list with 3-5 <li> elements for key features or benefits.
            4.  **Content**: Focus on the customer's benefits, not just listing features. Explain how the product solves a problem or improves their life.
            5.  **Important**: Do NOT include the product name "${productName}" in the heading you generate. The heading should be a creative tagline.
            6.  **Output Style**: Your entire response should be ONLY the raw HTML code. Do not include any markdown formatting like \`\`\`html or any other explanatory text.
        `;
        
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            let generatedText = data.candidates[0]?.content?.parts[0]?.text;

            if (generatedText) {
                const cleanHtml = generatedText.replace(/```html/g, '').replace(/```/g, '').trim();
                descriptionOutput.innerHTML = cleanHtml; // Render the HTML directly
                copyBtn.disabled = false;
            } else {
                throw new Error("Received an empty or invalid response from the API.");
            }

        } catch (error) {
            console.error('Error:', error);
            displayError(`An error occurred: ${error.message}`);
            descriptionOutput.innerHTML = '<p class="placeholder">An error occurred. Please try again.</p>';
        } finally {
            setLoadingState(false);
        }
    });

    // Function to copy the HTML code to the clipboard
    copyBtn.addEventListener('click', () => {
        const htmlToCopy = descriptionOutput.innerHTML;
        
        // Create a temporary textarea to hold the HTML content for copying
        const tempTextArea = document.createElement('textarea');
        tempTextArea.style.position = 'absolute';
        tempTextArea.style.left = '-9999px';
        tempTextArea.value = htmlToCopy;
        
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy HTML';
        }, 2000);
    });
});
