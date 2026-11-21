+++
title = "几乎无关紧要：当智能体写代码时，如何选择编程语言"
date = 2026-11-19
description = "当智能体写下大部分代码，语言没有以前那么重要了，但也并非毫不重要。Rust、Go、Elixir 和 Haskell 仍然能给你带来什么。"

[extra]
author = "Raffael"
image = "almost-irrelevant.avif"
cover = "covers/almost-irrelevant.avif"
in_short = [
  "编程智能体吸收了过去决定语言选择的那些成本，也就是学习曲线、样板代码和招聘人才池，所以这个选择远没有以前那么重要了。",
  "剩下的是智能体离开之后一门语言还能做出的承诺：编译器检查什么，运行时在故障下如何表现，代码在评审时读起来如何，以及它在整个公司范围内如何组合。",
  "Rust 用于无论如何都必须正常工作的东西，也就是 C 和 C++ 过去占据的领地，以及替换大型机上用 COBOL 写的核心系统；Go 用于整个公司共享的朴素代码，也就是 Java 过去占据的领地。",
  "Elixir 用于天生分布式的平台，以及一个人运营的雄心勃勃的项目，只是类型系统仍在到来的路上；通过 bhc 使用的 Haskell，则是押注一种不同的软件构建方式：经过验证的含义不断积累，而不是一再重写。",
  "Python 和 TypeScript 在笔记本和浏览器里保住各自的位置，而人们越来越多写下的是需求，用 Markdown 和 JSON，而不是用编程语言。",
]
+++

如果大部分代码都由智能体来写，它用哪门语言写还重要吗？

在我职业生涯的大部分时间里，选择语言其实是在选择人。你能招到谁，他们要多久才能上手，他们已经会什么，以及他们在第一个月里会有多讨厌借用检查器。这些成本决定的语言之争，比任何基准测试决定的都多，而如今它们大多已经坍塌。智能体写地道的 Rust 和写 Python 一样顺手。它不介意样板代码，不需要花一个月学习生命周期，对制表符也没有任何意见。过去让团队对 Rust、Elixir 或 Haskell 望而却步的学习曲线，现在大体上成了智能体的问题。

所以我的回答是：语言已经变得几乎无关紧要，但并非完全无关紧要，因为一门语言从来不只是一种敲代码的方式。它还是一个编译器，决定在任何东西运行之前检查什么；是一个运行时，决定出故障时会发生什么；是一种风格，决定一个人能多快评审智能体写出来的东西；也是一个模块系统，决定这些代码如何与组织里已有的其他一切契合。这些都没有消失，其中有些比以前更重要。

关于编程语言长远的走向，我在 [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/) 里写过。这篇文章是它的实践篇：我今天会选用哪些语言，用来做什么，以及为什么。它带有我的立场，而且只谈四门语言，因为我用的就是这四门。

## 智能体吸收了什么，又没有吸收什么 {#what-the-agent-absorbs-and-what-it-does-not}

arcanist.sh 上的文章 [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/) 提出了一个我一再回想的论点：常见的语言评分表本身是公允的，但它们的权重假定作者是一个人，必须把整个程序装在脑子里。作者换了，权重也就换了。大致如下：

| 一门语言让你付出或给你的东西 | 由人写代码时的权重 | 由智能体写代码时的权重 |
|---|---|---|
| 学习曲线、繁文缛节、样板代码 | 高 | 低：由智能体承担 |
| 招聘人才池的大小 | 高 | 较低：写代码的人更少，评审代码的人更多 |
| 编译器在任何东西运行之前检查什么 | 中 | 高：生成很便宜，验证才是瓶颈 |
| 代码在评审者眼中读起来如何 | 中 | 高：每一行仍然需要一个读者 |
| 构建和测试的速度 | 中 | 高：这个循环以机器的速度运转 |
| 运行时在负载和故障下如何表现 | 高 | 不变 |
| 生态系统和库 | 高 | 依然高：智能体也复用库 |

失去权重的那些行关乎编写；获得权重的那些行关乎信任已经写好的东西。这就是本文其余部分的视角：对每一门语言，它对团队里没人亲手敲过的代码做出什么承诺？

为了让示例可以相互比较，下面每一段代码都处理同一个小需求的一部分，就是银行核心系统里比比皆是的那种：为一个账户计入月度利息，按远离零的方向四舍五入到分，并且绝不计入已关闭的账户。它在文章快结束时会被完整写出来，用的是我认为需求将来会采用的形式。

## Rust：用于必须正常工作的东西 {#rust-for-things-that-have-to-work}

Rust 占据着 C 和 C++ 过去占据的领地：代理、操作系统、运行时、编译器、引擎，以及任何要连续运行数月、处在热路径上、或者要处理怀有恶意的人所提供输入的东西。借用检查器在编译期就带来内存安全和无数据竞争，而且不需要垃圾回收器；类型系统则让人很自然地把不变量放在编译器看得见的地方。

