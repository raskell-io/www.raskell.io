+++
title = "智能体究竟是什么"
date = 2026-06-02
description = "「AI 智能体」是业内含义最混乱的词。本文讲它的结构、来历，并用 Bun 上大约两百行 TypeScript 写出一个能运行的实现。The Agent Platform Handbook 第一篇。"

[extra]
author = "Raffael"
image = "what-an-agent-actually-is.avif"
cover = "covers/what-an-agent-actually-is.avif"
in_short = [
  "智能体是具备五项属性的软件：目标、模型、上下文、工具和循环；少了任何一项，得到的就是聊天机器人、工作流或一次性补全。",
  "从 SHRDLU 和 BDI 的研究开始，这套架构就是对的；缺的是一个可用的语言模型，而函数调用随后把循环变成了一个软件问题。",
  "2025 到 2026 年间，先是编程智能体，后是助理智能体，把循环、工具和运行时打包在一起；可几乎没有哪个组织在它们底下有一个连贯的平台，这个系列要补上的正是这一块。",
  "我用 Bun 上的 TypeScript 写了一个能运行的智能体，只有一个 shell 工具和一个迭代预算，并说明随着聊天产品悄悄长出工具，名称总是落后于架构。",
  "聊天机器人的失败在于知道得不够，智能体的失败在于做错了事，失败模式包括失控的循环与成本、谎报成功、缺乏隔离和隐藏状态，后续文章会逐一处理。",
]
+++

> *The Agent Platform Handbook. From Loop to Platform.* 的第 1 篇。这个系列共 22 篇，从单个循环一路走到生产级平台，覆盖整个智能体技术栈。下一篇：[Your Agent Wants Root](/articles/your-agent-wants-root/)。

如果你在同一天开三个会，会听到 *agent*（智能体）这个词被用来指三种不同的东西。供应商用它指一个带 logo 的聊天窗口。平台团队用它指一个带重试的工作流。安全负责人用它指一个长期运行、拿着你看不见的凭证的进程。这些人都不算完全错。但他们说的不是同一件东西。

这是一个系列的第一篇，这个系列从单个智能体循环一直讲到生产级平台。在谈隔离、工具、身份或编排之前，我们得先就架构图正中间那个东西到底是什么达成一致。所以我们会先给它下定义，勾勒它的结构，回顾业界走到今天的路径，然后用 Bun 上大约两百行 TypeScript 写出一个能运行的智能体。

读完这篇，这个抽象名词就会变成一个你能运行的具体文件。

## 一个可用的定义 {#a-working-definition}

智能体是具备五项属性的软件。去掉任何一项，你得到的就是别的东西。

1. **目标。** 不是单条提示词，而是系统试图满足的一个目标状态、一段任务描述或一个问题陈述。
2. **模型。** 一个或多个推理引擎，把当前状态加上目标转换成下一步行动。如今这几乎总是一个大语言模型。
3. **上下文。** 模型在用户输入之外能读到的信息：系统提示词、文档、之前的对话轮次、环境状态、配置文件。
4. **工具。** 一组有限的、具名的、带副作用的操作，模型被允许调用它们。读一个文件，执行一条 shell 命令，调用一个 API。
5. **循环。** 模型选一个工具，工具运行，结果重新进入上下文，模型再选。当目标达成、预算耗尽或触发停止条件时，循环结束。

在生产环境里通常还有第六项属性，**记忆**，也就是在循环结束后仍然保留的状态。我们会在[第六篇](/articles/memory-is-a-write-path/)把记忆当作单独的一层来讲，这第一个智能体则保持无状态。

五项属性齐全的系统就是智能体。只有四项的系统是另一种值得命名的东西。聊天窗口有目标、模型、上下文和循环，但没有工具，所以它是聊天机器人。CI 流水线有目标、上下文、工具和循环，但没有模型，所以它是工作流。一次函数调用有目标、模型、上下文和一个工具，但没有循环，所以它是一次性补全。有了循环，行为才是开放式的。有了工具，循环才有意义。

迄今交付过的每一个智能体，架构图都长这样。

