import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageSquare, FiTrendingUp, FiBarChart2, FiPieChart, FiActivity, FiTarget, FiZap, FiChevronRight, FiTrendingDown, FiUsers, FiDollarSign, FiCalendar, FiArrowUp, FiArrowDown, FiEye } from 'react-icons/fi';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, ComposedChart, Cell, Area, AreaChart, PieChart, Pie, ScatterChart, Scatter
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
const chartColors = [
    '#7400B8', '#9B4DCA', '#C77DFF', '#E0AAFF', '#F8F4FF',
    '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#F3E8FF',
    '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#DDD6FE'
  ];
// --- IMPORTANT: API Key Configuration ---
// It's recommended to use environment variables to store your API key securely.
// 1. Create a .env file in the root of your project.
// 2. Add your API key to the .env file: VITE_GEMINI_API_KEY=YOUR_API_KEY
// 3. Make sure your build process (e.g., Vite) is configured to handle .env files.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Track AI prompt usage with retry logic
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const RAW_DATA_API_BASE_URL = import.meta.env.VITE_RAW_DATA_API_BASE_URL || '';

async function trackAIPromptUsageWithRetry(maxRetries = 1) {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, message: 'No token' };
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/files/promts/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 200 && res.data?.message === 'AI prompt used successfully') {
                return { success: true, usage: res.data.usage };
            } else {
                // Check for limit message
                const msg = res.data?.message || '';
                const isLimit = /limit|Upgrade your plan/i.test(msg);
                return { success: false, message: msg || 'Unknown error', isLimit };
            }
        } catch (err) {
            attempt++;
            const msg = err?.response?.data?.message || err.message || 'Internal server error';
            const status = err?.response?.status;
            const isLimit = status === 403 || /limit|Upgrade your plan/i.test(msg);
            if (attempt > maxRetries) {
                return { success: false, message: msg, isLimit };
            }
        }
    }
}