Rust 出了名的代价，是与借用检查器的搏斗，而这场搏斗正是智能体能吸收的那类成本。Rust 甚至把它变成了优势，因为它的编译器错误精确、局部、可操作，这使它们几乎是在循环中工作的模型的理想反馈。智能体提出方案，编译器带着行号和建议提出异议，智能体修好它。等到一个人来读这段代码时，一整类错误已经消失了。

下面就是两个线程往同一个账本里追加记录时的那种反馈；在许多语言里，这段代码能编译通过，然后只在生产环境、在负载之下偶尔出错：

```rust
let mut ledger = Vec::new();
let a = thread::spawn(move || ledger.push("interest"));
let b = thread::spawn(move || ledger.push("fees"));
```

```text
error[E0382]: use of moved value: `ledger`
 --> src/main.rs:6:27
  |
5 |     let a = thread::spawn(move || ledger.push("interest"));
  |                           ------- ------ variable moved due to use in closure
  |                           |
  |                           value moved into closure here
6 |     let b = thread::spawn(move || ledger.push("fees"));
  |                           ^^^^^^^ ------ use occurs due to use in closure
  |                           |
  |                           value used here after move
  |
help: consider cloning the value before moving it into the closure
```

程序根本不会运行，而错误信息准确地说明了在哪里、为什么。它也显示了编译器的局限，以及一个人或一条需求仍然重要的地方：建议的修复办法，也就是克隆这个向量，可以编译，但它给每个线程各自一个账本，而这并不是银行想要的。正确的修复是用一把锁保护的一个共享账本，`Arc<Mutex<Vec<_>>>`，而要选中它，就得知道这段代码是做什么用的。编译器把智能体的选项收窄到安全的那些；需求则在其中做出选择。

证明这一点在大规模上很重要的证据，并不是我的。Google 在 2024 年报告说，Android 中内存安全漏洞的占比「随着开发转向内存安全语言，在 6 年间从 76% 降到了 24%」，而且问题「绝大部分出在新代码上」（[Google Security Blog](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)）。一年之后，同一个团队报告说，Rust 中的内存安全漏洞密度比 Android 的 C 和 C++ 低「超过 1000 倍」，而且 Rust 改动的回滚率大约低四倍（[Google Security Blog](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html)）。如果智能体即将写出大量新代码，那么这些新代码最安全的落脚处，就是一门让这些错误无法编译通过的语言。

