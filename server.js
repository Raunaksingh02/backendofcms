const express = require("express");
const pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const multer = require("multer");
dotenv.config();
const app = express();

const TEMP_DIR = path.join(__dirname, "temp");

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});



const upload = multer({
    dest: "uploads/"
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected on Successfully"
    );
  })
  .catch((error) => {
    console.log(
      "MongoDB Connection Error:",
      error.message
    );
  });


const courseRoutes = require("./routes/courseRoutes");

const applicantRoutes = require("./routes/applicantRoutes");


// In-memory session store (NO DB)
const sessions = {};

/**
=====================================================
UTIL: AI CALL WRAPPER (YOUR GEMINI ROUTE STYLE)
=====================================================
*/
async function callAI(prompt, ai) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

/**
=====================================================
START INTERVIEW (FIRST QUESTION)
=====================================================
*/
app.post("/run1", async (req, res) => {
  try {
    const { language, code } = req.body;

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language,
        version: "*",
        files: [
          {
            content: code,
          },
        ],
      }
    );

    res.json({
      output: response.data.run.output,
    });
  } catch (err) {
  console.log("ERROR:");
  console.log(err.message);

  if (err.response) {
    console.log("Status:", err.response.status);
    console.log("Data:", err.response.data);

    return res.status(500).json({
      output: err.response.data
    });
  }

  return res.status(500).json({
    output: err.message
  });
}
  
});
app.post("/run", (req, res) => {

    const { code } = req.body;

    if (!code) {
        return res.json({
            output: "No code received."
        });
    }

    const javaFile = path.join(TEMP_DIR, "Main.java");

    fs.writeFileSync(javaFile, code);

    const command = `cd "${TEMP_DIR}" && javac Main.java && java Main`;

    exec(command, (error, stdout, stderr) => {

        if (error) {
            return res.json({
                output: stderr || error.message
            });
        }

        if (stderr) {
            return res.json({
                output: stderr
            });
        }

        return res.json({
            output: stdout
        });

    });

});


/**
=====================================================
ANSWER + EVALUATION + NEXT QUESTION
=====================================================
*/
app.post("/interview/answer", async (req, res) => {
  try {
    const { name, answer } = req.body;

    const session = sessions[name];

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session expired",
      });
    }

    const currentQuestion =
      session.questions[session.answers.length];

    /**
     * STEP 1: Evaluate Answer
     */
    const evalPrompt = `
You are an expert MNC HR evaluator.

Question: ${currentQuestion}
Answer: ${answer}

Return ONLY valid JSON:
{
  "score": number (0-10),
  "feedback": "short professional HR feedback"
}
`;

    const evaluationRaw = await callAI(evalPrompt, req.ai);

    let evaluation;
    try {
      evaluation = JSON.parse(evaluationRaw);
    } catch (e) {
      evaluation = {
        score: 5,
        feedback: "Moderate answer, needs improvement",
      };
    }

    session.answers.push(answer);
    session.scores.push(evaluation.score);
    session.feedbacks.push(evaluation.feedback);

    /**
     * STEP 2: Generate Next Question
     */
    const nextPrompt = `
You are a strict MNC HR interviewer.

Candidate Role: ${session.role}

Based on previous conversation, ask the next interview question.
Do NOT repeat previous questions.
Keep it professional and challenging.
`;

    const nextQuestion = await callAI(nextPrompt, req.ai);

    session.questions.push(nextQuestion);

    res.json({
      success: true,
      evaluation,
      nextQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Answer Error",
    });
  }
});

/**
=====================================================
END INTERVIEW (FINAL REPORT)
=====================================================
*/
app.post("/interview/end", async (req, res) => {
  try {
    const { name } = req.body;

    const session = sessions[name];

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session not found",
      });
    }

    const avgScore =
      session.scores.length > 0
        ? session.scores.reduce((a, b) => a + b, 0) /
          session.scores.length
        : 0;

    const finalPrompt = `
You are a senior HR manager of a top MNC.

Generate final interview report:

Role: ${session.role}

Scores: ${session.scores.join(", ")}

Feedbacks: ${session.feedbacks.join(" | ")}

Return:
- Final verdict (Selected / Not Selected / Needs Improvement)
- Summary feedback (professional)
`;

    const report = await callAI(finalPrompt, req.ai);

    delete sessions[name];

    res.json({
      success: true,
      averageScore: avgScore.toFixed(2),
      report,
      totalQuestions: session.questions.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "End Error",
    });
  }
});

app.post("/ai", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
});

app.post("/airesume", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }
const prompt = `
You are a professional ATS Resume Writer.

Analyze the resume below and create a new modern ATS-friendly resume.

Return ONLY valid JSON.

{
  "name":"",
  "email":"",
  "phone":"",
  "location":"",
  "linkedin":"",
  "summary":"",
  "skills":[],
  "education":[
    {
      "degree":"",
      "college":"",
      "year":""
    }
  ],
  "experience":[
    {
      "title":"",
      "company":"",
      "duration":"",
      "description":""
    }
  ],
  "projects":[
    {
      "name":"",
      "description":""
    }
  ],
  "certifications":[]
}

Resume:
${resumeText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


app.post("/aichatbox", async (req, res) => {

    try {

        const {
            message,
            question,
            language,
            code,
            input,
            output
        } = req.body;

        const prompt = `
You are an expert Data Structures and Algorithms mentor.

You are helping a student solve a coding problem.

==================================
QUESTION TITLE
==================================

${question.title}

==================================
DESCRIPTION
==================================

${question.description}

==================================
CONSTRAINTS
==================================

${question.constraints.join("\n")}

