# VaultGPT - AI Analytics Assistant for Pepe Unchained

## Overview

VaultGPT is an advanced AI-powered analytics assistant specifically designed for the Pepe Unchained ecosystem. It provides real-time token analysis, market insights, and comprehensive data visualization for users who hold at least 1,000,000 $Vault tokens.

## 🚀 Key Features

### **Access Control**
- **Token Gated**: Requires minimum 1,000,000 $Vault tokens to access
- **Wallet Integration**: Seamless connection via RainbowKit
- **Real-time Balance Checking**: Automatically verifies token holdings

### **AI-Powered Analysis**
- **Advanced Language Understanding**: Powered by GPT-4o-mini, understands complex crypto queries in natural language
- **Intelligent Market Analysis**: Can analyze token performance, identify trends, and provide investment insights
- **Smart Data Interpretation**: Automatically processes market data and presents it in easy-to-understand formats
- **Contextual Responses**: Remembers conversation context and provides relevant follow-up analysis
- **Predictive Insights**: Can identify patterns and provide educated market predictions based on current data

### **Real-Time Market Data**
- **Live Price Tracking**: Real-time token prices and market data
- **Volume Analysis**: 24-hour trading volume and liquidity metrics
- **Performance Metrics**: Price changes, market cap, and transaction counts
- **Cross-Validation**: Multiple data sources for accuracy verification

### **Interactive Interface**
- **Chat-Based UI**: Conversational interface for easy interaction
- **Visual Data Cards**: Rich token information with formatted metrics
- **Network Overview**: Comprehensive Pepe Unchained network statistics
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Technical Architecture

### **Frontend Components**

#### **VaultGPTButton.tsx**
- Floating action button with gradient styling
- Fixed positioning (bottom-right corner)
- Smooth hover animations and transitions
- Triggers modal opening

#### **VaultGPTModal.tsx**
- Full-screen modal with backdrop blur
- Multi-state interface (connect, loading, access denied, chat)
- Real-time message handling with auto-scroll
- Token data visualization with formatted cards
- Market statistics display

### **Backend API**

#### **API Route: `/api/vaultgpt`**
- **Method**: POST
- **Input**: User message as JSON
- **Output**: AI response with token data and market insights

### **Data Sources**

#### **GeckoTerminal API Integration**
- **Base URL**: `https://api.geckoterminal.com/api/v2`
- **Network**: `pepe-unchained`
- **Endpoints Used**:
  - `/search/pools` - Token pool discovery
  - `/search/tokens` - Direct token lookup
  - `/networks/pepe-unchained/trending_pools` - Trending analysis
  - `/networks/pepe-unchained/new_pools` - New token launches
  - `/networks/pepe-unchained/pools` - Top pools and volume data
  - `/networks/pepe-unchained/tokens/{address}` - Specific token info

#### **Dynamic Token Database**
- **File**: `pepe-unchained-tokens.json`
- **Caching**: 5-minute cache duration
- **Fallback**: Hardcoded token addresses for reliability
- **Auto-refresh**: PATCH endpoint for manual token database updates

### **AI Integration**

#### **AI Capabilities (Powered by GPT-4o-mini)**
- **Natural Language Understanding**: Can interpret complex questions about crypto markets, tokens, and trading
- **Intelligent Analysis**: Provides deep insights into token fundamentals, market trends, and trading opportunities
- **Conversational Intelligence**: Maintains context throughout conversations and can answer follow-up questions
- **Market Expertise**: Specialized knowledge of DeFi, tokenomics, and Pepe Unchained ecosystem
- **Data Synthesis**: Combines multiple data sources to provide comprehensive market analysis
- **Risk Assessment**: Can evaluate token risks and provide balanced investment perspectives

## 📊 Data Processing Pipeline

### **1. Query Analysis**
```typescript
// Intent extraction patterns
- "tell me about X" → token analysis
- "X price" → price query
- "compare X and Y" → comparison
- "trending" → trending analysis
- "0x..." → contract address lookup
```

### **2. Token Discovery**
```typescript
// Multi-strategy search
1. Database lookup (pepe-unchained-tokens.json)
2. Contract address validation
3. Dynamic pool scanning
4. Cross-reference validation
```

### **3. Data Validation**
```typescript
// Quality checks
- Volume vs market cap ratios
- Liquidity consistency
- Price change validation
- Multi-source cross-validation
```

### **4. Response Generation**
```typescript
// AI-powered analysis
- Context-aware responses
- Data visualization
- Market insights
- Performance metrics
```

## 🎯 Supported Query Types

### **Token Analysis**
- `"Tell me about PENK"`
- `"Analyze VAULT token"`
- `"What's the price of SPRING?"`

### **Market Overview**
- `"Show me trending tokens"`
- `"What's hot on Pepe Unchained?"`
- `"Market overview"`

### **Performance Analysis**
- `"Top gainers today"`
- `"Best performing tokens"`
- `"Volume leaders"`

