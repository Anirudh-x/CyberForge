/**
 * Phishing Email Generator Routes - Gemini AI Integration
 * 
 * This module generates realistic phishing emails for security awareness training.
 * For educational purposes only - no real malicious content.
 */
/* eslint-env node */
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/**
 * POST /api/phishing/generate
 * Generate a realistic phishing email based on parameters
 * 
 * Request body:
 * - employee_role: string (e.g., "HR Manager", "Software Engineer", "CEO")
 * - org_type: string (e.g., "Tech Startup", "Healthcare", "Finance")
 * - region: string (e.g., "North America", "Europe", "Asia")
 * - attack_goal: string (e.g., "Credential Theft", "Malware Installation", "Wire Transfer")
 * - difficulty: string ("easy", "medium", "hard")
 */
router.post('/generate', async (req, res) => {
  try {
    const { employee_role, org_type, region, attack_goal, difficulty } = req.body;

    // Validate required fields
    if (!employee_role || !org_type || !region || !attack_goal || !difficulty) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: employee_role, org_type, region, attack_goal, difficulty'
      });
    }

    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be one of: easy, medium, hard'
      });
    }

    // Build the prompt for phishing email generation
    const prompt = buildPhishingPrompt(employee_role, org_type, region, attack_goal, difficulty);

    // Generate the phishing email using Gemini with retry logic for rate limiting
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break; // Success, exit the retry loop
      } catch (genError) {
        if (genError.status === 429) {
          retryCount++;
          // Extract retry delay from error or use default
          const retryDelay = genError.errorDetails?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay;
          const waitTime = retryDelay ? parseInt(retryDelay) * 1000 : 20000; // Default 20 seconds

          if (retryCount < maxRetries) {
            console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            return res.status(429).json({
              success: false,
              error: 'API rate limit exceeded. Please wait a moment and try again.',
              retryAfter: Math.ceil(waitTime / 1000)
            });
          }
        } else {
          throw genError; // Re-throw non-rate-limit errors
        }
      }
    }

    const response = result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    let phishingEmail;
    try {
      // Extract JSON from the response (in case it's wrapped in markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        phishingEmail = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      });
    }

    // Validate the response structure
    const requiredFields = ['subject', 'body', 'phishing_technique', 'red_flags'];
    const missingFields = requiredFields.filter(field => !phishingEmail[field]);

    if (missingFields.length > 0) {
      return res.status(500).json({
        success: false,
        error: `AI response missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Return the generated phishing email
    res.json({
      success: true,
      data: {
        subject: phishingEmail.subject,
        body: phishingEmail.body,
        phishing_technique: phishingEmail.phishing_technique,
        red_flags: phishingEmail.red_flags,
        metadata: {
          target_role: employee_role,
          organization_type: org_type,
          region: region,
          attack_goal: attack_goal,
          difficulty: difficulty
        }
      }
    });

  } catch (error) {
    console.error('Phishing generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate phishing email. Please try again.'
    });
  }
});

/**
 * Build the prompt for Gemini to generate a phishing email
 */
function buildPhishingPrompt(employee_role, org_type, region, attack_goal, difficulty) {
  const difficultyGuidelines = {
    easy: `
      - Include obvious red flags that are easy to spot
      - Use generic greetings like "Dear User" or "Dear Employee"
      - Include noticeable spelling/grammar errors
      - Use suspicious-looking placeholder URLs like [SUSPICIOUS_LINK_EXAMPLE.com]
      - The urgency should feel forced and unnatural
      - Sender name/domain should look clearly fake
      - Include at least 5-6 obvious red flags`,
    medium: `
      - Include subtle red flags that require attention to notice
      - Use semi-personalized greetings
      - Minimal but present grammatical issues
      - Use placeholder URLs that look somewhat legitimate like [company-secure-portal.example.com]
      - Create moderate urgency that feels somewhat natural
      - Sender appears somewhat legitimate but has issues on closer inspection
      - Include 3-4 subtle red flags`,
    hard: `
      - Make red flags very difficult to spot
      - Use highly personalized content matching the role
      - Perfect grammar and professional tone
      - Use placeholder URLs that look very legitimate like [secure.company-name.example.com/verify]
      - Urgency feels natural and justified
      - Sender appears completely legitimate
      - Include only 1-2 very subtle red flags (like slight URL misspelling or unusual request timing)`
  };

  return `You are a cybersecurity expert creating phishing email simulations for security awareness training. Generate a realistic phishing email based on these parameters:

Target Role: ${employee_role}
Organization Type: ${org_type}
Region: ${region}
Attack Goal: ${attack_goal}
Difficulty Level: ${difficulty.toUpperCase()}

DIFFICULTY GUIDELINES FOR ${difficulty.toUpperCase()}:
${difficultyGuidelines[difficulty.toLowerCase()]}

REQUIREMENTS:
1. The email must sound realistic and professional for the given difficulty level
2. Use social engineering techniques relevant to the target role
3. Include red flags appropriate to the difficulty level
4. Do NOT include real malicious URLs - use placeholder examples like [EXAMPLE_LINK] or [company.example.com]
5. Do NOT include real attachment names that could be harmful
6. The content should be educational and help people recognize phishing attempts
7. Tailor the content to be regionally appropriate for ${region}
8. The attack should logically aim to achieve: ${attack_goal}

SOCIAL ENGINEERING TECHNIQUES TO CONSIDER:
- Authority impersonation (CEO, IT department, HR)
- Urgency and fear tactics
- Curiosity triggers
- Reward/benefit promises
- Trust exploitation
- Invoice/payment scams
- Account verification requests
- Package delivery notifications
- Document sharing requests

Return ONLY a valid JSON object (no markdown, no code blocks) with exactly these fields:
{
  "subject": "The email subject line",
  "body": "The full email body with proper formatting. Use \\n for line breaks.",
  "phishing_technique": "The primary social engineering technique used",
  "red_flags": ["Array of red flags present in this email that users should look for"]
}

Generate the phishing email now:`;
}

/**
 * GET /api/phishing/techniques
 * Get list of common phishing techniques for educational purposes
 */
router.get('/techniques', (req, res) => {
  const techniques = [
    {
      name: 'Spear Phishing',
      description: 'Targeted phishing attacks aimed at specific individuals or organizations',
      indicators: ['Personalized content', 'References to real colleagues', 'Industry-specific language']
    },
    {
      name: 'Whaling',
      description: 'Phishing attacks targeting high-profile executives',
      indicators: ['CEO fraud', 'Executive impersonation', 'High-value requests']
    },
    {
      name: 'Business Email Compromise (BEC)',
      description: 'Impersonating business partners or internal employees',
      indicators: ['Invoice modifications', 'Wire transfer requests', 'Vendor impersonation']
    },
    {
      name: 'Clone Phishing',
      description: 'Copying legitimate emails and replacing links/attachments',
      indicators: ['Resent emails', 'Updated attachment claims', 'Link modifications']
    },
    {
      name: 'Vishing',
      description: 'Voice phishing combined with email follow-up',
      indicators: ['Phone number requests', 'Callback urgency', 'Voicemail references']
    },
    {
      name: 'Pretexting',
      description: 'Creating a fabricated scenario to extract information',
      indicators: ['Detailed backstory', 'Authority claims', 'Urgency with context']
    }
  ];

  res.json({
    success: true,
    data: techniques
  });
});

/**
 * GET /api/phishing/attack-goals
 * Get list of common attack goals
 */
router.get('/attack-goals', (req, res) => {
  const attackGoals = [
    { id: 'credential_theft', name: 'Credential Theft', description: 'Stealing login credentials through fake login pages' },
    { id: 'malware_delivery', name: 'Malware Delivery', description: 'Tricking users into downloading malicious software' },
    { id: 'wire_transfer', name: 'Wire Transfer Fraud', description: 'Convincing victims to transfer money' },
    { id: 'data_exfiltration', name: 'Data Exfiltration', description: 'Extracting sensitive information directly' },
    { id: 'ransomware', name: 'Ransomware Deployment', description: 'Installing ransomware on victim systems' },
    { id: 'account_takeover', name: 'Account Takeover', description: 'Gaining access to user accounts' },
    { id: 'reconnaissance', name: 'Reconnaissance', description: 'Gathering information for future attacks' },
    { id: 'supply_chain', name: 'Supply Chain Attack', description: 'Compromising vendor/partner relationships' }
  ];

  res.json({
    success: true,
    data: attackGoals
  });
});

export default router;
