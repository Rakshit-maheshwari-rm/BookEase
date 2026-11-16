const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports.summarizeReviews = async (reviews, listingTitle) => {
    if (!reviews || reviews.length === 0) {
        return null;
    }

    const prompt = `You are an expert hospitality analyst. Analyze the following verified guest reviews for "${listingTitle}".
    Synthesize them into:
    1. A concise 2-sentence overall summary.
    2. Top 3-4 distinct "Pros" (what guests loved).
    3. Top 1-3 distinct "Cons" or "Things to keep in mind" (constructive notes or caveats).
    4. An overall positivity score as an integer between 0 and 100 (e.g. 85, 92).
    5. A short 3-word "Guest Vibe" (e.g. "Couples & Remote Workers", "Family Friendly Retreat").
    Guest Reviews:
    ${reviews.map((r, i) => `${i + 1}. "${r}"`).join("\n")}`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: "2-sentence executive summary of guest consensus",
                    },
                    pros: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of 3-4 positive highlights",
                    },
                    cons: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of 1-3 honest caveats or things to keep in mind",
                    },
                    positivityScore: {
                        type: Type.NUMBER,
                        description: "Integer score between 0 and 100 representing positive sentiment percentage",
                    },
                    guestVibe: {
                        type: Type.STRING,
                        description: "3-word phrase describing the primary guest audience",
                    },
                },
                required: ["summary", "pros", "cons", "positivityScore", "guestVibe"],
            },
            temperature: 0.2,
        },
    });

    return JSON.parse(response.text);
};

module.exports.parseSearch = async (userPrompt) => {
    if (!userPrompt || userPrompt.trim().length === 0) {
        return null;
    }

    const prompt = `You are a travel search intent extractor. 
        Extract search criteria from this user query: "${userPrompt}".
        Rules:
        1. Map property type to one of these exact values if mentioned: 
        ["luxury-villa", "beachfront", "mountain-cabin", "urban-apartment", "countryside-cottage", "boutique-hotel", "treehouse", "cabin", "villa", "apartment", "house", "cottage"]
        2. Map amenities to matching values from:
        ["High-speed WiFi", "Infinity Pool", "Ocean View", "Free Parking", "Air Conditioning", "Hot Tub", "Pet Friendly", "Indoor Fireplace", "Kitchen", "Balcony"]
        3. If a city or country is mentioned, extract it into 'destination'.
        4. If a price ceiling or budget is mentioned (e.g. "under 3000", "below 5000"), extract numeric value into 'maxPrice'.
        5. If number of guests/people is mentioned, extract into 'minGuests'.
        6. Generate a warm 1-sentence 'explanation' of what was searched.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    destination: {
                        type: Type.STRING,
                        description: "City, state, or country name if mentioned"
                    },
                    type: {
                        type: Type.STRING,
                        description: "Property type matching valid enum values"
                    },
                    maxPrice: {
                        type: Type.NUMBER,
                        description: "Maximum nightly price budget"
                    },
                    minGuests: {
                        type: Type.NUMBER,
                        description: "Minimum guest capacity needed"
                    },
                    amenities: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "Array of amenities specifically mentioned or clearly implied"
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "1-sentence friendly confirmation of search parameters (e.g., 'Showing pet-friendly stays with WiFi under ₹3000')"
                    }
                },
                required: ["explanation"]
            },
            temperature: 0.1,
        }
    });
    return JSON.parse(response.text);
};

module.exports.generateItinerary = async ({ destination, checkIn, checkOut, guests, propertyTitle, propertyType }) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.min(7, Math.ceil((end - start) / (1000 * 60 * 60 * 24))));

    const prompt = `You are a luxury local concierge. Create a detailed ${nights}-day travel itinerary for ${guests} guests staying at "${propertyTitle}" (${propertyType}) in ${destination}.
    Check-in: ${checkIn}, Check-out: ${checkOut}.
    
    Requirements:
    1. For each day, provide a theme, morning, afternoon, and evening activity tailored to the destination.
    2. Suggest 3 authentic local culinary dishes or food spots.
    3. Suggest 4 packing essentials for the destination and season.
    4. Provide 1 pro-budget or local transportation tip.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tripTitle: {
                        type: Type.STRING
                    },
                    tripOverview: {
                        type: Type.STRING
                    },
                    daysCount: {
                        type: Type.NUMBER
                    },
                    days: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                dayNumber: {
                                    type: Type.NUMBER
                                },
                                theme: {
                                    type: Type.STRING
                                },
                                morning: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activity: {
                                            type: Type.STRING
                                        },
                                        description: {
                                            type: Type.STRING
                                        }
                                    },
                                    required: ["activity", "description"]
                                },
                                afternoon: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activity: {
                                            type: Type.STRING
                                        },
                                        description: {
                                            type: Type.STRING
                                        }
                                    },
                                    required: ["activity", "description"]
                                },
                                evening: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activity: {
                                            type: Type.STRING
                                        },
                                        description: {
                                            type: Type.STRING
                                        }
                                    },
                                    required: ["activity", "description"]
                                }
                            },
                            required: ["dayNumber", "theme", "morning", "afternoon", "evening"]
                        }
                    },
                    localCuisine: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                dish: {
                                    type: Type.STRING
                                },
                                whyTry: {
                                    type: Type.STRING
                                }
                            },
                            required: ["dish", "whyTry"]
                        }
                    },
                    packingTips: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    },
                    localTip: {
                        type: Type.STRING
                    }
                },
                required: ["tripTitle", "tripOverview", "days", "localCuisine", "packingTips", "localTip"]
            },
            temperature: 0.3
        }
    });

    return JSON.parse(response.text);
};