==================================
VISIBLE TEST CASES
==================================

${question.visibleCases
    .map(
        (tc, index) => `
Example ${index + 1}

Input:
${tc.input}

Output:
${tc.output}
`
    )
    .join("\n")}

==================================
PROGRAMMING LANGUAGE
==================================

${language}

==================================
STUDENT CODE
==================================

${code}

==================================
CURRENT INPUT
==================================

${input}

==================================
CURRENT OUTPUT
==================================

${output}

==================================
STUDENT QUESTION
==================================

${message}

==================================
IMPORTANT RULES
==================================

1. Explain in simple language.

2. Never reveal hidden test cases.

3. If student asks for hint, don't directly give full solution.

4. Explain mistakes if code is wrong.

5. Mention Time Complexity whenever applicable.

6. Mention Space Complexity whenever applicable.

7. Use code blocks whenever required.

8. If asked for Dry Run, explain every iteration.

9. If asked for Step by Step Solution, explain every step.

10. If asked to optimize code, explain why the new approach is better.
`;

        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt,

        });

        res.json({

            success: true,

            answer: response.text,

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Unable to generate AI response."

        });

    }

});

app.post("/api/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const payload = {
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: `91${mobile}`,
    };

    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      payload,
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      data: response.data,
    });
  } catch (error) {
    console.log("MSG91 ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.post("/interview/start", async (req, res) => {
  try {
    const { name, role } = req.body;

    const prompt = `
You are a strict MNC HR interviewer.
Candidate Role: ${role}
Ask the FIRST interview question.
Make it professional, concise, and realistic.
Do not explain anything.
`;

    const question = await callAI(prompt, req.ai);

    sessions[name] = {
      role,
      questions: [question],
      answers: [],
      scores: [],
      feedbacks: [],
    };

    res.json({
      success: true,
      question,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Start Error " });
  }
});

app.post(
    "/image-answer",
    upload.single("image"),
    async (req, res) => {

        try {

            const imageBytes = fs.readFileSync(req.file.path);

            const base64Image =
                imageBytes.toString("base64");

            const question = req.body.question;

            const response =
                await ai.models.generateContent({

                    model: "gemini-2.5-flash",

                    contents: [
                        {
                            inlineData: {
                                mimeType: req.file.mimetype,
                                data: base64Image,
                            },
                        },
                        {
                            text: question,
                        },
                    ],
                });

            fs.unlinkSync(req.file.path);

            res.json({
                answer: response.text,
            });

        } catch (err) {

            console.log(err);

            res.status(500).json({
                message: err.message,
            });
        }

    }
);

app.post("/answer", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an expert teacher for an EdTech platform.

Follow these rules STRICTLY:

1. Return ONLY plain text.
2. Do NOT use Markdown.
3. Do NOT use HTML.
4. Do NOT use LaTeX.
5. Do NOT use:
   **, *, #, \`\`\`, $, $$,
   \\boxed{}, \\sqrt{}, \\frac{},
   \\left, \\right, \\times, \\cdot,
   \\Rightarrow, \\rightarrow.
6. Use normal Unicode symbols only.
7. Explain step by step.
8. For mathematics, write expressions like:
   x² - 4x + 1
   (x - 7)(x + 5) = 0
   2 + √3
   1/2

Question:

${question}
`,
    });

    let answer = response.text;

    // Remove $ and $$
    answer = answer.replace(/\\\$/g, "");
    answer = answer.replace(/\$/g, "");

    // Remove Markdown
    answer = answer.replace(/\*\*(.*?)\*\*/gs, "$1");
    answer = answer.replace(/\*(.*?)\*/gs, "$1");
    answer = answer.replace(/`{3}[\s\S]*?`{3}/g, "");
    answer = answer.replace(/`/g, "");
    answer = answer.replace(/^#{1,6}\s*/gm, "");

    // Convert common LaTeX
    answer = answer.replace(/\\boxed\{([^}]*)\}/g, "$1");
    answer = answer.replace(/\\sqrt\{([^}]*)\}/g, "√($1)");
    answer = answer.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2");
    answer = answer.replace(/\\times/g, "×");
    answer = answer.replace(/\\cdot/g, "·");
    answer = answer.replace(/\\Rightarrow/g, "=>");
    answer = answer.replace(/\\rightarrow/g, "->");
    answer = answer.replace(/\\left/g, "");
    answer = answer.replace(/\\right/g, "");
    answer = answer.replace(/\\\\/g, "\n");

    // Remove remaining LaTeX commands
    answer = answer.replace(/\\[a-zA-Z]+\*?/g, "");

    // Remove braces left by LaTeX
    answer = answer.replace(/[{}]/g, "");

    // Remove decorative symbols
    answer = answer.replace(
      /[•▪■►➜✓✔★☆◆◇⬤●○➡️🔥✨🎯📌📍📖📝💡]/g,
      ""
    );

    // Remove horizontal lines
    answer = answer.replace(/^[-=]{3,}$/gm, "");

    // Remove multiple spaces
    answer = answer.replace(/[ \t]+/g, " ");

    // Remove excessive blank lines
    answer = answer.replace(/\n{3,}/g, "\n\n");

    answer = answer.trim();

    res.json({
      success: true,
      answer,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "AI Error",
    });
  }
});

app.use(
  "/api/course",
  courseRoutes
);

app.use(
  "/api/applicant",
  applicantRoutes
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "Backend Running on Port ${PORT} Successfully happy",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(
  (error, req, res, next) => {
    console.error(
      "Server Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Internal Server ",
    });
  }
);

const PORT =
  process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(
    `Server Running On  ${PORT}`
  );
});