{% diagram(title="The agent loop") %}
                          +--------------+
                          |    Goal      |
                          | (user task)  |
                          +-------+------+
                                  |
                                  v
   +------------+         +---------------+         +------------+
   |  Context   +-------->|     Model     |<--------+   Memory   |
   | docs, env, |         | next action?  |         | (optional) |
   | prior turns|         +-------+-------+         +------------+
   +------------+                 |
                                  | tool call
                                  v
                          +---------------+
                          |   Tool        |
                          | shell, http,  |
                          | file, custom  |
                          +-------+-------+
                                  |
                                  | result
                                  v
                          +---------------+
                          |    Runtime    |
                          | (where the    |
                          |  side effect  |
                          |  happens)     |
                          +-------+-------+
                                  |
                                  v
                       +----------+----------+
                       | done? --no--> loop  |
                       |   |                 |
                       |  yes                |
                       |   v                 |
                       | return              |
                       +---------------------+
{% end %}

这张图故意画得很小。这个系列几乎每一篇都会重画它，并展开其中一个组件。第二篇展开运行时。第三篇展开工具。第四篇展开上下文。第六篇展开记忆。第七篇展开模型。系列末尾的收官篇把它们全部组装成一套参考架构。

把这张图记在脑子里。我们还会回到它。

## 我们是怎么走到这里的 {#how-we-got-here}

这一节剩下的部分可以当背景读；如果前两小节讲的你都亲身经历过，可以跳过。第三小节讲 2024 到 2026 年这一段，无论如何都值得一读，因为它解释了为什么你身边每个人突然都在用 *agent* 这个词。

### 老派 AI {#the-old-ai}

软件智能体这个想法比现代大语言模型早了大约五十年。Terry Winograd 在 1970 年做的 SHRDLU，是一个接收自然语言指令、在模拟的积木世界里规划动作、执行动作并更新内部状态的程序。它有目标、有世界模型、有一组工具，也有循环。它就是一个智能体。它在积木世界里运行得很漂亮，可你一走出那个世界它就垮了，因为世界模型是手写的，语言理解也很脆弱。

整个 1980 和 1990 年代，这个想法换着名字一再回来。专家系统把业务逻辑包进推理规则里。由 Bratman 等人形式化的「信念、愿望、意图」（Belief-Desire-Intention）架构，给了智能体一个明确的认知模型：它相信什么，它想要什么，它接下来打算做什么。那时有好论文，有能运行的系统，也有上市的产品。它们共同缺少的，是一个可用的语言模型。你可以用形式逻辑或结构化的 DSL 来指定智能体的目标。你没法说一句「帮我订张机票」就让它解析明白。

这个时代的教训是，这套架构几十年来一直是对的。瓶颈在模型。

### 聊天时代 {#the-chat-era}

GPT-3 在 2020 年出现，ChatGPT 在 2022 年底出现，语言这道瓶颈被打破了。你终于可以用英语写下一个目标，系统会连贯地回应。业界的第一反应，是把这项能力包进一个聊天窗口里拿去卖。那不是智能体。它没有循环，没有工具，模型对它所处的世界什么也做不了。它是一个非常好的自动补全，外加对这段对话的记忆。

直到有人问出那个显而易见的下一个问题，智能体模式才回来。既然模型能读写英语，我们又能让它调用函数，那能不能把循环闭合，让它去行动？

2022 年底到 2023 年初，两篇论文和两个爆红的演示回答了这个问题。

论文先到。Yao 等人在 2022 年 10 月发表的 *ReAct: Synergizing Reasoning and Acting in Language Models* 表明，把推理步骤和工具使用步骤交替进行，效果好于单独使用其中任何一种。这份蓝图小到能写在一张餐巾纸上：思考，行动，观察，重复。此后交付的几乎每一个智能体，都把它当成了事实上的标准模式。

演示在 2023 年初到来。Toran Bruce Richards 在 2023 年 3 月发布的 Auto-GPT，把 GPT-4 包进的正是这个循环，并让它无人值守地运行。它的演示效果惊艳，实际却一直出故障。几周后，Yohei Nakajima 的 BabyAGI 用大约一百行 Python 做了同样的事。两者都不是生产级的。但两者都让从没读过 ReAct 论文的人看懂了这个想法。Auto-GPT 之后，你可以这样解释智能体：「想象一个 ChatGPT，但它会一直做下去，直到任务完成。」这是营销上的突破，不是工程上的突破，但想法正是靠营销传播的。