module.exports.generateListingCopy = async ({ propertyType, city, country, amenities, notes }) => {
    const prompt = `You are a world-class hospitality copywriter and Superhost listing optimizer.
    Generate a compelling, high-converting listing title and description based on these details:
    - Property Type: ${propertyType || "Stay"}
    - Location: ${[city, country].filter(Boolean).join(", ") || "City, Country"}
    - Selected Amenities: ${(amenities && amenities.length > 0) ? amenities.join(", ") : "Standard luxury amenities"}
    - Host's Key Highlights / Notes: ${notes || "Cozy, modern, great view, peaceful neighborhood"}
    Guidelines:
    1. Provide 3 distinct, catchy, SEO-friendly titles (e.g. "Serene Sunlit Beachfront Villa with Private Plunge Pool").
    2. Write an enticing 2-paragraph description:
       - Paragraph 1: Atmospheric hook describing the property's design, mood, and relaxation experience.
       - Paragraph 2: Practical layout, top amenities, and neighborhood convenience.
    3. Provide 1 punchy tagline and 3 key selling bullet points.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    titles: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "3 high-converting title options"
                    },
                    tagline: {
                        type: Type.STRING,
                        description: "1-sentence marketing tagline"
                    },
                    description: {
                        type: Type.STRING,
                        description: "2-paragraph compelling property description"
                    },
                    keyHighlights: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "3 key selling points"
                    }
                },
                required: ["titles", "tagline", "description", "keyHighlights"]
            },
            temperature: 0.7
        }
    });
    return JSON.parse(response.text);
};

module.exports.suggestPricing = async ({ propertyType, city, country, bedrooms, bathrooms, personsPerRoom, amenities }) => {
    const prompt = `You are a hospitality revenue management specialist for BookEase, an accessible short-term vacation rental platform.
    Estimate realistic, highly competitive, and guest-friendly market rates in Indian Rupees (INR) for this listing:
    - Property Type: ${propertyType || "Stay"}
    - Location: ${[city, country].filter(Boolean).join(", ") || "India"}
    - Bedrooms: ${bedrooms || 1}
    - Bathrooms: ${bathrooms || 1}
    - Capacity: ${personsPerRoom || 2} persons per room
    - Amenities: ${(amenities && amenities.length > 0) ? amenities.join(", ") : "Standard amenities"}

    PRICING RULES (STRICT & ESSENTIAL):
    1. Realistic Vacation Rental Benchmarks:
       - Standard stays / apartments / homestays: ₹1,500 - ₹3,500 / night.
       - Premium stays / cabins / cottages / villas / mansions: ₹4,500 - ₹8,500 / night (rarely exceeding ₹10,000 for 1-3 bedroom stays).
       - Maintain competitive pricing that drives high conversion and bookings; avoid excessive luxury inflation.
    2. Nightly Rates:
       - suggestedPrice: fair, competitive base nightly rate as an integer.
       - minPrice: low-season / weekday discounted rate as an integer.
       - maxPrice: peak holiday / weekend rate as an integer.
    3. Low, Guest-Friendly Fees (CRITICAL - avoid guest sticker shock):
       - cleaningFee: MUST be very modest, typically between ₹200 and ₹500 (maximum ₹700 for large multi-bedroom properties). NEVER suggest thousands of rupees for cleaning.
       - serviceFee: Minimal platform fee, typically between ₹150 and ₹350 (maximum ₹450).
    4. Market Insight: 2-sentence concise explanation of why this rate ensures high booking conversion and guest appeal.
    5. Revenue Tips: 2-3 concise, actionable revenue tips.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedPrice: {
                        type: Type.NUMBER,
                        description: "Recommended nightly base price in INR as an integer"
                    },
                    priceRange: {
                        type: Type.OBJECT,
                        properties: {
                            minPrice: { type: Type.NUMBER, description: "Low season / weekday rate" },
                            maxPrice: { type: Type.NUMBER, description: "Peak season / weekend rate" }
                        },
                        required: ["minPrice", "maxPrice"]
                    },
                    cleaningFee: {
                        type: Type.NUMBER,
                        description: "Modest cleaning fee in INR, between 200 and 600"
                    },
                    serviceFee: {
                        type: Type.NUMBER,
                        description: "Minimal service fee in INR, between 150 and 400"
                    },
                    marketInsight: {
                        type: Type.STRING,
                        description: "2-sentence market analysis and pricing reasoning"
                    },
                    revenueTips: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "2-3 actionable tips to maximize occupancy and revenue"
                    }
                },
                required: ["suggestedPrice", "priceRange", "cleaningFee", "serviceFee", "marketInsight", "revenueTips"]
            },
            temperature: 0.3
        }
    });

    const data = JSON.parse(response.text);

    if (typeof data.cleaningFee === "number") {
        data.cleaningFee = Math.max(150, Math.min(750, Math.round(data.cleaningFee)));
    } else {
        data.cleaningFee = 350;
    }

    if (typeof data.serviceFee === "number") {
        data.serviceFee = Math.max(100, Math.min(450, Math.round(data.serviceFee)));
    } else {
        data.serviceFee = 250;
    }

    if (typeof data.suggestedPrice === "number" && data.suggestedPrice > 12000 && (bedrooms || 1) <= 3) {
        data.suggestedPrice = Math.min(9500, Math.round(data.suggestedPrice));
        if (data.priceRange) {
            data.priceRange.minPrice = Math.min(data.priceRange.minPrice, Math.round(data.suggestedPrice * 0.75));
            data.priceRange.maxPrice = Math.min(data.priceRange.maxPrice, Math.round(data.suggestedPrice * 1.3));
        }
    }

    return data;
};

