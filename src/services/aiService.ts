
const API_KEY = '51ca6243f7msh9902b1a86759ef4p18db50jsn69065123cb41';
const HOST = 'image-tagging-and-classification.p.rapidapi.com';

interface AIResult {
  title: string;
  description: string;
  category: string;
}

export const analyzeImage = async (base64String: string): Promise<AIResult> => {

  const cleanBase64 = base64String.replace(/^data:image\/[a-z]+;base64,/, "");

  const response = await fetch(`https://${HOST}/analyze`, {
    method: 'POST',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': HOST,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input_image: cleanBase64,
      input_type: "base64",
      max_description_length: 500,
      min_keywords_count: 3,
      max_keywords_count: 5,
      custom_categories: {}
    })
  });

  if (!response.ok) throw new Error('Failed to fetch image');

  const json = await response.json();

  if (json.data) {
    const keywords = json.data.keywords ? json.data.keywords.join(", ") : "";
    const category = json.data.category || "Geral";

    return {
      title: json.data.title || "Report detected",
      description: `${json.data.description}\n\n[Tags]: ${keywords}\n[Category]: ${category}`,
      category: category
    };
  }

  throw new Error('Image description could cannot be used.');
};