出于这个原因，我构建的大部分东西都用 Rust。[Zentinel](https://zentinelproxy.io/) 是一个反向代理，挡在别人的流量前面。Aqueduct 是一个持久化执行引擎，必须在崩溃之后把一次运行重放出同样的结果（[The River and the Canal](/articles/the-river-and-the-canal/) 解释了原因）。hx 和 bhc 是别人的构建所依赖的工具链（[Why We Built a Haskell Package Manager in Rust](/articles/why-we-built-a-haskell-package-manager-in-rust/) 讲了这个故事）。Shiioo 在我自己的机器上运行智能体，并记录它们做了什么（[Shiioo, Re-imagined](/articles/shiioo-reimagined-and-a-home-ai-lab/)）。这些东西一旦出错代价都很高，而且每一个都以单个静态二进制文件的形式发布。

同样的推理，让 Rust 成为我在这类工作中最大的一项上的首选：替换银行、保险公司和公共管理机构仍在大型机上运行的核心系统，其中大多数是几十年前用 COBOL 写的。这些系统能用。它们可靠，十进制运算做得正确，而且挺过了每一次替换它们的尝试，主要是因为没有人能有把握地说出它们的全部代码都做了什么。智能体改变了这个问题的一半。它们耐心地阅读 COBOL，解释一个程序做了什么，并且不知疲倦地写出新版本。它们改变不了的，是新系统必须至少和旧系统一样可靠，而这正是语言起作用的地方。Rust 给你大型机的优点，却不需要大型机：没有未定义行为，没有垃圾回收器在一次记账运行中途停顿（Discord 在 2020 年正是因为这个原因把一个服务从 Go 迁到了 Rust，此前 Go 的垃圾回收器至少每两分钟运行一次，造成了[周期性的延迟尖峰](https://discord.com/blog/why-discord-is-switching-from-go-to-rust)），有用于金额的精确十进制类型，比如 [rust_decimal](https://docs.rs/rust_decimal/)，还有一个在程序运行之前就拒绝整类错误的编译器。利息本身算得对不对，仍然要由需求和它的测试来判断，前面那个被克隆的账本已经说明了这一点。

金额这部分很短。COBOL 程序把金额保存为定点十进制数，替换它的系统也必须这样做，绝不能用二进制浮点数，在那里 `0.1 + 0.2` 等于 `0.30000000000000004`：

```rust
use rust_decimal::{Decimal, RoundingStrategy};
use rust_decimal_macros::dec;

/// Monthly interest, rounded half away from zero to the cent.
fn monthly_interest(balance: Decimal, annual_rate: Decimal) -> Decimal {
    (balance * annual_rate / dec!(12))
        .round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero)
}

// monthly_interest(dec!(1234.56), dec!(0.015)) == dec!(1.54)
```

舍入规则按名字写进了代码，因为一条只存在于某人对旧系统行为记忆中的舍入规则，正是迁移出错的方式。

大型机用批处理窗口和事务监控器做的事，Rust 用它的异步运行时 [Tokio](https://tokio.rs/) 来做：在少数几个线程上运行成千上万个并发任务，带有定时器、超时和取消。Tokio 本身运行在一个进程里；分布来自于在负载所需的那么多台机器上运行许多小的二进制文件，前面是一个做复制的数据库。迁移本身应该刻意保持平淡：让新旧两个系统在相同的输入上并行运行，比较每一个输出，等它们一致之后，再一次切换一个产品或一个批次。用 Tokio，这种比较的核心只有几行：

```rust
/// Parallel run: the mainframe stays the system of record, the new core shadows it.
async fn post_interest(
    legacy: &Legacy, core: &Core, divergences: &Divergences, balance: Decimal,
) -> Outcome {
    let (old, new) = tokio::join!(legacy.post(balance), core.post(balance));
    if old != new {
        divergences.record(balance, &old, &new).await;
    }
    old
}
```

两个系统同时得到相同的输入，算数的是旧系统的答案，每一处分歧都被记录下来，等人去解释。这种比较才是真正的工作，而这正是智能体擅长的工作。语言则让人在此之后可以放心信任它们产出的东西。

Rust 有它的代价，智能体并不能把它们全部消除。构建比 Go 慢。异步 Rust 仍然比它应有的样子更难。而且对一个读不惯生命周期的人来说，Rust 评审起来并不快，当评审者来自另一个团队时，这一点很重要。（Google 的 Android 工程师报告的情况正好相反，说 Rust 改动在评审上花的时间少了大约四分之一，但他们比较的对象是 C++，不是 Go，而且他们每天都在评审 Rust。）我不会默认用它来写一家公司的内部服务，只会用它来写那些服务承受不起出错的部分。

## Go：用于整个公司共享的代码 {#go-for-code-a-whole-company-shares}

Go 就是 Java 过去之于大型组织的那个角色：它们成百上千地运行的那些朴素而长寿的服务所用的语言，由许多团队来写，由更多的团队来读。长版本我写在 [Building IT Intelligence](/articles/building-it-intelligence/#why-go) 的「为什么用 Go」一节里，这里是短版本。

Go 地道到了乏味的地步，而在一家公司里，这是最高的赞誉。做一件事通常只有一种方式，`gofmt` 决定了排版，错误是值，在发生的地方处理，依赖是传进来的，而不是由框架变出来的，这门语言也不提供那套把企业级 Java 变成工厂的工厂的机制。导入的是模块路径，通常就是一个 Git 仓库的地址，所以引用另一个团队的代码只是文件里的一行，而不是给制品仓库团队提的一张工单。在一个模块内部，一切都从源码编译，这让全公司范围的单一仓库变得很便宜：没有需要发布、打版本、等待的内部库。它几秒钟就能编译完，运行很快，以单个二进制文件发布，它的工具链（测试、vet、竞态检测器、性能剖析、语言服务器）都是自带的。而 [Go 1 兼容性承诺](https://go.dev/doc/go1compat) 说，按照规范编写的程序「将继续编译并正确运行，无需改动」，这正是企业软件存活的时间尺度。

智能体带来的变化是，这种乏味成了双重的资产。智能体写的 Go 看起来和人写的 Go 一样，因为风格上的余地太小了，所以来自另一个团队的评审者读它，就像读散文一样快。同样的千篇一律也让智能体很容易在一个庞大的 Go 代码库里找到方向：一个函数做的就是它的签名所说的事，调用图就摆在那里。

用 Go 写的利息规则是这样的，无论哪个团队或哪个智能体写它，读起来都一样：

```go
var ErrClosed = errors.New("account is closed")

// MonthlyInterest returns the interest in cents for one month,
// rounded half away from zero, as the requirement says.
func MonthlyInterest(ctx context.Context, accounts Accounts, iban string, bps int64) (int64, error) {
	acct, err := accounts.Get(ctx, iban)
	if err != nil {
		return 0, fmt.Errorf("monthly interest for %s: %w", iban, err)
	}
	if acct.Closed {
		return 0, fmt.Errorf("monthly interest for %s: %w", iban, ErrClosed)
	}
	return roundHalfAway(acct.Balance*bps, 10000*12), nil
}
```

依赖是一个传进来的接口，每一次失败都是一个值，在向上传递的途中加上上下文，调用方可以问 `errors.Is(err, ErrClosed)`，而不必解析一条消息，这些都不需要向另一个团队的人解释。

代价是 Go 检查的比 Rust 或 Haskell 少。它没有和类型（sum types），`nil` 仍然是一个值，相当一部分正确性存在于测试之中，而不是类型之中。对一家公司来说，这通常是正确的取舍：必须正确的那个系统用 Rust，围绕它的上百个服务用 Go。

## Elixir：用于天生分布式的平台 {#elixir-for-platforms-that-are-distributed-by-nature}

Elixir 运行在 BEAM 上，也就是 Erlang 虚拟机，而 BEAM 是为电话交换机而建的：数以百万计的小型隔离进程，重启崩溃者的监督者，节点之间的消息作为一等公民，以及一种为故障而设计、而不是假装故障不会发生的文化。大多数语言靠库和基础设施来加上分布式能力。在 BEAM 上，它是默认的思考方式。

BEAM 上的一个进程并不是操作系统线程。根据 [Erlang efficiency guide](https://www.erlang.org/doc/system/eff_guide_processes.html)，新建一个进程占用 327 个字的内存，大约 2.6 KB，并且有自己的堆，所以一台机器能运行几十万个进程，一个进程的垃圾回收也从不会让其他进程停下来。（基于 Erlang 构建的 WhatsApp 报告说，在 2012 年 1 月，单台服务器上维持了[超过两百万个 TCP 连接](https://blog.whatsapp.com/1-million-is-so-2011)。）进程之间不共享任何东西，通过消息交谈，并由监督者看管。一个应用是一棵监督者树，一个集群是分布在能相互发送消息的机器上的若干棵这样的树。这是 broodwar.live 的那棵树，做了删减：

```elixir
children = [
  Broodwar.Repo,                                    # the database pool
  {DNSCluster, query: dns_cluster_query()},         # find the other nodes
  {Phoenix.PubSub, name: Broodwar.PubSub},          # messages across nodes
  {Oban, Application.fetch_env!(:broodwar, Oban)},  # durable jobs in PostgreSQL
  Broodwar.Ingestion.LiquipediaThrottle,            # one process, one rate limit
  BroodwarWeb.Endpoint                              # one process per connection
]

Supervisor.start_link(children, strategy: :one_for_one, name: Broodwar.Supervisor)
```

而这是它在两台机器上运行时的样子：

{% diagram(title="One application on the BEAM, on two nodes") %}
   node a                                     node b
  ┌────────────────────────────────────┐      ┌──────────────────────┐
  │ Broodwar.Supervisor (one_for_one)  │      │ Broodwar.Supervisor  │
  │  ├─ Repo        database pool      │      │  ├─ Repo             │
  │  ├─ PubSub ◀───────────────────────┼──────┼─▶├─ PubSub           │
  │  ├─ Oban        job queues         │      │  ├─ Oban             │
  │  ├─ Throttle    crashed, so the    │      │  ├─ Throttle         │
  │  │              supervisor starts  │      │  └─ Endpoint         │
  │  │              a fresh one alone  │      │      ○ ○ ○ ○ ...     │
  │  └─ Endpoint                       │      └──────────┬───────────┘
  │      ○ ○ ○ ○ ○ ○ ○ ○ ...           │                 │
  │      one process per connection    │                 │
  └─────────────────┬──────────────────┘                 │
                    └─────────────────┬──────────────────┘
                                      ▼
                      PostgreSQL: data, and Oban's jobs
{% end %}

当限流进程崩溃时，它的监督者会启动一个新的，而打开的连接、作业队列和另一个节点都不会察觉。在一个节点上发布的消息会到达另一个节点上的订阅者。这就是整个分布式系统，其中没有任何一部分需要一件单独的基础设施。

这让 Elixir 成为我在天生分布式的平台上的选择：任何全渠道的东西，同一段对话会通过网页、聊天、邮件和电话到来；任何有实时在线状态和大量打开连接的东西；任何有大量必须在重启后存活的后台工作的东西。后台工作正是 [Oban](https://oban.hexdocs.pm/Oban.html) 发挥作用的地方，这是一个作业框架，它「使用 PostgreSQL、MySQL 或 SQLite3 进行持久化」。作业存放在你已有的数据库里，带有重试、唯一性和队列，不需要另外运行一个消息代理。在 [broodwar.live](https://broodwar.live) 里，一个从 Liquipedia 摄取赛事页面的作业是这样的：

```elixir
# api.broodwar.live, lib/broodwar/ingestion/match_sync.ex (trimmed)
use Oban.Worker,
  queue: :ingestion,
  max_attempts: 3,
  unique: [period: 3600, fields: [:args]]

@impl Oban.Worker
def perform(%Oban.Job{args: %{"pages" => pages}}) when is_list(pages) do
  case run(pages) do
    {:ok, _summaries} -> :ok
    {:error, {:rate_limited, _} = reason} -> {:cancel, reason}
    {:error, reason} -> {:error, reason}
  end
end
```

重试、一小时内去重，以及在数据源对我们限流时停下来而不是重试的决定：八行代码，每一行都能被从没见过 Elixir 的人读懂。[Humankind](https://humankind.plus) 是一个收藏人们的声音和故事的档案库，它以同样的方式运行八个队列（转写、嵌入、语音合成、故事生成等等），与 Phoenix 的实时更新并列，在同一个运行时里。

这也是为什么 Elixir 是我在一个人运营的雄心勃勃的项目上最喜欢的语言。一家公司会拆分成 Web 层、队列、消息代理、缓存和集群管理器的东西，BEAM 用一个你仍然可以装在脑子里的系统就给了你。它没有 Go 那样的招聘人才池或跨团队的约定，所以我不会把它作为大型组织的默认选择，但一个小团队靠它能走得很远。

它的弱点一直是类型，而有了智能体，这一点分量更重，因为动态语言在运行之前检查的智能体所写内容更少。这种情况正在改变。2026 年 6 月发布的 [Elixir 1.20](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released) 能够「在不引入类型注解的情况下，对每一个 Elixir 程序进行类型推断和渐进式类型检查」。带类型的结构体和类型签名还在后面，没有确定的日期（[路线图](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/)）。在那之前，我依靠模式匹配、typespec 和测试，并且评审智能体写的 Elixir 比评审智能体写的 Rust 更加仔细。

如果你今天就想要带静态类型的 BEAM，有 [Gleam](https://gleam.run/)，「一门用于构建可扩展的类型安全系统的友好语言」。它编译到同一个虚拟机，所以拥有进程、监督者和分布式能力，它能使用用 Erlang 和 Elixir 写的包，并且自 [2024 年 3 月的 1.0 版本](https://gleam.run/news/gleam-version-1/) 以来一直保持稳定。一切都有类型，并由编译器检查，而这正是智能体写代码时分量加重的那个性质。它的生态系统比 Elixir 的年轻，也没有用它写的 Phoenix 或 Oban，不过可以通过它的外部函数接口调用 Elixir 库，类型则要手写。对于 BEAM 上一个正确性比框架更重要的新服务，它是我会最先考虑的选择。

## Haskell 和 bhc：另一种押注 {#haskell-and-bhc-a-different-kind-of-bet}

Rust、Go 和 Elixir 是对我们早已有的问题的更好回答。而 Haskell，以我正在构建的这种形式，回答的是一个只有在智能体写代码之后才出现的问题：当生成变得廉价时，会发生什么？

模型几秒钟就能写出看似合理的代码，而看似合理的代码常常是错的，所以稀缺的工作从写代码转移到了确知代码正确（以及，正如我在 [The Behavioural Turn](/articles/the-behavioural-turn/) 里论证的那样，转移到决定究竟有多少代码需要有人去读）。在生产语言里，Haskell 是让这一点可检查程度最高的那一门。一个类型良好的函数，就是一个变换有效的小小证明；副作用在签名里可见；非法状态可以被做成无法表示。模型不必是对的；它必须是可检查的，而编译器就是检查者。检查者甚至可以坐进生成过程内部：苏黎世联邦理工学院（ETH Zurich）和加州大学伯克利分校（UC Berkeley）的一个团队让类型检查器逐个 token 地约束模型的输出，把生成的 TypeScript 中的编译错误减少了一半以上（[Mündler et al., 2025](https://arxiv.org/abs/2504.09246)）。

利息需求说，利息绝不计入已关闭的账户。在大多数语言里，这条规则是一个需要有人记住的 `if`。在 Haskell 里，它可以就是数据的形状：

```haskell
newtype Cents       = Cents Integer
newtype BasisPoints = BasisPoints Integer

data OpenAccount   = OpenAccount { iban :: String, balance :: Cents }
data ClosedAccount = ClosedAccount { closedIban :: String }
data Account       = Open OpenAccount | Closed ClosedAccount

-- Interest can only be posted to an open account: the type says so.
postInterest :: BasisPoints -> OpenAccount -> OpenAccount
postInterest (BasisPoints bps) acct = acct { balance = Cents (c + interest) }
  where
    Cents c  = balance acct
    interest = roundHalfAway (c * bps) (10000 * 12)

monthEnd :: BasisPoints -> Account -> Account
monthEnd rate (Open a)   = Open (postInterest rate a)
monthEnd _    (Closed c) = Closed c
```

一个试图给已关闭账户计入利息的智能体，会在任何东西运行之前从 `bhc check` 得到这个，而不是一个失败的测试，或者几周后的一份缺陷报告：

```text
Type errors:
  1: type mismatch: expected `OpenAccount`, found `ClosedAccount`
```

没有人需要记住这条规则，因为程序根本无法表达对它的违反。这正是 [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/) 的押注，也是 [arcanist.sh](https://arcanist.sh/manifesto/) 存在的原因。

[bhc](https://arcanist.sh/bhc/)，即 Basel Haskell Compiler，是同一门语言的一个从零开始的编译器，用 Rust 写成，它加入了两个想法，我认为它们让这成为一种不同的软件构建方式，而不只是一个更好的 Haskell。

第一个想法是，运行时是你选择的一份契约。同一份源码在某个配置档下编译：`default` 是照常的惰性求值，`server` 是带截止时间的结构化并发，`numeric` 是融合的、严格的数值代码和张量内核，`edge` 是一个极简的 WebAssembly 运行时。性能边界不再是口口相传的经验，而成为一个函数本身的一部分：不只是「这是正确的」，而是「这在这份契约下是正确的」。

第二个想法是[公共资源（the commons）](https://arcanist.sh/commons/)。今天，每一个智能体，在每一次会话里，都要重新编写和检查同一个日期解析器，然后把验证结果扔掉。bhc 把每一个定义展开为它的显式含义，类型类实例都被写明，而这个含义可以按其内容来寻址。于是一个定义带有一个身份，一份关于它已经被检查了什么、还没有被检查什么的精确记录，以及所有编译、测试、评审过它或为它担保的人的签名。两个人用不同风格写出同一个函数，就是写出了同一个函数，他们的证据汇集在同一个对象上。智能体的工作从「写这段代码」变成了「用已经检查过的含义把它组装出来，在什么都没有的地方，把它写出来、证明它，并把它留给下一个人」。[The Proof You Only Have to Write Once](/articles/the-proof-you-only-have-to-write-once/) 是长版本。

这就是我所说的一种不同的软件构建方式：软件的单位不再是一个装满指令的文件，而是一份在明确契约下经过验证的含义，在所有需要它的人之间共享。

这也是离完成最远的部分。bhc 处于 0.2 版本。它能对 Pandoc 的全部 221 个模块做类型检查并编译，Pandoc 的 Markdown 读取器和 HTML 写入器能端到端地运行，但垃圾回收器还没有接入编译后的代码，所以长时间运行的服务器暂时还不适合（[现状](https://arcanist.sh/bhc/status/)）。公共资源是一个方向，路线图上有了最初几步，还不是一个你今天就能使用的服务。我之所以朝它构建，是因为我认为一旦大部分代码都是生成的，验证就必须走向那里，而 Haskell 是离这一点最近、最可能达到的语言。

## 显而易见的反对意见 {#the-obvious-objection}

反对这一切最有力的论点是：智能体最擅长的是训练数据最多的语言，所以你应该什么都用 Python 和 TypeScript 写，然后不再操心。

这话有一定道理，两门语言也都赢得了自己的位置。Python 统治着数据科学、机器学习和笔记本，在那里它的库无可匹敌，很多代码运行一次就被扔掉。JavaScript 是浏览器的语言，而 TypeScript 是写它而不至于后悔的方式；用别的语言写前端，通常是自讨苦吃。但凡是必须长久存在的东西，我很少再回到它们中的任何一个。我过去选用它们，是为了写得快、为了熟悉，而这些正是智能体如今吸收掉的成本；剩下的，是一个在生产环境里才发现类型错误的运行时。

一个模型写一门语言有多流利，和写出来的结果能保证什么，是两个不同的问题。流利度的差距比这个反对意见所设想的要小：MultiPL-E 把标准的代码生成基准测试翻译成了 18 种语言，发现一个模型在其中几种语言上的得分与它的 Python 得分持平甚至更高（[Cassano et al., 2022](https://arxiv.org/abs/2208.08227)）。保证上的差距也可以衡量：研究者给那些逃过了测试和评审的 JavaScript 缺陷加上类型注解后，TypeScript 标记出了其中的 15%（[Gao, Bird and Barr, 2017](https://earlbarr.com/publications/typestudy.pdf)）。无论模型写 Rust 和写 Python 的水平之间还剩下多少差距，那都是便宜那部分里的差距；而两个编译器所检查内容之间的差距，在昂贵的那部分里。

另一个公允的反对意见是，对一个组织来说，四门语言多了三门。对大多数公司而言确实如此，这也是为什么我不会把这份清单作为政策交给一家公司。一家公司应该只挑很少的几门语言，并给每一门一份工作。我的是这样的：

| 如果你构建的东西 | 选用 | 因为 |
|---|---|---|
| 绝不能出错、处在热路径上、处理恶意输入，或者要替换一个大型机核心系统 | Rust | 编译器排除了整类整类的故障，而且没有垃圾回收器 |
| 是许多团队都要阅读和修改的上百个服务之一 | Go | 只有一种地道写法，构建快，单一仓库无需发布库 |
| 天生分布式、实时、全渠道，或者是一个小团队的整个平台 | Elixir | 监督、分布式和持久化作业随运行时而来 |
| 需要它的正确性被检查、被共享、被在其上继续构建 | Haskell 加 bhc | 类型即证明，运行时契约，不断积累的验证 |
| 存在于笔记本、训练循环或浏览器里 | Python 或 TypeScript | 它们的库就在那里，别的都难以企及 |

## 人们转而会写什么 {#what-people-will-write-instead}

如果代码由智能体来写，人写什么？越来越多的是需求：一个系统必须做什么，哪些情形重要，什么绝不能发生，以及谁批准什么。这种写作在精确时是声明式的，不精确时是描述性的，但无论哪种，它说的都是什么应当为真，而不是如何达到那里。

本文每一段代码背后的那条利息规则，按我现在写需求的方式写出来，就是一个简短的 Markdown 文件：

```markdown
## Monthly interest

- Interest is posted on the last business day of each month.
- Monthly interest is balance × annual rate ÷ 12, in cents,
  rounded half away from zero.
- A closed account never receives interest.
- Until the switch-over, the mainframe's result is the one that counts,
  and every difference from the new core is recorded.
```

以及把它钉牢的那些用例，用 JSON 写：

```json
[
  { "case": "ordinary month", "account": { "status": "open", "balance": "1234.56" },
    "annual_rate": "0.015", "expect": { "interest": "1.54" } },
  { "case": "closed account", "account": { "status": "closed", "balance": "1200.00" },
    "annual_rate": "0.015", "expect": { "interest": "0.00" } }
]
```

上面四门语言里的一切，都在这两个文件的下游。

这种写作的格式，一是 Markdown，用于意图、决策和智能体阅读的指令（一份简报、一份设计记录、一个 `AGENTS.md`），二是 JSON，以及作为它更友好亲戚的 YAML 和 TOML，用于任何有结构的东西：一份模式、一份配置、两个系统之间的一份契约、一个测试所对照的用例（也就是 [Evaluation Closes the Loop](/articles/evaluation-closes-the-loop/) 用来给智能体打分的那些已知用例）。两者都不是编程语言，而它们是我现在手工编辑最多的两种格式。这个网站就是一个例子：文字是 Markdown，数据是 TOML 和 JSON，而把它们变成页面的代码，大部分是智能体写的。

就连这也可能只是一个过渡阶段。Markdown 和 JSON 对人重要，是因为人还在读它们，而随着它们所描述的内容越来越多地由机器来检查，人的那部分会收缩为陈述意图和批准结果。一条精确到机器可以检查的需求，离一个类型已经不远了（这是 [Source Code Is the New Assembly](/articles/semantic-artifacts-and-meaning-engines/) 的论点），这也是我认为 Haskell 这个押注不只是押在代码的去向上、也是押在需求的去向上的又一个理由。

## 选择还剩下什么 {#what-is-left-of-the-choice}

当写代码的成本趋近于零，一门语言就不再是写作的工具，而成为关于没人亲手敲过的代码的一组承诺。按照智能体离开房间之后它仍然做出的承诺来选择它。

## 参考资料 {#references}

- Jeff Vander Stoep 和 Alex Rebert，[Eliminating Memory Safety Vulnerabilities at the Source](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)，Google Security Blog，2024 年 9 月 25 日。
- Jeff Vander Stoep，[Rust in Android: move fast and fix things](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html)，Google Security Blog，2025 年 11 月 13 日。
- Jesse Howarth，[Why Discord is switching from Go to Rust](https://discord.com/blog/why-discord-is-switching-from-go-to-rust)，2020 年 2 月 4 日。
- [Go 1 and the Future of Go Programs](https://go.dev/doc/go1compat)，Go 1 兼容性承诺。
- WhatsApp，[1 million is so 2011](https://blog.whatsapp.com/1-million-is-so-2011)，2012 年 1 月 6 日。
- José Valim，[Elixir v1.20 released: now a gradually typed language](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released)，2026 年 6 月 3 日，以及 [Type inference of all constructs and the next 15 months](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/)，2026 年 1 月 9 日。
- [Gleam](https://gleam.run/)，一门面向 BEAM 的静态类型语言，以及 [Gleam version 1](https://gleam.run/news/gleam-version-1/)，2024 年 3 月 4 日。
- [Tokio](https://tokio.rs/)，Rust 的异步运行时，以及 [rust_decimal](https://docs.rs/rust_decimal/)，用于金融计算的十进制数。
- [Oban](https://oban.hexdocs.pm/Oban.html)，以数据库为后端的 Elixir 后台作业。
- arcanist.sh，[Manifesto](https://arcanist.sh/manifesto/)、[The Commons](https://arcanist.sh/commons/) 和 [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/)
- [bhc](https://arcanist.sh/bhc/) 和 [where bhc stands](https://arcanist.sh/bhc/status/)，最后更新于 2026 年 10 月 20 日。
- Federico Cassano et al.，[MultiPL-E: A Scalable and Extensible Approach to Benchmarking Neural Code Generation](https://arxiv.org/abs/2208.08227)，2022。
- Zheng Gao、Christian Bird 和 Earl T. Barr，[To Type or Not to Type: Quantifying Detectable Bugs in JavaScript](https://earlbarr.com/publications/typestudy.pdf)，ICSE 2017。
- Niels Mündler、Jingxuan He、Hao Wang、Koushik Sen、Dawn Song 和 Martin Vechev，[Type-Constrained Code Generation with Language Models](https://arxiv.org/abs/2504.09246)，2025。

### 延伸阅读 {#further-reading}

本站上那些支撑这篇文章的更长的论证：

- [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/)，关于显式的、声明式的和后语言时代的几种未来，以及我为什么押注 Haskell。
- [What Comes After the Last Programming Language](/articles/what-comes-after-the-last-programming-language/)，关于底层的机器会变成什么。
- [Why We Built a Haskell Package Manager in Rust](/articles/why-we-built-a-haskell-package-manager-in-rust/)，Rust 和 Haskell 在同一个项目里，各司其职。
- [The River and the Canal](/articles/the-river-and-the-canal/)，Aqueduct 和持久化执行背后的那篇文章。
- [How I Work These Days](/articles/how-i-work-these-days/)，与编程智能体一起工作在日常中是什么样子。
- [The Proof You Only Have to Write Once](/articles/the-proof-you-only-have-to-write-once/)，经过验证的 Haskell 的公共资源，完整版。

Rust 与内存安全：

- [Fearless Concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html)，*The Rust Programming Language* 中讲编译器在并发代码里排除了什么的那一章。
- [The Case for Memory Safe Roadmaps](https://www.cisa.gov/resources-tools/resources/case-memory-safe-roadmaps)，CISA 及合作机构，2023 年 12 月 6 日，关于规划从内存不安全语言迁出。
- [What is memory safety and why does it matter?](https://www.memorysafety.org/docs/memory-safety/)，ISRG 的 Prossimo 项目，一篇简短的入门。
- [Rust in the Linux kernel](https://docs.kernel.org/rust/index.html)，内核自己的文档。
- Martin Fowler，[Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)，在遗留核心系统继续运行的同时逐块替换它的模式。

Go 与大规模软件工程：

- Rob Pike，[Go at Google: Language Design in the Service of Software Engineering](https://go.dev/talks/2012/splash.article)，2012，说明 Go 为什么刻意保持朴素。关于本文论点，这是最好的单篇文本。
- [Effective Go](https://go.dev/doc/effective_go) 和 [Go Proverbs](https://go-proverbs.github.io/)，地道在实践中意味着什么。
- [Go Modules Reference](https://go.dev/ref/mod)，导入路径、版本和校验和如何运作。

BEAM、Elixir 与 Gleam：

- Joe Armstrong，[Making reliable distributed systems in the presence of software errors](https://erlang.org/download/armstrong_thesis_2003.pdf)，博士论文，2003，监督者和「let it crash」（任其崩溃）背后的推理。
- [OTP Design Principles](https://www.erlang.org/doc/system/design_principles.html)，Erlang 文档中关于监督树和行为模式的部分。
- Gary Rennie，[The Road to 2 Million Websocket Connections in Phoenix](https://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections)，2015 年 11 月 3 日，一台 BEAM 机器能保持多少打开的连接。
- Giuseppe Castagna、Guillaume Duboc 和 José Valim，[The Design Principles of the Elixir Type System](https://arxiv.org/abs/2306.06391)，2023，以及 Elixir 关于[渐进集合论类型](https://hexdocs.pm/elixir/gradual-set-theoretic-types.html)的指南。
- [The Gleam language tour](https://tour.gleam.run/)，看清 BEAM 上的带类型代码是什么样子的最快途径。

类型即证明，以及不断积累的验证：

- Philip Wadler，[Propositions as Types](https://homepages.inf.ed.ac.uk/wadler/papers/propositions-as-types/propositions-as-types.pdf)，程序与证明之间的对应关系，Haskell 这个押注就建立在它之上。
- Alexis King，[Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)，2019，如何在日常代码中把不变量放进类型。
- Yaron Minsky，[Effective ML Revisited](https://blog.janestreet.com/effective-ml-revisited/)，Jane Street，「让非法状态无法表示」（make illegal states unrepresentable）这句话的出处。
- [Unison](https://www.unison-lang.org/)，引入了内容寻址代码的语言，以及 arcanist.sh 的 [Building the Commons](https://arcanist.sh/blog/building-the-commons/)，讲把它带到 Haskell 背后的工程。