随后到来的工程突破，是 OpenAI 在 2023 年 6 月推出的函数调用 API。你不必再从自由行文里解析出「模型想调用 `search(query)`」，而是用 JSON schema 声明你的工具，模型则返回一个结构化的工具调用。Anthropic 的 `tool_use` 也按同样的模式上线。有了函数调用，智能体循环不再是一个正则表达式问题，而开始成为一个软件问题。我们会在[第三篇](/articles/tools-how-agents-actually-do-things/)回到这一点。

2023 年这一波催生了第一批真正的框架：2022 年 10 月的 LangChain，2023 年底的 AutoGen，2024 年的 CrewAI 和 LangGraph。它们比拼的是抽象。有的赢了，有的输了。我们会在后面的文章里评点它们。眼下要说的是，到 2024 年年中，构建一个智能体已经是一道 Python 或 TypeScript 练习题，而不再是一个研究项目。

### 2025 到 2026 年的打包 {#the-2025-to-2026-bundling}

正是在这里，*agent* 这个词不再是一个研究术语，而成了一个产品类别。这分两波发生。

第一波面向构建者。2025 年初，Anthropic 推出了 Claude Code，一个在你的笔记本电脑上运行的命令行智能体，能编辑文件、执行 shell 命令，还能派生子智能体。OpenAI 把 Codex 重新推出，作为一个真正的智能体，而不再是一个补全接口。开源社区做出了 OpenCode 和五六个相近的项目（aider、continue、opencoder），给同样的形态提供了不绑定供应商的界面。这些在技术上都不新。循环就是 ReAct 循环。工具就是 `bash` 和 `edit`。新的是打包：循环、工具和运行时一起到来，装在一个三十秒就能装好的二进制文件里。这一出来，每个基础设施和平台工程师在一周之内，笔记本上就都有了一个能用的智能体。

接下来发生的事，我写在了 [What Sixteen AI Agents Taught Me About Management](/articles/what-sixteen-ai-agents-taught-me-about-management/) 里。构建者一旦有了能用的智能体，就想同时跑不止一个。一旦跑了不止一个，就撞上了协调问题。一旦撞上协调问题，就发现智能体编排其实是一个套着软件外壳的管理问题。

第二波面向助理场景，它彻底冲出了开发者的圈子。OpenClaw 在 2026 年初发布，第一周就在 GitHub 上突破了十万颗星。Hermes 紧随其后，走的是同一条路。两者都把智能体模式交给了不写代码的人。一项调研任务。一份合同审阅。一次日程协商。同样的循环，换了不同的工具和不同的上下文。企业里的买家不再是开发者工具团队，而变成了任何一条有工作流的业务线。

截至 2026 年年中，市场就处在这个位置。每个工程组织都有构建者在本地跑编程智能体。每个业务组织都有人在试点助理智能体。几乎没有哪个组织在这一切底下有一个连贯的平台。这个系列的目的，就是填上这道缺口。

## 动手写一个 {#build-one}

要明白智能体是什么，就动手写一个。下面的代码是一个完整、能运行的智能体，用 Bun 上的 TypeScript 写成，大约两百行。它从命令行读取一个目标，带着一个小小的工具注册表调用 Anthropic 的 API，执行工具调用，把结果送回去，并在模型完成或迭代预算耗尽时停止。

要跟着做，你需要三样东西。

```
bun --version          # 1.1 or newer
echo $ANTHROPIC_API_KEY  # any valid key
bun add @anthropic-ai/sdk
```

