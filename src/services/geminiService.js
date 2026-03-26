import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const cropData = {
  wheat: { pH: { min: 6.0, max: 7.0 }, N: { min: 25, max: 50 }, P: { min: 15, max: 30 }, K: { min: 20, max: 40 } },
  rice: { pH: { min: 5.5, max: 6.5 }, N: { min: 30, max: 60 }, P: { min: 20, max: 40 }, K: { min: 25, max: 50 } },
  corn: { pH: { min: 6.0, max: 7.0 }, N: { min: 20, max: 40 }, P: { min: 15, max: 30 }, K: { min: 15, max: 30 } },
  tomato: { pH: { min: 6.0, max: 6.8 }, N: { min: 100, max: 150 }, P: { min: 50, max: 80 }, K: { min: 150, max: 200 } },
  potato: { pH: { min: 5.0, max: 6.0 }, N: { min: 80, max: 120 }, P: { min: 40, max: 60 }, K: { min: 120, max: 160 } },
  default: { pH: { min: 6.0, max: 7.0 }, N: { min: 25, max: 50 }, P: { min: 15, max: 30 }, K: { min: 20, max: 40 } }
};

/**
 * Helper to safely extract JSON from AI response
 */
function parseAIResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    console.error("Parsing error:", e);
    return null;
  }
}

/**
 * Cache management for daily recommendations
 */
const CACHE_KEY_PREFIX = 'fertilizer_recommendation_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(cropType) {
  return `${CACHE_KEY_PREFIX}${cropType?.toLowerCase() || 'default'}`;
}

