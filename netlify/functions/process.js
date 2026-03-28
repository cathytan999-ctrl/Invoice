const Anthropic = require(”@anthropic-ai/sdk”);

exports.handler = async function (event, context) {
// Allow CORS
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
  // Read receipt image with AI
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: imageData,
            },
          },
          {
            type: "text",
            text: `Extract all details from this receipt/invoice. Reply ONLY with valid JSON, no markdown, no explanation:
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

- category must be one of: Supplies, Rent, Utilities, Maintenance, Professional Services, Insurance, Travel, Equipment, Marketing, Other
- If GST not shown but total > 0, calculate as total/11 rounded to 2dp
- Date as YYYY-MM-DD, use today (${new Date().toISOString().split(“T”)[0]}) if not visible
- All amounts as numbers only, no currency symbols
- Extract ALL line items if visible
- invoiceNumber: invoice/receipt number if shown, else empty string`,
  },
  ],
  },
  ],
  });
  
  ```
  const text = response.content[0].text
    .replace(/```json|```/g, "")
    .trim();
  const data = JSON.parse(text);
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data }),
  };
  ```
  
  }
  
  return {
  statusCode: 400,
  headers,
  body: JSON.stringify({ error: “Unknown action” }),
  };
  } catch (err) {
  console.error(“Function error:”, err);
  return {
  statusCode: 500,
  headers,
  body: JSON.stringify({ error: err.message }),
  };
  }
  };
