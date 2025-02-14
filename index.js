const { Permit } = require("permitio");
const express = require("express");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const cors = require("cors");

dotenv.config();

const permit = new Permit({
  // To check the ReBAC policy, you have to run the Permit PDP locally
  // It is not a must to run it to see the demo
  pdp: "http://localhost:7766",
  token: process.env.PERMIT_API_KEY,
});

const openai = new OpenAI({
  baseURL: "https://api.studio.nebius.ai/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  return res.status(200).json({ message: "Welcome to the Permit.io API" });
});

app.post("/generate-rebac", async (req, res) => {
  const { text } = req.body;

  function generatePrompt(userInput) {
    return `Parse the following sentence into a REBAC relationship tuple for use in Permit.io:
      
      Sentence: "${userInput}"
      
      Identify the following:
      - **Subject:** Include type and instance if available (e.g., "team:enterprise_sales").
      - **Relation:** Extract the main action verb (e.g., "manages").
      - **Object:** Include type and instance if available (e.g., "account:enterprise").
  - **Attributes:** Extract any metadata or qualifiers relevant to the object (e.g., {"level": "enterprise"}). If no attributes exist, return an empty object.
  
  Return the result in this JSON format:
  \`\`\`json
  {
    "subject": "type:id",
    "relation": "verb",
    "object": "type:id",
    "attributes": {
        "key": "value"
        }
  }
  \`\`\`
  
  Ensure that the response remains consistent in format, with exact JSON keys as shown, even if some fields are empty.`;
  }

  const prompt = generatePrompt(text);

  function formatJsonResponse(jsonString) {
    try {
      // Parse the JSON string to an object
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error) {
      console.error("Invalid JSON input:", error);
      return null;
    }
  }

  function transformJson(jsonString) {
    const jsonMatch = jsonString.match(/```json\n({[\s\S]*?})\n```/);
    const extractedJson = jsonMatch ? jsonMatch[1] : null;
    try {
      const data = JSON.parse(extractedJson);

      // Return the JSON string with correct formatting
      return data;
    } catch (error) {
      console.error("Invalid JSON input:", error);
      return null;
    }
  }

  try {
    const response = await openai.chat.completions.create({
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
      model: "deepseek-ai/DeepSeek-R1",
    });

    const responseText = response.choices[0].message.content;
    const rebacTuple = transformJson(responseText);

    const result = await permit.api.relationshipTuples.create({
      subject: `${rebacTuple?.subject}`,
      relation: `${rebacTuple?.relation}`,
      object: `${rebacTuple?.object}`,
    });

    console.log(result);
    console.log(rebacTuple?.subject, rebacTuple?.relation, rebacTuple?.object);
    console.log(responseText);
    return res.status(200).json({
      success: true,
      responseText,
      rebacTuple,
      relationTupleCreated: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      relationTupleCreated: false,
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