function getCachedRecommendation(cropType) {
  try {
    const cacheKey = getCacheKey(cropType);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { recommendation, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const age = now - timestamp;
    
    // Check if cache is still valid (less than 24 hours old)
    if (age < CACHE_DURATION_MS) {
      const hoursRemaining = Math.floor((CACHE_DURATION_MS - age) / (60 * 60 * 1000));
      console.log(`📦 Using cached recommendation (${hoursRemaining}h remaining)`);
      return recommendation;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

// Function to clear all fertilizer recommendation cache
export function clearFertilizerCache(cropType = null) {
  try {
    if (cropType) {
      // Clear cache for specific crop type
      const cacheKey = getCacheKey(cropType);
      localStorage.removeItem(cacheKey);
      // Also clear root rot cache for this crop
      const rootRotCacheKey = getCacheKey(`root_rot_${cropType?.toLowerCase() || 'default'}`);
      localStorage.removeItem(rootRotCacheKey);
      console.log(`🗑️ Cleared cache for ${cropType}`);
    } else {
      // Clear all fertilizer recommendation cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🗑️ Cleared all fertilizer and root rot recommendation cache');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

function setCachedRecommendation(cropType, recommendation) {
  try {
    const cacheKey = getCacheKey(cropType);
    const cacheData = {
      recommendation,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('💾 Recommendation cached for 24 hours');
  } catch (error) {
    console.error('Error caching recommendation:', error);
  }
}

/**
 * Retry wrapper with exponential backoff for rate limit errors
 */
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.message?.includes('429') || 
                         error.message?.includes('quota') || 
                         error.message?.includes('rate-limit');
      
      if (isRateLimit && attempt < maxRetries) {
        const retryDelay = error.message.match(/retry in (\d+)\.?\d*s/i);
        const delayMs = retryDelay ? parseFloat(retryDelay[1]) * 1000 : baseDelay * Math.pow(2, attempt);
        
        console.warn(`Rate limit hit, retrying in ${delayMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
}

export async function getFertilizerRecommendation(sensorData, cropType) {
  try {
    console.log('🔍 getFertilizerRecommendation called with:', { sensorData, cropType });
    
    if (!sensorData) {
      console.error('❌ Sensor data is null/undefined');
      throw new Error('Sensor data is required');
    }

    // Check for cached recommendation (once per day)
    const cached = getCachedRecommendation(cropType);
    if (cached) {
      console.log('📦 Using cached recommendation');
      return cached;
    }

    console.log('🔄 Generating new fertilizer recommendation (cache expired or not found)...');

    // Using gemini-1.5-flash which is the current model with good rate limits
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const ideals = cropData[cropType?.toLowerCase()] || cropData.default;

    const prompt = `
      You are an expert agronomist. 
      Farm Area: 1100 sqm. Crop: ${cropType || 'wheat'}.
      Ideals: pH(${ideals.pH.min}-${ideals.pH.max}), N(${ideals.N.min}-${ideals.N.max}), P(${ideals.P.min}-${ideals.P.max}), K(${ideals.K.min}-${ideals.K.max}).
      Current: pH(${sensorData.ph_level || 7.0}), N(${sensorData.nitrogen || 0}), P(${sensorData.phosphorus || 0}), K(${sensorData.potassium || 0}).
      
      Standards: N: Urea(46-0-0), P: TSP(0-46-0), K: MOP(0-0-60). 
      pH: Lime to raise, Sulfur to lower.

      Task: Provide a JSON array of strings titled "recommendations". 
      Only recommend for values OUTSIDE the ideal range. 
      Format: "Apply [Amount] kg of [Product] to correct [Nutrient/pH] level."
      Respond ONLY with valid JSON: {"recommendations": ["..."]}
    `;

    console.log('📝 Sending prompt to Gemini:', prompt);

    const result = await retryWithBackoff(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    });

    console.log('🤖 Gemini raw response:', result);

    const parsed = parseAIResponse(result) || { recommendations: [] };
    console.log('📋 Parsed recommendations:', parsed);

    const recommendation = convertRecommendationsToPlan(parsed.recommendations, sensorData, cropType);
    console.log('🎯 Final recommendation plan:', recommendation);
    
    // Cache the recommendation for 24 hours
    setCachedRecommendation(cropType, recommendation);

    return recommendation;
  } catch (error) {
    console.error('❌ Fertilizer Error:', error);
    
    // Try to return cached recommendation even if API fails
    const cached = getCachedRecommendation(cropType);
    if (cached) {
      console.log('⚠️ API failed, using cached recommendation');
      return cached;
    }
    
    // Handle quota/rate limit errors with user-friendly message
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return fallbackPlan('API rate limit exceeded. Please wait a moment and try again, or upgrade your API plan for higher limits.');
    }
    
    return fallbackPlan(`Error: ${error.message}`);
  }
}

export async function getRootRotSuggestion(sensorData, cropType) {
  try {
    // Check for cached root rot recommendation (once per day)
    const rootRotKey = `root_rot_${cropType?.toLowerCase() || 'default'}`;
    const cached = getCachedRecommendation(rootRotKey);
    if (cached) {
      console.log('📦 Using cached root rot recommendation');
      return cached;
    }

    console.log('🔄 Generating new root rot recommendation (cache expired or not found)...');

    // Using gemini-1.5-flash which is the current model with good rate limits
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const ideals = cropData[cropType?.toLowerCase()] || cropData.default;

    const prompt = `You are an expert soil agronomist and your task is to analyze soil sensor data to determine the immediate risk of root rot for a specific crop.

**Analysis Guidelines:**
Your analysis must be based on the following rules. The combination of multiple risk factors must result in a higher overall risk level.

1. **Soil Moisture:** This is the most critical factor. Levels above 85-90% are a **High Risk** (waterlogging starves roots of oxygen, promoting fungal growth). Levels 75-85% are a **Medium Risk**.
2. **EC (Electrical Conductivity):** Levels above 3.0 mS/cm are a **High Risk** (indicates high salts, which damage roots and create entry points for disease). Levels 2.0-3.0 mS/cm are a **Medium Risk**.
3. **pH Level:** Extreme levels are a **Medium Risk** as they stress the plant. Consider < 5.5 or > 7.5 as a risk factor.
4. **NPK Imbalance:** A Nitrogen (N) level significantly above the ideal maximum (e.g., >${ideals.N.max}) is a **Medium Risk** factor, as it can cause weak, sappy growth that is more susceptible to disease.

**Sensor Data to Analyze:**
* Crop: ${cropType || 'wheat'}
* Soil Moisture: ${sensorData?.moisture || 0}%
* pH Level: ${sensorData?.ph_level || 7.0}
* EC: ${sensorData?.ec || 0} mS/cm
* Nitrogen (N): ${sensorData?.nitrogen || 0} ppm (Ideal: ${ideals.N.min}-${ideals.N.max})
* Phosphorus (P): ${sensorData?.phosphorus || 0} ppm (Ideal: ${ideals.P.min}-${ideals.P.max})
* Potassium (K): ${sensorData?.potassium || 0} ppm (Ideal: ${ideals.K.min}-${ideals.K.max})

**Your Task:**
Based *only* on the data and guidelines above, provide your analysis as a JSON object with 'riskLevel' and 'explanation'.
- Keep explanation concise and precise (max 2 sentences)
- Focus on the most critical factors only
- Be direct and specific

Respond ONLY with valid JSON: {"riskLevel": "Low|Medium|High", "explanation": "Concise explanation of primary risk factors (max 2 sentences)."}`;

    const result = await retryWithBackoff(async () => {
      const result = await model.generateContent(prompt);
      return result.response.text();
    });

    console.log('🤖 Root rot Gemini raw response:', result);

    const parsed = parseAIResponse(result) || { riskLevel: "Low", explanation: "Data unavailable." };
    console.log('📋 Parsed root rot recommendation:', parsed);

    const recommendation = {
      risk_level: parsed.riskLevel,
      explanation: parsed.explanation,
      recommendation: getRecommendationForRisk(parsed.riskLevel)
    };

    console.log('🎯 Final root rot recommendation:', recommendation);
    
    // Cache the root rot recommendation for 24 hours
    setCachedRecommendation(rootRotKey, recommendation);

    return recommendation;
  } catch (error) {
    console.error('❌ Root rot Error:', error);
    
    // Try to return cached recommendation even if API fails
    const rootRotKey = `root_rot_${cropType?.toLowerCase() || 'default'}`;
    const cached = getCachedRecommendation(rootRotKey);
    if (cached) {
      console.log('⚠️ API failed, using cached root rot recommendation');
      return cached;
    }
    
    // Handle quota/rate limit errors with user-friendly message
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return { 
        risk_level: 'Unknown', 
        explanation: 'Unable to assess risk due to API rate limits. Please wait and try again.', 
        recommendation: 'Monitor soil moisture manually and ensure proper drainage.' 
      };
    }
    return { risk_level: 'Unknown', explanation: 'API Error.', recommendation: 'Check drainage manually.' };
  }
}

function convertRecommendationsToPlan(recommendations, sensorData, cropType) {
  console.log('🔄 Converting recommendations to plan:', { recommendations, sensorData, cropType });
  
  let plan = {
    nitrogen_amount: 0, phosphorus_amount: 0, potassium_amount: 0,
    nitrogen_priority: 'low', phosphorus_priority: 'low', potassium_priority: 'low',
    nitrogen_apply_by: formatDate(0), phosphorus_apply_by: formatDate(3), potassium_apply_by: formatDate(5),
    recommendation_text: recommendations.join(' ') || 'Soil levels are optimal.'
  };

  console.log('📋 Initial plan:', plan);

  recommendations.forEach(rec => {
    console.log('🔍 Processing recommendation:', rec);
    const amountMatch = rec.match(/(\d+(?:\.\d+)?)\s*kg/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const lower = rec.toLowerCase();

    console.log('📊 Extracted amount:', amount, 'for recommendation:', rec);

    if (lower.includes('urea')) { 
      plan.nitrogen_amount = amount; 
      plan.nitrogen_priority = 'high'; 
      console.log('✅ Updated nitrogen:', amount);
    }
    if (lower.includes('tsp')) { 
      plan.phosphorus_amount = amount; 
      plan.phosphorus_priority = 'high'; 
      console.log('✅ Updated phosphorus:', amount);
    }
    if (lower.includes('mop')) { 
      plan.potassium_amount = amount; 
      plan.potassium_priority = 'high'; 
      console.log('✅ Updated potassium:', amount);
    }
  });

  console.log('🎯 Final plan after processing:', plan);
  return plan;
}

function getRecommendationForRisk(riskLevel) {
  const map = {
    High: 'Immediately improve drainage and consider fungicide application. Reduce watering.',
    Medium: 'Monitor soil moisture closely; check for standing water.',
    Low: 'Continue regular irrigation monitoring.'
  };
  return map[riskLevel] || map.Low;
}

function formatDate(daysAhead) {
  return new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];
}

function fallbackPlan(msg) {
  return { 
    nitrogen_amount: 0, 
    phosphorus_amount: 0, 
    potassium_amount: 0, 
    recommendation_text: msg, 
    nitrogen_priority: 'low', 
    phosphorus_priority: 'low', 
    potassium_priority: 'low',
    nitrogen_apply_by: formatDate(0),
    phosphorus_apply_by: formatDate(3),
    potassium_apply_by: formatDate(5)
  };
}