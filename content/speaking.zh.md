+++
title = "演讲"
description = "关于智能体 AI、AI 编写代码之后的软件开发、平台自动化、边缘系统和应用安全的演讲、圆桌和播客。"
+++

## 演讲 {#talks}

演讲的幻灯片收录在[演讲稿](@/talks/_index.zh.md)中。

{% card(title="我不再亲手写大部分代码", url="/talks/iat-13-basel/", eyebrow="IT's ABOUT TECH #13，巴塞尔", meta="2026 年 6 月 10 日 · FHNW Aula", links=["打开幻灯片|/talks/iat-13-basel/", "活动页面|https://www.swissmadesoftware.org/en/news/2026/iat--13.html"]) %}
这是 swiss made software 的 IT's ABOUT TECH 晚间活动上一场 15 分钟的展示，活动主题是“亲手做软件工程已是昨天，现在是 AI 的时代。真的吗？”。这不是一场讲工具的演讲，而是一个故事：在 Claude Opus 4.5 和 Claude Code 出现之后，一名资深工程师经历了哪些变化；当瓶颈不再是时间时，积压多年的想法又会怎样。

**要点：**

- 瓶颈从把想法翻译成语法，转移到了决定做什么，以及判断结果是否可以接受
- 想法不是 AI 生成的。AI 让已有的想法走出了笔记本
- 人并没有消失。人只是移到了技术栈的更上层
{% end %}

{% card(title="自学习 WAF：用生成式 AI 驯服 ModSecurity 误报", url="https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq", eyebrow="RSAC 2026 · NCS-W01", meta="2026 年 3 月 25 日 · Moscone Center，旧金山", links=["在 RSAC 网站上查看本场次|https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq"]) %}
搭配 OWASP Core Rule Set（CRS）的 ModSecurity 是一款强大的开源 WAF，但调优误报依然痛苦又耗时。这场演讲介绍了一种自学习的方法：用生成式 AI 分析被拦截的请求，判断其是否合法，并自动生成调优规则，在减少人工工作量的同时，让人继续参与其中、负责审批。

**要点：**

- 生成式 AI 如何以很高的准确率对 WAF 误报进行分类
- 一条在人工监督下自动生成规则的实用流水线
- 在生产环境中应用这一方法的经验教训

**面向媒体的版本：** 用生成式 AI 自动发现并修复 WAF 误报，让 ModSecurity 保持有效，又免去调优的烦恼。
{% end %}

## 可邀请的主题 {#available-for}

我可以就以下主题参加技术演讲、圆桌和播客：

{% tiles(cols=2) %}
- **智能体 AI** 智能体平台、编排、上下文、工具调用、治理和可观测性。
- **AI 编写代码之后** 当 AI 写下大部分代码时会发生什么变化：验证、审查、工具，以及人的位置移向何处。
- **平台自动化** 自助式基础设施、工作流和护栏。
- **边缘系统** 反向代理、入口流量、策略执行。
- **应用安全** 务实的控制措施、事件响应、可运维性。
- **开放标准** 可持续的架构，而不是厂商锁定。
{% end %}

{% panel(eyebrow="邀请我", title="你有舞台、圆桌或播客吗？", contact=true) %}
请在 X 或 LinkedIn 上给我发消息，告诉我活动、日期和听众。
{% end %}
