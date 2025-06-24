# OpenRouter Available Models

**Total Models Available**: 323
**Last Updated**: January 2025

## Table of Contents

- [Overview](#overview)
- [All Models](#all-models)
- [Models by Category](#models-by-category)
  - [Reasoning Models](#reasoning-models)
  - [High Context Models (>500k tokens)](#high-context-models-500k-tokens)
  - [Free Models](#free-models)
  - [Vision Models](#vision-models)

## Overview

This document contains all available models on OpenRouter, including their specifications, pricing, and capabilities.

## All Models

### Auto Router

**Model ID**: `openrouter/auto`

**Description**: Your prompt will be processed by a meta-model and routed to one of dozens of models (see below), optimizing for the best possible output.

To see which model was used, visit [Activity](/activity), or read the `model` attribute of the response. Your response will be priced at the same rate as the routed model.

The meta-model is powered by [Not Diamond](https://docs.notdiamond.ai/docs/how-not-diamond-works). Learn more in our [docs](/docs/model-routing).

Requests will be routed to the following models:
- [openai/gpt-4o-2024-08-06](/openai/gpt-4o-2024-08-06)
- [openai/gpt-4o-2024-05-13](/openai/gpt-4o-2024-05-13)
- [openai/gpt-4o-mini-2024-07-18](/openai/gpt-4o-mini-2024-07-18)
- [openai/chatgpt-4o-latest](/openai/chatgpt-4o-latest)
- [openai/o1-preview-2024-09-12](/openai/o1-preview-2024-09-12)
- [openai/o1-mini-2024-09-12](/openai/o1-mini-2024-09-12)
- [anthropic/claude-3.5-sonnet](/anthropic/claude-3.5-sonnet)
- [anthropic/claude-3.5-haiku](/anthropic/claude-3.5-haiku)
- [anthropic/claude-3-opus](/anthropic/claude-3-opus)
- [anthropic/claude-2.1](/anthropic/claude-2.1)
- [google/gemini-pro-1.5](/google/gemini-pro-1.5)
- [google/gemini-flash-1.5](/google/gemini-flash-1.5)
- [mistralai/mistral-large-2407](/mistralai/mistral-large-2407)
- [mistralai/mistral-nemo](/mistralai/mistral-nemo)
- [deepseek/deepseek-r1](/deepseek/deepseek-r1)
- [meta-llama/llama-3.1-70b-instruct](/meta-llama/llama-3.1-70b-instruct)
- [meta-llama/llama-3.1-405b-instruct](/meta-llama/llama-3.1-405b-instruct)
- [mistralai/mixtral-8x22b-instruct](/mistralai/mixtral-8x22b-instruct)
- [cohere/command-r-plus](/cohere/command-r-plus)
- [cohere/command-r](/cohere/command-r)

**Context Length**: 2,000,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $-1/token
- Completion: $-1/token

**Provider Limits**:
- Moderated: No

---

### Google: Gemini 1.5 Pro

**Model ID**: `google/gemini-pro-1.5`

**Description**: Google's latest multimodal model, supports image and video[0] in text or chat prompts.

Optimized for language tasks including:

- Code generation
- Text generation
- Text editing
- Problem solving
- Recommendations
- Information extraction
- Data extraction or generation
- AI agents

Usage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).

* [0]: Video input is not available through OpenRouter at this time.

**Context Length**: 2,000,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.25e-06/token
- Completion: $5e-06/token
- Image: $0.0006575/image

**Provider Limits**:
- Max Context: 2,000,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, tools, tool_choice, seed, response_format, structured_outputs

---

### Google: Gemini 2.0 Flash

**Model ID**: `google/gemini-2.0-flash-001`

**Description**: Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $4e-07/token
- Image: $2.58e-05/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, response_format, structured_outputs

---

### Google: Gemini 2.0 Flash Experimental (free)

**Model ID**: `google/gemini-2.0-flash-exp:free`

**Description**: Gemini Flash 2.0 offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5). It introduces notable enhancements in multimodal understanding, coding capabilities, complex instruction following, and function calling. These advancements come together to deliver more seamless and robust agentic experiences.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop

---

### Google: Gemini 2.0 Flash Lite

**Model ID**: `google/gemini-2.0-flash-lite-001`

**Description**: Gemini 2.0 Flash Lite offers a significantly faster time to first token (TTFT) compared to [Gemini Flash 1.5](/google/gemini-flash-1.5), while maintaining quality on par with larger models like [Gemini Pro 1.5](/google/gemini-pro-1.5), all at extremely economical token prices.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $7.5e-08/token
- Completion: $3e-07/token

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, response_format, structured_outputs

---

### Google: Gemini 2.5 Flash

**Model ID**: `google/gemini-2.5-flash`

**Description**: Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. 

Additionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: file, image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $2.5e-06/token
- Image: $0.001238/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Google: Gemini 2.5 Flash Lite Preview 06-17

**Model ID**: `google/gemini-2.5-flash-lite-preview-06-17`

**Description**: Gemini 2.5 Flash-Lite is a lightweight reasoning model in the Gemini 2.5 family, optimized for ultra-low latency and cost efficiency. It offers improved throughput, faster token generation, and better performance across common benchmarks compared to earlier Flash models. By default, "thinking" (i.e. multi-pass reasoning) is disabled to prioritize speed, but developers can enable it via the [Reasoning API parameter](https://openrouter.ai/docs/use-cases/reasoning-tokens) to selectively trade off cost for intelligence. 

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: file, image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Google: Gemini 2.5 Flash Preview 04-17

**Model ID**: `google/gemini-2.5-flash-preview`

**Description**: Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. 

Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the ":thinking" suffix), the model will explicitly avoid generating thinking tokens. 

To utilize the thinking capability and receive thinking tokens, you must choose the ":thinking" variant, which will then incur the higher thinking-output pricing. 

Additionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.0006192/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, tools, tool_choice, stop, response_format, structured_outputs

---

### Google: Gemini 2.5 Flash Preview 04-17 (thinking)

**Model ID**: `google/gemini-2.5-flash-preview:thinking`

**Description**: Gemini 2.5 Flash is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. 

Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the ":thinking" suffix), the model will explicitly avoid generating thinking tokens. 

To utilize the thinking capability and receive thinking tokens, you must choose the ":thinking" variant, which will then incur the higher thinking-output pricing. 

Additionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $3.5e-06/token
- Image: $0.0006192/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, tools, tool_choice, stop, response_format, structured_outputs

---

### Google: Gemini 2.5 Flash Preview 05-20

**Model ID**: `google/gemini-2.5-flash-preview-05-20`

**Description**: Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. 

Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the ":thinking" suffix), the model will explicitly avoid generating thinking tokens. 

To utilize the thinking capability and receive thinking tokens, you must choose the ":thinking" variant, which will then incur the higher thinking-output pricing. 

Additionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.0006192/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Google: Gemini 2.5 Flash Preview 05-20 (thinking)

**Model ID**: `google/gemini-2.5-flash-preview-05-20:thinking`

**Description**: Gemini 2.5 Flash May 20th Checkpoint is Google's state-of-the-art workhorse model, specifically designed for advanced reasoning, coding, mathematics, and scientific tasks. It includes built-in "thinking" capabilities, enabling it to provide responses with greater accuracy and nuanced context handling. 

Note: This model is available in two variants: thinking and non-thinking. The output pricing varies significantly depending on whether the thinking capability is active. If you select the standard variant (without the ":thinking" suffix), the model will explicitly avoid generating thinking tokens. 

To utilize the thinking capability and receive thinking tokens, you must choose the ":thinking" variant, which will then incur the higher thinking-output pricing. 

Additionally, Gemini 2.5 Flash is configurable through the "max tokens for reasoning" parameter, as described in the documentation (https://openrouter.ai/docs/use-cases/reasoning-tokens#max-tokens-for-reasoning).

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $3.5e-06/token
- Image: $0.0006192/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Google: Gemini 2.5 Pro

**Model ID**: `google/gemini-2.5-pro`

**Description**: Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: file, image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.25e-06/token
- Completion: $1e-05/token
- Image: $0.00516/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,536 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Google: Gemini 2.5 Pro Experimental

**Model ID**: `google/gemini-2.5-pro-exp-03-25`

**Description**: This model has been deprecated by Google in favor of the (paid Preview model)[google/gemini-2.5-pro-preview]
 
Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, tools, tool_choice, stop, seed, response_format, structured_outputs

---

### Google: Gemini 2.5 Pro Preview 05-06

**Model ID**: `google/gemini-2.5-pro-preview-05-06`

**Description**: Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.25e-06/token
- Completion: $1e-05/token
- Image: $0.00516/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,535 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, tools, tool_choice, stop, seed, response_format, structured_outputs

---

### Google: Gemini 2.5 Pro Preview 06-05

**Model ID**: `google/gemini-2.5-pro-preview`

**Description**: Gemini 2.5 Pro is Google’s state-of-the-art AI model designed for advanced reasoning, coding, mathematics, and scientific tasks. It employs “thinking” capabilities, enabling it to reason through responses with enhanced accuracy and nuanced context handling. Gemini 2.5 Pro achieves top-tier performance on multiple benchmarks, including first-place positioning on the LMArena leaderboard, reflecting superior human-preference alignment and complex problem-solving abilities.


**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: file, image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.25e-06/token
- Completion: $1e-05/token
- Image: $0.00516/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 65,536 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Meta: Llama 4 Maverick

**Model ID**: `meta-llama/llama-4-maverick`

**Description**: Llama 4 Maverick 17B Instruct (128E) is a high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture with 128 experts and 17 billion active parameters per forward pass (400B total). It supports multilingual text and image input, and produces multilingual text and code output across 12 supported languages. Optimized for vision-language tasks, Maverick is instruction-tuned for assistant-like behavior, image reasoning, and general-purpose multimodal interaction.

Maverick features early fusion for native multimodality and a 1 million token context window. It was trained on a curated mixture of public, licensed, and Meta-platform data, covering ~22 trillion tokens, with a knowledge cutoff in August 2024. Released on April 5, 2025 under the Llama 4 Community License, Maverick is suited for research and commercial applications requiring advanced multimodal understanding and high model throughput.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.0006684/image

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p, logit_bias, tools, tool_choice, structured_outputs, logprobs, top_logprobs

---

### Meta: Llama 4 Scout

**Model ID**: `meta-llama/llama-4-scout`

**Description**: Llama 4 Scout 17B Instruct (16E) is a mixture-of-experts (MoE) language model developed by Meta, activating 17 billion parameters out of a total of 109B. It supports native multimodal input (text and image) and multilingual output (text and code) across 12 supported languages. Designed for assistant-style interaction and visual reasoning, Scout uses 16 experts per forward pass and features a context length of 10 million tokens, with a training corpus of ~40 trillion tokens.

Built for high efficiency and local or commercial deployment, Llama 4 Scout incorporates early fusion for seamless modality integration. It is instruction-tuned for use in multilingual chat, captioning, and image understanding tasks. Released under the Llama 4 Community License, it was last trained on data up to August 2024 and launched publicly on April 5, 2025.

**Context Length**: 1,048,576 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-08/token
- Completion: $3e-07/token

**Provider Limits**:
- Max Context: 1,048,576 tokens
- Max Completion: 1,048,576 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, response_format, tools, tool_choice, structured_outputs, repetition_penalty, top_k, top_logprobs, logprobs, logit_bias, min_p

---

### OpenAI: GPT-4.1

**Model ID**: `openai/gpt-4.1`

**Description**: GPT-4.1 is a flagship large language model optimized for advanced instruction following, real-world software engineering, and long-context reasoning. It supports a 1 million token context window and outperforms GPT-4o and GPT-4.5 across coding (54.6% SWE-bench Verified), instruction compliance (87.4% IFEval), and multimodal understanding benchmarks. It is tuned for precise code diffs, agent reliability, and high recall in large document contexts, making it ideal for agents, IDE tooling, and enterprise knowledge retrieval.

**Context Length**: 1,047,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token

**Provider Limits**:
- Max Context: 1,047,576 tokens
- Max Completion: 32,768 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4.1 Mini

**Model ID**: `openai/gpt-4.1-mini`

**Description**: GPT-4.1 Mini is a mid-sized model delivering performance competitive with GPT-4o at substantially lower latency and cost. It retains a 1 million token context window and scores 45.1% on hard instruction evals, 35.8% on MultiChallenge, and 84.1% on IFEval. Mini also shows strong coding ability (e.g., 31.6% on Aider’s polyglot diff benchmark) and vision understanding, making it suitable for interactive applications with tight performance constraints.

**Context Length**: 1,047,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-07/token
- Completion: $1.6e-06/token

**Provider Limits**:
- Max Context: 1,047,576 tokens
- Max Completion: 32,768 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4.1 Nano

**Model ID**: `openai/gpt-4.1-nano`

**Description**: For tasks that demand low latency, GPT‑4.1 nano is the fastest and cheapest model in the GPT-4.1 series. It delivers exceptional performance at a small size with its 1 million token context window, and scores 80.1% on MMLU, 50.3% on GPQA, and 9.8% on Aider polyglot coding – even higher than GPT‑4o mini. It’s ideal for tasks like classification or autocompletion.

**Context Length**: 1,047,576 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 1,047,576 tokens
- Max Completion: 32,768 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### MiniMax: MiniMax-01

**Model ID**: `minimax/minimax-01`

**Description**: MiniMax-01 is a combines MiniMax-Text-01 for text generation and MiniMax-VL-01 for image understanding. It has 456 billion parameters, with 45.9 billion parameters activated per inference, and can handle a context of up to 4 million tokens.

The text model adopts a hybrid architecture that combines Lightning Attention, Softmax Attention, and Mixture-of-Experts (MoE). The image model adopts the “ViT-MLP-LLM” framework and is trained on top of the text model.

To read more about the release, see: https://www.minimaxi.com/en/news/minimax-01-series-2

**Context Length**: 1,000,192 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $1.1e-06/token

**Provider Limits**:
- Max Context: 1,000,192 tokens
- Max Completion: 1,000,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p

---

### Google: Gemini 1.5 Flash 

**Model ID**: `google/gemini-flash-1.5`

**Description**: Gemini 1.5 Flash is a foundation model that performs well at a variety of multimodal tasks such as visual understanding, classification, summarization, and creating content from image, audio and video. It's adept at processing visual and text inputs such as photographs, documents, infographics, and screenshots.

Gemini 1.5 Flash is designed for high-volume, high-frequency tasks where cost and latency matter. On most common tasks, Flash achieves comparable quality to other Gemini Pro models at a significantly reduced cost. Flash is well-suited for applications like chat assistants and on-demand content generation where speed and scale matter.

Usage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).

#multimodal

**Context Length**: 1,000,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $7.5e-08/token
- Completion: $3e-07/token
- Image: $4e-05/image

**Provider Limits**:
- Max Context: 1,000,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, tools, tool_choice, seed, response_format, structured_outputs

---

### Google: Gemini 1.5 Flash 8B

**Model ID**: `google/gemini-flash-1.5-8b`

**Description**: Gemini Flash 1.5 8B is optimized for speed and efficiency, offering enhanced performance in small prompt tasks like chat, transcription, and translation. With reduced latency, it is highly effective for real-time and large-scale operations. This model focuses on cost-effective solutions while maintaining high-quality results.

[Click here to learn more about this model](https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/).

Usage of Gemini is subject to Google's [Gemini Terms of Use](https://ai.google.dev/terms).

**Context Length**: 1,000,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3.75e-08/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 1,000,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, tools, tool_choice, seed, response_format, structured_outputs

---

### MiniMax: MiniMax M1

**Model ID**: `minimax/minimax-m1`

**Description**: MiniMax-M1 is a large-scale, open-weight reasoning model designed for extended context and high-efficiency inference. It leverages a hybrid Mixture-of-Experts (MoE) architecture paired with a custom "lightning attention" mechanism, allowing it to process long sequences—up to 1 million tokens—while maintaining competitive FLOP efficiency. With 456 billion total parameters and 45.9B active per token, this variant is optimized for complex, multi-step reasoning tasks.

Trained via a custom reinforcement learning pipeline (CISPO), M1 excels in long-context understanding, software engineering, agentic tool use, and mathematical reasoning. Benchmarks show strong performance across FullStackBench, SWE-bench, MATH, GPQA, and TAU-Bench, often outperforming other open models like DeepSeek R1 and Qwen3-235B.

**Context Length**: 1,000,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $1.65e-06/token

**Provider Limits**:
- Max Context: 1,000,000 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning

---

### Qwen: Qwen-Turbo

**Model ID**: `qwen/qwen-turbo`

**Description**: Qwen-Turbo, based on Qwen2.5, is a 1M context model that provides fast speed and low cost, suitable for simple tasks.

**Context Length**: 1,000,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 1,000,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, seed, response_format, presence_penalty

---

### Amazon: Nova Lite 1.0

**Model ID**: `amazon/nova-lite-v1`

**Description**: Amazon Nova Lite 1.0 is a very low-cost multimodal model from Amazon that focused on fast processing of image, video, and text inputs to generate text output. Amazon Nova Lite can handle real-time customer interactions, document analysis, and visual question-answering tasks with high accuracy.

With an input context of 300K tokens, it can analyze multiple images or up to 30 minutes of video in a single input.

**Context Length**: 300,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-08/token
- Completion: $2.4e-07/token
- Image: $9e-05/image

**Provider Limits**:
- Max Context: 300,000 tokens
- Max Completion: 5,120 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, top_k, stop

---

### Amazon: Nova Pro 1.0

**Model ID**: `amazon/nova-pro-v1`

**Description**: Amazon Nova Pro 1.0 is a capable multimodal model from Amazon focused on providing a combination of accuracy, speed, and cost for a wide range of tasks. As of December 2024, it achieves state-of-the-art performance on key benchmarks including visual question answering (TextVQA) and video understanding (VATEX).

Amazon Nova Pro demonstrates strong capabilities in processing both visual and textual information and at analyzing financial documents.

**NOTE**: Video input is not supported at this time.

**Context Length**: 300,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $3.2e-06/token
- Image: $0.0012/image

**Provider Limits**:
- Max Context: 300,000 tokens
- Max Completion: 5,120 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, top_k, stop

---

### Mistral: Codestral 2501

**Model ID**: `mistralai/codestral-2501`

**Description**: [Mistral](/mistralai)'s cutting-edge language model for coding. Codestral specializes in low-latency, high-frequency tasks such as fill-in-the-middle (FIM), code correction and test generation. 

Learn more on their blog post: https://mistral.ai/news/codestral-2501/

**Context Length**: 262,144 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $9e-07/token

**Provider Limits**:
- Max Context: 262,144 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### AI21: Jamba 1.6 Large

**Model ID**: `ai21/jamba-1.6-large`

**Description**: AI21 Jamba Large 1.6 is a high-performance hybrid foundation model combining State Space Models (Mamba) with Transformer attention mechanisms. Developed by AI21, it excels in extremely long-context handling (256K tokens), demonstrates superior inference efficiency (up to 2.5x faster than comparable models), and supports structured JSON output and tool-use capabilities. It has 94 billion active parameters (398 billion total), optimized quantization support (ExpertsInt8), and multilingual proficiency in languages such as English, Spanish, French, Portuguese, Italian, Dutch, German, Arabic, and Hebrew.

Usage of this model is subject to the [Jamba Open Model License](https://www.ai21.com/licenses/jamba-open-model-license).

**Context Length**: 256,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token

**Provider Limits**:
- Max Context: 256,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop

---

### AI21: Jamba Mini 1.6

**Model ID**: `ai21/jamba-1.6-mini`

**Description**: AI21 Jamba Mini 1.6 is a hybrid foundation model combining State Space Models (Mamba) with Transformer attention mechanisms. With 12 billion active parameters (52 billion total), this model excels in extremely long-context tasks (up to 256K tokens) and achieves superior inference efficiency, outperforming comparable open models on tasks such as retrieval-augmented generation (RAG) and grounded question answering. Jamba Mini 1.6 supports multilingual tasks across English, Spanish, French, Portuguese, Italian, Dutch, German, Arabic, and Hebrew, along with structured JSON output and tool-use capabilities.

Usage of this model is subject to the [Jamba Open Model License](https://www.ai21.com/licenses/jamba-open-model-license).

**Context Length**: 256,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 256,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop

---

### Cohere: Command A

**Model ID**: `cohere/command-a`

**Description**: Command A is an open-weights 111B parameter model with a 256k context window focused on delivering great performance across agentic, multilingual, and coding use cases.
Compared to other leading proprietary and open-weights models Command A delivers maximum performance with minimum hardware costs, excelling on business-critical agentic and multilingual tasks.

**Context Length**: 256,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token

**Provider Limits**:
- Max Context: 256,000 tokens
- Max Completion: 8,192 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Anthropic: Claude 3 Haiku

**Model ID**: `anthropic/claude-3-haiku`

**Description**: Claude 3 Haiku is Anthropic's fastest and most compact model for
near-instant responsiveness. Quick and accurate targeted performance.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $1.25e-06/token
- Image: $0.0004/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3 Haiku (self-moderated)

**Model ID**: `anthropic/claude-3-haiku:beta`

**Description**: Claude 3 Haiku is Anthropic's fastest and most compact model for
near-instant responsiveness. Quick and accurate targeted performance.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-haiku)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $1.25e-06/token
- Image: $0.0004/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3 Opus

**Model ID**: `anthropic/claude-3-opus`

**Description**: Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $7.5e-05/token
- Image: $0.024/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3 Opus (self-moderated)

**Model ID**: `anthropic/claude-3-opus:beta`

**Description**: Claude 3 Opus is Anthropic's most powerful model for highly complex tasks. It boasts top-level performance, intelligence, fluency, and understanding.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $7.5e-05/token
- Image: $0.024/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3 Sonnet

**Model ID**: `anthropic/claude-3-sonnet`

**Description**: Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3 Sonnet (self-moderated)

**Model ID**: `anthropic/claude-3-sonnet:beta`

**Description**: Claude 3 Sonnet is an ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/claude-3-family)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Haiku

**Model ID**: `anthropic/claude-3.5-haiku`

**Description**: Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.

This makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.

This model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Haiku (2024-10-22)

**Model ID**: `anthropic/claude-3.5-haiku-20241022`

**Description**: Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.

It does not support image inputs.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Haiku (2024-10-22) (self-moderated)

**Model ID**: `anthropic/claude-3.5-haiku-20241022:beta`

**Description**: Claude 3.5 Haiku features enhancements across all skill sets including coding, tool use, and reasoning. As the fastest model in the Anthropic lineup, it offers rapid response times suitable for applications that require high interactivity and low latency, such as user-facing chatbots and on-the-fly code completions. It also excels in specialized tasks like data extraction and real-time content moderation, making it a versatile tool for a broad range of industries.

It does not support image inputs.

See the launch announcement and benchmark results [here](https://www.anthropic.com/news/3-5-models-and-computer-use)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Haiku (self-moderated)

**Model ID**: `anthropic/claude-3.5-haiku:beta`

**Description**: Claude 3.5 Haiku features offers enhanced capabilities in speed, coding accuracy, and tool use. Engineered to excel in real-time applications, it delivers quick response times that are essential for dynamic tasks such as chat interactions and immediate coding suggestions.

This makes it highly suitable for environments that demand both speed and precision, such as software development, customer service bots, and data management systems.

This model is currently pointing to [Claude 3.5 Haiku (2024-10-22)](/anthropic/claude-3-5-haiku-20241022).

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Sonnet

**Model ID**: `anthropic/claude-3.5-sonnet`

**Description**: New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:

- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding
- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights
- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone
- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Sonnet (2024-06-20)

**Model ID**: `anthropic/claude-3.5-sonnet-20240620`

**Description**: Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:

- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting
- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights
- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone
- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)

For the latest version (2024-10-23), check out [Claude 3.5 Sonnet](/anthropic/claude-3.5-sonnet).

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Sonnet (2024-06-20) (self-moderated)

**Model ID**: `anthropic/claude-3.5-sonnet-20240620:beta`

**Description**: Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:

- Coding: Autonomously writes, edits, and runs code with reasoning and troubleshooting
- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights
- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone
- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)

For the latest version (2024-10-23), check out [Claude 3.5 Sonnet](/anthropic/claude-3.5-sonnet).

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.5 Sonnet (self-moderated)

**Model ID**: `anthropic/claude-3.5-sonnet:beta`

**Description**: New Claude 3.5 Sonnet delivers better-than-Opus capabilities, faster-than-Sonnet speeds, at the same Sonnet prices. Sonnet is particularly good at:

- Coding: Scores ~49% on SWE-Bench Verified, higher than the last best score, and without any fancy prompt scaffolding
- Data science: Augments human data science expertise; navigates unstructured data while using multiple tools for insights
- Visual processing: excelling at interpreting charts, graphs, and images, accurately transcribing text to derive insights beyond just the text alone
- Agentic tasks: exceptional tool use, making it great at agentic tasks (i.e. complex, multi-step problem solving tasks that require engaging with other systems)

#multimodal

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude 3.7 Sonnet

**Model ID**: `anthropic/claude-3.7-sonnet`

**Description**: Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. 

Claude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.

Read more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 64,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, stop, reasoning, include_reasoning, tools, tool_choice, top_p, top_k

---

### Anthropic: Claude 3.7 Sonnet (self-moderated)

**Model ID**: `anthropic/claude-3.7-sonnet:beta`

**Description**: Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. 

Claude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.

Read more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, stop, reasoning, include_reasoning, tools, tool_choice

---

### Anthropic: Claude 3.7 Sonnet (thinking)

**Model ID**: `anthropic/claude-3.7-sonnet:thinking`

**Description**: Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities. It introduces a hybrid reasoning approach, allowing users to choose between rapid responses and extended, step-by-step processing for complex tasks. The model demonstrates notable improvements in coding, particularly in front-end development and full-stack updates, and excels in agentic workflows, where it can autonomously navigate multi-step processes. 

Claude 3.7 Sonnet maintains performance parity with its predecessor in standard mode while offering an extended reasoning mode for enhanced accuracy in math, coding, and instruction-following tasks.

Read more at the [blog post here](https://www.anthropic.com/news/claude-3-7-sonnet)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 128,000 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, stop, reasoning, include_reasoning, tools, tool_choice

---

### Anthropic: Claude Opus 4

**Model ID**: `anthropic/claude-opus-4`

**Description**: Claude Opus 4 is benchmarked as the world’s best coding model, at time of release, bringing sustained performance on complex, long-running tasks and agent workflows. It sets new benchmarks in software engineering, achieving leading results on SWE-bench (72.5%) and Terminal-bench (43.2%). Opus 4 supports extended, agentic workflows, handling thousands of task steps continuously for hours without degradation. 

Read more at the [blog post here](https://www.anthropic.com/news/claude-4)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $7.5e-05/token
- Image: $0.024/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 32,000 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, stop, reasoning, include_reasoning, tools, tool_choice, top_p, top_k

---

### Anthropic: Claude Sonnet 4

**Model ID**: `anthropic/claude-sonnet-4`

**Description**: Claude Sonnet 4 significantly enhances the capabilities of its predecessor, Sonnet 3.7, excelling in both coding and reasoning tasks with improved precision and controllability. Achieving state-of-the-art performance on SWE-bench (72.7%), Sonnet 4 balances capability and computational efficiency, making it suitable for a broad range of applications from routine coding tasks to complex software development projects. Key enhancements include improved autonomous codebase navigation, reduced error rates in agent-driven workflows, and increased reliability in following intricate instructions. Sonnet 4 is optimized for practical everyday use, providing advanced reasoning capabilities while maintaining efficiency and responsiveness in diverse internal and external scenarios.

Read more at the [blog post here](https://www.anthropic.com/news/claude-4)

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token
- Image: $0.0048/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 64,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, stop, reasoning, include_reasoning, tools, tool_choice, top_p, top_k

---

### Anthropic: Claude v2

**Model ID**: `anthropic/claude-2`

**Description**: Claude 2 delivers advancements in key capabilities for enterprises—including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude v2 (self-moderated)

**Model ID**: `anthropic/claude-2:beta`

**Description**: Claude 2 delivers advancements in key capabilities for enterprises—including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude v2.1

**Model ID**: `anthropic/claude-2.1`

**Description**: Claude 2 delivers advancements in key capabilities for enterprises—including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude v2.1 (self-moderated)

**Model ID**: `anthropic/claude-2.1:beta`

**Description**: Claude 2 delivers advancements in key capabilities for enterprises—including an industry-leading 200K token context window, significant reductions in rates of model hallucination, system prompts and a new beta feature: tool use.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Meta: Llama 4 Scout (free)

**Model ID**: `meta-llama/llama-4-scout:free`

**Description**: Llama 4 Scout 17B Instruct (16E) is a mixture-of-experts (MoE) language model developed by Meta, activating 17 billion parameters out of a total of 109B. It supports native multimodal input (text and image) and multilingual output (text and code) across 12 supported languages. Designed for assistant-style interaction and visual reasoning, Scout uses 16 experts per forward pass and features a context length of 10 million tokens, with a training corpus of ~40 trillion tokens.

Built for high efficiency and local or commercial deployment, Llama 4 Scout incorporates early fusion for seamless modality integration. It is instruction-tuned for use in multilingual chat, captioning, and image understanding tasks. Released under the Llama 4 Community License, it was last trained on data up to August 2024 and launched publicly on April 5, 2025.

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, tools, tool_choice

---

### OpenAI: Codex Mini

**Model ID**: `openai/codex-mini`

**Description**: codex-mini-latest is a fine-tuned version of o4-mini specifically for use in Codex CLI. For direct use in the API, we recommend starting with gpt-4.1.

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o1

**Model ID**: `openai/o1`

**Description**: The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding. The o1 model series is trained with large-scale reinforcement learning to reason using chain of thought. 

The o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).


**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $6e-05/token
- Image: $0.021675/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o1-pro

**Model ID**: `openai/o1-pro`

**Description**: The o1 series of models are trained with reinforcement learning to think before they answer and perform complex reasoning. The o1-pro model uses more compute to think harder and provide consistently better answers.

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0.00015/token
- Completion: $0.0006/token
- Image: $0.21675/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o3

**Model ID**: `openai/o3`

**Description**: o3 is a well-rounded and powerful model across domains. It sets a new standard for math, science, coding, and visual reasoning tasks. It also excels at technical writing and instruction-following. Use it to think through multi-step problems that involve analysis across text, code, and images. Note that BYOK is required for this model. Set up here: https://openrouter.ai/settings/integrations

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token
- Image: $0.00153/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o3 Mini

**Model ID**: `openai/o3-mini`

**Description**: OpenAI o3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding.

This model supports the `reasoning_effort` parameter, which can be set to "high", "medium", or "low" to control the thinking time of the model. The default is "medium". OpenRouter also offers the model slug `openai/o3-mini-high` to default the parameter to "high".

The model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.

The model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o3 Mini High

**Model ID**: `openai/o3-mini-high`

**Description**: OpenAI o3-mini-high is the same model as [o3-mini](/openai/o3-mini) with reasoning_effort set to high. 

o3-mini is a cost-efficient language model optimized for STEM reasoning tasks, particularly excelling in science, mathematics, and coding. The model features three adjustable reasoning effort levels and supports key developer capabilities including function calling, structured outputs, and streaming, though it does not include vision processing capabilities.

The model demonstrates significant improvements over its predecessor, with expert testers preferring its responses 56% of the time and noting a 39% reduction in major errors on complex questions. With medium reasoning effort settings, o3-mini matches the performance of the larger o1 model on challenging reasoning evaluations like AIME and GPQA, while maintaining lower latency and cost.

**Context Length**: 200,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o3 Pro

**Model ID**: `openai/o3-pro`

**Description**: The o-series of models are trained with reinforcement learning to think before they answer and perform complex reasoning. The o3-pro model uses more compute to think harder and provide consistently better answers.

Note that BYOK is required for this model. Set up here: https://openrouter.ai/settings/integrations

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, file, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-05/token
- Completion: $8e-05/token
- Image: $0.0153/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o4 Mini

**Model ID**: `openai/o4-mini`

**Description**: OpenAI o4-mini is a compact reasoning model in the o-series, optimized for fast, cost-efficient performance while retaining strong multimodal and agentic capabilities. It supports tool use and demonstrates competitive reasoning and coding performance across benchmarks like AIME (99.5% with Python) and SWE-bench, outperforming its predecessor o3-mini and even approaching o3 in some domains.

Despite its smaller size, o4-mini exhibits high accuracy in STEM tasks, visual problem solving (e.g., MathVista, MMMU), and code editing. It is especially well-suited for high-throughput scenarios where latency or cost is critical. Thanks to its efficient architecture and refined reinforcement learning training, o4-mini can chain tools, generate structured outputs, and solve multi-step tasks with minimal delay—often in under a minute.

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token
- Image: $0.0008415/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### OpenAI: o4 Mini High

**Model ID**: `openai/o4-mini-high`

**Description**: OpenAI o4-mini-high is the same model as [o4-mini](/openai/o4-mini) with reasoning_effort set to high. 

OpenAI o4-mini is a compact reasoning model in the o-series, optimized for fast, cost-efficient performance while retaining strong multimodal and agentic capabilities. It supports tool use and demonstrates competitive reasoning and coding performance across benchmarks like AIME (99.5% with Python) and SWE-bench, outperforming its predecessor o3-mini and even approaching o3 in some domains.

Despite its smaller size, o4-mini exhibits high accuracy in STEM tasks, visual problem solving (e.g., MathVista, MMMU), and code editing. It is especially well-suited for high-throughput scenarios where latency or cost is critical. Thanks to its efficient architecture and refined reinforcement learning training, o4-mini can chain tools, generate structured outputs, and solve multi-step tasks with minimal delay—often in under a minute.

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: image, text, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token
- Image: $0.0008415/image

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 100,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, seed, max_tokens, response_format, structured_outputs

---

### Perplexity: Sonar Pro

**Model ID**: `perplexity/sonar-pro`

**Description**: Note: Sonar Pro pricing includes Perplexity search pricing. See [details here](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-reasoning-pro-and-sonar-pro)

For enterprises seeking more advanced capabilities, the Sonar Pro API can handle in-depth, multi-step queries with added extensibility, like double the number of citations per search as Sonar on average. Plus, with a larger context window, it can handle longer and more nuanced searches and follow-up questions. 

**Context Length**: 200,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token

**Provider Limits**:
- Max Context: 200,000 tokens
- Max Completion: 8,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, web_search_options, top_k, frequency_penalty, presence_penalty

---

### DeepSeek: DeepSeek V3

**Model ID**: `deepseek/deepseek-chat`

**Description**: DeepSeek-V3 is the latest model from the DeepSeek team, building upon the instruction following and coding abilities of the previous versions. Pre-trained on nearly 15 trillion tokens, the reported evaluations reveal that the model outperforms other open-source models and rivals leading closed-source models.

For model details, please visit [the DeepSeek-V3 repo](https://github.com/deepseek-ai/DeepSeek-V3) for more information, or see the [launch announcement](https://api-docs.deepseek.com/news/news1226).

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3.8e-07/token
- Completion: $8.9e-07/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Max Completion: 163,840 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs, seed, min_p

---

### DeepSeek: DeepSeek V3 (free)

**Model ID**: `deepseek/deepseek-chat:free`

**Description**: DeepSeek-V3 is the latest model from the DeepSeek team, building upon the instruction following and coding abilities of the previous versions. Pre-trained on nearly 15 trillion tokens, the reported evaluations reveal that the model outperforms other open-source models and rivals leading closed-source models.

For model details, please visit [the DeepSeek-V3 repo](https://github.com/deepseek-ai/DeepSeek-V3) for more information, or see the [launch announcement](https://api-docs.deepseek.com/news/news1226).

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, top_a

---

### DeepSeek: DeepSeek V3 0324

**Model ID**: `deepseek/deepseek-chat-v3-0324`

**Description**: DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team.

It succeeds the [DeepSeek V3](/deepseek/deepseek-chat-v3) model and performs really well on a variety of tasks.

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $8.8e-07/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs, seed, min_p

---

### DeepSeek: DeepSeek V3 0324 (free)

**Model ID**: `deepseek/deepseek-chat-v3-0324:free`

**Description**: DeepSeek V3, a 685B-parameter, mixture-of-experts model, is the latest iteration of the flagship chat model family from the DeepSeek team.

It succeeds the [DeepSeek V3](/deepseek/deepseek-chat-v3) model and performs really well on a variety of tasks.

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, top_a

---

### DeepSeek: DeepSeek V3 Base (free)

**Model ID**: `deepseek/deepseek-v3-base:free`

**Description**: Note that this is a base model mostly meant for testing, you need to provide detailed prompts for the model to return useful responses. 

DeepSeek-V3 Base is a 671B parameter open Mixture-of-Experts (MoE) language model with 37B active parameters per forward pass and a context length of 128K tokens. Trained on 14.8T tokens using FP8 mixed precision, it achieves high training efficiency and stability, with strong performance across language, reasoning, math, and coding tasks. 

DeepSeek-V3 Base is the pre-trained model behind [DeepSeek V3](/deepseek/deepseek-chat-v3)

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### DeepSeek: R1 (free)

**Model ID**: `deepseek/deepseek-r1:free`

**Description**: DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.

Fully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).

MIT licensed: Distill & commercialize freely!

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, reasoning, include_reasoning, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, top_a, logprobs

---

### DeepSeek: R1 0528 (free)

**Model ID**: `deepseek/deepseek-r1-0528:free`

**Description**: May 28th update to the [original DeepSeek R1](/deepseek/deepseek-r1) Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.

Fully open-source model.

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Meta: Llama Guard 4 12B

**Model ID**: `meta-llama/llama-guard-4-12b`

**Description**: Llama Guard 4 is a Llama 4 Scout-derived multimodal pretrained model, fine-tuned for content safety classification. Similar to previous versions, it can be used to classify content in both LLM inputs (prompt classification) and in LLM responses (response classification). It acts as an LLM—generating text in its output that indicates whether a given prompt or response is safe or unsafe, and if unsafe, it also lists the content categories violated.

Llama Guard 4 was aligned to safeguard against the standardized MLCommons hazards taxonomy and designed to support multimodal Llama 4 capabilities. Specifically, it combines features from previous Llama Guard models, providing content moderation for English and multiple supported languages, along with enhanced capabilities to handle mixed text-and-image prompts, including multiple images. Additionally, Llama Guard 4 is integrated into the Llama Moderations API, extending robust safety classification to text and images.

**Context Length**: 163,840 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $5e-08/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, top_logprobs, logprobs

---

### Microsoft: MAI DS R1 (free)

**Model ID**: `microsoft/mai-ds-r1:free`

**Description**: MAI-DS-R1 is a post-trained variant of DeepSeek-R1 developed by the Microsoft AI team to improve the model’s responsiveness on previously blocked topics while enhancing its safety profile. Built on top of DeepSeek-R1’s reasoning foundation, it integrates 110k examples from the Tulu-3 SFT dataset and 350k internally curated multilingual safety-alignment samples. The model retains strong reasoning, coding, and problem-solving capabilities, while unblocking a wide range of prompts previously restricted in R1.

MAI-DS-R1 demonstrates improved performance on harm mitigation benchmarks and maintains competitive results across general reasoning tasks. It surpasses R1-1776 in satisfaction metrics for blocked queries and reduces leakage in harmful content categories. The model is based on a transformer MoE architecture and is suitable for general-purpose use cases, excluding high-stakes domains such as legal, medical, or autonomous systems.

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### TNG: DeepSeek R1T Chimera (free)

**Model ID**: `tngtech/deepseek-r1t-chimera:free`

**Description**: DeepSeek-R1T-Chimera is created by merging DeepSeek-R1 and DeepSeek-V3 (0324), combining the reasoning capabilities of R1 with the token efficiency improvements of V3. It is based on a DeepSeek-MoE Transformer architecture and is optimized for general text generation tasks.

The model merges pretrained weights from both source models to balance performance across reasoning, efficiency, and instruction-following tasks. It is released under the MIT license and intended for research and commercial use.

**Context Length**: 163,840 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 163,840 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### AionLabs: Aion-1.0

**Model ID**: `aion-labs/aion-1.0`

**Description**: Aion-1.0 is a multi-model system designed for high performance across various tasks, including reasoning and coding. It is built on DeepSeek-R1, augmented with additional models and techniques such as Tree of Thoughts (ToT) and Mixture of Experts (MoE). It is Aion Lab's most powerful reasoning model.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-06/token
- Completion: $8e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning

---

### AionLabs: Aion-1.0-Mini

**Model ID**: `aion-labs/aion-1.0-mini`

**Description**: Aion-1.0-Mini 32B parameter model is a distilled version of the DeepSeek-R1 model, designed for strong performance in reasoning domains such as mathematics, coding, and logic. It is a modified variant of a FuseAI model that outperforms R1-Distill-Qwen-32B and R1-Distill-Llama-70B, with benchmark results available on its [Hugging Face page](https://huggingface.co/FuseAI/FuseO1-DeepSeekR1-QwQ-SkyT1-32B-Preview), independently replicated for verification.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-07/token
- Completion: $1.4e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning

---

### Arcee AI: Maestro Reasoning

**Model ID**: `arcee-ai/maestro-reasoning`

**Description**: Maestro Reasoning is Arcee's flagship analysis model: a 32 B‑parameter derivative of Qwen 2.5‑32 B tuned with DPO and chain‑of‑thought RL for step‑by‑step logic. Compared to the earlier 7 B preview, the production 32 B release widens the context window to 128 k tokens and doubles pass‑rate on MATH and GSM‑8K, while also lifting code completion accuracy. Its instruction style encourages structured "thought → answer" traces that can be parsed or hidden according to user preference. That transparency pairs well with audit‑focused industries like finance or healthcare where seeing the reasoning path matters. In Arcee Conductor, Maestro is automatically selected for complex, multi‑constraint queries that smaller SLMs bounce. 

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $9e-07/token
- Completion: $3.3e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Arcee AI: Spotlight

**Model ID**: `arcee-ai/spotlight`

**Description**: Spotlight is a 7‑billion‑parameter vision‑language model derived from Qwen 2.5‑VL and fine‑tuned by Arcee AI for tight image‑text grounding tasks. It offers a 32 k‑token context window, enabling rich multimodal conversations that combine lengthy documents with one or more images. Training emphasized fast inference on consumer GPUs while retaining strong captioning, visual‐question‑answering, and diagram‑analysis accuracy. As a result, Spotlight slots neatly into agent workflows where screenshots, charts or UI mock‑ups need to be interpreted on the fly. Early benchmarks show it matching or out‑scoring larger VLMs such as LLaVA‑1.6 13 B on popular VQA and POPE alignment tests. 

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.8e-07/token
- Completion: $1.8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 65,537 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Arcee AI: Virtuoso Large

**Model ID**: `arcee-ai/virtuoso-large`

**Description**: Virtuoso‑Large is Arcee's top‑tier general‑purpose LLM at 72 B parameters, tuned to tackle cross‑domain reasoning, creative writing and enterprise QA. Unlike many 70 B peers, it retains the 128 k context inherited from Qwen 2.5, letting it ingest books, codebases or financial filings wholesale. Training blended DeepSeek R1 distillation, multi‑epoch supervised fine‑tuning and a final DPO/RLHF alignment stage, yielding strong performance on BIG‑Bench‑Hard, GSM‑8K and long‑context Needle‑In‑Haystack tests. Enterprises use Virtuoso‑Large as the "fallback" brain in Conductor pipelines when other SLMs flag low confidence. Despite its size, aggressive KV‑cache optimizations keep first‑token latency in the low‑second range on 8× H100 nodes, making it a practical production‑grade powerhouse.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7.5e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 64,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Arcee AI: Virtuoso Medium V2

**Model ID**: `arcee-ai/virtuoso-medium-v2`

**Description**: Virtuoso‑Medium‑v2 is a 32 B model distilled from DeepSeek‑v3 logits and merged back onto a Qwen 2.5 backbone, yielding a sharper, more factual successor to the original Virtuoso Medium. The team harvested ~1.1 B logit tokens and applied "fusion‑merging" plus DPO alignment, which pushed scores past Arcee‑Nova 2024 and many 40 B‑plus peers on MMLU‑Pro, MATH and HumanEval. With a 128 k context and aggressive quantization options (from BF16 down to 4‑bit GGUF), it balances capability with deployability on single‑GPU nodes. Typical use cases include enterprise chat assistants, technical writing aids and medium‑complexity code drafting where Virtuoso‑Large would be overkill. 

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### DeepSeek: DeepSeek Prover V2

**Model ID**: `deepseek/deepseek-prover-v2`

**Description**: DeepSeek Prover V2 is a 671B parameter model, speculated to be geared towards logic and mathematics. Likely an upgrade from [DeepSeek-Prover-V1.5](https://huggingface.co/deepseek-ai/DeepSeek-Prover-V1.5-RL) Not much is known about the model yet, as DeepSeek released it on Hugging Face without an announcement or description.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $2.18e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### DeepSeek: Deepseek R1 0528 Qwen3 8B

**Model ID**: `deepseek/deepseek-r1-0528-qwen3-8b`

**Description**: DeepSeek-R1-0528 is a lightly upgraded release of DeepSeek R1 that taps more compute and smarter post-training tricks, pushing its reasoning and inference to the brink of flagship models like O3 and Gemini 2.5 Pro.
It now tops math, programming, and logic leaderboards, showcasing a step-change in depth-of-thought.
The distilled variant, DeepSeek-R1-0528-Qwen3-8B, transfers this chain-of-thought into an 8 B-parameter form, beating standard Qwen3 8B by +10 pp and tying the 235 B “thinking” giant on AIME 2024.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, presence_penalty, frequency_penalty, repetition_penalty, top_k, stop, seed, min_p, logit_bias

---

### DeepSeek: Deepseek R1 0528 Qwen3 8B (free)

**Model ID**: `deepseek/deepseek-r1-0528-qwen3-8b:free`

**Description**: DeepSeek-R1-0528 is a lightly upgraded release of DeepSeek R1 that taps more compute and smarter post-training tricks, pushing its reasoning and inference to the brink of flagship models like O3 and Gemini 2.5 Pro.
It now tops math, programming, and logic leaderboards, showcasing a step-change in depth-of-thought.
The distilled variant, DeepSeek-R1-0528-Qwen3-8B, transfers this chain-of-thought into an 8 B-parameter form, beating standard Qwen3 8B by +10 pp and tying the 235 B “thinking” giant on AIME 2024.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### DeepSeek: R1 Distill Llama 70B

**Model ID**: `deepseek/deepseek-r1-distill-llama-70b`

**Description**: DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:

- AIME 2024 pass@1: 70.0
- MATH-500 pass@1: 94.5
- CodeForces Rating: 1633

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, seed, top_k, stop, frequency_penalty, presence_penalty, logit_bias, logprobs, top_logprobs, min_p, repetition_penalty, tools, tool_choice, response_format, structured_outputs

---

### DeepSeek: R1 Distill Qwen 1.5B

**Model ID**: `deepseek/deepseek-r1-distill-qwen-1.5b`

**Description**: DeepSeek R1 Distill Qwen 1.5B is a distilled large language model based on  [Qwen 2.5 Math 1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It's a very small and efficient model which outperforms [GPT 4o 0513](/openai/gpt-4o-2024-05-13) on Math Benchmarks.

Other benchmark results include:

- AIME 2024 pass@1: 28.9
- AIME 2024 cons@64: 52.7
- MATH-500 pass@1: 83.9

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.8e-07/token
- Completion: $1.8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### DeepSeek: R1 Distill Qwen 32B

**Model ID**: `deepseek/deepseek-r1-distill-qwen-32b`

**Description**: DeepSeek R1 Distill Qwen 32B is a distilled large language model based on [Qwen 2.5 32B](https://huggingface.co/Qwen/Qwen2.5-32B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 72.6\n- MATH-500 pass@1: 94.3\n- CodeForces Rating: 1691\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.2e-07/token
- Completion: $1.8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, seed, stop, frequency_penalty, presence_penalty, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### DeepSeek: R1 Distill Qwen 7B

**Model ID**: `deepseek/deepseek-r1-distill-qwen-7b`

**Description**: DeepSeek-R1-Distill-Qwen-7B is a 7 billion parameter dense language model distilled from DeepSeek-R1, leveraging reinforcement learning-enhanced reasoning data generated by DeepSeek's larger models. The distillation process transfers advanced reasoning, math, and code capabilities into a smaller, more efficient model architecture based on Qwen2.5-Math-7B. This model demonstrates strong performance across mathematical benchmarks (92.8% pass@1 on MATH-500), coding tasks (Codeforces rating 1189), and general reasoning (49.1% pass@1 on GPQA Diamond), achieving competitive accuracy relative to larger models while maintaining smaller inference costs.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, seed

---

### Google: Gemma 3 12B

**Model ID**: `google/gemma-3-12b-it`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 12B is the second largest in the family of Gemma 3 models after [Gemma 3 27B](google/gemma-3-27b-it)

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p

---

### Google: Gemma 3 27B

**Model ID**: `google/gemma-3-27b-it`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 27B is Google's latest open source model, successor to [Gemma 2](google/gemma-2-27b-it)

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $2e-07/token
- Image: $2.56e-05/image

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p, logit_bias, top_logprobs, logprobs

---

### Google: Gemma 3 4B

**Model ID**: `google/gemma-3-4b-it`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling.

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-08/token
- Completion: $4e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p

---

### Kimi Dev 72b (free)

**Model ID**: `moonshotai/kimi-dev-72b:free`

**Description**: Kimi-Dev-72B is an open-source large language model fine-tuned for software engineering and issue resolution tasks. Based on Qwen2.5-72B, it is optimized using large-scale reinforcement learning that applies code patches in real repositories and validates them via full test suite execution—rewarding only correct, robust completions. The model achieves 60.4% on SWE-bench Verified, setting a new benchmark among open-source models for software bug fixing and code reasoning.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Llama Guard 3 8B

**Model ID**: `meta-llama/llama-guard-3-8b`

**Description**: Llama Guard 3 is a Llama-3.1-8B pretrained model, fine-tuned for content safety classification. Similar to previous versions, it can be used to classify content in both LLM inputs (prompt classification) and in LLM responses (response classification). It acts as an LLM – it generates text in its output that indicates whether a given prompt or response is safe or unsafe, and if unsafe, it also lists the content categories violated.

Llama Guard 3 was aligned to safeguard against the MLCommons standardized hazards taxonomy and designed to support Llama 3.1 capabilities. Specifically, it provides content moderation in 8 languages, and was optimized to support safety and security for search and code interpreter tool calls.


**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-08/token
- Completion: $6e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs, min_p, seed

---

### Meta: Llama 3.1 70B Instruct

**Model ID**: `meta-llama/llama-3.1-70b-instruct`

**Description**: Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 70B instruct-tuned version is optimized for high quality dialogue usecases.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $2.8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, response_format, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, seed, min_p, logit_bias, logprobs, top_logprobs, structured_outputs

---

### Meta: Llama 3.1 8B Instruct (free)

**Model ID**: `meta-llama/llama-3.1-8b-instruct:free`

**Description**: Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed

---

### Meta: Llama 3.2 11B Vision Instruct

**Model ID**: `meta-llama/llama-3.2-11b-vision-instruct`

**Description**: Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.

Its ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $4.9e-08/token
- Completion: $4.9e-08/token
- Image: $7.948e-05/image

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, seed, repetition_penalty, frequency_penalty, presence_penalty, stop, logit_bias, min_p, response_format, top_logprobs, tools, tool_choice, logprobs

---

### Meta: Llama 3.2 11B Vision Instruct (free)

**Model ID**: `meta-llama/llama-3.2-11b-vision-instruct:free`

**Description**: Llama 3.2 11B Vision is a multimodal model with 11 billion parameters, designed to handle tasks combining visual and textual data. It excels in tasks such as image captioning and visual question answering, bridging the gap between language generation and visual reasoning. Pre-trained on a massive dataset of image-text pairs, it performs well in complex, high-accuracy image analysis.

Its ability to integrate visual understanding with language processing makes it an ideal solution for industries requiring comprehensive visual-linguistic AI applications, such as content creation, AI-driven customer service, and research.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Meta: Llama 3.2 1B Instruct

**Model ID**: `meta-llama/llama-3.2-1b-instruct`

**Description**: Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.

Supporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-09/token
- Completion: $1e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, seed, min_p, logit_bias, top_logprobs

---

### Meta: Llama 3.2 1B Instruct (free)

**Model ID**: `meta-llama/llama-3.2-1b-instruct:free`

**Description**: Llama 3.2 1B is a 1-billion-parameter language model focused on efficiently performing natural language tasks, such as summarization, dialogue, and multilingual text analysis. Its smaller size allows it to operate efficiently in low-resource environments while maintaining strong task performance.

Supporting eight core languages and fine-tunable for more, Llama 1.3B is ideal for businesses or developers seeking lightweight yet powerful AI solutions that can operate in diverse multilingual settings without the high computational demand of larger models.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed

---

### Meta: Llama 3.2 3B Instruct

**Model ID**: `meta-llama/llama-3.2-3b-instruct`

**Description**: Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.

Trained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-08/token
- Completion: $2e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k

---

### Meta: Llama 3.2 90B Vision Instruct

**Model ID**: `meta-llama/llama-3.2-90b-vision-instruct`

**Description**: The Llama 90B Vision model is a top-tier, 90-billion-parameter multimodal model designed for the most challenging visual reasoning and language tasks. It offers unparalleled accuracy in image captioning, visual question answering, and advanced image-text comprehension. Pre-trained on vast multimodal datasets and fine-tuned with human feedback, the Llama 90B Vision is engineered to handle the most demanding image-based AI tasks.

This model is perfect for industries requiring cutting-edge multimodal AI capabilities, particularly those dealing with complex, real-time visual and textual analysis.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD_VISION.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1.2e-06/token
- Completion: $1.2e-06/token
- Image: $0.001734/image

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed

---

### Meta: Llama 3.3 70B Instruct

**Model ID**: `meta-llama/llama-3.3-70b-instruct`

**Description**: The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.

Supported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.

[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $2.5e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p, logit_bias, logprobs, top_logprobs, structured_outputs

---

### Meta: Llama 3.3 70B Instruct (free)

**Model ID**: `meta-llama/llama-3.3-70b-instruct:free`

**Description**: The Meta Llama 3.3 multilingual large language model (LLM) is a pretrained and instruction tuned generative model in 70B (text in/text out). The Llama 3.3 instruction tuned text only model is optimized for multilingual dialogue use cases and outperforms many of the available open source and closed chat models on common industry benchmarks.

Supported languages: English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai.

[Model Card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, repetition_penalty, top_k, stop, frequency_penalty, presence_penalty, logit_bias, min_p, response_format

---

### Microsoft: Phi 4 Multimodal Instruct

**Model ID**: `microsoft/phi-4-multimodal-instruct`

**Description**: Phi-4 Multimodal Instruct is a versatile 5.6B parameter foundation model that combines advanced reasoning and instruction-following capabilities across both text and visual inputs, providing accurate text outputs. The unified architecture enables efficient, low-latency inference, suitable for edge and mobile deployments. Phi-4 Multimodal Instruct supports text inputs in multiple languages including Arabic, Chinese, English, French, German, Japanese, Spanish, and more, with visual input optimized primarily for English. It delivers impressive performance on multimodal tasks involving mathematical, scientific, and document reasoning, providing developers and enterprises a powerful yet compact model for sophisticated interactive applications. For more information, see the [Phi-4 Multimodal blog post](https://azure.microsoft.com/en-us/blog/empowering-innovation-the-next-generation-of-the-phi-family/).


**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $1e-07/token
- Image: $0.00017685/image

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p

---

### Mistral Large 2407

**Model ID**: `mistralai/mistral-large-2407`

**Description**: This is Mistral AI's flagship model, Mistral Large 2 (version mistral-large-2407). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).

It supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.


**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral Large 2411

**Model ID**: `mistralai/mistral-large-2411`

**Description**: Mistral Large 2 2411 is an update of [Mistral Large 2](/mistralai/mistral-large) released together with [Pixtral Large 2411](/mistralai/pixtral-large-2411)

It provides a significant upgrade on the previous [Mistral Large 24.07](/mistralai/mistral-large-2407), with notable improvements in long context understanding, a new system prompt, and more accurate function calling.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral: Devstral Small (free)

**Model ID**: `mistralai/devstral-small:free`

**Description**: Devstral-Small-2505 is a 24B parameter agentic LLM fine-tuned from Mistral-Small-3.1, jointly developed by Mistral AI and All Hands AI for advanced software engineering tasks. It is optimized for codebase exploration, multi-file editing, and integration into coding agents, achieving state-of-the-art results on SWE-Bench Verified (46.8%).

Devstral supports a 128k context window and uses a custom Tekken tokenizer. It is text-only, with the vision encoder removed, and is suitable for local deployment on high-end consumer hardware (e.g., RTX 4090, 32GB RAM Macs). Devstral is best used in agentic workflows via the OpenHands scaffold and is compatible with inference frameworks like vLLM, Transformers, and Ollama. It is released under the Apache 2.0 license.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Ministral 3B

**Model ID**: `mistralai/ministral-3b`

**Description**: Ministral 3B is a 3B parameter model optimized for on-device and edge computing. It excels in knowledge, commonsense reasoning, and function-calling, outperforming larger models like Mistral 7B on most benchmarks. Supporting up to 128k context length, it’s ideal for orchestrating agentic workflows and specialist tasks with efficient inference.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-08/token
- Completion: $4e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral: Mistral Nemo

**Model ID**: `mistralai/mistral-nemo`

**Description**: A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.

The model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.

It supports function calling and is released under the Apache 2.0 license.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-08/token
- Completion: $2.2e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs, min_p, seed, response_format, tools, tool_choice, structured_outputs

---

### Mistral: Mistral Nemo (free)

**Model ID**: `mistralai/mistral-nemo:free`

**Description**: A 12B parameter model with a 128k token context length built by Mistral in collaboration with NVIDIA.

The model is multilingual, supporting English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi.

It supports function calling and is released under the Apache 2.0 license.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Mistral Small 3.1 24B

**Model ID**: `mistralai/mistral-small-3.1-24b-instruct`

**Description**: Mistral Small 3.1 24B Instruct is an upgraded variant of Mistral Small 3 (2501), featuring 24 billion parameters with advanced multimodal capabilities. It provides state-of-the-art performance in text-based reasoning and vision tasks, including image analysis, programming, mathematical reasoning, and multilingual support across dozens of languages. Equipped with an extensive 128k token context window and optimized for efficient local inference, it supports use cases such as conversational agents, function calling, long-document comprehension, and privacy-sensitive deployments.

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, presence_penalty, frequency_penalty, repetition_penalty, top_k, tools, tool_choice, stop, response_format, structured_outputs, seed, logit_bias, logprobs, top_logprobs

---

### Moonshot AI: Kimi VL A3B Thinking (free)

**Model ID**: `moonshotai/kimi-vl-a3b-thinking:free`

**Description**: Kimi-VL is a lightweight Mixture-of-Experts vision-language model that activates only 2.8B parameters per step while delivering strong performance on multimodal reasoning and long-context tasks. The Kimi-VL-A3B-Thinking variant, fine-tuned with chain-of-thought and reinforcement learning, excels in math and visual reasoning benchmarks like MathVision, MMMU, and MathVista, rivaling much larger models such as Qwen2.5-VL-7B and Gemma-3-12B. It supports 128K context and high-resolution input via its MoonViT encoder.

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### NVIDIA: Llama 3.1 Nemotron 70B Instruct

**Model ID**: `nvidia/llama-3.1-nemotron-70b-instruct`

**Description**: NVIDIA's Llama 3.1 Nemotron 70B is a language model designed for generating precise and useful responses. Leveraging [Llama 3.1 70B](/models/meta-llama/llama-3.1-70b-instruct) architecture and Reinforcement Learning from Human Feedback (RLHF), it excels in automatic alignment benchmarks. This model is tailored for applications requiring high accuracy in helpfulness and response generation, suitable for diverse user queries across multiple domains.

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.2e-07/token
- Completion: $3e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k

---

### NVIDIA: Llama 3.1 Nemotron Ultra 253B v1

**Model ID**: `nvidia/llama-3.1-nemotron-ultra-253b-v1`

**Description**: Llama-3.1-Nemotron-Ultra-253B-v1 is a large language model (LLM) optimized for advanced reasoning, human-interactive chat, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta’s Llama-3.1-405B-Instruct, it has been significantly customized using Neural Architecture Search (NAS), resulting in enhanced efficiency, reduced memory usage, and improved inference latency. The model supports a context length of up to 128K tokens and can operate efficiently on an 8x NVIDIA H100 node.

Note: you must include `detailed thinking on` in the system prompt to enable reasoning. Please see [Usage Recommendations](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1#quick-start-and-usage-recommendations) for more.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-07/token
- Completion: $1.8e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, logit_bias, logprobs, top_logprobs

---

### NVIDIA: Llama 3.1 Nemotron Ultra 253B v1 (free)

**Model ID**: `nvidia/llama-3.1-nemotron-ultra-253b-v1:free`

**Description**: Llama-3.1-Nemotron-Ultra-253B-v1 is a large language model (LLM) optimized for advanced reasoning, human-interactive chat, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta’s Llama-3.1-405B-Instruct, it has been significantly customized using Neural Architecture Search (NAS), resulting in enhanced efficiency, reduced memory usage, and improved inference latency. The model supports a context length of up to 128K tokens and can operate efficiently on an 8x NVIDIA H100 node.

Note: you must include `detailed thinking on` in the system prompt to enable reasoning. Please see [Usage Recommendations](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1#quick-start-and-usage-recommendations) for more.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### NVIDIA: Llama 3.3 Nemotron Super 49B v1

**Model ID**: `nvidia/llama-3.3-nemotron-super-49b-v1`

**Description**: Llama-3.3-Nemotron-Super-49B-v1 is a large language model (LLM) optimized for advanced reasoning, conversational interactions, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta's Llama-3.3-70B-Instruct, it employs a Neural Architecture Search (NAS) approach, significantly enhancing efficiency and reducing memory requirements. This allows the model to support a context length of up to 128K tokens and fit efficiently on single high-performance GPUs, such as NVIDIA H200.

Note: you must include `detailed thinking on` in the system prompt to enable reasoning. Please see [Usage Recommendations](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1#quick-start-and-usage-recommendations) for more.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.3e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, logit_bias, logprobs, top_logprobs

---

### NVIDIA: Llama 3.3 Nemotron Super 49B v1 (free)

**Model ID**: `nvidia/llama-3.3-nemotron-super-49b-v1:free`

**Description**: Llama-3.3-Nemotron-Super-49B-v1 is a large language model (LLM) optimized for advanced reasoning, conversational interactions, retrieval-augmented generation (RAG), and tool-calling tasks. Derived from Meta's Llama-3.3-70B-Instruct, it employs a Neural Architecture Search (NAS) approach, significantly enhancing efficiency and reducing memory requirements. This allows the model to support a context length of up to 128K tokens and fit efficiently on single high-performance GPUs, such as NVIDIA H200.

Note: you must include `detailed thinking on` in the system prompt to enable reasoning. Please see [Usage Recommendations](https://huggingface.co/nvidia/Llama-3_1-Nemotron-Ultra-253B-v1#quick-start-and-usage-recommendations) for more.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Nous: DeepHermes 3 Llama 3 8B Preview (free)

**Model ID**: `nousresearch/deephermes-3-llama-3-8b-preview:free`

**Description**: DeepHermes 3 Preview is the latest version of our flagship Hermes series of LLMs by Nous Research, and one of the first models in the world to unify Reasoning (long chains of thought that improve answer accuracy) and normal LLM response modes into one model. We have also improved LLM annotation, judgement, and function calling.

DeepHermes 3 Preview is one of the first LLM models to unify both "intuitive", traditional mode responses and long chain of thought reasoning responses into a single model, toggled by a system prompt.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Nous: Hermes 3 405B Instruct

**Model ID**: `nousresearch/hermes-3-llama-3.1-405b`

**Description**: Hermes 3 is a generalist language model with many improvements over Hermes 2, including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.

Hermes 3 405B is a frontier-level, full-parameter finetune of the Llama-3.1 405B foundation model, focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.

The Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.

Hermes 3 is competitive, if not superior, to Llama-3.1 Instruct models at general capabilities, with varying strengths and weaknesses attributable between the two.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k

---

### Nous: Hermes 3 70B Instruct

**Model ID**: `nousresearch/hermes-3-llama-3.1-70b`

**Description**: Hermes 3 is a generalist language model with many improvements over [Hermes 2](/models/nousresearch/nous-hermes-2-mistral-7b-dpo), including advanced agentic capabilities, much better roleplaying, reasoning, multi-turn conversation, long context coherence, and improvements across the board.

Hermes 3 70B is a competitive, if not superior finetune of the [Llama-3.1 70B foundation model](/models/meta-llama/llama-3.1-70b-instruct), focused on aligning LLMs to the user, with powerful steering capabilities and control given to the end user.

The Hermes 3 series builds and expands on the Hermes 2 set of capabilities, including more powerful and reliable function calling and structured output capabilities, generalist assistant capabilities, and improved code generation skills.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.2e-07/token
- Completion: $3e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k, tools, tool_choice

---

### NousResearch: Hermes 2 Pro - Llama-3 8B

**Model ID**: `nousresearch/hermes-2-pro-llama-3-8b`

**Description**: Hermes 2 Pro is an upgraded, retrained version of Nous Hermes 2, consisting of an updated and cleaned version of the OpenHermes 2.5 Dataset, as well as a newly introduced Function Calling and JSON Mode dataset developed in-house.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-08/token
- Completion: $4e-08/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k

---

### Qwen: QwQ 32B

**Model ID**: `qwen/qwq-32b`

**Description**: QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. QwQ-32B is the medium-sized reasoning model, which is capable of achieving competitive performance against state-of-the-art reasoning models, e.g., DeepSeek-R1, o1-mini.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, logprobs, top_logprobs, seed, structured_outputs

---

### Qwen: Qwen-Plus

**Model ID**: `qwen/qwen-plus`

**Description**: Qwen-Plus, based on the Qwen2.5 foundation model, is a 131K context model with a balanced performance, speed, and cost combination.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, seed, response_format, presence_penalty

---

### Qwen: Qwen2.5 VL 72B Instruct (free)

**Model ID**: `qwen/qwen2.5-vl-72b-instruct:free`

**Description**: Qwen2.5-VL is proficient in recognizing common objects such as flowers, birds, fish, and insects. It is also highly capable of analyzing texts, charts, icons, graphics, and layouts within images.

**Context Length**: 131,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, seed, response_format, presence_penalty, stop, frequency_penalty, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Sao10K: Llama 3.1 Euryale 70B v2.2

**Model ID**: `sao10k/l3.1-euryale-70b`

**Description**: Euryale L3.1 70B v2.2 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.1](/models/sao10k/l3-euryale-70b).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### Sao10K: Llama 3.3 Euryale 70B

**Model ID**: `sao10k/l3.3-euryale-70b`

**Description**: Euryale L3.3 70B is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k). It is the successor of [Euryale L3 70B v2.2](/models/sao10k/l3-euryale-70b).

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p, logit_bias

---

### SentientAGI: Dobby Mini Plus Llama 3.1 8B

**Model ID**: `sentientagi/dobby-mini-unhinged-plus-llama-3.1-8b`

**Description**: Dobby-Mini-Leashed-Llama-3.1-8B and Dobby-Mini-Unhinged-Llama-3.1-8B are language models fine-tuned from Llama-3.1-8B-Instruct. Dobby models have a strong conviction towards personal freedom, decentralization, and all things crypto — even when coerced to speak otherwise. 

Dobby-Mini-Leashed-Llama-3.1-8B and Dobby-Mini-Unhinged-Llama-3.1-8B have their own unique, uhh, personalities. The two versions are being released to be improved using the community’s feedback, which will steer the development of a 70B model.



**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs

---

### TheDrummer: Anubis Pro 105B V1

**Model ID**: `thedrummer/anubis-pro-105b-v1`

**Description**: Anubis Pro 105B v1 is an expanded and refined variant of Meta’s Llama 3.3 70B, featuring 50% additional layers and further fine-tuning to leverage its increased capacity. Designed for advanced narrative, roleplay, and instructional tasks, it demonstrates enhanced emotional intelligence, creativity, nuanced character portrayal, and superior prompt adherence compared to smaller models. Its larger parameter count allows for deeper contextual understanding and extended reasoning capabilities, optimized for engaging, intelligent, and coherent interactions.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1e-06/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, presence_penalty, frequency_penalty, repetition_penalty, top_k

---

### TheDrummer: Valkyrie 49B V1

**Model ID**: `thedrummer/valkyrie-49b-v1`

**Description**: Built on top of NVIDIA's Llama 3.3 Nemotron Super 49B, Valkyrie is TheDrummer's newest model drop for creative writing.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Max Completion: 131,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, presence_penalty, frequency_penalty, repetition_penalty, top_k

---

### xAI: Grok 2 1212

**Model ID**: `x-ai/grok-2-1212`

**Description**: Grok 2 1212 introduces significant enhancements to accuracy, instruction adherence, and multilingual support, making it a powerful and flexible choice for developers seeking a highly steerable, intelligent model.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $1e-05/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logprobs, top_logprobs, response_format

---

### xAI: Grok 3 Beta

**Model ID**: `x-ai/grok-3-beta`

**Description**: Grok 3 is the latest model from xAI. It's their flagship model that excels at enterprise use cases like data extraction, coding, and text summarization. Possesses deep domain knowledge in finance, healthcare, law, and science.

Excels in structured tasks and benchmarks like GPQA, LCB, and MMLU-Pro where it outperforms Grok 3 Mini even on high thinking. 

Note: That there are two xAI endpoints for this model. By default when using this model we will always route you to the base endpoint. If you want the fast endpoint you can add `provider: { sort: throughput}`, to sort by throughput instead. 


**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logprobs, top_logprobs, response_format

---

### xAI: Grok 3 Mini Beta

**Model ID**: `x-ai/grok-3-mini-beta`

**Description**: Grok 3 Mini is a lightweight, smaller thinking model. Unlike traditional models that generate answers immediately, Grok 3 Mini thinks before responding. It’s ideal for reasoning-heavy tasks that don’t demand extensive domain knowledge, and shines in math-specific and quantitative use cases, such as solving challenging puzzles or math problems.

Transparent "thinking" traces accessible. Defaults to low reasoning, can boost with setting `reasoning: { effort: "high" }`

Note: That there are two xAI endpoints for this model. By default when using this model we will always route you to the base endpoint. If you want the fast endpoint you can add `provider: { sort: throughput}`, to sort by throughput instead. 


**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $5e-07/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, stop, seed, logprobs, top_logprobs, response_format

---

### xAI: Grok Beta

**Model ID**: `x-ai/grok-beta`

**Description**: Grok Beta is xAI's experimental language model with state-of-the-art reasoning capabilities, best for complex and multi-step use cases.

It is the successor of [Grok 2](https://x.ai/blog/grok-2) with enhanced context length.

**Context Length**: 131,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-06/token
- Completion: $1.5e-05/token

**Provider Limits**:
- Max Context: 131,072 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logprobs, top_logprobs, response_format

---

### Meta: Llama 3.1 8B Instruct

**Model ID**: `meta-llama/llama-3.1-8b-instruct`

**Description**: Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 8B instruct-tuned version is fast and efficient.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 131,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.6e-08/token
- Completion: $3e-08/token

**Provider Limits**:
- Max Context: 131,000 tokens
- Max Completion: 131,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, min_p, repetition_penalty, top_k, structured_outputs

---

### Amazon: Nova Micro 1.0

**Model ID**: `amazon/nova-micro-v1`

**Description**: Amazon Nova Micro 1.0 is a text-only model that delivers the lowest latency responses in the Amazon Nova family of models at a very low cost. With a context length of 128K tokens and optimized for speed and cost, Amazon Nova Micro excels at tasks such as text summarization, translation, content classification, interactive chat, and brainstorming. It has  simple mathematical reasoning and coding abilities.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3.5e-08/token
- Completion: $1.4e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 5,120 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, top_k, stop

---

### Cohere: Command R

**Model ID**: `cohere/command-r`

**Description**: Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.

Read the launch post [here](https://txt.cohere.com/command-r/).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R (03-2024)

**Model ID**: `cohere/command-r-03-2024`

**Description**: Command-R is a 35B parameter model that performs conversational language tasks at a higher quality, more reliably, and with a longer context than previous models. It can be used for complex workflows like code generation, retrieval augmented generation (RAG), tool use, and agents.

Read the launch post [here](https://txt.cohere.com/command-r/).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R (08-2024)

**Model ID**: `cohere/command-r-08-2024`

**Description**: command-r-08-2024 is an update of the [Command R](/models/cohere/command-r) with improved performance for multilingual retrieval-augmented generation (RAG) and tool use. More broadly, it is better at math, code and reasoning and is competitive with the previous version of the larger Command R+ model.

Read the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R+

**Model ID**: `cohere/command-r-plus`

**Description**: Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).

It offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R+ (04-2024)

**Model ID**: `cohere/command-r-plus-04-2024`

**Description**: Command R+ is a new, 104B-parameter LLM from Cohere. It's useful for roleplay, general consumer usecases, and Retrieval Augmented Generation (RAG).

It offers multilingual support for ten key languages to facilitate global business operations. See benchmarks and the launch post [here](https://txt.cohere.com/command-r-plus-microsoft-azure/).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $1.5e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R+ (08-2024)

**Model ID**: `cohere/command-r-plus-08-2024`

**Description**: command-r-plus-08-2024 is an update of the [Command R+](/models/cohere/command-r-plus) with roughly 50% higher throughput and 25% lower latencies as compared to the previous Command R+ version, while keeping the hardware footprint the same.

Read the launch post [here](https://docs.cohere.com/changelog/command-gets-refreshed).

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### Cohere: Command R7B (12-2024)

**Model ID**: `cohere/command-r7b-12-2024`

**Description**: Command R7B (12-2024) is a small, fast update of the Command R+ model, delivered in December 2024. It excels at RAG, tool use, agents, and similar tasks requiring complex reasoning and multiple steps.

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3.75e-08/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### DeepSeek: R1

**Model ID**: `deepseek/deepseek-r1`

**Description**: DeepSeek R1 is here: Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.

Fully open-source model & [technical report](https://api-docs.deepseek.com/news/news250120).

MIT licensed: Distill & commercialize freely!

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4.5e-07/token
- Completion: $2.15e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, logit_bias, top_logprobs, response_format, structured_outputs, logprobs, repetition_penalty, tools, tool_choice

---

### DeepSeek: R1 0528

**Model ID**: `deepseek/deepseek-r1-0528`

**Description**: May 28th update to the [original DeepSeek R1](/deepseek/deepseek-r1) Performance on par with [OpenAI o1](/openai/o1), but open-sourced and with fully open reasoning tokens. It's 671B parameters in size, with 37B active in an inference pass.

Fully open-source model.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $2.15e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, logprobs, top_logprobs, tools, tool_choice, structured_outputs

---

### Meta: Llama 3.3 8B Instruct (free)

**Model ID**: `meta-llama/llama-3.3-8b-instruct:free`

**Description**: A lightweight and ultra-fast variant of Llama 3.3 70B, for use when quick response times are needed most.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,028 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, structured_outputs, response_format, repetition_penalty, top_k

---

### Meta: Llama 4 Maverick (free)

**Model ID**: `meta-llama/llama-4-maverick:free`

**Description**: Llama 4 Maverick 17B Instruct (128E) is a high-capacity multimodal language model from Meta, built on a mixture-of-experts (MoE) architecture with 128 experts and 17 billion active parameters per forward pass (400B total). It supports multilingual text and image input, and produces multilingual text and code output across 12 supported languages. Optimized for vision-language tasks, Maverick is instruction-tuned for assistant-like behavior, image reasoning, and general-purpose multimodal interaction.

Maverick features early fusion for native multimodality and a 1 million token context window. It was trained on a curated mixture of public, licensed, and Meta-platform data, covering ~22 trillion tokens, with a knowledge cutoff in August 2024. Released on April 5, 2025 under the Llama 4 Community License, Maverick is suited for research and commercial applications requiring advanced multimodal understanding and high model throughput.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, tools, tool_choice

---

### Microsoft: Phi-3 Medium 128K Instruct

**Model ID**: `microsoft/phi-3-medium-128k-instruct`

**Description**: Phi-3 128K Medium is a powerful 14-billion parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.

At time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. In the MMLU-Pro eval, the model even comes close to a Llama3 70B level of performance.

For 4k context length, try [Phi-3 Medium 4K](/models/microsoft/phi-3-medium-4k-instruct).

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $1e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p

---

### Microsoft: Phi-3 Mini 128K Instruct

**Model ID**: `microsoft/phi-3-mini-128k-instruct`

**Description**: Phi-3 Mini is a powerful 3.8B parameter model designed for advanced language understanding, reasoning, and instruction following. Optimized through supervised fine-tuning and preference adjustments, it excels in tasks involving common sense, mathematics, logical reasoning, and code processing.

At time of release, Phi-3 Medium demonstrated state-of-the-art performance among lightweight models. This model is static, trained on an offline dataset with an October 2023 cutoff date.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p

---

### Microsoft: Phi-3.5 Mini 128K Instruct

**Model ID**: `microsoft/phi-3.5-mini-128k-instruct`

**Description**: Phi-3.5 models are lightweight, state-of-the-art open models. These models were trained with Phi-3 datasets that include both synthetic data and the filtered, publicly available websites data, with a focus on high quality and reasoning-dense properties. Phi-3.5 Mini uses 3.8B parameters, and is a dense decoder-only transformer model using the same tokenizer as [Phi-3 Mini](/models/microsoft/phi-3-mini-128k-instruct).

The models underwent a rigorous enhancement process, incorporating both supervised fine-tuning, proximal policy optimization, and direct preference optimization to ensure precise instruction adherence and robust safety measures. When assessed against benchmarks that test common sense, language understanding, math, code, long context and logical reasoning, Phi-3.5 models showcased robust and state-of-the-art performance among models with less than 13 billion parameters.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p

---

### MiniMax: MiniMax M1 (extended)

**Model ID**: `minimax/minimax-m1:extended`

**Description**: MiniMax-M1 is a large-scale, open-weight reasoning model designed for extended context and high-efficiency inference. It leverages a hybrid Mixture-of-Experts (MoE) architecture paired with a custom "lightning attention" mechanism, allowing it to process long sequences—up to 1 million tokens—while maintaining competitive FLOP efficiency. With 456 billion total parameters and 45.9B active per token, this variant is optimized for complex, multi-step reasoning tasks.

Trained via a custom reinforcement learning pipeline (CISPO), M1 excels in long-context understanding, software engineering, agentic tool use, and mathematical reasoning. Benchmarks show strong performance across FullStackBench, SWE-bench, MATH, GPQA, and TAU-Bench, often outperforming other open models like DeepSeek R1 and Qwen3-235B.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5.5e-07/token
- Completion: $2.2e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### Mistral Large

**Model ID**: `mistralai/mistral-large`

**Description**: This is Mistral AI's flagship model, Mistral Large 2 (version `mistral-large-2407`). It's a proprietary weights-available model and excels at reasoning, code, JSON, chat, and more. Read the launch announcement [here](https://mistral.ai/news/mistral-large-2407/).

It supports dozens of languages including French, German, Spanish, Italian, Portuguese, Arabic, Hindi, Russian, Chinese, Japanese, and Korean, along with 80+ coding languages including Python, Java, C, C++, JavaScript, and Bash. Its long context window allows precise information recall from large documents.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, response_format, stop, seed, frequency_penalty, presence_penalty, structured_outputs

---

### Mistral: Devstral Small

**Model ID**: `mistralai/devstral-small`

**Description**: Devstral-Small-2505 is a 24B parameter agentic LLM fine-tuned from Mistral-Small-3.1, jointly developed by Mistral AI and All Hands AI for advanced software engineering tasks. It is optimized for codebase exploration, multi-file editing, and integration into coding agents, achieving state-of-the-art results on SWE-Bench Verified (46.8%).

Devstral supports a 128k context window and uses a custom Tekken tokenizer. It is text-only, with the vision encoder removed, and is suitable for local deployment on high-end consumer hardware (e.g., RTX 4090, 32GB RAM Macs). Devstral is best used in agentic workflows via the OpenHands scaffold and is compatible with inference frameworks like vLLM, Transformers, and Ollama. It is released under the Apache 2.0 license.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-08/token
- Completion: $1.2e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p, tools, tool_choice, structured_outputs

---

### Mistral: Ministral 8B

**Model ID**: `mistralai/ministral-8b`

**Description**: Ministral 8B is an 8B parameter model featuring a unique interleaved sliding-window attention pattern for faster, memory-efficient inference. Designed for edge use cases, it supports up to 128k context length and excels in knowledge and reasoning tasks. It outperforms peers in the sub-10B category, making it perfect for low-latency, privacy-first applications.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### OpenAI: ChatGPT-4o

**Model ID**: `openai/chatgpt-4o-latest`

**Description**: OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.

OpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-06/token
- Completion: $1.5e-05/token
- Image: $0.007225/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4 Turbo

**Model ID**: `openai/gpt-4-turbo`

**Description**: The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.

Training data: up to December 2023.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-05/token
- Completion: $3e-05/token
- Image: $0.01445/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-4 Turbo (older v1106)

**Model ID**: `openai/gpt-4-1106-preview`

**Description**: The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling.

Training data: up to April 2023.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-05/token
- Completion: $3e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4 Turbo Preview

**Model ID**: `openai/gpt-4-turbo-preview`

**Description**: The preview GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Dec 2023.

**Note:** heavily rate limited by OpenAI while in preview.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-05/token
- Completion: $3e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4.5 (Preview)

**Model ID**: `openai/gpt-4.5-preview`

**Description**: GPT-4.5 (Preview) is a research preview of OpenAI’s latest language model, designed to advance capabilities in reasoning, creativity, and multi-turn conversation. It builds on previous iterations with improvements in world knowledge, contextual coherence, and the ability to follow user intent more effectively.

The model demonstrates enhanced performance in tasks that require open-ended thinking, problem-solving, and communication. Early testing suggests it is better at generating nuanced responses, maintaining long-context coherence, and reducing hallucinations compared to earlier versions.

This research preview is intended to help evaluate GPT-4.5’s strengths and limitations in real-world use cases as OpenAI continues to refine and develop future models. Read more at the [blog post here.](https://openai.com/index/introducing-gpt-4-5/)

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $7.5e-05/token
- Completion: $0.00015/token
- Image: $0.108375/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o

**Model ID**: `openai/gpt-4o`

**Description**: GPT-4o ("o" for "omni") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.

For benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)

#multimodal

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token
- Image: $0.003613/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o (2024-05-13)

**Model ID**: `openai/gpt-4o-2024-05-13`

**Description**: GPT-4o ("o" for "omni") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.

For benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)

#multimodal

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-06/token
- Completion: $1.5e-05/token
- Image: $0.007225/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o (2024-08-06)

**Model ID**: `openai/gpt-4o-2024-08-06`

**Description**: The 2024-08-06 version of GPT-4o offers improved performance in structured outputs, with the ability to supply a JSON schema in the respone_format. Read more [here](https://openai.com/index/introducing-structured-outputs-in-the-api/).

GPT-4o ("o" for "omni") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.

For benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token
- Image: $0.003613/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o (2024-11-20)

**Model ID**: `openai/gpt-4o-2024-11-20`

**Description**: The 2024-11-20 version of GPT-4o offers a leveled-up creative writing ability with more natural, engaging, and tailored writing to improve relevance & readability. It’s also better at working with uploaded files, providing deeper insights & more thorough responses.

GPT-4o ("o" for "omni") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token
- Image: $0.003613/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o (extended)

**Model ID**: `openai/gpt-4o:extended`

**Description**: GPT-4o ("o" for "omni") is OpenAI's latest AI model, supporting both text and image inputs with text outputs. It maintains the intelligence level of [GPT-4 Turbo](/models/openai/gpt-4-turbo) while being twice as fast and 50% more cost-effective. GPT-4o also offers improved performance in processing non-English languages and enhanced visual capabilities.

For benchmarking against other models, it was briefly called ["im-also-a-good-gpt2-chatbot"](https://twitter.com/LiamFedus/status/1790064963966370209)

#multimodal

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-06/token
- Completion: $1.8e-05/token
- Image: $0.007225/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 64,000 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o Search Preview

**Model ID**: `openai/gpt-4o-search-preview`

**Description**: GPT-4o Search Previewis a specialized model for web search in Chat Completions. It is trained to understand and execute web search queries.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token
- Image: $0.003613/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: web_search_options, max_tokens, response_format, structured_outputs

---

### OpenAI: GPT-4o-mini

**Model ID**: `openai/gpt-4o-mini`

**Description**: GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.

As their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.

GPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).

Check out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.

#multimodal

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.000217/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs, tools, tool_choice

---

### OpenAI: GPT-4o-mini (2024-07-18)

**Model ID**: `openai/gpt-4o-mini-2024-07-18`

**Description**: GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.

As their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.

GPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).

Check out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.

#multimodal

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image, file
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.007225/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, web_search_options, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-4o-mini Search Preview

**Model ID**: `openai/gpt-4o-mini-search-preview`

**Description**: GPT-4o mini Search Preview is a specialized model for web search in Chat Completions. It is trained to understand and execute web search queries.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $6e-07/token
- Image: $0.000217/image

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 16,384 tokens
- Moderated: Yes

**Supported Parameters**: web_search_options, max_tokens, response_format, structured_outputs

---

### OpenAI: o1-mini

**Model ID**: `openai/o1-mini`

**Description**: The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.

The o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).

Note: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 65,536 tokens
- Moderated: Yes

**Supported Parameters**: seed, max_tokens

---

### OpenAI: o1-mini (2024-09-12)

**Model ID**: `openai/o1-mini-2024-09-12`

**Description**: The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.

The o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).

Note: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-06/token
- Completion: $4.4e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 65,536 tokens
- Moderated: Yes

**Supported Parameters**: seed, max_tokens

---

### OpenAI: o1-preview

**Model ID**: `openai/o1-preview`

**Description**: The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.

The o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).

Note: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $6e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 32,768 tokens
- Moderated: Yes

**Supported Parameters**: seed, max_tokens

---

### OpenAI: o1-preview (2024-09-12)

**Model ID**: `openai/o1-preview-2024-09-12`

**Description**: The latest and strongest model family from OpenAI, o1 is designed to spend more time thinking before responding.

The o1 models are optimized for math, science, programming, and other STEM-related tasks. They consistently exhibit PhD-level accuracy on benchmarks in physics, chemistry, and biology. Learn more in the [launch announcement](https://openai.com/o1).

Note: This model is currently experimental and not suitable for production use-cases, and may be heavily rate-limited.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-05/token
- Completion: $6e-05/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 32,768 tokens
- Moderated: Yes

**Supported Parameters**: seed, max_tokens

---

### Perplexity: R1 1776

**Model ID**: `perplexity/r1-1776`

**Description**: R1 1776 is a version of DeepSeek-R1 that has been post-trained to remove censorship constraints related to topics restricted by the Chinese government. The model retains its original reasoning capabilities while providing direct responses to a wider range of queries. R1 1776 is an offline chat model that does not use the perplexity search subsystem.

The model was tested on a multilingual dataset of over 1,000 examples covering sensitive topics to measure its likelihood of refusal or overly filtered responses. [Evaluation Results](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/GiN2VqC5hawUgAGJ6oHla.png) Its performance on math and reasoning benchmarks remains similar to the base R1 model. [Reasoning Performance](https://cdn-uploads.huggingface.co/production/uploads/675c8332d01f593dc90817f5/n4Z9Byqp2S7sKUvCvI40R.png)

Read more on the [Blog Post](https://perplexity.ai/hub/blog/open-sourcing-r1-1776)

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, top_k, frequency_penalty, presence_penalty, stop, repetition_penalty, logit_bias, min_p, response_format

---

### Perplexity: Sonar Deep Research

**Model ID**: `perplexity/sonar-deep-research`

**Description**: Sonar Deep Research is a research-focused model designed for multi-step retrieval, synthesis, and reasoning across complex topics. It autonomously searches, reads, and evaluates sources, refining its approach as it gathers information. This enables comprehensive report generation across domains like finance, technology, health, and current events.

Notes on Pricing ([Source](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-deep-research)) 
- Input tokens comprise of Prompt tokens (user prompt) + Citation tokens (these are processed tokens from running searches)
- Deep Research runs multiple searches to conduct exhaustive research. Searches are priced at $5/1000 searches. A request that does 30 searches will cost $0.15 in this step.
- Reasoning is a distinct step in Deep Research since it does extensive automated reasoning through all the material it gathers during its research phase. Reasoning tokens here are a bit different than the CoTs in the answer - these are tokens that we use to reason through the research material prior to generating the outputs via the CoTs. Reasoning tokens are priced at $3/1M tokens

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token
- Internal Reasoning: $3e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, top_k, frequency_penalty, presence_penalty

---

### Perplexity: Sonar Reasoning Pro

**Model ID**: `perplexity/sonar-reasoning-pro`

**Description**: Note: Sonar Pro pricing includes Perplexity search pricing. See [details here](https://docs.perplexity.ai/guides/pricing#detailed-pricing-breakdown-for-sonar-reasoning-pro-and-sonar-pro)

Sonar Reasoning Pro is a premier reasoning model powered by DeepSeek R1 with Chain of Thought (CoT). Designed for advanced use cases, it supports in-depth, multi-step queries with a larger context window and can surface more citations per search, enabling more comprehensive and extensible responses.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $8e-06/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, web_search_options, top_k, frequency_penalty, presence_penalty

---

### Qwen: Qwen2.5 VL 32B Instruct

**Model ID**: `qwen/qwen2.5-vl-32b-instruct`

**Description**: Qwen2.5-VL-32B is a multimodal vision-language model fine-tuned through reinforcement learning for enhanced mathematical reasoning, structured outputs, and visual problem-solving capabilities. It excels at visual analysis tasks, including object recognition, textual interpretation within images, and precise event localization in extended videos. Qwen2.5-VL-32B demonstrates state-of-the-art performance across multimodal benchmarks such as MMMU, MathVista, and VideoMME, while maintaining strong reasoning and clarity in text-based tasks like MMLU, mathematical problem-solving, and code generation.

**Context Length**: 128,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $9e-07/token
- Completion: $9e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs

---

### Qwen: Qwen3 8B

**Model ID**: `qwen/qwen3-8b`

**Description**: Qwen3-8B is a dense 8.2B parameter causal language model from the Qwen3 series, designed for both reasoning-heavy tasks and efficient dialogue. It supports seamless switching between "thinking" mode for math, coding, and logical inference, and "non-thinking" mode for general conversation. The model is fine-tuned for instruction-following, agent integration, creative writing, and multilingual use across 100+ languages and dialects. It natively supports a 32K token context window and can extend to 131K tokens with YaRN scaling.

**Context Length**: 128,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3.5e-08/token
- Completion: $1.38e-07/token

**Provider Limits**:
- Max Context: 128,000 tokens
- Max Completion: 20,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### Perplexity: Llama 3.1 Sonar 70B Online

**Model ID**: `perplexity/llama-3.1-sonar-large-128k-online`

**Description**: Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.

This is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-large-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online

**Context Length**: 127,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $1e-06/token

**Provider Limits**:
- Max Context: 127,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, frequency_penalty, presence_penalty

---

### Perplexity: Llama 3.1 Sonar 8B Online

**Model ID**: `perplexity/llama-3.1-sonar-small-128k-online`

**Description**: Llama 3.1 Sonar is Perplexity's latest model family. It surpasses their earlier Sonar models in cost-efficiency, speed, and performance.

This is the online version of the [offline chat model](/models/perplexity/llama-3.1-sonar-small-128k-chat). It is focused on delivering helpful, up-to-date, and factual responses. #online

**Context Length**: 127,072 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 127,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, frequency_penalty, presence_penalty

---

### Perplexity: Sonar

**Model ID**: `perplexity/sonar`

**Description**: Sonar is lightweight, affordable, fast, and simple to use — now featuring citations and the ability to customize sources. It is designed for companies seeking to integrate lightweight question-and-answer features optimized for speed.

**Context Length**: 127,072 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $1e-06/token

**Provider Limits**:
- Max Context: 127,072 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, web_search_options, top_k, frequency_penalty, presence_penalty

---

### Perplexity: Sonar Reasoning

**Model ID**: `perplexity/sonar-reasoning`

**Description**: Sonar Reasoning is a reasoning model provided by Perplexity based on [DeepSeek R1](/deepseek/deepseek-r1).

It allows developers to utilize long chain of thought with built-in web search. Sonar Reasoning is uncensored and hosted in US datacenters. 

**Context Length**: 127,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $5e-06/token

**Provider Limits**:
- Max Context: 127,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, web_search_options, top_k, frequency_penalty, presence_penalty

---

### Anthropic: Claude v2.0

**Model ID**: `anthropic/claude-2.0`

**Description**: Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.

**Context Length**: 100,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 100,000 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Anthropic: Claude v2.0 (self-moderated)

**Model ID**: `anthropic/claude-2.0:beta`

**Description**: Anthropic's flagship model. Superior performance on tasks that require complex reasoning. Supports hundreds of pages of text.

**Context Length**: 100,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-06/token
- Completion: $2.4e-05/token

**Provider Limits**:
- Max Context: 100,000 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, stop

---

### Agentica: Deepcoder 14B Preview (free)

**Model ID**: `agentica-org/deepcoder-14b-preview:free`

**Description**: DeepCoder-14B-Preview is a 14B parameter code generation model fine-tuned from DeepSeek-R1-Distill-Qwen-14B using reinforcement learning with GRPO+ and iterative context lengthening. It is optimized for long-context program synthesis and achieves strong performance across coding benchmarks, including 60.6% on LiveCodeBench v5, competitive with models like o3-Mini

**Context Length**: 96,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 96,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Google: Gemma 3 12B (free)

**Model ID**: `google/gemma-3-12b-it:free`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 12B is the second largest in the family of Gemma 3 models after [Gemma 3 27B](google/gemma-3-27b-it)

**Context Length**: 96,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 96,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, response_format, structured_outputs

---

### Google: Gemma 3 27B (free)

**Model ID**: `google/gemma-3-27b-it:free`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Gemma 3 27B is Google's latest open source model, successor to [Gemma 2](google/gemma-2-27b-it)

**Context Length**: 96,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 96,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, response_format, structured_outputs

---

### Google: Gemma 3 4B (free)

**Model ID**: `google/gemma-3-4b-it:free`

**Description**: Gemma 3 introduces multimodality, supporting vision-language input and text outputs. It handles context windows up to 128k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling.

**Context Length**: 96,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 96,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs, response_format, structured_outputs

---

### Mistral: Mistral Small 3.1 24B (free)

**Model ID**: `mistralai/mistral-small-3.1-24b-instruct:free`

**Description**: Mistral Small 3.1 24B Instruct is an upgraded variant of Mistral Small 3 (2501), featuring 24 billion parameters with advanced multimodal capabilities. It provides state-of-the-art performance in text-based reasoning and vision tasks, including image analysis, programming, mathematical reasoning, and multilingual support across dozens of languages. Equipped with an extensive 128k token context window and optimized for efficient local inference, it supports use cases such as conversational agents, function calling, long-document comprehension, and privacy-sensitive deployments.

**Context Length**: 96,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 96,000 tokens
- Max Completion: 96,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Mixtral 8x22B Instruct

**Model ID**: `mistralai/mixtral-8x22b-instruct`

**Description**: Mistral's official instruct fine-tuned version of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b). It uses 39B active parameters out of 141B, offering unparalleled cost efficiency for its size. Its strengths include:
- strong math, coding, and reasoning
- large context length (64k)
- fluency in English, French, Italian, German, and Spanish

See benchmarks on the launch announcement [here](https://mistral.ai/news/mixtral-8x22b/).
#moe

**Context Length**: 65,536 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $9e-07/token
- Completion: $9e-07/token

**Provider Limits**:
- Max Context: 65,536 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs

---

### WizardLM-2 8x22B

**Model ID**: `microsoft/wizardlm-2-8x22b`

**Description**: WizardLM-2 8x22B is Microsoft AI's most advanced Wizard model. It demonstrates highly competitive performance compared to leading proprietary models, and it consistently outperforms all existing state-of-the-art opensource models.

It is an instruct finetune of [Mixtral 8x22B](/models/mistralai/mixtral-8x22b).

To read more about the model release, [click here](https://wizardlm.github.io/WizardLM2/).

#moe

**Context Length**: 65,536 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4.8e-07/token
- Completion: $4.8e-07/token

**Provider Limits**:
- Max Context: 65,536 tokens
- Max Completion: 65,536 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### DeepSeek: R1 Distill Qwen 14B

**Model ID**: `deepseek/deepseek-r1-distill-qwen-14b`

**Description**: DeepSeek R1 Distill Qwen 14B is a distilled large language model based on [Qwen 2.5 14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.

Other benchmark results include:

- AIME 2024 pass@1: 69.7
- MATH-500 pass@1: 93.9
- CodeForces Rating: 1481

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 64,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 64,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, seed, stop, frequency_penalty, presence_penalty, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### DeepSeek: R1 Distill Qwen 14B (free)

**Model ID**: `deepseek/deepseek-r1-distill-qwen-14b:free`

**Description**: DeepSeek R1 Distill Qwen 14B is a distilled large language model based on [Qwen 2.5 14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.

Other benchmark results include:

- AIME 2024 pass@1: 69.7
- MATH-500 pass@1: 93.9
- CodeForces Rating: 1481

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 64,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 64,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Magistral Medium 2506

**Model ID**: `mistralai/magistral-medium-2506`

**Description**: Magistral is Mistral's first reasoning model. It is ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $5e-06/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Mistral: Magistral Medium 2506 (thinking)

**Model ID**: `mistralai/magistral-medium-2506:thinking`

**Description**: Magistral is Mistral's first reasoning model. It is ideal for general purpose use requiring longer thought processing and better accuracy than with non-reasoning LLMs. From legal research and financial forecasting to software development and creative storytelling — this model solves multi-step challenges where transparency and precision are critical.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $5e-06/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Qwen: Qwen3 14B

**Model ID**: `qwen/qwen3-14b`

**Description**: Qwen3-14B is a dense 14.8B parameter causal language model from the Qwen3 series, designed for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, programming, and logical inference, and a "non-thinking" mode for general-purpose conversation. The model is fine-tuned for instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-08/token
- Completion: $2.4e-07/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, presence_penalty, frequency_penalty, repetition_penalty, top_k, tools, tool_choice, stop, response_format, seed, min_p, logit_bias, logprobs, top_logprobs

---

### Qwen: Qwen3 14B (free)

**Model ID**: `qwen/qwen3-14b:free`

**Description**: Qwen3-14B is a dense 14.8B parameter causal language model from the Qwen3 series, designed for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, programming, and logical inference, and a "non-thinking" mode for general-purpose conversation. The model is fine-tuned for instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen: Qwen3 235B A22B

**Model ID**: `qwen/qwen3-235b-a22b`

**Description**: Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a "thinking" mode for complex reasoning, math, and code tasks, and a "non-thinking" mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.3e-07/token
- Completion: $6e-07/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, seed, presence_penalty, frequency_penalty, repetition_penalty, top_k, tools, tool_choice, stop, response_format, structured_outputs, logit_bias, logprobs, top_logprobs, min_p

---

### Qwen: Qwen3 235B A22B (free)

**Model ID**: `qwen/qwen3-235b-a22b:free`

**Description**: Qwen3-235B-A22B is a 235B parameter mixture-of-experts (MoE) model developed by Qwen, activating 22B parameters per forward pass. It supports seamless switching between a "thinking" mode for complex reasoning, math, and code tasks, and a "non-thinking" mode for general conversational efficiency. The model demonstrates strong reasoning ability, multilingual support (100+ languages and dialects), advanced instruction-following, and agent tool-calling capabilities. It natively handles a 32K token context window and extends up to 131K tokens using YaRN-based scaling.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen: Qwen3 30B A3B

**Model ID**: `qwen/qwen3-30b-a3b`

**Description**: Qwen3, the latest generation in the Qwen large language model series, features both dense and mixture-of-experts (MoE) architectures to excel in reasoning, multilingual support, and advanced agent tasks. Its unique ability to switch seamlessly between a thinking mode for complex reasoning and a non-thinking mode for efficient dialogue ensures versatile, high-quality performance.

Significantly outperforming prior models like QwQ and Qwen2.5, Qwen3 delivers superior mathematics, coding, commonsense reasoning, creative writing, and interactive dialogue capabilities. The Qwen3-30B-A3B variant includes 30.5 billion parameters (3.3 billion activated), 48 layers, 128 experts (8 activated per task), and supports up to 131K token contexts with YaRN, setting a new standard among open-source models.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-08/token
- Completion: $2.9e-07/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,960 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, response_format, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, seed, min_p, structured_outputs, logit_bias, logprobs, top_logprobs

---

### Qwen: Qwen3 30B A3B (free)

**Model ID**: `qwen/qwen3-30b-a3b:free`

**Description**: Qwen3, the latest generation in the Qwen large language model series, features both dense and mixture-of-experts (MoE) architectures to excel in reasoning, multilingual support, and advanced agent tasks. Its unique ability to switch seamlessly between a thinking mode for complex reasoning and a non-thinking mode for efficient dialogue ensures versatile, high-quality performance.

Significantly outperforming prior models like QwQ and Qwen2.5, Qwen3 delivers superior mathematics, coding, commonsense reasoning, creative writing, and interactive dialogue capabilities. The Qwen3-30B-A3B variant includes 30.5 billion parameters (3.3 billion activated), 48 layers, 128 experts (8 activated per task), and supports up to 131K token contexts with YaRN, setting a new standard among open-source models.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen: Qwen3 32B

**Model ID**: `qwen/qwen3-32b`

**Description**: Qwen3-32B is a dense 32.8B parameter causal language model from the Qwen3 series, optimized for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, coding, and logical inference, and a "non-thinking" mode for faster, general-purpose conversation. The model demonstrates strong performance in instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling. 

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $3e-07/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, response_format, top_logprobs, logprobs, logit_bias, seed, tools, tool_choice, repetition_penalty, top_k, min_p, structured_outputs

---

### Qwen: Qwen3 32B (free)

**Model ID**: `qwen/qwen3-32b:free`

**Description**: Qwen3-32B is a dense 32.8B parameter causal language model from the Qwen3 series, optimized for both complex reasoning and efficient dialogue. It supports seamless switching between a "thinking" mode for tasks like math, coding, and logical inference, and a "non-thinking" mode for faster, general-purpose conversation. The model demonstrates strong performance in instruction-following, agent tool use, creative writing, and multilingual tasks across 100+ languages and dialects. It natively handles 32K token contexts and can extend to 131K tokens using YaRN-based scaling. 

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen: Qwen3 8B (free)

**Model ID**: `qwen/qwen3-8b:free`

**Description**: Qwen3-8B is a dense 8.2B parameter causal language model from the Qwen3 series, designed for both reasoning-heavy tasks and efficient dialogue. It supports seamless switching between "thinking" mode for math, coding, and logical inference, and "non-thinking" mode for general conversation. The model is fine-tuned for instruction-following, agent integration, creative writing, and multilingual use across 100+ languages and dialects. It natively supports a 32K token context window and can extend to 131K tokens with YaRN scaling.

**Context Length**: 40,960 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,960 tokens
- Max Completion: 40,960 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Magistral Small 2506

**Model ID**: `mistralai/magistral-small-2506`

**Description**: Magistral Small is a 24B parameter instruction-tuned model based on Mistral-Small-3.1 (2503), enhanced through supervised fine-tuning on traces from Magistral Medium and further refined via reinforcement learning. It is optimized for reasoning and supports a wide multilingual range, including over 20 languages.

**Context Length**: 40,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 40,000 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, reasoning, include_reasoning, structured_outputs, response_format, stop, frequency_penalty, presence_penalty, seed

---

### Qwen: QwQ 32B (free)

**Model ID**: `qwen/qwq-32b:free`

**Description**: QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. QwQ-32B is the medium-sized reasoning model, which is capable of achieving competitive performance against state-of-the-art reasoning models, e.g., DeepSeek-R1, o1-mini.

**Context Length**: 40,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 40,000 tokens
- Max Completion: 40,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### 01.AI: Yi Large

**Model ID**: `01-ai/yi-large`

**Description**: The Yi Large model was designed by 01.AI with the following usecases in mind: knowledge search, data classification, human-like chat bots, and customer service.

It stands out for its multilingual proficiency, particularly in Spanish, Chinese, Japanese, German, and French.

Check out the [launch announcement](https://01-ai.github.io/blog/01.ai-yi-large-llm-launch) to learn more.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $3e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs

---

### AionLabs: Aion-RP 1.0 (8B)

**Model ID**: `aion-labs/aion-rp-llama-3.1-8b`

**Description**: Aion-RP-Llama-3.1-8B ranks the highest in the character evaluation portion of the RPBench-Auto benchmark, a roleplaying-specific variant of Arena-Hard-Auto, where LLMs evaluate each other’s responses. It is a fine-tuned base model rather than an instruct model, designed to produce more natural and varied writing.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p

---

### Arcee AI: Arcee Blitz

**Model ID**: `arcee-ai/arcee-blitz`

**Description**: Arcee Blitz is a 24 B‑parameter dense model distilled from DeepSeek and built on Mistral architecture for "everyday" chat. The distillation‑plus‑refinement pipeline trims compute while keeping DeepSeek‑style reasoning, so Blitz punches above its weight on MMLU, GSM‑8K and BBH compared with other mid‑size open models. With a default 128 k context window and competitive throughput, it serves as a cost‑efficient workhorse for summarization, brainstorming and light code help. Internally, Arcee uses Blitz as the default writer in Conductor pipelines when the heavier Virtuoso line is not required. Users therefore get near‑70 B quality at ~⅓ the latency and price. 

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4.5e-07/token
- Completion: $7.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Arcee AI: Caller Large

**Model ID**: `arcee-ai/caller-large`

**Description**: Caller Large is Arcee's specialist "function‑calling" SLM built to orchestrate external tools and APIs. Instead of maximizing next‑token accuracy, training focuses on structured JSON outputs, parameter extraction and multi‑step tool chains, making Caller a natural choice for retrieval‑augmented generation, robotic process automation or data‑pull chatbots. It incorporates a routing head that decides when (and how) to invoke a tool versus answering directly, reducing hallucinated calls. The model is already the backbone of Arcee Conductor's auto‑tool mode, where it parses user intent, emits clean function signatures and hands control back once the tool response is ready. Developers thus gain an OpenAI‑style function‑calling UX without handing requests to a frontier‑scale model. 

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5.5e-07/token
- Completion: $8.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Arcee AI: Coder Large

**Model ID**: `arcee-ai/coder-large`

**Description**: Coder‑Large is a 32 B‑parameter offspring of Qwen 2.5‑Instruct that has been further trained on permissively‑licensed GitHub, CodeSearchNet and synthetic bug‑fix corpora. It supports a 32k context window, enabling multi‑file refactoring or long diff review in a single call, and understands 30‑plus programming languages with special attention to TypeScript, Go and Terraform. Internal benchmarks show 5–8 pt gains over CodeLlama‑34 B‑Python on HumanEval and competitive BugFix scores thanks to a reinforcement pass that rewards compilable output. The model emits structured explanations alongside code blocks by default, making it suitable for educational tooling as well as production copilot scenarios. Cost‑wise, Together AI prices it well below proprietary incumbents, so teams can scale interactive coding without runaway spend. 

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### ArliAI: QwQ 32B RpR v1 (free)

**Model ID**: `arliai/qwq-32b-arliai-rpr-v1:free`

**Description**: QwQ-32B-ArliAI-RpR-v1 is a 32B parameter model fine-tuned from Qwen/QwQ-32B using a curated creative writing and roleplay dataset originally developed for the RPMax series. It is designed to maintain coherence and reasoning across long multi-turn conversations by introducing explicit reasoning steps per dialogue turn, generated and refined using the base model itself.

The model was trained using RS-QLORA+ on 8K sequence lengths and supports up to 128K context windows (with practical performance around 32K). It is optimized for creative roleplay and dialogue generation, with an emphasis on minimizing cross-context repetition while preserving stylistic diversity.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Dolphin3.0 Mistral 24B (free)

**Model ID**: `cognitivecomputations/dolphin3.0-mistral-24b:free`

**Description**: Dolphin 3.0 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.

Dolphin aims to be a general purpose instruct model, similar to the models behind ChatGPT, Claude, Gemini. 

Part of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Dolphin3.0 R1 Mistral 24B (free)

**Model ID**: `cognitivecomputations/dolphin3.0-r1-mistral-24b:free`

**Description**: Dolphin 3.0 R1 is the next generation of the Dolphin series of instruct-tuned models.  Designed to be the ultimate general purpose local model, enabling coding, math, agentic, function calling, and general use cases.

The R1 version has been trained for 3 epochs to reason using 800k reasoning traces from the Dolphin-R1 dataset.

Dolphin aims to be a general purpose reasoning instruct model, similar to the models behind ChatGPT, Claude, Gemini.

Part of the [Dolphin 3.0 Collection](https://huggingface.co/collections/cognitivecomputations/dolphin-30-677ab47f73d7ff66743979a3) Curated and trained by [Eric Hartford](https://huggingface.co/ehartford), [Ben Gitter](https://huggingface.co/bigstorm), [BlouseJury](https://huggingface.co/BlouseJury) and [Cognitive Computations](https://huggingface.co/cognitivecomputations)

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Google: Gemma 3 1B (free)

**Model ID**: `google/gemma-3-1b-it:free`

**Description**: Gemma 3 1B is the smallest of the new Gemma 3 family. It handles context windows up to 32k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities, including structured outputs and function calling. Note: Gemma 3 1B is not multimodal. For the smallest multimodal Gemma 3 model, please see [Gemma 3 4B](google/gemma-3-4b-it)

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Liquid: LFM 3B

**Model ID**: `liquid/lfm-3b`

**Description**: Liquid's LFM 3B delivers incredible performance for its size. It positions itself as first place among 3B parameter transformers, hybrids, and RNN models It is also on par with Phi-3.5-mini on multiple benchmarks, while being 18.4% smaller.

LFM-3B is the ideal choice for mobile and other edge text-based applications.

See the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-08/token
- Completion: $2e-08/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty

---

### Liquid: LFM 40B MoE

**Model ID**: `liquid/lfm-40b`

**Description**: Liquid's 40.3B Mixture of Experts (MoE) model. Liquid Foundation Models (LFMs) are large neural networks built with computational units rooted in dynamic systems.

LFMs are general-purpose AI models that can be used to model any kind of sequential data, including video, audio, text, time series, and signals.

See the [launch announcement](https://www.liquid.ai/liquid-foundation-models) for benchmarks and more info.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-07/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, logprobs, top_logprobs, response_format

---

### Liquid: LFM 7B

**Model ID**: `liquid/lfm-7b`

**Description**: LFM-7B, a new best-in-class language model. LFM-7B is designed for exceptional chat capabilities, including languages like Arabic and Japanese. Powered by the Liquid Foundation Model (LFM) architecture, it exhibits unique features like low memory footprint and fast inference speed. 

LFM-7B is the world’s best-in-class multilingual language model in English, Arabic, and Japanese.

See the [launch announcement](https://www.liquid.ai/lfm-7b) for benchmarks and more info.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-08/token
- Completion: $1e-08/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, logprobs, top_logprobs, response_format

---

### Magnum v2 72B

**Model ID**: `anthracite-org/magnum-v2-72b`

**Description**: From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the seventh in a family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.

The model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $3e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed

---

### Meta: Llama 3.1 405B (base)

**Model ID**: `meta-llama/llama-3.1-405b`

**Description**: Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This is the base 405B pre-trained version.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, logprobs, top_logprobs, seed, logit_bias, top_k, min_p, repetition_penalty

---

### Meta: Llama 3.1 405B Instruct

**Model ID**: `meta-llama/llama-3.1-405b-instruct`

**Description**: The highly anticipated 400B class of Llama3 is here! Clocking in at 128k context with impressive eval scores, the Meta AI team continues to push the frontier of open-source LLMs.

Meta's latest class of model (Llama 3.1) launched with a variety of sizes & flavors. This 405B instruct-tuned version is optimized for high quality dialogue usecases.

It has demonstrated strong performance compared to leading closed-source models including GPT-4o and Claude 3.5 Sonnet in evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3-1/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs, min_p, seed

---

### Microsoft: Phi 4 Reasoning (free)

**Model ID**: `microsoft/phi-4-reasoning:free`

**Description**: Phi-4-reasoning is a 14B parameter dense decoder-only transformer developed by Microsoft, fine-tuned from Phi-4 to enhance complex reasoning capabilities. It uses a combination of supervised fine-tuning on chain-of-thought traces and reinforcement learning, targeting math, science, and code reasoning tasks. With a 32k context window and high inference efficiency, it is optimized for structured responses in a two-part format: reasoning trace followed by a final solution.

The model achieves strong results on specialized benchmarks such as AIME, OmniMath, and LiveCodeBench, outperforming many larger models in structured reasoning tasks. It is released under the MIT license and intended for use in latency-constrained, English-only environments requiring reliable step-by-step logic. Recommended usage includes ChatML prompts and structured reasoning format for best results.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Microsoft: Phi 4 Reasoning Plus

**Model ID**: `microsoft/phi-4-reasoning-plus`

**Description**: Phi-4-reasoning-plus is an enhanced 14B parameter model from Microsoft, fine-tuned from Phi-4 with additional reinforcement learning to boost accuracy on math, science, and code reasoning tasks. It uses the same dense decoder-only transformer architecture as Phi-4, but generates longer, more comprehensive outputs structured into a step-by-step reasoning trace and final answer.

While it offers improved benchmark scores over Phi-4-reasoning across tasks like AIME, OmniMath, and HumanEvalPlus, its responses are typically ~50% longer, resulting in higher latency. Designed for English-only applications, it is well-suited for structured reasoning workflows where output quality takes priority over response speed.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-08/token
- Completion: $3.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p

---

### Microsoft: Phi 4 Reasoning Plus (free)

**Model ID**: `microsoft/phi-4-reasoning-plus:free`

**Description**: Phi-4-reasoning-plus is an enhanced 14B parameter model from Microsoft, fine-tuned from Phi-4 with additional reinforcement learning to boost accuracy on math, science, and code reasoning tasks. It uses the same dense decoder-only transformer architecture as Phi-4, but generates longer, more comprehensive outputs structured into a step-by-step reasoning trace and final answer.

While it offers improved benchmark scores over Phi-4-reasoning across tasks like AIME, OmniMath, and HumanEvalPlus, its responses are typically ~50% longer, resulting in higher latency. Designed for English-only applications, it is well-suited for structured reasoning workflows where output quality takes priority over response speed.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral Medium

**Model ID**: `mistralai/mistral-medium`

**Description**: This is Mistral AI's closed-source, medium-sided model. It's powered by a closed-source prototype and excels at reasoning, code, JSON, chat, and more. In benchmarks, it compares with many of the flagship models of other companies.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.75e-06/token
- Completion: $8.1e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral Small

**Model ID**: `mistralai/mistral-small`

**Description**: With 22 billion parameters, Mistral Small v24.09 offers a convenient mid-point between (Mistral NeMo 12B)[/mistralai/mistral-nemo] and (Mistral Large 2)[/mistralai/mistral-large], providing a cost-effective solution that can be deployed across various platforms and environments. It has better reasoning, exhibits more capabilities, can produce and reason about code, and is multiligual, supporting English, French, German, Italian, and Spanish.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $6e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral Tiny

**Model ID**: `mistralai/mistral-tiny`

**Description**: Note: This model is being deprecated. Recommended replacement is the newer [Ministral 8B](/mistral/ministral-8b)

This model is currently powered by Mistral-7B-v0.2, and incorporates a "better" fine-tuning than [Mistral 7B](/models/mistralai/mistral-7b-instruct-v0.1), inspired by community work. It's best used for large batch processing tasks where cost is a significant factor but reasoning capabilities are not crucial.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $2.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral: Mistral 7B Instruct

**Model ID**: `mistralai/mistral-7b-instruct`

**Description**: A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.

*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.8e-08/token
- Completion: $5.4e-08/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, logprobs, tools, tool_choice

---

### Mistral: Mistral 7B Instruct (free)

**Model ID**: `mistralai/mistral-7b-instruct:free`

**Description**: A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.

*Mistral 7B Instruct has multiple version variants, and this is intended to be the latest version.*

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, response_format, top_k, seed, min_p

---

### Mistral: Mistral 7B Instruct v0.2

**Model ID**: `mistralai/mistral-7b-instruct-v0.2`

**Description**: A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.

An improved version of [Mistral 7B Instruct](/modelsmistralai/mistral-7b-instruct-v0.1), with the following changes:

- 32k context window (vs 8k context in v0.1)
- Rope-theta = 1e6
- No Sliding-Window Attention

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Mistral: Mistral 7B Instruct v0.3

**Model ID**: `mistralai/mistral-7b-instruct-v0.3`

**Description**: A high-performing, industry-standard 7.3B parameter model, with optimizations for speed and context length.

An improved version of [Mistral 7B Instruct v0.2](/models/mistralai/mistral-7b-instruct-v0.2), with the following changes:

- Extended vocabulary to 32768
- Supports v3 Tokenizer
- Supports function calling

NOTE: Support for function calling depends on the provider.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.8e-08/token
- Completion: $5.4e-08/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, tools, tool_choice, logprobs

---

### Mistral: Mistral Medium 3

**Model ID**: `mistralai/mistral-medium-3`

**Description**: Mistral Medium 3 is a high-performance enterprise-grade language model designed to deliver frontier-level capabilities at significantly reduced operational cost. It balances state-of-the-art reasoning and multimodal performance with 8× lower cost compared to traditional large models, making it suitable for scalable deployments across professional and industrial use cases.

The model excels in domains such as coding, STEM reasoning, and enterprise adaptation. It supports hybrid, on-prem, and in-VPC deployments and is optimized for integration into custom workflows. Mistral Medium 3 offers competitive accuracy relative to larger models like Claude Sonnet 3.5/3.7, Llama 4 Maverick, and Command R+, while maintaining broad compatibility across cloud environments.

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-07/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral: Mistral Small 3

**Model ID**: `mistralai/mistral-small-24b-instruct-2501`

**Description**: Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.

The model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-08/token
- Completion: $9e-08/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs, min_p, seed, response_format, tools, tool_choice, structured_outputs

---

### Mistral: Mistral Small 3 (free)

**Model ID**: `mistralai/mistral-small-24b-instruct-2501:free`

**Description**: Mistral Small 3 is a 24B-parameter language model optimized for low-latency performance across common AI tasks. Released under the Apache 2.0 license, it features both pre-trained and instruction-tuned versions designed for efficient local deployment.

The model achieves 81% accuracy on the MMLU benchmark and performs competitively with larger models like Llama 3.3 70B and Qwen 32B, while operating at three times the speed on equivalent hardware. [Read the blog post about the model here.](https://mistral.ai/news/mistral-small-3/)

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Mistral: Mixtral 8x7B Instruct

**Model ID**: `mistralai/mixtral-8x7b-instruct`

**Description**: Mixtral 8x7B Instruct is a pretrained generative Sparse Mixture of Experts, by Mistral AI, for chat and instruction use. Incorporates 8 experts (feed-forward networks) for a total of 47 billion parameters.

Instruct model fine-tuned by Mistral. #moe

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-08/token
- Completion: $2.4e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed

---

### Mistral: Pixtral 12B

**Model ID**: `mistralai/pixtral-12b`

**Description**: The first multi-modal, text+image-to-text model from Mistral AI. Its weights were launched via torrent: https://x.com/mistralai/status/1833758285167722836.

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-07/token
- Completion: $1e-07/token
- Image: $0.0001445/image

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, logprobs, top_logprobs, seed, logit_bias, top_k, min_p, repetition_penalty, tools, tool_choice, response_format, structured_outputs

---

### Mistral: Pixtral Large 2411

**Model ID**: `mistralai/pixtral-large-2411`

**Description**: Pixtral Large is a 124B parameter, open-weight, multimodal model built on top of [Mistral Large 2](/mistralai/mistral-large-2411). The model is able to understand documents, charts and natural images.

The model is available under the Mistral Research License (MRL) for research and educational use, and the Mistral Commercial License for experimentation, testing, and production for commercial purposes.



**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $6e-06/token
- Image: $0.002888/image

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed

---

### Mistral: Saba

**Model ID**: `mistralai/mistral-saba`

**Description**: Mistral Saba is a 24B-parameter language model specifically designed for the Middle East and South Asia, delivering accurate and contextually relevant responses while maintaining efficient performance. Trained on curated regional datasets, it supports multiple Indian-origin languages—including Tamil and Malayalam—alongside Arabic. This makes it a versatile option for a range of regional and multilingual applications. Read more at the blog post [here](https://mistral.ai/en/news/mistral-saba)

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $6e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, structured_outputs, seed, top_logprobs, logprobs, logit_bias

---

### NeverSleep: Lumimaid v0.2 8B

**Model ID**: `neversleep/llama-3.1-lumimaid-8b`

**Description**: Lumimaid v0.2 8B is a finetune of [Llama 3.1 8B](/models/meta-llama/llama-3.1-8b-instruct) with a "HUGE step up dataset wise" compared to Lumimaid v0.1. Sloppy chats output were purged.

Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $1.25e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed, logit_bias, top_a

---

### Nous: DeepHermes 3 Mistral 24B Preview (free)

**Model ID**: `nousresearch/deephermes-3-mistral-24b-preview:free`

**Description**: DeepHermes 3 (Mistral 24B Preview) is an instruction-tuned language model by Nous Research based on Mistral-Small-24B, designed for chat, function calling, and advanced multi-turn reasoning. It introduces a dual-mode system that toggles between intuitive chat responses and structured “deep reasoning” mode using special system prompts. Fine-tuned via distillation from R1, it supports structured output (JSON mode) and function call syntax for agent-based applications.

DeepHermes 3 supports a **reasoning toggle via system prompt**, allowing users to switch between fast, intuitive responses and deliberate, multi-step reasoning. When activated with the following specific system instruction, the model enters a *"deep thinking"* mode—generating extended chains of thought wrapped in `<think></think>` tags before delivering a final answer. 

System Prompt: You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem.


**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Nous: Hermes 2 Mixtral 8x7B DPO

**Model ID**: `nousresearch/nous-hermes-2-mixtral-8x7b-dpo`

**Description**: Nous Hermes 2 Mixtral 8x7B DPO is the new flagship Nous Research model trained over the [Mixtral 8x7B MoE LLM](/models/mistralai/mixtral-8x7b).

The model was trained on over 1,000,000 entries of primarily [GPT-4](/models/openai/gpt-4) generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.

#moe

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-07/token
- Completion: $6e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### OlympicCoder 32B (free)

**Model ID**: `open-r1/olympiccoder-32b:free`

**Description**: OlympicCoder-32B is a high-performing open-source model fine-tuned using the CodeForces-CoTs dataset, containing approximately 100,000 chain-of-thought programming samples. It excels at complex competitive programming benchmarks, such as IOI 2024 and Codeforces-style challenges, frequently surpassing state-of-the-art closed-source models. OlympicCoder-32B provides advanced reasoning, coherent multi-step problem-solving, and robust code generation capabilities, demonstrating significant potential for olympiad-level competitive programming applications.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen 2 72B Instruct

**Model ID**: `qwen/qwen-2-72b-instruct`

**Description**: Qwen2 72B is a transformer-based model that excels in language understanding, multilingual capabilities, coding, mathematics, and reasoning.

It features SwiGLU activation, attention QKV bias, and group query attention. It is pretrained on extensive data with supervised finetuning and direct preference optimization.

For more details, see this [blog post](https://qwenlm.github.io/blog/qwen2/) and [GitHub repo](https://github.com/QwenLM/Qwen2).

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $9e-07/token
- Completion: $9e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Qwen2.5 72B Instruct

**Model ID**: `qwen/qwen-2.5-72b-instruct`

**Description**: Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:

- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.

- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.

- Long-context Support up to 128K tokens and can generate up to 8K tokens.

- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.2e-07/token
- Completion: $3.9e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, response_format, structured_outputs, logit_bias, logprobs, top_logprobs, seed, min_p

---

### Qwen2.5 72B Instruct (free)

**Model ID**: `qwen/qwen-2.5-72b-instruct:free`

**Description**: Qwen2.5 72B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:

- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.

- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.

- Long-context Support up to 128K tokens and can generate up to 8K tokens.

- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen2.5 7B Instruct

**Model ID**: `qwen/qwen-2.5-7b-instruct`

**Description**: Qwen2.5 7B is the latest series of Qwen large language models. Qwen2.5 brings the following improvements upon Qwen2:

- Significantly more knowledge and has greatly improved capabilities in coding and mathematics, thanks to our specialized expert models in these domains.

- Significant improvements in instruction following, generating long texts (over 8K tokens), understanding structured data (e.g, tables), and generating structured outputs especially JSON. More resilient to the diversity of system prompts, enhancing role-play implementation and condition-setting for chatbots.

- Long-context Support up to 128K tokens and can generate up to 8K tokens.

- Multilingual support for over 29 languages, including Chinese, English, French, Spanish, Portuguese, German, Italian, Russian, Japanese, Korean, Vietnamese, Thai, Arabic, and more.

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-08/token
- Completion: $1e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, structured_outputs, seed

---

### Qwen2.5 Coder 32B Instruct

**Model ID**: `qwen/qwen-2.5-coder-32b-instruct`

**Description**: Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:

- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. 
- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.

To read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6e-08/token
- Completion: $1.5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, logprobs, top_logprobs

---

### Qwen2.5 Coder 32B Instruct (free)

**Model ID**: `qwen/qwen-2.5-coder-32b-instruct:free`

**Description**: Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen). Qwen2.5-Coder brings the following improvements upon CodeQwen1.5:

- Significantly improvements in **code generation**, **code reasoning** and **code fixing**. 
- A more comprehensive foundation for real-world applications such as **Code Agents**. Not only enhancing coding capabilities but also maintaining its strengths in mathematics and general competencies.

To read more about its evaluation results, check out [Qwen 2.5 Coder's blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwen: QwQ 32B Preview

**Model ID**: `qwen/qwq-32b-preview`

**Description**: QwQ-32B-Preview is an experimental research model focused on AI reasoning capabilities developed by the Qwen Team. As a preview release, it demonstrates promising analytical abilities while having several important limitations:

1. **Language Mixing and Code-Switching**: The model may mix languages or switch between them unexpectedly, affecting response clarity.
2. **Recursive Reasoning Loops**: The model may enter circular reasoning patterns, leading to lengthy responses without a conclusive answer.
3. **Safety and Ethical Considerations**: The model requires enhanced safety measures to ensure reliable and secure performance, and users should exercise caution when deploying it.
4. **Performance and Benchmark Limitations**: The model excels in math and coding but has room for improvement in other areas, such as common sense reasoning and nuanced language understanding.



**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, logprobs, top_logprobs, seed, logit_bias, top_k, min_p, repetition_penalty

---

### Qwen: Qwen-Max 

**Model ID**: `qwen/qwen-max`

**Description**: Qwen-Max, based on Qwen2.5, provides the best inference performance among [Qwen models](/qwen), especially for complex multi-step tasks. It's a large-scale MoE model that has been pretrained on over 20 trillion tokens and further post-trained with curated Supervised Fine-Tuning (SFT) and Reinforcement Learning from Human Feedback (RLHF) methodologies. The parameter count is unknown.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.6e-06/token
- Completion: $6.4e-06/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, seed, response_format, presence_penalty

---

### Qwen: Qwen2.5-VL 7B Instruct

**Model ID**: `qwen/qwen-2.5-vl-7b-instruct`

**Description**: Qwen2.5 VL 7B is a multimodal LLM from the Qwen Team with the following key enhancements:

- SoTA understanding of images of various resolution & ratio: Qwen2.5-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.

- Understanding videos of 20min+: Qwen2.5-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.

- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2.5-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.

- Multilingual Support: to serve global users, besides English and Chinese, Qwen2.5-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.

For more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token
- Image: $0.0001445/image

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, logprobs, top_logprobs, min_p, seed

---

### Qwen: Qwen2.5-VL 7B Instruct (free)

**Model ID**: `qwen/qwen-2.5-vl-7b-instruct:free`

**Description**: Qwen2.5 VL 7B is a multimodal LLM from the Qwen Team with the following key enhancements:

- SoTA understanding of images of various resolution & ratio: Qwen2.5-VL achieves state-of-the-art performance on visual understanding benchmarks, including MathVista, DocVQA, RealWorldQA, MTVQA, etc.

- Understanding videos of 20min+: Qwen2.5-VL can understand videos over 20 minutes for high-quality video-based question answering, dialog, content creation, etc.

- Agent that can operate your mobiles, robots, etc.: with the abilities of complex reasoning and decision making, Qwen2.5-VL can be integrated with devices like mobile phones, robots, etc., for automatic operation based on visual environment and text instructions.

- Multilingual Support: to serve global users, besides English and Chinese, Qwen2.5-VL now supports the understanding of texts in different languages inside images, including most European languages, Japanese, Korean, Arabic, Vietnamese, etc.

For more details, see this [blog post](https://qwenlm.github.io/blog/qwen2-vl/) and [GitHub repo](https://github.com/QwenLM/Qwen2-VL).

Usage of this model is subject to [Tongyi Qianwen LICENSE AGREEMENT](https://huggingface.co/Qwen/Qwen1.5-110B-Chat/blob/main/LICENSE).

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Qwerky 72B (free)

**Model ID**: `featherless/qwerky-72b:free`

**Description**: Qwerky-72B is a linear-attention RWKV variant of the Qwen 2.5 72B model, optimized to significantly reduce computational cost at scale. Leveraging linear attention, it achieves substantial inference speedups (>1000x) while retaining competitive accuracy on common benchmarks like ARC, HellaSwag, Lambada, and MMLU. It inherits knowledge and language support from Qwen 2.5, supporting approximately 30 languages, making it suitable for efficient inference in large-context applications.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Reka: Flash 3 (free)

**Model ID**: `rekaai/reka-flash-3:free`

**Description**: Reka Flash 3 is a general-purpose, instruction-tuned large language model with 21 billion parameters, developed by Reka. It excels at general chat, coding tasks, instruction-following, and function calling. Featuring a 32K context length and optimized through reinforcement learning (RLOO), it provides competitive performance comparable to proprietary models within a smaller parameter footprint. Ideal for low-latency, local, or on-device deployments, Reka Flash 3 is compact, supports efficient quantization (down to 11GB at 4-bit precision), and employs explicit reasoning tags ("<reasoning>") to indicate its internal thought process.

Reka Flash 3 is primarily an English model with limited multilingual understanding capabilities. The model weights are released under the Apache 2.0 license.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Sarvam AI: Sarvam-M (free)

**Model ID**: `sarvamai/sarvam-m:free`

**Description**: Sarvam-M is a 24 B-parameter, instruction-tuned derivative of Mistral-Small-3.1-24B-Base-2503, post-trained on English plus eleven major Indic languages (bn, hi, kn, gu, mr, ml, or, pa, ta, te). The model introduces a dual-mode interface: “non-think” for low-latency chat and a optional “think” phase that exposes chain-of-thought tokens for more demanding reasoning, math, and coding tasks. 

Benchmark reports show solid gains versus similarly sized open models on Indic-language QA, GSM-8K math, and SWE-Bench coding, making Sarvam-M a practical general-purpose choice for multilingual conversational agents as well as analytical workloads that mix English, native Indic scripts, or romanized text.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Shisa AI: Shisa V2 Llama 3.3 70B  (free)

**Model ID**: `shisa-ai/shisa-v2-llama3.3-70b:free`

**Description**: Shisa V2 Llama 3.3 70B is a bilingual Japanese-English chat model fine-tuned by Shisa.AI on Meta’s Llama-3.3-70B-Instruct base. It prioritizes Japanese language performance while retaining strong English capabilities. The model was optimized entirely through post-training, using a refined mix of supervised fine-tuning (SFT) and DPO datasets including regenerated ShareGPT-style data, translation tasks, roleplaying conversations, and instruction-following prompts. Unlike earlier Shisa releases, this version avoids tokenizer modifications or extended pretraining.

Shisa V2 70B achieves leading Japanese task performance across a wide range of custom and public benchmarks, including JA MT Bench, ELYZA 100, and Rakuda. It supports a 128K token context length and integrates smoothly with inference frameworks like vLLM and SGLang. While it inherits safety characteristics from its base model, no additional alignment was applied. The model is intended for high-performance bilingual chat, instruction following, and translation tasks across JA/EN.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### THUDM: GLM 4 32B (free)

**Model ID**: `thudm/glm-4-32b:free`

**Description**: GLM-4-32B-0414 is a 32B bilingual (Chinese-English) open-weight language model optimized for code generation, function calling, and agent-style tasks. Pretrained on 15T of high-quality and reasoning-heavy data, it was further refined using human preference alignment, rejection sampling, and reinforcement learning. The model excels in complex reasoning, artifact generation, and structured output tasks, achieving performance comparable to GPT-4o and DeepSeek-V3-0324 across several benchmarks.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### THUDM: GLM Z1 32B (free)

**Model ID**: `thudm/glm-z1-32b:free`

**Description**: GLM-Z1-32B-0414 is an enhanced reasoning variant of GLM-4-32B, built for deep mathematical, logical, and code-oriented problem solving. It applies extended reinforcement learning—both task-specific and general pairwise preference-based—to improve performance on complex multi-step tasks. Compared to the base GLM-4-32B model, Z1 significantly boosts capabilities in structured reasoning and formal domains.

The model supports enforced “thinking” steps via prompt engineering and offers improved coherence for long-form outputs. It’s optimized for use in agentic workflows, and includes support for long context (via YaRN), JSON tool calling, and fine-grained sampling configuration for stable inference. Ideal for use cases requiring deliberate, multi-step reasoning or formal derivations.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### TheDrummer: Rocinante 12B

**Model ID**: `thedrummer/rocinante-12b`

**Description**: Rocinante 12B is designed for engaging storytelling and rich prose.

Early testers have reported:
- Expanded vocabulary with unique and expressive word choices
- Enhanced creativity for vivid narratives
- Adventure-filled and captivating stories

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $5e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed, logit_bias

---

### TheDrummer: Skyfall 36B V2

**Model ID**: `thedrummer/skyfall-36b-v2`

**Description**: Skyfall 36B v2 is an enhanced iteration of Mistral Small 2501, specifically fine-tuned for improved creativity, nuanced writing, role-playing, and coherent storytelling.

**Context Length**: 32,768 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 32,768 tokens
- Max Completion: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, presence_penalty, frequency_penalty, repetition_penalty, top_k

---

### xAI: Grok 2 Vision 1212

**Model ID**: `x-ai/grok-2-vision-1212`

**Description**: Grok 2 Vision 1212 advances image-based AI with stronger visual comprehension, refined instruction-following, and multilingual support. From object recognition to style analysis, it empowers developers to build more intuitive, visually aware applications. Its enhanced steerability and reasoning establish a robust foundation for next-generation image solutions.

To read more about this model, check out [xAI's announcement](https://x.ai/blog/grok-1212).

**Context Length**: 32,768 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-06/token
- Completion: $1e-05/token
- Image: $0.0036/image

**Provider Limits**:
- Max Context: 32,768 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logprobs, top_logprobs, response_format

---

### DeepSeek: R1 Distill Llama 8B

**Model ID**: `deepseek/deepseek-r1-distill-llama-8b`

**Description**: DeepSeek R1 Distill Llama 8B is a distilled large language model based on [Llama-3.1-8B-Instruct](/meta-llama/llama-3.1-8b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:

- AIME 2024 pass@1: 50.4
- MATH-500 pass@1: 89.1
- CodeForces Rating: 1205

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

Hugging Face: 
- [Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B) 
- [DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)   |

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-08/token
- Completion: $4e-08/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### Inception: Mercury Coder Small Beta

**Model ID**: `inception/mercury-coder-small-beta`

**Description**: Mercury Coder Small is the first diffusion large language model (dLLM). Applying a breakthrough discrete diffusion approach, the model runs 5-10x faster than even speed optimized models like Claude 3.5 Haiku and GPT-4o Mini while matching their performance. Mercury Coder Small's speed means that developers can stay in the flow while coding, enjoying rapid chat-based iteration and responsive code completion suggestions. On Copilot Arena, Mercury Coder ranks 1st in speed and ties for 2nd in quality. Read more in the [blog post here](https://www.inceptionlabs.ai/introducing-mercury).

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $1e-06/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, frequency_penalty, presence_penalty, stop

---

### Qwen: Qwen2.5 VL 72B Instruct

**Model ID**: `qwen/qwen2.5-vl-72b-instruct`

**Description**: Qwen2.5-VL is proficient in recognizing common objects such as flowers, birds, fish, and insects. It is also highly capable of analyzing texts, charts, icons, graphics, and layouts within images.

**Context Length**: 32,000 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-07/token
- Completion: $7.5e-07/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, response_format, logprobs, top_logprobs

---

### THUDM: GLM 4 32B

**Model ID**: `thudm/glm-4-32b`

**Description**: GLM-4-32B-0414 is a 32B bilingual (Chinese-English) open-weight language model optimized for code generation, function calling, and agent-style tasks. Pretrained on 15T of high-quality and reasoning-heavy data, it was further refined using human preference alignment, rejection sampling, and reinforcement learning. The model excels in complex reasoning, artifact generation, and structured output tasks, achieving performance comparable to GPT-4o and DeepSeek-V3-0324 across several benchmarks.

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.4e-07/token
- Completion: $2.4e-07/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### THUDM: GLM Z1 32B

**Model ID**: `thudm/glm-z1-32b`

**Description**: GLM-Z1-32B-0414 is an enhanced reasoning variant of GLM-4-32B, built for deep mathematical, logical, and code-oriented problem solving. It applies extended reinforcement learning—both task-specific and general pairwise preference-based—to improve performance on complex multi-step tasks. Compared to the base GLM-4-32B model, Z1 significantly boosts capabilities in structured reasoning and formal domains.

The model supports enforced “thinking” steps via prompt engineering and offers improved coherence for long-form outputs. It’s optimized for use in agentic workflows, and includes support for long context (via YaRN), JSON tool calling, and fine-grained sampling configuration for stable inference. Ideal for use cases requiring deliberate, multi-step reasoning or formal derivations.

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.4e-07/token
- Completion: $2.4e-07/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### THUDM: GLM Z1 Rumination 32B 

**Model ID**: `thudm/glm-z1-rumination-32b`

**Description**: THUDM: GLM Z1 Rumination 32B is a 32B-parameter deep reasoning model from the GLM-4-Z1 series, optimized for complex, open-ended tasks requiring prolonged deliberation. It builds upon glm-4-32b-0414 with additional reinforcement learning phases and multi-stage alignment strategies, introducing “rumination” capabilities designed to emulate extended cognitive processing. This includes iterative reasoning, multi-hop analysis, and tool-augmented workflows such as search, retrieval, and citation-aware synthesis.

The model excels in research-style writing, comparative analysis, and intricate question answering. It supports function calling for search and navigation primitives (`search`, `click`, `open`, `finish`), enabling use in agent-style pipelines. Rumination behavior is governed by multi-turn loops with rule-based reward shaping and delayed decision mechanisms, benchmarked against Deep Research frameworks such as OpenAI’s internal alignment stacks. This variant is suitable for scenarios requiring depth over speed.

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.4e-07/token
- Completion: $2.4e-07/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### TheDrummer: UnslopNemo 12B

**Model ID**: `thedrummer/unslopnemo-12b`

**Description**: UnslopNemo v4.1 is the latest addition from the creator of Rocinante, designed for adventure writing and role-play scenarios.

**Context Length**: 32,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4.5e-07/token
- Completion: $4.5e-07/token

**Provider Limits**:
- Max Context: 32,000 tokens
- Max Completion: 32,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed, tools, tool_choice, structured_outputs, response_format, logprobs

---

### NeverSleep: Llama 3 Lumimaid 8B

**Model ID**: `neversleep/llama-3-lumimaid-8b`

**Description**: The NeverSleep team is back, with a Llama 3 8B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.

To enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.

Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 24,576 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $1.25e-06/token

**Provider Limits**:
- Max Context: 24,576 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed, logit_bias, top_a

---

### Meta: Llama 3.2 3B Instruct (free)

**Model ID**: `meta-llama/llama-3.2-3b-instruct:free`

**Description**: Llama 3.2 3B is a 3-billion-parameter multilingual large language model, optimized for advanced natural language processing tasks like dialogue generation, reasoning, and summarization. Designed with the latest transformer architecture, it supports eight languages, including English, Spanish, and Hindi, and is adaptable for additional languages.

Trained on 9 trillion tokens, the Llama 3.2 3B model excels in instruction-following, complex reasoning, and tool use. Its balanced performance makes it ideal for applications needing accuracy and efficiency in text generation across multilingual settings.

Click here for the [original model card](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md).

Usage of this model is subject to [Meta's Acceptable Use Policy](https://www.llama.com/llama3/use-policy/).

**Context Length**: 20,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 20,000 tokens
- Max Completion: 20,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p

---

### OpenAI: GPT-3.5 Turbo

**Model ID**: `openai/gpt-3.5-turbo`

**Description**: GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.

Training data up to Sep 2021.

**Context Length**: 16,385 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 16,385 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-3.5 Turbo 16k

**Model ID**: `openai/gpt-3.5-turbo-16k`

**Description**: This model offers four times the context length of gpt-3.5-turbo, allowing it to support approximately 20 pages of text in a single request at a higher cost. Training data: up to Sep 2021.

**Context Length**: 16,385 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-06/token
- Completion: $4e-06/token

**Provider Limits**:
- Max Context: 16,385 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-3.5 Turbo 16k

**Model ID**: `openai/gpt-3.5-turbo-0125`

**Description**: The latest GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.

This version has a higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls.

**Context Length**: 16,385 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-07/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 16,385 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-3.5 Turbo 16k (older v1106)

**Model ID**: `openai/gpt-3.5-turbo-1106`

**Description**: An older GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Training data: up to Sep 2021.

**Context Length**: 16,385 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 16,385 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### Aetherwiing: Starcannon 12B

**Model ID**: `aetherwiing/mn-starcannon-12b`

**Description**: Starcannon 12B v2 is a creative roleplay and story writing model, based on Mistral Nemo, using [nothingiisreal/mn-celeste-12b](/nothingiisreal/mn-celeste-12b) as a base, with [intervitens/mini-magnum-12b-v1.1](https://huggingface.co/intervitens/mini-magnum-12b-v1.1) merged in using the [TIES](https://arxiv.org/abs/2306.01708) method.

Although more similar to Magnum overall, the model remains very creative, with a pleasant writing style. It is recommended for people wanting more variety than Magnum, and yet more verbose prose than Celeste.

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### EVA Llama 3.33 70B

**Model ID**: `eva-unit-01/eva-llama-3.33-70b`

**Description**: EVA Llama 3.33 70b is a roleplay and storywriting specialist model. It is a full-parameter finetune of [Llama-3.3-70B-Instruct](https://openrouter.ai/meta-llama/llama-3.3-70b-instruct) on mixture of synthetic and natural data.

It uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and "flavor" of the resulting model

This model was built with Llama by Meta.


**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### EVA Qwen2.5 32B

**Model ID**: `eva-unit-01/eva-qwen-2.5-32b`

**Description**: EVA Qwen2.5 32B is a roleplaying/storywriting specialist model. It's a full-parameter finetune of Qwen2.5-32B on mixture of synthetic and natural data.

It uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and "flavor" of the resulting model.

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.6e-06/token
- Completion: $3.4e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### EVA Qwen2.5 72B

**Model ID**: `eva-unit-01/eva-qwen-2.5-72b`

**Description**: EVA Qwen2.5 72B is a roleplay and storywriting specialist model. It's a full-parameter finetune of Qwen2.5-72B on mixture of synthetic and natural data.

It uses Celeste 70B 0.1 data mixture, greatly expanding it to improve versatility, creativity and "flavor" of the resulting model.

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Infermatic: Mistral Nemo Inferor 12B

**Model ID**: `infermatic/mn-inferor-12b`

**Description**: Inferor 12B is a merge of top roleplay models, expert on immersive narratives and storytelling.

This model was merged using the [Model Stock](https://arxiv.org/abs/2403.19522) merge method using [anthracite-org/magnum-v4-12b](https://openrouter.ai/anthracite-org/magnum-v4-72b) as a base.


**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Magnum 72B

**Model ID**: `alpindale/magnum-72b`

**Description**: From the maker of [Goliath](https://openrouter.ai/models/alpindale/goliath-120b), Magnum 72B is the first in a new family of models designed to achieve the prose quality of the Claude 3 models, notably Opus & Sonnet.

The model is based on [Qwen2 72B](https://openrouter.ai/models/qwen/qwen-2-72b-instruct) and trained with 55 million tokens of highly curated roleplay (RP) data.

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Magnum v4 72B

**Model ID**: `anthracite-org/magnum-v4-72b`

**Description**: This is a series of models designed to replicate the prose quality of the Claude 3 models, specifically Sonnet(https://openrouter.ai/anthropic/claude-3.5-sonnet) and Opus(https://openrouter.ai/anthropic/claude-3-opus).

The model is fine-tuned on top of [Qwen2.5 72B](https://openrouter.ai/qwen/qwen-2.5-72b-instruct).

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $3e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 1,024 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed, logit_bias, top_a

---

### Microsoft: Phi 4

**Model ID**: `microsoft/phi-4`

**Description**: [Microsoft Research](/microsoft) Phi-4 is designed to perform well in complex reasoning tasks and can operate efficiently in situations with limited memory or where quick responses are needed. 

At 14 billion parameters, it was trained on a mix of high-quality synthetic datasets, data from curated websites, and academic materials. It has undergone careful improvement to follow instructions accurately and maintain strong safety standards. It works best with English language inputs.

For more information, please see [Phi-4 Technical Report](https://arxiv.org/pdf/2412.08905)


**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $7e-08/token
- Completion: $1.4e-07/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, logit_bias, logprobs, top_logprobs, repetition_penalty, response_format, min_p

---

### Mistral Nemo 12B Celeste

**Model ID**: `nothingiisreal/mn-celeste-12b`

**Description**: A specialized story writing and roleplaying model based on Mistral's NeMo 12B Instruct. Fine-tuned on curated datasets including Reddit Writing Prompts and Opus Instruct 25K.

This model excels at creative writing, offering improved NSFW capabilities, with smarter and more active narration. It demonstrates remarkable versatility in both SFW and NSFW scenarios, with strong Out of Character (OOC) steering capabilities, allowing fine-tuned control over narrative direction and character behavior.

Check out the model's [HuggingFace page](https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9) for details on what parameters and prompts work best!

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### NeverSleep: Lumimaid v0.2 70B

**Model ID**: `neversleep/llama-3.1-lumimaid-70b`

**Description**: Lumimaid v0.2 70B is a finetune of [Llama 3.1 70B](/meta-llama/llama-3.1-70b-instruct) with a "HUGE step up dataset wise" compared to Lumimaid v0.1. Sloppy chats output were purged.

Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $3e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed, top_a

---

### OpenHands LM 32B V0.1

**Model ID**: `all-hands/openhands-lm-32b-v0.1`

**Description**: OpenHands LM v0.1 is a 32B open-source coding model fine-tuned from Qwen2.5-Coder-32B-Instruct using reinforcement learning techniques outlined in SWE-Gym. It is optimized for autonomous software development agents and achieves strong performance on SWE-Bench Verified, with a 37.2% resolve rate. The model supports a 128K token context window, making it well-suited for long-horizon code reasoning and large codebase tasks.

OpenHands LM is designed for local deployment and runs on consumer-grade GPUs such as a single 3090. It enables fully offline agent workflows without dependency on proprietary APIs. This release is intended as a research preview, and future updates aim to improve generalizability, reduce repetition, and offer smaller variants.

**Context Length**: 16,384 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.6e-06/token
- Completion: $3.4e-06/token

**Provider Limits**:
- Max Context: 16,384 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### DeepSeek: R1 Distill Qwen 32B (free)

**Model ID**: `deepseek/deepseek-r1-distill-qwen-32b:free`

**Description**: DeepSeek R1 Distill Qwen 32B is a distilled large language model based on [Qwen 2.5 32B](https://huggingface.co/Qwen/Qwen2.5-32B), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). It outperforms OpenAI's o1-mini across various benchmarks, achieving new state-of-the-art results for dense models.\n\nOther benchmark results include:\n\n- AIME 2024 pass@1: 72.6\n- MATH-500 pass@1: 94.3\n- CodeForces Rating: 1691\n\nThe model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 16,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 16,000 tokens
- Max Completion: 16,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning

---

### Dolphin 2.9.2 Mixtral 8x22B 🐬

**Model ID**: `cognitivecomputations/dolphin-mixtral-8x22b`

**Description**: Dolphin 2.9 is designed for instruction following, conversational, and coding. This model is a finetune of [Mixtral 8x22B Instruct](/models/mistralai/mixtral-8x22b-instruct). It features a 64k context length and was fine-tuned with a 16k sequence length using ChatML templates.

This model is a successor to [Dolphin Mixtral 8x7B](/models/cognitivecomputations/dolphin-mixtral-8x7b).

The model is uncensored and is stripped of alignment and bias. It requires an external alignment layer for ethical use. Users are cautioned to use this highly compliant model responsibly, as detailed in a blog post about uncensored models at [erichartford.com/uncensored-models](https://erichartford.com/uncensored-models).

#moe #uncensored

**Context Length**: 16,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $9e-07/token
- Completion: $9e-07/token

**Provider Limits**:
- Max Context: 16,000 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### SorcererLM 8x22B

**Model ID**: `raifle/sorcererlm-8x22b`

**Description**: SorcererLM is an advanced RP and storytelling model, built as a Low-rank 16-bit LoRA fine-tuned on [WizardLM-2 8x22B](/microsoft/wizardlm-2-8x22b).

- Advanced reasoning and emotional intelligence for engaging and immersive interactions
- Vivid writing capabilities enriched with spatial and contextual awareness
- Enhanced narrative depth, promoting creative and dynamic storytelling

**Context Length**: 16,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4.5e-06/token
- Completion: $4.5e-06/token

**Provider Limits**:
- Max Context: 16,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed

---

### OpenGVLab: InternVL3 14B (free)

**Model ID**: `opengvlab/internvl3-14b:free`

**Description**: The 14b version of the InternVL3 series. An advanced multimodal large language model (MLLM) series that demonstrates superior overall performance. Compared to InternVL 2.5, InternVL3 exhibits superior multimodal perception and reasoning capabilities, while further extending its multimodal capabilities to encompass tool usage, GUI agents, industrial image analysis, 3D vision perception, and more.

**Context Length**: 12,288 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 12,288 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p

---

### OpenGVLab: InternVL3 2B (free)

**Model ID**: `opengvlab/internvl3-2b:free`

**Description**: The 2b version of the InternVL3 series, for an even higher inference speed and very reasonable performance. An advanced multimodal large language model (MLLM) series that demonstrates superior overall performance. Compared to InternVL 2.5, InternVL3 exhibits superior multimodal perception and reasoning capabilities, while further extending its multimodal capabilities to encompass tool usage, GUI agents, industrial image analysis, 3D vision perception, and more.

**Context Length**: 12,288 tokens
**Modality**: text+image->text
**Input Modalities**: image, text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 12,288 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p

---

### DeepSeek: R1 Distill Llama 70B (free)

**Model ID**: `deepseek/deepseek-r1-distill-llama-70b:free`

**Description**: DeepSeek R1 Distill Llama 70B is a distilled large language model based on [Llama-3.3-70B-Instruct](/meta-llama/llama-3.3-70b-instruct), using outputs from [DeepSeek R1](/deepseek/deepseek-r1). The model combines advanced distillation techniques to achieve high performance across multiple benchmarks, including:

- AIME 2024 pass@1: 70.0
- MATH-500 pass@1: 94.5
- CodeForces Rating: 1633

The model leverages fine-tuning from DeepSeek R1's outputs, enabling competitive performance comparable to larger frontier models.

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, reasoning, include_reasoning, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed, logprobs, top_logprobs

---

### Google: Gemma 2 27B

**Model ID**: `google/gemma-2-27b-it`

**Description**: Gemma 2 27B by Google is an open model built from the same research and technology used to create the [Gemini models](/models?q=gemini).

Gemma models are well-suited for a variety of text generation tasks, including question answering, summarization, and reasoning.

See the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### Google: Gemma 2 9B

**Model ID**: `google/gemma-2-9b-it`

**Description**: Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.

Designed for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.

See the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, response_format, top_logprobs, logprobs, logit_bias, seed

---

### Google: Gemma 2 9B (free)

**Model ID**: `google/gemma-2-9b-it:free`

**Description**: Gemma 2 9B by Google is an advanced, open-source language model that sets a new standard for efficiency and performance in its size class.

Designed for a wide variety of tasks, it empowers developers and researchers to build innovative applications, while maintaining accessibility, safety, and cost-effectiveness.

See the [launch announcement](https://blog.google/technology/developers/google-gemma-2/) for more details. Usage of Gemma is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Google: Gemma 3n 4B (free)

**Model ID**: `google/gemma-3n-e4b-it:free`

**Description**: Gemma 3n E4B-it is optimized for efficient execution on mobile and low-resource devices, such as phones, laptops, and tablets. It supports multimodal inputs—including text, visual data, and audio—enabling diverse tasks such as text generation, speech recognition, translation, and image analysis. Leveraging innovations like Per-Layer Embedding (PLE) caching and the MatFormer architecture, Gemma 3n dynamically manages memory usage and computational load by selectively activating model parameters, significantly reducing runtime resource requirements.

This model supports a wide linguistic range (trained in over 140 languages) and features a flexible 32K token context window. Gemma 3n can selectively load parameters, optimizing memory and computational efficiency based on the task or device capabilities, making it well-suited for privacy-focused, offline-capable applications and on-device AI solutions. [Read more in the blog post](https://developers.googleblog.com/en/introducing-gemma-3n/)

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, response_format

---

### Meta: Llama 3 70B Instruct

**Model ID**: `meta-llama/llama-3-70b-instruct`

**Description**: Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 70B instruct-tuned version was optimized for high quality dialogue usecases.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-07/token
- Completion: $4e-07/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, top_logprobs, logprobs, seed, tools, tool_choice

---

### Meta: Llama 3 8B Instruct

**Model ID**: `meta-llama/llama-3-8b-instruct`

**Description**: Meta's latest class of model (Llama 3) launched with a variety of sizes & flavors. This 8B instruct-tuned version was optimized for high quality dialogue usecases.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-08/token
- Completion: $6e-08/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 16,384 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, top_k, seed, repetition_penalty, frequency_penalty, presence_penalty, stop, min_p, logit_bias, tools, tool_choice, response_format, top_logprobs, logprobs, top_a

---

### Meta: LlamaGuard 2 8B

**Model ID**: `meta-llama/llama-guard-2-8b`

**Description**: This safeguard model has 8B parameters and is based on the Llama 3 family. Just like is predecessor, [LlamaGuard 1](https://huggingface.co/meta-llama/LlamaGuard-7b), it can do both prompt and response classification.

LlamaGuard 2 acts as a normal LLM would, generating text that indicates whether the given input/output is safe/unsafe. If deemed unsafe, it will also share the content categories violated.

For best results, please use raw prompt input or the `/completions` endpoint, instead of the chat API.

It has demonstrated strong performance compared to leading closed-source models in human evaluations.

To read more about the model release, [click here](https://ai.meta.com/blog/meta-llama-3/). Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-07/token
- Completion: $2e-07/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### NeverSleep: Llama 3 Lumimaid 70B

**Model ID**: `neversleep/llama-3-lumimaid-70b`

**Description**: The NeverSleep team is back, with a Llama 3 70B finetune trained on their curated roleplay data. Striking a balance between eRP and RP, Lumimaid was designed to be serious, yet uncensored when necessary.

To enhance it's overall intelligence and chat capability, roughly 40% of the training data was not roleplay. This provides a breadth of knowledge to access, while still keeping roleplay as the primary strength.

Usage of this model is subject to [Meta's Acceptable Use Policy](https://llama.meta.com/llama3/use-policy/).

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $4e-06/token
- Completion: $6e-06/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Noromaid 20B

**Model ID**: `neversleep/noromaid-20b`

**Description**: A collab between IkariDev and Undi. This merge is suitable for RP, ERP, and general knowledge.

#merge #uncensored

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.25e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed, top_a

---

### Qwen: Qwen2.5 VL 32B Instruct (free)

**Model ID**: `qwen/qwen2.5-vl-32b-instruct:free`

**Description**: Qwen2.5-VL-32B is a multimodal vision-language model fine-tuned through reinforcement learning for enhanced mathematical reasoning, structured outputs, and visual problem-solving capabilities. It excels at visual analysis tasks, including object recognition, textual interpretation within images, and precise event localization in extended videos. Qwen2.5-VL-32B demonstrates state-of-the-art performance across multimodal benchmarks such as MMMU, MathVista, and VideoMME, while maintaining strong reasoning and clarity in text-based tasks like MMLU, mathematical problem-solving, and code generation.

**Context Length**: 8,192 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $0/token
- Completion: $0/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, seed, response_format, presence_penalty, stop, frequency_penalty, top_k, min_p, repetition_penalty, logprobs, logit_bias, top_logprobs

---

### Sao10K: Llama 3 8B Lunaris

**Model ID**: `sao10k/l3-lunaris-8b`

**Description**: Lunaris 8B is a versatile generalist and roleplaying model based on Llama 3. It's a strategic merge of multiple models, designed to balance creativity with improved logic and general knowledge.

Created by [Sao10k](https://huggingface.co/Sao10k), this model aims to offer an improved experience over Stheno v3.2, with enhanced creativity and logical reasoning.

For best results, use with Llama 3 Instruct context template, temperature 1.4, and min_p 0.1.

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2e-08/token
- Completion: $5e-08/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias, response_format

---

### Sao10k: Llama 3 Euryale 70B v2.1

**Model ID**: `sao10k/l3-euryale-70b`

**Description**: Euryale 70B v2.1 is a model focused on creative roleplay from [Sao10k](https://ko-fi.com/sao10k).

- Better prompt adherence.
- Better anatomy / spatial awareness.
- Adapts much better to unique and custom formatting / reply formats.
- Very creative, lots of unique swipes.
- Is not restrictive during roleplays.

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.48e-06/token
- Completion: $1.48e-06/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Max Completion: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### Typhoon2 70B Instruct

**Model ID**: `scb10x/llama3.1-typhoon2-70b-instruct`

**Description**: Llama3.1-Typhoon2-70B-Instruct is a Thai-English instruction-tuned language model with 70 billion parameters, built on Llama 3.1. It demonstrates strong performance across general instruction-following, math, coding, and tool-use tasks, with state-of-the-art results in Thai-specific benchmarks such as IFEval, MT-Bench, and Thai-English code-switching.

The model excels in bilingual reasoning and function-calling scenarios, offering high accuracy across diverse domains. Comparative evaluations show consistent improvements over prior Thai LLMs and other Llama-based baselines. Full results and methodology are available in the [technical report.](https://arxiv.org/abs/2412.13702)

**Context Length**: 8,192 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8.8e-07/token
- Completion: $8.8e-07/token

**Provider Limits**:
- Max Context: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format

---

### xAI: Grok Vision Beta

**Model ID**: `x-ai/grok-vision-beta`

**Description**: Grok Vision Beta is xAI's experimental language model with vision capability.



**Context Length**: 8,192 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $5e-06/token
- Completion: $1.5e-05/token
- Image: $0.009/image

**Provider Limits**:
- Max Context: 8,192 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-4

**Model ID**: `openai/gpt-4`

**Description**: OpenAI's flagship model, GPT-4 is a large-scale multimodal language model capable of solving difficult problems with greater accuracy than previous models due to its broader general knowledge and advanced reasoning capabilities. Training data: up to Sep 2021.

**Context Length**: 8,191 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-05/token
- Completion: $6e-05/token

**Provider Limits**:
- Max Context: 8,191 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### OpenAI: GPT-4 (older v0314)

**Model ID**: `openai/gpt-4-0314`

**Description**: GPT-4-0314 is the first version of GPT-4 released, with a context length of 8,192 tokens, and was supported until June 14. Training data: up to Sep 2021.

**Context Length**: 8,191 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $3e-05/token
- Completion: $6e-05/token

**Provider Limits**:
- Max Context: 8,191 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### Inflection: Inflection 3 Pi

**Model ID**: `inflection/inflection-3-pi`

**Description**: Inflection 3 Pi powers Inflection's [Pi](https://pi.ai) chatbot, including backstory, emotional intelligence, productivity, and safety. It has access to recent news, and excels in scenarios like customer support and roleplay.

Pi has been trained to mirror your tone and style, if you use more emojis, so will Pi! Try experimenting with various prompts and conversation styles.

**Context Length**: 8,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token

**Provider Limits**:
- Max Context: 8,000 tokens
- Max Completion: 1,024 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop

---

### Inflection: Inflection 3 Productivity

**Model ID**: `inflection/inflection-3-productivity`

**Description**: Inflection 3 Productivity is optimized for following instructions. It is better for tasks requiring JSON output or precise adherence to provided guidelines. It has access to recent news.

For emotional intelligence similar to Pi, see [Inflect 3 Pi](/inflection/inflection-3-pi)

See [Inflection's announcement](https://inflection.ai/blog/enterprise) for more details.

**Context Length**: 8,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $2.5e-06/token
- Completion: $1e-05/token

**Provider Limits**:
- Max Context: 8,000 tokens
- Max Completion: 1,024 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop

---

### Mancer: Weaver (alpha)

**Model ID**: `mancer/weaver`

**Description**: An attempt to recreate Claude-style verbosity, but don't expect the same level of coherence or memory. Meant for use in roleplay/narrative situations.

**Context Length**: 8,000 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-06/token
- Completion: $1.5e-06/token

**Provider Limits**:
- Max Context: 8,000 tokens
- Max Completion: 1,000 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed, top_a

---

### Qwen: Qwen VL Max

**Model ID**: `qwen/qwen-vl-max`

**Description**: Qwen VL Max is a visual understanding model with 7500 tokens context length. It excels in delivering optimal performance for a broader spectrum of complex tasks.


**Context Length**: 7,500 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $3.2e-06/token
- Image: $0.001024/image

**Provider Limits**:
- Max Context: 7,500 tokens
- Max Completion: 1,500 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, seed, response_format, presence_penalty

---

### Qwen: Qwen VL Plus

**Model ID**: `qwen/qwen-vl-plus`

**Description**: Qwen's Enhanced Large Visual Language Model. Significantly upgraded for detailed recognition capabilities and text recognition abilities, supporting ultra-high pixel resolutions up to millions of pixels and extreme aspect ratios for image input. It delivers significant performance across a broad range of visual tasks.


**Context Length**: 7,500 tokens
**Modality**: text+image->text
**Input Modalities**: text, image
**Output Modalities**: text

**Pricing**:
- Prompt: $2.1e-07/token
- Completion: $6.3e-07/token
- Image: $0.0002688/image

**Provider Limits**:
- Max Context: 7,500 tokens
- Max Completion: 1,500 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, seed, response_format, presence_penalty

---

### Goliath 120B

**Model ID**: `alpindale/goliath-120b`

**Description**: A large LLM created by combining two fine-tuned Llama 70B models into one 120B model. Combines Xwin and Euryale.

Credits to
- [@chargoddard](https://huggingface.co/chargoddard) for developing the framework used to merge the model - [mergekit](https://github.com/cg123/mergekit).
- [@Undi95](https://huggingface.co/Undi95) for helping with the merge ratios.

#merge

**Context Length**: 6,144 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-05/token
- Completion: $1.25e-05/token

**Provider Limits**:
- Max Context: 6,144 tokens
- Max Completion: 512 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, logit_bias, top_k, min_p, seed, top_a

---

### AlfredPros: CodeLLaMa 7B Instruct Solidity

**Model ID**: `alfredpros/codellama-7b-instruct-solidity`

**Description**: A finetuned 7 billion parameters Code LLaMA - Instruct model to generate Solidity smart contract using 4-bit QLoRA finetuning provided by PEFT library.

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Cohere: Command

**Model ID**: `cohere/command`

**Description**: Command is an instruction-following conversational model that performs language tasks with high quality, more reliably and with a longer context than our base generative models.

Use of this model is subject to Cohere's [Usage Policy](https://docs.cohere.com/docs/usage-policy) and [SaaS Agreement](https://cohere.com/saas-agreement).

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,000 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, seed, response_format, structured_outputs

---

### EleutherAI: Llemma 7b

**Model ID**: `eleutherai/llemma_7b`

**Description**: Llemma 7B is a language model for mathematics. It was initialized with Code Llama 7B weights, and trained on the Proof-Pile-2 for 200B tokens. Llemma models are particularly strong at chain-of-thought mathematical reasoning and using computational tools for mathematics, such as Python and formal theorem provers.

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Fimbulvetr 11B v2

**Model ID**: `sao10k/fimbulvetr-11b-v2`

**Description**: Creative writing model, routed with permission. It's fast, it keeps the conversation going, and it stays in character.

If you submit a raw prompt, you can use Alpaca or Vicuna formats.

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### Midnight Rose 70B

**Model ID**: `sophosympatheia/midnight-rose-70b`

**Description**: A merge with a complex family tree, this model was crafted for roleplaying and storytelling. Midnight Rose is a successor to Rogue Rose and Aurora Nights and improves upon them both. It wants to produce lengthy output by default and is the best creative writing merge produced so far by sophosympatheia.

Descending from earlier versions of Midnight Rose and [Wizard Tulu Dolphin 70B](https://huggingface.co/sophosympatheia/Wizard-Tulu-Dolphin-70B-v1.0), it inherits the best qualities of each.

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $8e-07/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 2,048 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, top_k, min_p, repetition_penalty, logit_bias

---

### MythoMax 13B

**Model ID**: `gryphe/mythomax-l2-13b`

**Description**: One of the highest performing and most popular fine-tunes of Llama 2 13B, with rich descriptions and roleplay. #merge

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $6.5e-08/token
- Completion: $6.5e-08/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, presence_penalty, frequency_penalty, repetition_penalty, top_k, stop, seed, min_p, logit_bias, response_format, top_a

---

### Pygmalion: Mythalion 13B

**Model ID**: `pygmalionai/mythalion-13b`

**Description**: A blend of the new Pygmalion-13b and MythoMax. #merge

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### ReMM SLERP 13B

**Model ID**: `undi95/remm-slerp-l2-13b`

**Description**: A recreation trial of the original MythoMax-L2-B13 but with updated models. #merge

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed, logit_bias, top_a

---

### Toppy M 7B

**Model ID**: `undi95/toppy-m-7b`

**Description**: A wild 7B parameter model that merges several models using the new task_arithmetic merge method from mergekit.
List of merged models:
- NousResearch/Nous-Capybara-7B-V1.9
- [HuggingFaceH4/zephyr-7b-beta](/models/huggingfaceh4/zephyr-7b-beta)
- lemonilia/AshhLimaRP-Mistral-7B
- Vulkane/120-Days-of-Sodom-LoRA-Mistral-7b
- Undi95/Mistral-pippa-sharegpt-7b-qlora

#merge #uncensored

**Context Length**: 4,096 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $8e-07/token
- Completion: $1.2e-06/token

**Provider Limits**:
- Max Context: 4,096 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, repetition_penalty, top_k, min_p, seed

---

### OpenAI: GPT-3.5 Turbo (older v0613)

**Model ID**: `openai/gpt-3.5-turbo-0613`

**Description**: GPT-3.5 Turbo is OpenAI's fastest model. It can understand and generate natural language or code, and is optimized for chat and traditional completion tasks.

Training data up to Sep 2021.

**Context Length**: 4,095 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 4,095 tokens
- Max Completion: 4,096 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format, structured_outputs

---

### OpenAI: GPT-3.5 Turbo Instruct

**Model ID**: `openai/gpt-3.5-turbo-instruct`

**Description**: This model is a variant of GPT-3.5 Turbo tuned for instructional prompts and omitting chat-related optimizations. Training data: up to Sep 2021.

**Context Length**: 4,095 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.5e-06/token
- Completion: $2e-06/token

**Provider Limits**:
- Max Context: 4,095 tokens
- Max Completion: 4,096 tokens
- Moderated: Yes

**Supported Parameters**: max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, seed, logit_bias, logprobs, top_logprobs, response_format

---

### Mistral: Mistral 7B Instruct v0.1

**Model ID**: `mistralai/mistral-7b-instruct-v0.1`

**Description**: A 7.3B parameter model that outperforms Llama 2 13B on all benchmarks, with optimizations for speed and context length.

**Context Length**: 2,824 tokens
**Modality**: text->text
**Input Modalities**: text
**Output Modalities**: text

**Pricing**:
- Prompt: $1.1e-07/token
- Completion: $1.9e-07/token

**Provider Limits**:
- Max Context: 2,824 tokens
- Moderated: No

**Supported Parameters**: tools, tool_choice, max_tokens, temperature, top_p, stop, frequency_penalty, presence_penalty, top_k, repetition_penalty, logit_bias, min_p, response_format, seed

---

## Models by Category

### Reasoning Models

Models that support chain-of-thought reasoning and thinking capabilities.

- **Google: Gemini 2.5 Flash** (`google/gemini-2.5-flash`)
  - Context: 1,048,576 tokens
  - Pricing: $3e-07 prompt / $2.5e-06 completion

- **Google: Gemini 2.5 Flash Lite Preview 06-17** (`google/gemini-2.5-flash-lite-preview-06-17`)
  - Context: 1,048,576 tokens
  - Pricing: $1e-07 prompt / $4e-07 completion

- **Google: Gemini 2.5 Flash Preview 04-17 (thinking)** (`google/gemini-2.5-flash-preview:thinking`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $3.5e-06 completion

- **Google: Gemini 2.5 Flash Preview 05-20** (`google/gemini-2.5-flash-preview-05-20`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $6e-07 completion

- **Google: Gemini 2.5 Flash Preview 05-20 (thinking)** (`google/gemini-2.5-flash-preview-05-20:thinking`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $3.5e-06 completion

- **Google: Gemini 2.5 Pro** (`google/gemini-2.5-pro`)
  - Context: 1,048,576 tokens
  - Pricing: $1.25e-06 prompt / $1e-05 completion

- **Google: Gemini 2.5 Pro Preview 06-05** (`google/gemini-2.5-pro-preview`)
  - Context: 1,048,576 tokens
  - Pricing: $1.25e-06 prompt / $1e-05 completion

- **MiniMax: MiniMax M1** (`minimax/minimax-m1`)
  - Context: 1,000,000 tokens
  - Pricing: $3e-07 prompt / $1.65e-06 completion

- **Anthropic: Claude 3.7 Sonnet** (`anthropic/claude-3.7-sonnet`)
  - Context: 200,000 tokens
  - Pricing: $3e-06 prompt / $1.5e-05 completion

- **Anthropic: Claude 3.7 Sonnet (self-moderated)** (`anthropic/claude-3.7-sonnet:beta`)
  - Context: 200,000 tokens
  - Pricing: $3e-06 prompt / $1.5e-05 completion

- **Anthropic: Claude 3.7 Sonnet (thinking)** (`anthropic/claude-3.7-sonnet:thinking`)
  - Context: 200,000 tokens
  - Pricing: $3e-06 prompt / $1.5e-05 completion

- **Anthropic: Claude Opus 4** (`anthropic/claude-opus-4`)
  - Context: 200,000 tokens
  - Pricing: $1.5e-05 prompt / $7.5e-05 completion

- **Anthropic: Claude Sonnet 4** (`anthropic/claude-sonnet-4`)
  - Context: 200,000 tokens
  - Pricing: $3e-06 prompt / $1.5e-05 completion

- **DeepSeek: R1 (free)** (`deepseek/deepseek-r1:free`)
  - Context: 163,840 tokens
  - Pricing: $0 prompt / $0 completion

- **DeepSeek: R1 0528 (free)** (`deepseek/deepseek-r1-0528:free`)
  - Context: 163,840 tokens
  - Pricing: $0 prompt / $0 completion

- **Microsoft: MAI DS R1 (free)** (`microsoft/mai-ds-r1:free`)
  - Context: 163,840 tokens
  - Pricing: $0 prompt / $0 completion

- **TNG: DeepSeek R1T Chimera (free)** (`tngtech/deepseek-r1t-chimera:free`)
  - Context: 163,840 tokens
  - Pricing: $0 prompt / $0 completion

- **AionLabs: Aion-1.0** (`aion-labs/aion-1.0`)
  - Context: 131,072 tokens
  - Pricing: $4e-06 prompt / $8e-06 completion

- **AionLabs: Aion-1.0-Mini** (`aion-labs/aion-1.0-mini`)
  - Context: 131,072 tokens
  - Pricing: $7e-07 prompt / $1.4e-06 completion

- **Arcee AI: Maestro Reasoning** (`arcee-ai/maestro-reasoning`)
  - Context: 131,072 tokens
  - Pricing: $9e-07 prompt / $3.3e-06 completion

### High Context Models (>500k tokens)

- **Auto Router** (`openrouter/auto`)
  - Context: 2,000,000 tokens
  - Pricing: $-1 prompt / $-1 completion

- **Google: Gemini 1.5 Pro** (`google/gemini-pro-1.5`)
  - Context: 2,000,000 tokens
  - Pricing: $1.25e-06 prompt / $5e-06 completion

- **Google: Gemini 2.0 Flash** (`google/gemini-2.0-flash-001`)
  - Context: 1,048,576 tokens
  - Pricing: $1e-07 prompt / $4e-07 completion

- **Google: Gemini 2.0 Flash Experimental (free)** (`google/gemini-2.0-flash-exp:free`)
  - Context: 1,048,576 tokens
  - Pricing: $0 prompt / $0 completion

- **Google: Gemini 2.0 Flash Lite** (`google/gemini-2.0-flash-lite-001`)
  - Context: 1,048,576 tokens
  - Pricing: $7.5e-08 prompt / $3e-07 completion

- **Google: Gemini 2.5 Flash** (`google/gemini-2.5-flash`)
  - Context: 1,048,576 tokens
  - Pricing: $3e-07 prompt / $2.5e-06 completion

- **Google: Gemini 2.5 Flash Lite Preview 06-17** (`google/gemini-2.5-flash-lite-preview-06-17`)
  - Context: 1,048,576 tokens
  - Pricing: $1e-07 prompt / $4e-07 completion

- **Google: Gemini 2.5 Flash Preview 04-17** (`google/gemini-2.5-flash-preview`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $6e-07 completion

- **Google: Gemini 2.5 Flash Preview 04-17 (thinking)** (`google/gemini-2.5-flash-preview:thinking`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $3.5e-06 completion

- **Google: Gemini 2.5 Flash Preview 05-20** (`google/gemini-2.5-flash-preview-05-20`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $6e-07 completion

- **Google: Gemini 2.5 Flash Preview 05-20 (thinking)** (`google/gemini-2.5-flash-preview-05-20:thinking`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $3.5e-06 completion

- **Google: Gemini 2.5 Pro** (`google/gemini-2.5-pro`)
  - Context: 1,048,576 tokens
  - Pricing: $1.25e-06 prompt / $1e-05 completion

- **Google: Gemini 2.5 Pro Experimental** (`google/gemini-2.5-pro-exp-03-25`)
  - Context: 1,048,576 tokens
  - Pricing: $0 prompt / $0 completion

- **Google: Gemini 2.5 Pro Preview 05-06** (`google/gemini-2.5-pro-preview-05-06`)
  - Context: 1,048,576 tokens
  - Pricing: $1.25e-06 prompt / $1e-05 completion

- **Google: Gemini 2.5 Pro Preview 06-05** (`google/gemini-2.5-pro-preview`)
  - Context: 1,048,576 tokens
  - Pricing: $1.25e-06 prompt / $1e-05 completion

- **Meta: Llama 4 Maverick** (`meta-llama/llama-4-maverick`)
  - Context: 1,048,576 tokens
  - Pricing: $1.5e-07 prompt / $6e-07 completion

- **Meta: Llama 4 Scout** (`meta-llama/llama-4-scout`)
  - Context: 1,048,576 tokens
  - Pricing: $8e-08 prompt / $3e-07 completion

- **OpenAI: GPT-4.1** (`openai/gpt-4.1`)
  - Context: 1,047,576 tokens
  - Pricing: $2e-06 prompt / $8e-06 completion

- **OpenAI: GPT-4.1 Mini** (`openai/gpt-4.1-mini`)
  - Context: 1,047,576 tokens
  - Pricing: $4e-07 prompt / $1.6e-06 completion

- **OpenAI: GPT-4.1 Nano** (`openai/gpt-4.1-nano`)
  - Context: 1,047,576 tokens
  - Pricing: $1e-07 prompt / $4e-07 completion

- **MiniMax: MiniMax-01** (`minimax/minimax-01`)
  - Context: 1,000,192 tokens
  - Pricing: $2e-07 prompt / $1.1e-06 completion

- **Google: Gemini 1.5 Flash ** (`google/gemini-flash-1.5`)
  - Context: 1,000,000 tokens
  - Pricing: $7.5e-08 prompt / $3e-07 completion

- **Google: Gemini 1.5 Flash 8B** (`google/gemini-flash-1.5-8b`)
  - Context: 1,000,000 tokens
  - Pricing: $3.75e-08 prompt / $1.5e-07 completion

- **MiniMax: MiniMax M1** (`minimax/minimax-m1`)
  - Context: 1,000,000 tokens
  - Pricing: $3e-07 prompt / $1.65e-06 completion

- **Qwen: Qwen-Turbo** (`qwen/qwen-turbo`)
  - Context: 1,000,000 tokens
  - Pricing: $5e-08 prompt / $2e-07 completion

### Free Models

- **Google: Gemini 2.0 Flash Experimental (free)** (`google/gemini-2.0-flash-exp:free`)
  - Context: 1,048,576 tokens
  - Modality: text+image->text

- **Google: Gemini 2.5 Pro Experimental** (`google/gemini-2.5-pro-exp-03-25`)
  - Context: 1,048,576 tokens
  - Modality: text+image->text

- **Meta: Llama 4 Scout (free)** (`meta-llama/llama-4-scout:free`)
  - Context: 200,000 tokens
  - Modality: text+image->text

- **DeepSeek: DeepSeek V3 (free)** (`deepseek/deepseek-chat:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **DeepSeek: DeepSeek V3 0324 (free)** (`deepseek/deepseek-chat-v3-0324:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **DeepSeek: DeepSeek V3 Base (free)** (`deepseek/deepseek-v3-base:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **DeepSeek: R1 (free)** (`deepseek/deepseek-r1:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **DeepSeek: R1 0528 (free)** (`deepseek/deepseek-r1-0528:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **Microsoft: MAI DS R1 (free)** (`microsoft/mai-ds-r1:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **TNG: DeepSeek R1T Chimera (free)** (`tngtech/deepseek-r1t-chimera:free`)
  - Context: 163,840 tokens
  - Modality: text->text

- **DeepSeek: Deepseek R1 0528 Qwen3 8B (free)** (`deepseek/deepseek-r1-0528-qwen3-8b:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Kimi Dev 72b (free)** (`moonshotai/kimi-dev-72b:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Meta: Llama 3.1 8B Instruct (free)** (`meta-llama/llama-3.1-8b-instruct:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Meta: Llama 3.2 11B Vision Instruct (free)** (`meta-llama/llama-3.2-11b-vision-instruct:free`)
  - Context: 131,072 tokens
  - Modality: text+image->text

- **Meta: Llama 3.2 1B Instruct (free)** (`meta-llama/llama-3.2-1b-instruct:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Meta: Llama 3.3 70B Instruct (free)** (`meta-llama/llama-3.3-70b-instruct:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Mistral: Devstral Small (free)** (`mistralai/devstral-small:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Mistral: Mistral Nemo (free)** (`mistralai/mistral-nemo:free`)
  - Context: 131,072 tokens
  - Modality: text->text

- **Moonshot AI: Kimi VL A3B Thinking (free)** (`moonshotai/kimi-vl-a3b-thinking:free`)
  - Context: 131,072 tokens
  - Modality: text+image->text

- **NVIDIA: Llama 3.1 Nemotron Ultra 253B v1 (free)** (`nvidia/llama-3.1-nemotron-ultra-253b-v1:free`)
  - Context: 131,072 tokens
  - Modality: text->text

### Vision Models

Models that can process image inputs.

- **Google: Gemini 1.5 Pro** (`google/gemini-pro-1.5`)
  - Context: 2,000,000 tokens
  - Image Pricing: $0.0006575/image

- **Google: Gemini 2.0 Flash** (`google/gemini-2.0-flash-001`)
  - Context: 1,048,576 tokens
  - Image Pricing: $2.58e-05/image

- **Google: Gemini 2.0 Flash Experimental (free)** (`google/gemini-2.0-flash-exp:free`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0/image

- **Google: Gemini 2.0 Flash Lite** (`google/gemini-2.0-flash-lite-001`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0/image

- **Google: Gemini 2.5 Flash** (`google/gemini-2.5-flash`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.001238/image

- **Google: Gemini 2.5 Flash Lite Preview 06-17** (`google/gemini-2.5-flash-lite-preview-06-17`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0/image

- **Google: Gemini 2.5 Flash Preview 04-17** (`google/gemini-2.5-flash-preview`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.0006192/image

- **Google: Gemini 2.5 Flash Preview 04-17 (thinking)** (`google/gemini-2.5-flash-preview:thinking`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.0006192/image

- **Google: Gemini 2.5 Flash Preview 05-20** (`google/gemini-2.5-flash-preview-05-20`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.0006192/image

- **Google: Gemini 2.5 Flash Preview 05-20 (thinking)** (`google/gemini-2.5-flash-preview-05-20:thinking`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.0006192/image

- **Google: Gemini 2.5 Pro** (`google/gemini-2.5-pro`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.00516/image

- **Google: Gemini 2.5 Pro Experimental** (`google/gemini-2.5-pro-exp-03-25`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0/image

- **Google: Gemini 2.5 Pro Preview 05-06** (`google/gemini-2.5-pro-preview-05-06`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.00516/image

- **Google: Gemini 2.5 Pro Preview 06-05** (`google/gemini-2.5-pro-preview`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.00516/image

- **Meta: Llama 4 Maverick** (`meta-llama/llama-4-maverick`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0.0006684/image

- **Meta: Llama 4 Scout** (`meta-llama/llama-4-scout`)
  - Context: 1,048,576 tokens
  - Image Pricing: $0/image

- **OpenAI: GPT-4.1** (`openai/gpt-4.1`)
  - Context: 1,047,576 tokens
  - Image Pricing: $0/image

- **OpenAI: GPT-4.1 Mini** (`openai/gpt-4.1-mini`)
  - Context: 1,047,576 tokens
  - Image Pricing: $0/image

- **OpenAI: GPT-4.1 Nano** (`openai/gpt-4.1-nano`)
  - Context: 1,047,576 tokens
  - Image Pricing: $0/image

- **MiniMax: MiniMax-01** (`minimax/minimax-01`)
  - Context: 1,000,192 tokens
  - Image Pricing: $0/image

