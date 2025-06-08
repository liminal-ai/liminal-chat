# OpenRouter Available Models

Last updated: January 2025

## Recommended Models for Liminal Chat

### Latest Generation Models

**OpenAI GPT-4 Series**
- `openai/gpt-4.1` - GPT-4.1 (1M context)
- `openai/gpt-4.1-mini` - GPT-4.1 Mini (1M context)
- `openai/gpt-4o` - GPT-4o (128k context)
- `openai/gpt-4o-mini` - GPT-4o Mini (128k context)
- `openai/chatgpt-4o-latest` - ChatGPT-4o Latest (128k context)

**Anthropic Claude Series**
- `anthropic/claude-opus-4` - Claude Opus 4 (200k context)
- `anthropic/claude-sonnet-4` - Claude Sonnet 4 (200k context)
- `anthropic/claude-3.7-sonnet` - Claude 3.7 Sonnet (200k context)
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet (200k context)
- `anthropic/claude-3.5-haiku` - Claude 3.5 Haiku (200k context)

**Google Gemini Series**
- `google/gemini-2.5-pro-preview` - Gemini 2.5 Pro Preview (1M context)
- `google/gemini-2.5-flash-preview` - Gemini 2.5 Flash Preview (1M context)
- `google/gemini-2.0-flash-001` - Gemini 2.0 Flash (1M context)

**DeepSeek Series**
- `deepseek/deepseek-r1` - DeepSeek R1 (128k context)
- `deepseek/deepseek-chat` - DeepSeek V3 (163k context)
- `deepseek/deepseek-r1-distill-llama-70b` - R1 Distill Llama 70B (131k context)

**Mistral Series**
- `mistralai/mistral-large-2411` - Mistral Large 2411 (131k context)
- `mistralai/mistral-medium-3` - Mistral Medium 3 (131k context)
- `mistralai/mistral-small-24b-instruct-2501` - Mistral Small 3 (32k context)
- `mistralai/codestral-2501` - Codestral 2501 (262k context)

**Meta Llama Series**
- `meta-llama/llama-4-maverick` - Llama 4 Maverick (1M context)
- `meta-llama/llama-4-scout` - Llama 4 Scout (1M context)
- `meta-llama/llama-3.3-70b-instruct` - Llama 3.3 70B (131k context)
- `meta-llama/llama-3.1-405b-instruct` - Llama 3.1 405B (32k context)

### Free Models (No API cost)

- `google/gemini-2.0-flash-exp:free` - Gemini 2.0 Flash Experimental
- `meta-llama/llama-4-maverick:free` - Llama 4 Maverick (128k context)
- `meta-llama/llama-4-scout:free` - Llama 4 Scout (200k context)
- `meta-llama/llama-3.3-70b-instruct:free` - Llama 3.3 70B
- `deepseek/deepseek-r1:free` - DeepSeek R1
- `deepseek/deepseek-chat:free` - DeepSeek V3
- `mistralai/mistral-small-3.1-24b-instruct:free` - Mistral Small 3.1 24B

### Specialized Models

**Coding**
- `mistralai/codestral-2501` - Latest Mistral coding model (262k context)
- `deepseek/deepseek-prover-v2` - Mathematical proofs and reasoning

**Vision/Multimodal**
- `meta-llama/llama-3.2-90b-vision-instruct` - Llama 3.2 Vision
- `mistralai/pixtral-large-2411` - Mistral Pixtral Vision
- `google/gemini-2.5-pro-preview` - Supports text+image inputs

**Online/Search**
- `perplexity/llama-3.1-sonar-large-128k-online` - With web search
- `perplexity/llama-3.1-sonar-small-128k-online` - Smaller online model

## Default Model Selection

For Liminal Chat, recommended defaults:
- Primary: `openai/gpt-4o-mini` (good balance of capability/cost)
- Budget: `meta-llama/llama-3.3-70b-instruct:free` 
- Premium: `anthropic/claude-3.7-sonnet` or `google/gemini-2.5-pro-preview`

## Notes

- Models with `:free` suffix have no per-token cost
- Models with `:beta` suffix are self-moderated versions
- Context lengths vary significantly - check model details
- Some models support special features like reasoning traces (`:thinking` suffix)
- Pricing varies - check OpenRouter dashboard for current rates

## Full Model List

See https://openrouter.ai/models for the complete list of 1000+ available models.