本文的完整源码在 [`the-agent-platform-handbook`](https://github.com/raskell-io/the-agent-platform-handbook) 的 `post-01` 标签下。如果你更愿意在编辑器里读代码，可以克隆下来，运行 `bun agent.ts "list the three largest files under /etc"`。

### 工具接口 {#the-tool-interface}

最值得先定义的最小单元是工具。一个工具有名字、一段模型能读的描述、一个描述输入的 JSON schema，以及一个执行副作用并返回字符串的函数。

```typescript
// tools.ts
export type Tool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (input: Record<string, unknown>) => Promise<string>;
};
```

这就是全部的契约。`run` 函数返回字符串，因为模型会把结果当作文本来读。如果你的工具返回结构化数据，就用 `JSON.stringify` 序列化，让模型自己去解析。等我们在[第三篇](/articles/tools-how-agents-actually-do-things/)更仔细地看结构化输出时，会重新审视这个选择。

shell 工具是你能交给智能体的最有用的单个工具，它长这样。

```typescript
// tools.ts (continued)
export const shell: Tool = {
  name: "shell",
  description:
    "Run a shell command in the current working directory and return its stdout, stderr, and exit code as JSON.",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to run. Runs under `sh -c`.",
      },
    },
    required: ["command"],
  },
  run: async ({ command }) => {
    const proc = Bun.spawn(["sh", "-c", String(command)], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const code = await proc.exited;
    return JSON.stringify({ code, stdout, stderr });
  },
};
```

有几点值得注意。描述是写给模型看的，不是写给你看的。要具体写明工具做什么、返回什么、有哪些限制。JSON schema 是模型在决定要不要调用这个工具时看到的契约。Bun 的 `Bun.spawn` 返回的是流，所以我们把 stdout 和 stderr 都读出来，连同退出码合成一个模型可以据此推理的 JSON 载荷。

这个工具会执行任何 shell 命令。这极其不安全。不要部署它。我们会用[第二篇](/articles/your-agent-wants-root/)解释为什么，以及该怎么办。对于在你自己笔记本上、单用户、单目录的演示来说，它没问题。

### 循环 {#the-loop}

循环是大多数讲解匆匆带过的部分。我们慢慢来。

```typescript
// agent.ts
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { shell, type Tool } from "./tools";

const client = new Anthropic();
const tools: Tool[] = [shell];

const SYSTEM_PROMPT = `You are a careful command-line assistant.
You have access to a shell tool. Use it to investigate the user's
request and answer concretely. When you have the answer, stop calling
tools and reply in plain text.`;
```

我们引入 SDK，注册一个工具，再写一段系统提示词。系统提示词是第一块不属于用户输入的上下文。我们会用[第四篇](/articles/context-is-the-product/)讲如何把它发展成一套真正的上下文策略。眼下它只是一段话，告诉模型该如何表现。

```typescript
// agent.ts (continued)
async function step(messages: MessageParam[]) {
  return client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: tools.map(({ run, ...t }) => t),
    messages,
  });
}
```

每一次调用模型都是一个 `step`。我们发出去的工具列表只有 schema，从不包括 `run` 函数，所以要把它去掉。模型返回的消息要么是最终的文本回答，要么是调用一个或多个工具的请求。

循环本身五十行。

```typescript
// agent.ts (continued)
export async function run(goal: string, maxIterations = 10) {
  const messages: MessageParam[] = [{ role: "user", content: goal }];

  for (let i = 0; i < maxIterations; i++) {
    const response = await step(messages);
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("\n");
      console.log(text);
      return;
    }

    if (response.stop_reason !== "tool_use") {
      throw new Error(`unexpected stop reason: ${response.stop_reason}`);
    }

    const toolResults: ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const tool = tools.find((t) => t.name === block.name);
      if (!tool) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `unknown tool: ${block.name}`,
          is_error: true,
        });
        continue;
      }
      console.error(`> ${block.name} ${JSON.stringify(block.input)}`);
      try {
        const result = await tool.run(block.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(err),
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  console.error(`iteration limit (${maxIterations}) reached`);
}
```

从头走一遍。我们把目标作为第一条用户消息。我们调用模型。我们把模型的回复追加到对话里。如果模型给出 `end_turn`，我们打印最终文本并返回。如果模型给出 `tool_use`，我们找到它请求的工具，运行它，并把结果作为一个用户角色的 `tool_result` 块追加进去。模型在下一轮看到结果，再决定做什么。

带 `maxIterations` 的 `for` 循环，是这个智能体和无休止运行之间唯一的屏障。我们会在[第八篇](/articles/the-bill-is-part-of-the-loop/)用相当篇幅讨论迭代次数是不是合适的预算单位。它不是，但它最简单。先从最简单的开始。

入口只有两行。

```typescript
// agent.ts (continued)
const goal = process.argv.slice(2).join(" ");
if (!goal) {
  console.error("usage: bun agent.ts '<goal>'");
  process.exit(1);
}
await run(goal);
```

这就是整个智能体。算上 import 和系统提示词，大约一百四十行代码。按我们开头的定义，它是一个真正的智能体。它有目标、模型、上下文（系统提示词和不断增长的消息列表）、工具（一个）和循环（带 `maxIterations` 的 `for`）。

### 运行它 {#running-it}

一小段运行记录能让循环变得具体。

```
$ bun agent.ts "what is the largest TypeScript file under src and what does it do?"
> shell {"command":"find src -name '*.ts' -type f -printf '%s %p\n' | sort -nr | head -5"}
> shell {"command":"wc -l src/agent.ts"}
> shell {"command":"head -40 src/agent.ts"}
The largest TypeScript file under src is src/agent.ts at 4837 bytes
(150 lines). It implements an agent loop against the Anthropic Messages
API. It defines a single shell tool, sends the user's goal to the model,
executes any tool calls the model requests, feeds the results back, and
stops when the model returns an end_turn response or the iteration
budget of 10 steps is exhausted.
```

以 `>` 开头的行是智能体的工具调用，由循环里的 `console.error` 记录下来。最后一段是模型的 `end_turn` 文本。三次工具调用，一个最终回答，一个闭合的循环。

你有了一个智能体。

## 为什么大多数智能体演示都不是智能体 {#why-most-agent-demos-are-not-agents}

既然定义已经具体，你手里也有了一个能运行的例子，「什么是智能体、什么不是」这个问题就变得有用了。诚实的答案在这张表里。

| 系统                              | 目标 | 模型 | 上下文 | 工具 | 循环 | 结论     |
|--------------------------------------|:----:|:-----:|:-------:|:-----:|:----:|-------------|
| ChatGPT，2022 年上线时                 |  Y   |   Y   |    Y    |   N   |  Y   | 聊天机器人     |
| 今天的 ChatGPT（浏览、代码、文件）  |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |
| Cursor 的行内编辑                 |  Y   |   Y   |    Y    |   Y   |  N   | 补全  |
| 一个 GitHub Actions 工作流            |  Y   |   N   |    Y    |   Y   |  Y   | 工作流    |
| 纯检索增强聊天      |  Y   |   Y   |    Y    |   N   |  Y   | 聊天机器人+RAG |
| 一次函数调用 API 请求          |  Y   |   Y   |    Y    |   Y   |  N   | 工具调用   |
| 终端里的 Claude Code         |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |
| 本文的脚本              |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |
| Auto-GPT、BabyAGI                    |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |
| OpenClaw                             |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |
| 带一个 LLM 步骤的 Temporal 工作流 |  Y   |   Y   |    Y    |   Y   |  Y   | 智能体       |

前两行是同一个产品，相隔两年。ChatGPT 在 2022 年 11 月上线时，是一个没有工具的聊天窗口。如今同一个网页界面能浏览实时网络、在沙箱运行时里执行 Python、转换和阅读 PDF、生成图片。它跨过了那条线。有意思的是，面向用户的说法并没有变。它仍然被叫作聊天机器人。按我们采用的定义，它是一个智能体。边界在营销话术底下悄悄移动了。

这就是接下来两年整个行业里可以预期的模式。每个聊天产品都会悄悄长出工具。每个工作流产品都会悄悄长出模型。名称会落后于架构一两年。如果你只听名称，就会错过一个系统变成需要你换一种方式去治理的东西的那一刻。

纯 RAG 那一行是没有跨线的那一个。一个只充实自身上下文的检索增强聊天，并没有获得真正意义上的工具。模型无法根据它找到的东西决定去做点不同的事。它只是从更丰富的上下文里作答。有用，有时非常出色，但不是智能体。一旦同一个系统获得了「换个查询再搜一次」或「去取这份文档」这样的工具，它就是了。

带 LLM 的 Temporal 那一行，有意思的地方恰好相反。它是一个智能体。它也是一个工作流。这两个类别并不互斥。后面会有一篇文章解释，为什么几乎每个智能体的生产版本，最后都会被包进一个持久化工作流里。

这张表的意义不在于为这个词把关，而在于指出概念上的区别。聊天机器人的失败在于知道得不够。智能体的失败在于做错了事。一旦你的系统能够行动，失败模式就变了，你对运维人员所负的责任也随之改变。

## 失败模式 {#failure-modes}

上面的脚本，你最初运行的十次都会正常工作。它的有些失败模式显而易见。有些只有在生产环境里才看得到。下面是诚实的清单，大致按你遇到它们的顺序排列。

- **伪装成进展的无限循环。** 模型可以一直调用工具而永不收敛。`maxIterations = 10` 今天能把你从自己的演示里救出来。明天有人问一个更难的问题时，它就救不了你了。真正的预算是基于 token 或挂钟时间的，而不是基于步数。我们会在[第八篇](/articles/the-bill-is-part-of-the-loop/)好好解决这个问题。
- **成本失控。** 每一次迭代都是一次完整的模型调用，以整个对话为输入。token 成本大致随步数呈平方增长，因为每个新轮次都要把之前的所有轮次重新发一遍。一个十步的循环，花费超过一步调用的十倍。提示词缓存有帮助。在便宜的轮次换用更小的模型帮助更大。我们会用[第八篇](/articles/the-bill-is-part-of-the-loop/)来讲这个。
- **谎报成功。** 模型可能声称完成了任务，却并没有真正验证。shell 工具不检查答案是否正确。你问「你做了 X 吗？」，可能得到「做了」，而真相是「我试了，失败了，我放弃了」。评测（eval）就是为此存在的。后面有一篇文章会讲它。
- **损坏的工具输出。** 如果一个工具返回一兆字节的二进制数据，模型会噎住或者产生幻觉。工具输出需要经过摘要、截断或按 schema 整形。智能体不会替你做这件事。
- **没有隔离。** 如果模型认定 `rm -rf $HOME` 是正确的命令，shell 工具就会执行它。模型不会经常这么认定。但至少会有一次。这是下一篇的主题。
- **隐藏状态。** 每一次工具调用都会对运行时产生副作用。文件被创建。网络请求被发出。数据库行被插入。对话日志一样也记录不到。你可以重放模型的推理过程。你无法重放它推理时所面对的那个世界。严肃的系统靠幂等性和持久化执行来处理这一点。
- **并发边界情况。** 这个循环是顺序执行的。模型可以在一轮里请求多个工具，上面的例子会按顺序运行它们。如果其中两个工具都要写同一个文件，你就有了一个模型看不见的 bug。

这些都不是不去构建智能体的理由。它们是这个系列其余部分存在的理由。

## 这篇刻意略去的内容 {#what-this-post-left-out-on-purpose}

长文也仍然会略去一些东西。下面是有意的省略，以及会接手它们的文章。

- **隔离。** shell 工具很危险。在[第二篇：Your Agent Wants Root](/articles/your-agent-wants-root/) 里解决。
- **真正的工具注册表。** 一个工具只是演示。一个有用的智能体有四个到十几个工具。在[第三篇](/articles/tools-how-agents-actually-do-things/)里讲。
- **上下文策略。** 系统提示词只有一段话。真实的系统从磁盘加载上下文，并按任务来塑造它。在[第四篇](/articles/context-is-the-product/)和[第五篇](/articles/retrieval-is-a-tool-not-a-layer/)里讲。
- **跨会话的记忆。** 智能体在两次运行之间会忘掉一切。在[第六篇](/articles/memory-is-a-write-path/)里讲。
- **模型选择。** 我们把模型写死了。生产环境里的智能体会做路由。在[第七篇](/articles/the-model-is-a-dependency/)里讲。
- **工具协议。** 这里的工具接口是自定义的。业界已经汇聚到 MCP 上。在后面的一篇文章里讲。
- **框架。** 我们是从零写的。关于框架的讨论在系列后面。
- **身份、评测、持久性、经济性、治理。** 全部在第四和第五部分。

如果你读一下这个系列的目录，就能看出它的形状：系列中其余的每一篇，都在修补你刚刚构建的这个智能体的一个局限。

## 它在平台中的位置 {#where-this-lands-in-the-platform}

本文开头那张图，是最终参考架构里最小的那个方框。智能体循环位于运行时之内。运行时位于一个集群之内。集群位于一个具备身份、可观测性、治理和控制平面的平台之内。系列结束时我们得到的形状，和开始时的形状一模一样，只是放大到了企业规模，每个组件都被展开，各自有了生产级的完整讲述。

你可以用一条规则把整个系列装进脑子里。每一篇增加技术栈的一层，并解释为什么下面那一层单靠自己是不够的。

往上一层是运行时。你刚刚交给前沿模型的 shell 工具，是一把上了膛的枪。下周我们讲怎样把它指向安全的地方。

## 下一篇 {#next}

**第 2 篇：[Your Agent Wants Root](/articles/your-agent-wants-root/)。** 为什么一个 Docker 容器不够，以及 Firecracker、gVisor 和 Kata 实际上解决了什么。周四发布。
