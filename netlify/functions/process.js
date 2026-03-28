const Anthropic = require(”@anthropic-ai/sdk”);

exports.handler = async function (event, context) {
const headers = {
“Access-Control-Allow-Origin”: “*”,
“Access-Control-Allow-Headers”: “Content-Type”,
“Access-Control-Allow-Methods”: “POST, OPTIONS”,
};

if (event.httpMethod === “OPTIONS”) {
return { statusCode: 200, headers, body: “” };
}

if (event.httpMethod !== “POST”) {
return { statusCode: 405, headers, body: “Method not allowed” };
}

try {
const { imageData, mimeType, action } = JSON.parse(event.body);

```
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

if (action === "readReceipt") {
  const isImage = mimeType && mimeType.startsWith("image/");
  const isPDF = mimeType && mimeType.includes("pdf");

  let content = [];

  const prompt = `Extract all details from this receipt/invoice. Reply ONLY with valid JSON, no markdown:
```

{
“supplier”: “”,
“items”: [{“description”: “”, “quantity”: 1, “unitPrice”: 0, “amount”: 0}],
“subtotal”: 0,
“gst”: 0,
“total”: 0,
“date”: “YYYY-MM-DD”,
“category”: “”,
“invoiceNumber”: “”,
“notes”: “”
}
Rules:

- category: Supplies, Rent, Utilities, Maintenance, Professional Services, Insurance, Travel, Equipment, Marketing, or Other
- If GST not shown, calculate as total/11 rounded to 2dp
- Date as YYYY-MM-DD, use ${new Date().toISOString().split(“T”)[0]} if not visible
- Numbers only for amounts, no currency symbols
- Extract ALL line items visible`;
  
  ```
  if (isImage) {
    content = [
      { type: "image", source: { type: "base64", media_type: mimeType, data: imageData } },
      { type: "text", text: prompt }
    ];
  } else if (isPDF) {
    content = [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: imageData } },
      { type: "text", text: prompt }
    ];
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unsupported file type" }) };
  }
  
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content }],
  });
  
  const text = response.content[0].text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(text);
  
  return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
  ```
  
  }
  
  return { statusCode: 400, headers, body: JSON.stringify({ error: “Unknown action” }) };
  } catch (err) {
  console.error(“Function error:”, err);
  return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
  };