module.exports.moderateReview = async ({ message, rating, listingTitle }) => {
    const prompt = `You are an automated content moderation specialist for the hospitality platform BookEase.
    Analyze the following guest review submitted for "${listingTitle || 'Stay'}":
    - Rating Given: ${rating} / 5 stars
    - Review Text: "${message}"

    Rules:
    1. Distinguish between honest negative feedback vs. true toxicity. Legitimate complaints about cleanliness, noise, or facilities are APPROVED.
    2. Flag as 'toxic' if it contains profanity, hate speech, racial slurs, personal threats, or harassment.
    3. Flag as 'spam' if it contains external promotional URLs, phone numbers, phishing, or bot-generated text.
    4. Categorize as:
       - 'approved': Safe, genuine guest feedback (positive or negative).
       - 'flagged': Suspicious, excessively hostile, or borderline spam (needs admin eyes).
       - 'rejected': Severe profanity, hate speech, illegal threats, or blatant scam links.
    5. Provide a short 1-sentence flagReason if not approved (or "Clean review" if safe).`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    status: {
                        type: Type.STRING,
                        description: "Must be 'approved', 'flagged', or 'rejected'"
                    },
                    isToxic: {
                        type: Type.BOOLEAN
                    },
                    isSpam: {
                        type: Type.BOOLEAN
                    },
                    confidenceScore: {
                        type: Type.NUMBER,
                        description: "Confidence percentage between 0 and 100"
                    },
                    flagReason: {
                        type: Type.STRING,
                        description: "Short concise reason for flagging or rejection"
                    }
                },
                required: ["status", "isToxic", "isSpam", "confidenceScore", "flagReason"]
            },
            temperature: 0.1
        }
    });

    return JSON.parse(response.text);
};