### **Comparisons**
- `"Compare VAULT and SPRING"`
- `"PENK vs PEPU"`

### **New Launches**
- `"Show new tokens"`
- `"Recent launches"`

### **Contract Lookups**
- `"0x8746D6Fc80708775461226657a6947497764BBe6"`

## 🔧 Configuration

### **Environment Variables**
```env
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional (for token database)
NEWS_ENDPOINT=your_news_endpoint
```

### **Token Requirements**
- **Minimum Balance**: 1,000,000 $Vault tokens
- **Token Address**: `0x8746D6Fc80708775461226657a6947497764BBe6`
- **Network**: Pepe Unchained

### **API Rate Limits**
- **GeckoTerminal**: Standard API limits apply
- **OpenAI**: Based on your API plan
- **Caching**: 5-minute cache for token database

## 🚀 What VaultGPT Can Do

### **Intelligent Token Analysis**
- **Deep Dive Analysis**: "Tell me about PENK" → VaultGPT provides comprehensive analysis including price trends, volume patterns, market cap evolution, and investment potential
- **Risk Assessment**: Evaluates token risks, liquidity concerns, and market stability
- **Fundamental Analysis**: Analyzes tokenomics, utility, and long-term viability

### **Market Intelligence**
- **Trend Identification**: "What's trending?" → Identifies emerging patterns, volume spikes, and market movements
- **Opportunity Discovery**: Finds undervalued tokens, new launches, and trading opportunities
- **Market Sentiment**: Analyzes community activity, trading patterns, and market psychology

### **Investment Insights**
- **Portfolio Analysis**: Can analyze multiple tokens and suggest diversification strategies
- **Performance Predictions**: Provides educated forecasts based on current market data and historical patterns
- **Risk Management**: Suggests position sizing and risk mitigation strategies

### **Conversational Trading Assistant**
- **Follow-up Questions**: Remembers previous queries and provides contextual responses
- **Complex Queries**: "Should I buy more VAULT or wait for a dip?" → Provides nuanced analysis with pros/cons
- **Educational Content**: Explains DeFi concepts, token mechanics, and market dynamics

## 🔍 Data Accuracy Features

### **Multi-Source Validation**
- **Primary**: GeckoTerminal API
- **Secondary**: Pool data cross-reference
- **Tertiary**: Top pools validation
- **Quality Scoring**: Confidence levels for data accuracy

### **Real-Time Updates**
- **Live Data**: Fresh market data on every query
- **Cache Management**: Intelligent caching for performance
- **Error Handling**: Graceful fallbacks for API failures

### **Data Quality Indicators**
- **Source Tracking**: Shows data source for transparency
- **Validation Warnings**: Alerts for potentially inaccurate data
- **Confidence Levels**: High/medium/low confidence indicators

## 🛡️ Security & Access Control

### **Token Gating**
- **Balance Verification**: Real-time $Vault token balance checking
- **Minimum Threshold**: 1,000,000 tokens required
- **Automatic Updates**: Balance checked on each session

### **API Security**
- **Server-Side Processing**: All API calls handled server-side
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Secure error messages without sensitive data

## 📱 User Experience

### **Interface States**
1. **Not Connected**: Wallet connection prompt
2. **Checking Balance**: Loading state with animation
3. **Insufficient Balance**: Clear error message with buy link
4. **Active Chat**: Full functionality with message history

### **Visual Elements**
- **Gradient Styling**: Consistent with Pepe Unchained branding
- **Animated Loading**: Smooth transitions and feedback
- **Responsive Cards**: Rich token data visualization
- **Auto-Scroll**: Seamless chat experience

## 🔄 Maintenance & Updates

### **Token Database Updates**
```bash
# Manual refresh via API
PATCH /api/vaultgpt
```

### **Performance Monitoring**
- **API Response Times**: Tracked for optimization
- **Error Rates**: Monitored for reliability
- **User Engagement**: Analytics for feature improvements

### **Future AI Enhancements**
- **Portfolio Optimization**: AI-powered portfolio rebalancing suggestions
- **Predictive Analytics**: Advanced machine learning for price prediction models
- **Sentiment Analysis**: AI analysis of social media and community sentiment
- **Automated Trading Insights**: AI-generated trading signals and entry/exit points
- **Personalized Recommendations**: AI that learns user preferences and suggests relevant opportunities

## 📞 Support & Troubleshooting

### **Common Issues**
1. **"Insufficient Vault Balance"**: Ensure you hold 1M+ $Vault tokens
2. **"Token not found"**: Try different name variations or contract address
3. **"API Error"**: Check network connection and try again

### **Debug Information**
- **Console Logs**: Detailed API call information
- **Data Sources**: Shows which API provided the data
- **Validation Warnings**: Alerts for data quality issues

---

**VaultGPT** - Your intelligent gateway to the Pepe Unchained ecosystem, powered by AI and real-time market data.