const AIAnalyst = ({ analysis, summary, file, onClose, onUpgradePlan }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [suggestedKeywords, setSuggestedKeywords] = useState([]);
    const [insightMode, setInsightMode] = useState('analysis'); // 'analysis' or 'raw'
    const [rawData, setRawData] = useState(null);
    const [isRawDataLoading, setIsRawDataLoading] = useState(false);
    const [rawDataFetched, setRawDataFetched] = useState(false); // Only fetch once
    const messagesEndRef = useRef(null);
    const genAI = useMemo(() => {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            return new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        }
        return null;
    }, []);

    // Fetch and cache raw data only the first time user selects Raw Data Insights
    useEffect(() => {
        if (insightMode === 'raw' && !rawDataFetched && !isRawDataLoading) {
            setIsRawDataLoading(true);
            fetchRawData().then(data => {
                setRawData(data);
                setIsRawDataLoading(false);
                setRawDataFetched(true);
            });
        }
    }, [insightMode]);

    useEffect(() => {
        if (analysis && genAI) {
            generateInitialInsights();
        }
    }, [analysis, genAI]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateInitialInsights = async () => {
        if (!analysis || !genAI) return;

        setIsInitialLoading(true);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const formattedAnalysis = formatAnalysisData();
            const { category } = analysis.insights;
            
            const prompt = `
Based on this data analysis, provide:
1. A brief overview of the key insights (2-3 sentences)
2. 6-10 suggested questions/keywords that users might want to explore (mix of basic and advanced questions)
3. 2-3 visual suggestions for charts that would be most insightful

Data: ${file.originalName}
Category: ${category}
Analysis: ${formattedAnalysis}

For suggested keywords, include:
- Basic analysis questions (e.g., "What are the top performers?")
- Trend analysis questions (e.g., "How have sales changed over time?")
- Comparative questions (e.g., "Which categories perform best?")
- Actionable insight questions (e.g., "What should we focus on to improve?")
- Industry-specific questions relevant to ${category}

Respond in this exact JSON format:
{
  "overview": "Brief overview of key insights",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "visualSuggestions": [
    {
      "type": "chart_type",
      "title": "Chart title",
      "description": "Why this chart would be useful"
    }
  ]
}
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            try {
                // The AI might wrap the JSON in ```json ... ```. We need to extract it.
                const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
                const jsonString = jsonMatch ? jsonMatch[1] : text;
                const parsed = JSON.parse(jsonString);
                
                // Set initial message with insights
                setMessages([
                    {
                        id: Date.now(),
                        type: 'ai',
                        content: `Hi there! 👋 I'm your AI data analyst. I've analyzed your ${file.originalName} file and here's what I found:

**📊 Key Insights:**
${parsed.overview}

**💡 You can ask me about:**
${parsed.suggestedKeywords.map(keyword => `• ${keyword}`).join('\n')}

**📈 Suggested Visualizations:**
${parsed.visualSuggestions.map(viz => `• ${viz.title}: ${viz.description}`).join('\n')}

**🎯 Industry Focus:** Since this is ${category} data, I can provide industry-specific insights and recommendations.

What would you like to explore first?`,
                        timestamp: new Date()
                    },
                ]);
                
                setSuggestedKeywords(parsed.suggestedKeywords);
            } catch (parseError) {
                console.error('Error parsing initial insights:', parseError);
                // Fallback to basic message
                setMessages([
                    {
                        id: Date.now(),
                        type: 'ai',
                        content: `Hi there! 👋 I'm your AI data analyst. I've analyzed your ${file.originalName} file and I'm here to help you understand what the data is telling us. What would you like to explore?`,
                        timestamp: new Date()
                    },
                ]);
            }
        } catch (error) {
            console.error('Error generating initial insights:', error);
            // Fallback to basic message
            setMessages([
                {
                    id: Date.now(),
                    type: 'ai',
                    content: `Hi there! 👋 I'm your AI data analyst. I've analyzed your ${file.originalName} file and I'm here to help you understand what the data is telling us. What would you like to explore?`,
                    timestamp: new Date()
                },
            ]);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const formatAnalysisData = () => {
        if (!analysis) return '';

        const { insights } = analysis;
        let formattedData = '';

        // Format KPIs
        if (insights.kpis) {
            formattedData += 'Key Performance Indicators:\n';
            Object.entries(insights.kpis).forEach(([key, value]) => {
                formattedData += `- ${key.replace(/_/g, ' ').toUpperCase()}: ${value}\n`;
            });
            formattedData += '\n';
        }

        // Format hypothesis
        if (insights.hypothesis) {
            formattedData += 'Analysis Hypothesis:\n';
            insights.hypothesis.forEach((hyp, index) => {
                formattedData += `${index + 1}. ${hyp}\n`;
            });
            formattedData += '\n';
        }

        // Format high performers
        if (insights.highPerformers) {
            formattedData += 'Top Performers:\n';
            Object.entries(insights.highPerformers).forEach(([category, data]) => {
                if (data && typeof data === 'object') {
                    formattedData += `- ${category.replace(/_/g, ' ').toUpperCase()}:\n`;
                    Object.entries(data).forEach(([key, values]) => {
                        if (Array.isArray(values)) {
                            formattedData += `  ${key}: ${values.join(', ')}\n`;
                        }
                    });
                }
            });
            formattedData += '\n';
        }

        // Format totals data
        if (insights.totals) {
            formattedData += 'Data Totals:\n';
            Object.entries(insights.totals).forEach(([category, data]) => {
                if (data && typeof data === 'object') {
                    formattedData += `- ${category.replace(/_/g, ' ').toUpperCase()}:\n`;
                    Object.entries(data).forEach(([key, values]) => {
                        if (Array.isArray(values)) {
                            formattedData += `  ${key}: ${values.join(', ')}\n`;
                        }
                    });
                }
            });
        }

        return formattedData;
    };

    const createEnhancedPrompt = (userMessage) => {
        const formattedAnalysis = formatAnalysisData();
        const { category } = analysis.insights;
        let summarySection = '';
        if (summary && Object.keys(summary).length > 0) {
            summarySection = '\n**Data Summary:**\n';
            Object.entries(summary).forEach(([field, details]) => {
                summarySection += `- ${field}: `;
                if (details.type === 'numeric') {
                    summarySection += `count=${details.count}, min=${details.min}, max=${details.max}, mean=${details.mean}, median=${details.median}, stddev=${details.stddev}`;
                } else if (details.type === 'categorical') {
                    summarySection += `unique_count=${details.unique_count}`;
                    if (details.top_values) {
                        summarySection += ', top_values=' + details.top_values.map(v => `${v.value} (${v.count})`).join(', ');
                    }
                } else if (details.type === 'boolean') {
                    if (details.counts) {
                        summarySection += details.counts.map(v => `${v.value}: ${v.count}`).join(', ');
                    }
                }
                summarySection += '\n';
            });
        }
        return `
You are an expert AI data analyst with access to comprehensive data analysis results. Your role is to:

1. **Provide insightful analysis** based on the available data
2. **Suggest relevant visualizations** when appropriate
3. **Answer questions naturally** while staying focused on the data context
4. **Generate actionable insights** that help users understand their data
5. **Provide context-aware recommendations** based on the industry/category

**Available Data Context:**
- File: ${file.originalName}
- Category: ${category}
- Analysis Results: ${formattedAnalysis}
${summarySection}
**User Question:** "${userMessage}"

**Response Guidelines:**
- Be conversational but professional
- Provide specific insights based on the data
- When suggesting visualizations, include them in JSON format
- If the question is off-topic, gently redirect to data-related topics
- Always provide value and actionable insights
- Use industry-specific terminology when relevant
- Suggest follow-up questions that might be interesting

**For Visualizations, use this format:**
\`\`\`json
{
  "type": "chart_type",
  "title": "Chart Title",
  "description": "Why this visualization is useful and what insights it provides",
  "data": [
    {"name": "Category A", "value": 100},
    {"name": "Category B", "value": 150}
  ]
}
\`\`\`

**Supported chart types:** bar, line, pie, area, scatter

**Industry-specific insights for ${category}:**
- Focus on relevant KPIs and metrics for this industry
- Suggest actionable recommendations based on industry best practices
- Consider seasonal trends and industry-specific patterns
- Provide benchmarking insights when possible

Provide a comprehensive, helpful response that addresses the user's question while leveraging the available data insights and industry context.
`;
    };

    const parseAIResponse = (text) => {
        let content = text;
        const chartData = [];

        // Regex to find all JSON code blocks
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/g;
        let match;
        while ((match = jsonRegex.exec(text)) !== null) {
            try {
                let jsonString = match[1].replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
                jsonString = jsonString.replace(/,(\s*?[\}\]])/g, '$1');

                // --- Fix: Evaluate math expressions in value fields ---
                jsonString = jsonString.replace(/("value"\s*:\s*)([0-9.]+\s*\/\s*[0-9.]+)/g, (m, prefix, expr) => {
                    try {
                        // Evaluate the math expression safely
                        const val = Function('return ' + expr)();
                        return `${prefix}${val}`;
                    } catch {
                        return m; // fallback to original if error
                    }
                });
                // --- End fix ---

                const parsed = JSON.parse(jsonString);
                chartData.push(parsed);
            } catch (error) {
                console.error('[AIAnalyst] Error parsing chart JSON from AI response:', error);
            }
            // Remove the matched block from the content
            content = content.replace(match[0], '');
        }

        // If no code blocks were found, try to find raw JSON objects
        if (chartData.length === 0) {
            const rawJsonRegex = /\{[\s\S]*?"type"[\s\S]*?"data"[\s\S]*?\}/g;
            while ((match = rawJsonRegex.exec(text)) !== null) {
                try {
                    let jsonString = match[0].replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
                    jsonString = jsonString.replace(/,(\s*?[\}\]])/g, '$1');

                    // --- Fix: Evaluate math expressions in value fields ---
                    jsonString = jsonString.replace(/("value"\s*:\s*)([0-9.]+\s*\/\s*[0-9.]+)/g, (m, prefix, expr) => {
                        try {
                            const val = Function('return ' + expr)();
                            return `${prefix}${val}`;
                        } catch {
                            return m;
                        }
                    });
                    // --- End fix ---

                    const parsed = JSON.parse(jsonString);
                    chartData.push(parsed);
                } catch (error) {
                    console.error('[AIAnalyst] Error parsing raw JSON from AI response:', error);
                }
                // Remove the matched block from the content
                content = content.replace(match[0], '');
            }
        }
        // Clean up any extra whitespace and newlines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

        // Also extract the first JSON/code block for fallback display
        let rawJsonBlock = null;
        const codeBlockMatch = text.match(/```json[\s\S]*?```/);
        if (codeBlockMatch) {
            rawJsonBlock = codeBlockMatch[0];
        }

        return { content, chartData, rawJsonBlock, rawText: text };
    };

    const formatMessageContent = (content) => {
        // First, handle table formatting
        let formattedContent = content;
        
        // Convert markdown tables to HTML tables with proper styling
        const tableRegex = /\|(.+)\|\n\|([-:\s|]+)\|\n((?:\|.+\|\n?)+)/g;
        formattedContent = formattedContent.replace(tableRegex, (match, headerRow, separatorRow, dataRows) => {
            const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
            const rows = dataRows.trim().split('\n').map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            
            let tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">';
            
            // Header
            tableHtml += '<thead class="bg-gray-50"><tr>';
            headers.forEach(header => {
                tableHtml += `<th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">${header}</th>`;
            });
            tableHtml += '</tr></thead>';
            
            // Body
            tableHtml += '<tbody class="divide-y divide-gray-200">';
            rows.forEach((row, index) => {
                tableHtml += '<tr class="hover:bg-gray-50">';
                row.forEach((cell, cellIndex) => {
                    const isNumeric = !isNaN(cell) && cell !== '';
                    const isDate = /^\d{4}-\d{2}-\d{2}/.test(cell);
                    const isCurrency = /^\$/.test(cell);
                    
                    let cellClass = 'px-4 py-3 text-sm text-gray-900 border-b border-gray-100';
                    if (isNumeric || isCurrency) {
                        cellClass += ' text-right font-medium';
                    } else if (isDate) {
                        cellClass += ' font-medium';
                    }
                    
                    tableHtml += `<td class="${cellClass}">${cell}</td>`;
                });
                tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table></div>';
            
            return tableHtml;
        });
        
        // Then apply other formatting
        return formattedContent
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/- (.*)/g, '• $1')
            .replace(/📊/g, '<span class="text-blue-600">📊</span>')
            .replace(/💡/g, '<span class="text-yellow-600">💡</span>')
            .replace(/📈/g, '<span class="text-green-600">📈</span>')
            .replace(/🔍/g, '<span class="text-purple-600">🔍</span>')
            .replace(/✅/g, '<span class="text-green-600">✅</span>')
            .replace(/❌/g, '<span class="text-red-600">❌</span>')
            .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
            .replace(/🎯/g, '<span class="text-purple-600">🎯</span>')
            .replace(/📋/g, '<span class="text-blue-600">📋</span>')
            .replace(/💰/g, '<span class="text-green-600">💰</span>')
            .replace(/👥/g, '<span class="text-blue-600">👥</span>')
            .replace(/📅/g, '<span class="text-purple-600">📅</span>');
    };

    // Helper: fetch raw data for the file
    const fetchRawData = async () => {
        if (!user || !file) return null;
        try {
            const token = localStorage.getItem('token');
            const userId = user._id || user.id;
            const fileId = file._id || file.id;
            const url = `${API_BASE_URL}/files/rawData/${userId}/${fileId}`;
            if (!token) return null;
            const res = await axios.get(url,
                { headers: { Authorization: `Bearer ${token}` } });
            return res.data?.rawData || res.data?.data || res.data || null;
        } catch (err) {
            return null;
        }
    };

    // Helper: check if user is asking for raw data
    const isRawDataRequest = (text) => {
        if (!text) return false;
        const lower = text.toLowerCase();
        return (
            lower.includes('raw data') ||
            lower.includes('original data') ||
            lower.includes('show me the data') ||
            lower.includes('data table') ||
            lower.includes('spreadsheet') ||
            lower.includes('csv')
        );
    };

    // Helper: create a generic, user-friendly prompt for raw data
    const createRawDataPrompt = (rawData, userMessage) => {
        return `You are an expert AI data analyst. The user wants insights from the raw/original data, not technical statistics. 

Here is the raw data (as JSON array):
${JSON.stringify(rawData).slice(0, 12000)}

User question: "${userMessage}"

Instructions:
- Give a simple, user-friendly summary of what this data is about.
- Highlight any obvious patterns, trends, or interesting facts, but avoid technical/statistical terms (like mean, median, stddev, etc.).
- Use plain language suitable for a non-technical audience.
- If possible, suggest what a normal business user might want to know or do with this data.
- If the data is too large, summarize only the first 100 rows.

TABLE FORMATTING:
- If the user asked for a table, show a small sample (first 5-10 rows) in markdown table format.
- Format dates as YYYY-MM-DD (remove time if present)
- Format numbers with appropriate precision (2 decimal places for currency, whole numbers for counts)
- Clean up column names (remove underscores, capitalize properly)
- Ensure all data is properly aligned and readable
- Use consistent formatting across all rows

Example table format:
| Date | Customer ID | Region | Product Category | Product | Units Sold | Unit Price | Total Revenue |
|------|-------------|--------|------------------|---------|------------|------------|---------------|
| 2024-01-02 | C001 | North | Electronics | Smartphone | 2 | $699.00 | $1,398.00 |
| 2024-01-03 | C002 | West | Clothing | T-Shirt | 5 | $25.00 | $125.00 |

CHART GENERATION:
If the user asks for a chart or visualization, generate a JSON chart object in this exact format:
\`\`\`json
{
  "type": "bar|line|pie|scatter",
  "title": "Chart Title",
  "data": [
    {"label": "Category 1", "value": 100},
    {"label": "Category 2", "value": 200}
  ]
}
\`\`\`

Chart types:
- "bar" for comparing categories
- "line" for trends over time
- "pie" for showing proportions
- "scatter" for correlations

Always include the JSON chart object when the user asks for visualizations or charts.
`;
    };

    // Modified handleSendMessage to support raw data insights and toggle
    const handleSendMessage = async (promptText = input) => {
        if (!promptText.trim()) return;
        setIsLoading(true);
        setInput('');
        let aiPrompt = promptText;
        let systemMessage = null;
        if (insightMode === 'raw') {
            if (rawData && messages.filter(m => m.role === 'system' && m.content.includes('Raw data context loaded')).length === 0) {
                // First time in raw mode, provide only a generic system message
                systemMessage = `Raw data context loaded for this file: ${file?.originalName || file?.name || file?.fileName || 'your file'}. Use this data for all future questions in Raw Data Insights mode.`;
            } else if (rawData) {
                // Subsequent questions in raw mode
                systemMessage = 'You already have the raw data for this file. Use it for your answer.';
            }
        }
        const newMessages = [
            ...messages,
            { role: 'user', content: aiPrompt, id: Date.now() }
        ];
        if (systemMessage) {
            newMessages.splice(newMessages.length - 1, 0, { role: 'system', content: systemMessage, id: Date.now() + 1 });
        }
        setMessages(newMessages);
        // Track AI prompt usage before calling AI
        const usageResult = await trackAIPromptUsageWithRetry(1);
        if (!usageResult.success) {
            const errorMessage = usageResult.message || 'You have reached your AI prompt limit. Please upgrade your plan to continue using AI insights.';
            toast.error(errorMessage);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    type: 'ai',
                    isUpgrade: usageResult.isLimit || true,
                    errorText: errorMessage,
                    timestamp: new Date()
                }
            ]);
            setIsLoading(false);
            return;
        }

        // --- RAW DATA LOGIC (toggle only) ---
        if (insightMode === 'raw') {
            if (isRawDataLoading) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        type: 'ai',
                        content: 'Raw data is still loading. Please wait a moment and try again.',
                        timestamp: new Date()
                    }
                ]);
                setIsLoading(false);
                return;
            }
            if (!rawData) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        type: 'ai',
                        content: 'Raw data is not available for this file.',
                        timestamp: new Date()
                    }
                ]);
                setIsLoading(false);
                return;
            }
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = createRawDataPrompt(rawData, promptText);
                const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
                // Parse the response for charts (same as normal insights)
            const { content, chartData, rawJsonBlock, rawText } = parseAIResponse(text);
            
            const newAiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: content,
                chartSuggestions: chartData,
                rawJsonBlock: rawJsonBlock,
                rawText: rawText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        type: 'ai',
                        content: 'Sorry, I could not fetch or analyze the raw data.',
                        timestamp: new Date()
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
            return;
        }
        // --- END RAW DATA LOGIC ---

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const enhancedPrompt = createEnhancedPrompt(promptText);
            const result = await model.generateContent(enhancedPrompt);
            const response = await result.response;
            const text = response.text();
            const { content, chartData, rawJsonBlock, rawText } = parseAIResponse(text);
            const newAiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: content,
                chartSuggestions: chartData,
                rawJsonBlock: rawJsonBlock,
                rawText: rawText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: 'I apologize, but I encountered an error while processing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeywordClick = (keyword) => {
        setInput(keyword);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderChart = (suggestion) => {
        const { type, data, title } = suggestion;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return null;
        }

        // Dynamically detect keys (robust)
        const first = data[0] || {};
        const keys = Object.keys(first);
        let stringKeys = keys.filter(k => typeof first[k] === 'string');
        let numberKeys = keys.filter(k => typeof first[k] === 'number');
        let xKey = stringKeys[0] || keys[0];
        let yKey = numberKeys[0] || keys.find(k => k !== xKey);
        if (!yKey) yKey = keys[0];
        // For scatter: x = first number key, y = second number key
        let scatterXKey = numberKeys[0];
        let scatterYKey = numberKeys[1];
        if (!scatterXKey) scatterXKey = keys[0];
        if (!scatterYKey) scatterYKey = keys[1] || keys[0];

        try {
            switch (type) {
                case 'bar':
                    return (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow">
                            {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey={xKey} />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [value, yKey]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                    />
                                    <Bar dataKey={yKey} fill="#7400B8" radius={[4, 4, 0, 0]}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                case 'pie':
                    return (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow">
                            {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey={yKey}
                                        nameKey={xKey}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label={entry => `${entry[xKey]} ${(entry[yKey] / data.reduce((sum, d) => sum + (d[yKey] || 0), 0) * 100).toFixed(0)}%`}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    );
                case 'line':
                    return (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow">
                            {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey={xKey} />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [value, yKey]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={yKey} 
                                        stroke="#7400B8" 
                                        strokeWidth={3}
                                        dot={{ fill: '#7400B8', strokeWidth: 2, r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    );
                case 'area':
                    return (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow">
                            {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey={xKey} />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [value, yKey]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey={yKey} 
                                        stroke="#7400B8" 
                                        fill="#7400B8"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    );
                case 'scatter':
                    if (!scatterXKey || !scatterYKey) {
                        return null;
                    }
                    return (
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow">
                            {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
                            <ResponsiveContainer width="100%" height={200}>
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey={scatterXKey} type="number" name={scatterXKey} />
                                    <YAxis dataKey={scatterYKey} type="number" name={scatterYKey} />
                                    <Tooltip 
                                        formatter={(value, name) => [value, name]}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '12px',
                                            padding: '12px'
                                        }}
                                    />
                                    <Scatter data={data} fill="#7400B8" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    );
                default:
                    return null;
            }
        } catch (err) {
            return <div style={{ color: 'red', fontWeight: 'bold' }}>Chart rendering error: {err && err.message ? err.message : String(err)}</div>;
        }
    };

    // Helper: render raw data if user asks for it
    const renderRawDataBlock = (rawData) => {
        if (!rawData) return null;
        // Show as a code block (first 5 rows if array)
        let displayData = rawData;
        if (Array.isArray(rawData)) {
            displayData = rawData.slice(0, 5);
        }
        return (
            <pre className="bg-gray-100 rounded-lg p-3 overflow-x-auto text-xs max-h-64 mt-2">
                {JSON.stringify(displayData, null, 2)}
                {Array.isArray(rawData) && rawData.length > 5 && '\n... (truncated)'}
            </pre>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-8"
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 w-full max-w-6xl xl:max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] p-3 sm:p-4 lg:p-6 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-lg lg:text-xl font-bold">AI Data Analyst</h2>
                            <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Ask me anything about your data</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-1 sm:p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                        <FiX className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </motion.button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                        {insightMode === 'raw' && isRawDataLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="w-10 h-10 border-4 border-[#7400B8] border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-4 text-[#7400B8] font-semibold">Loading raw data...</span>
                            </div>
                        ) : (
                        <AnimatePresence>
                                {messages.map((message, idx) => (
                                <motion.div
                                        key={message.id || idx || `${message.role}-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                        <div className={`max-w-[85%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[85%]`}>
                                        <div className={`p-3 sm:p-4 rounded-2xl ${
                                            message.type === 'user' 
                                                ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white' 
                                                : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-800'
                                        }`}>
                                            <div className="prose prose-sm sm:prose-base max-w-none">
                                                {message.isUpgrade ? (
                                                    <>
                                                        <span>{message.errorText}</span>
                                                        {typeof onUpgradePlan === 'function' && (
                                                            <button onClick={onUpgradePlan} className="mt-3 px-4 py-2 bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white rounded-xl font-bold shadow-lg hover:from-[#9B4DCA] hover:to-[#C77DFF] transition-all duration-200">Upgrade Plan</button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
                                                )}
                                                    {/* If user asks for raw data, show it as a code block */}
                                                    {message.role === 'user' && isRawDataRequest(message.content) && renderRawDataBlock(rawData)}
                                            </div>
                                        </div>
                                        <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                                                {message.timestamp ? message.timestamp.toLocaleTimeString() : ''}
                                        </div>
                                    </div>
                                    {/* Render chart only if valid chartSuggestions and data */}
                                    {message.type === 'ai' && Array.isArray(message.chartSuggestions) && message.chartSuggestions.length > 0 && message.chartSuggestions.some(s => s.data && s.data.length > 0) && (
                                            <div className="mt-2 space-y-3 w-full max-w-[85%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[85%]">
                                            <AnimatePresence>
                                                    {message.chartSuggestions.map((suggestion, cidx) => (
                                                    suggestion.data && suggestion.data.length > 0 && (
                                                        <motion.div 
                                                                key={suggestion.id || cidx || `chart-${cidx}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                                transition={{ delay: cidx * 0.1 }}
                                                            className=""
                                                        >
                                                            {renderChart(suggestion)}
                                                        </motion.div>
                                                    )
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        )}
                        
                        {/* Initial loading indicator */}
                        {isInitialLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-3 sm:p-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#7400B8] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm sm:text-base text-gray-600">Analyzing your data...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Loading indicator for ongoing messages */}
                        {isLoading && !isInitialLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-3 sm:p-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#7400B8] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm sm:text-base text-gray-600">AI is thinking...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Keywords */}
                    {suggestedKeywords.length > 0 && (
                        <div className="border-t border-gray-200/50 p-2 sm:p-3">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                                <FiZap className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium text-gray-700">Quick Questions:</span>
                            </div>
                            <div
                                className="flex flex-nowrap items-stretch min-h-0 gap-2 overflow-x-auto pb-1 max-w-full hide-scrollbar"
                                style={{ WebkitOverflowScrolling: 'touch', maxHeight: 60 }}
                            >
                                {suggestedKeywords.map((keyword, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleKeywordClick(keyword)}
                                        className={`px-3 py-1.5 bg-gradient-to-r from-[#7400B8]/10 to-[#9B4DCA]/10 text-[#7400B8] rounded-full text-xs font-medium hover:from-[#7400B8]/20 hover:to-[#9B4DCA]/20 transition-all duration-200 border border-[#7400B8]/20 whitespace-nowrap shrink-0${index !== suggestedKeywords.length - 1 ? ' mr-2' : ''}`}
                                        style={{ minWidth: 90 }}
                                    >
                                        {keyword}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-gray-200/50 p-3 sm:p-4 lg:p-6 flex flex-col gap-2">
                        <div className="flex space-x-2 sm:space-x-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me about your data..."
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7400B8] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                    disabled={isLoading || isInitialLoading}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() || isLoading || isInitialLoading}
                                className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                                    input.trim() && !isLoading && !isInitialLoading
                                        ? 'bg-gradient-to-r from-[#7400B8] to-[#9B4DCA] text-white hover:shadow-lg'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                        </div>
                        {/* Segmented control for insight mode at bottom left */}
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 font-medium">Mode:</span>
                            <div className="relative flex items-center gap-0 bg-gray-100 rounded-full p-1 shadow-inner" style={{ minWidth: 180 }}>
                                <button
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none z-10 ${insightMode === 'analysis' ? 'bg-white text-[#7400B8] shadow border border-[#7400B8]' : 'bg-transparent text-gray-600'}`}
                                    onClick={() => setInsightMode('analysis')}
                                >
                                    Analysis Insights
                                </button>
                                <button
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 focus:outline-none z-10 ${insightMode === 'raw' ? 'bg-white text-[#7400B8] shadow border border-[#7400B8]' : 'bg-transparent text-gray-600'}`}
                                    onClick={() => setInsightMode('raw')}
                                >
                                    Raw Data Insights
                                </button>
                                {isRawDataLoading && insightMode === 'raw' && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                        <span className="w-3 h-3 border-2 border-[#7400B8] border-t-transparent rounded-full animate-spin"></span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AIAnalyst;

// Hide scrollbar for Chrome, Safari, Opera, IE, Edge, and Firefox for .hide-scrollbar
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .hide-scrollbar::-webkit-scrollbar { display: none !important; }
    .hide-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
  `;
  document.head.appendChild(style);
} 