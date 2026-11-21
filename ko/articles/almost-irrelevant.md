---
title: "거의 무관해진 선택: 에이전트가 코드를 쓸 때 언어를 고르는 법"
url: https://raskell.io/ko/articles/almost-irrelevant/
author: Raffael Schneider
date: 2026-11-19
description: "에이전트가 코드 대부분을 쓰면 언어는 예전보다 덜 중요해지지만, 아무 의미가 없어지지는 않습니다. Rust, Go, Elixir, Haskell이 여전히 주는 것입니다."
tags: [programming-languages, ai-engineering, rust, golang, elixir, haskell, type-systems]
lang: ko
translation_of: https://raskell.io/articles/almost-irrelevant/
---

# 거의 무관해진 선택: 에이전트가 코드를 쓸 때 언어를 고르는 법

## 요약

코딩 에이전트는 예전에 언어 선택을 좌우하던 비용, 즉 학습 곡선, 보일러플레이트, 채용할 수 있는 인력의 규모를 대신 떠안습니다. 그래서 언어 선택은 예전보다 훨씬 덜 중요해졌습니다. 남는 것은 에이전트가 떠난 뒤에 언어가 약속하는 것입니다. 컴파일러가 무엇을 검사하는지, 장애가 났을 때 런타임이 무엇을 하는지, 리뷰에서 코드가 어떻게 읽히는지, 회사 전체에서 코드가 어떻게 맞물리는지입니다. Rust는 무슨 일이 있어도 작동해야 하는 것들, 예전에 C와 C++가 차지하던 영역, 그리고 메인프레임 위의 COBOL 코어 시스템을 대체하는 일에 씁니다. Go는 회사 전체가 함께 쓰는 평이한 코드, 예전에 Java가 차지하던 영역에 씁니다. Elixir는 본질적으로 분산된 플랫폼과 한 사람이 운영하는 야심 찬 프로젝트에 쓰며, 타입은 아직 도입되는 중입니다. bhc를 통한 Haskell은 소프트웨어를 만드는 다른 방식에 거는 내기이고, 그 방식에서는 검증된 의미가 다시 쓰이는 대신 쌓여 갑니다. Python과 TypeScript는 노트북과 브라우저에서 제자리를 지킵니다. 그리고 사람들이 점점 더 많이 쓰는 것은 요구사항이며, 요구사항은 프로그래밍 언어가 아니라 Markdown과 JSON으로 쓰입니다.

에이전트가 코드 대부분을 쓴다면, 그 코드가 어떤 언어로 쓰이는지가 여전히 중요합니까?

제 경력 대부분 동안 언어 선택은 사람에 관한 선택이었습니다. 누구를 채용할 수 있는지, 생산성을 내기까지 얼마나 걸리는지, 그 사람들이 이미 무엇을 아는지, 그리고 첫 달에 빌림 검사기(borrow checker)를 얼마나 미워하게 될지였습니다. 이런 비용이 어떤 벤치마크보다 더 많은 언어 논쟁을 결정했고, 이제 그 비용은 대부분 무너졌습니다. 에이전트는 Python을 쓰는 것만큼 쉽게 관용적인 Rust를 씁니다. 보일러플레이트를 꺼리지 않고, 라이프타임을 익히는 데 한 달이 필요하지 않으며, 탭에 대한 의견도 없습니다. 팀들이 Rust, Elixir, Haskell을 멀리하게 만들던 학습 곡선은 이제 대체로 에이전트의 문제입니다.

그래서 제 답은 언어가 거의 무관해졌지만 완전히 그렇지는 않다는 것입니다. 언어는 언제나 타이핑하는 방식 이상의 것이었기 때문입니다. 언어는 무엇이 실행 전에 검사될지 정하는 컴파일러이기도 하고, 무언가 실패했을 때 무슨 일이 일어날지 정하는 런타임이기도 하며, 에이전트가 쓴 것을 사람이 얼마나 빨리 리뷰할 수 있는지 정하는 스타일이기도 하고, 코드가 조직이 가진 다른 모든 것과 어떻게 맞물릴지 정하는 모듈 시스템이기도 합니다. 그중 어느 것도 사라지지 않았고, 몇몇은 예전보다 더 중요해졌습니다.

프로그래밍 언어가 장기적으로 어디로 가는지는 [The Last Programming Language Might Not Be for Humans](https://raskell.io/articles/what-programming-languages-become-when-ai-writes-the-code/)에서 쓴 적이 있습니다. 이 글은 그 글의 실용적인 짝입니다. 제가 오늘 어떤 언어를, 무엇을 위해, 왜 집어 드는지에 관한 글입니다. 주관이 강한 글이고, 네 가지 언어를 다룹니다. 제가 쓰는 언어가 그 넷이기 때문입니다.

## 에이전트가 떠안는 것과 떠안지 않는 것 {#what-the-agent-absorbs-and-what-it-does-not}

arcanist.sh의 글 [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/)은 제가 계속 다시 떠올리는 주장 하나를 폈습니다. 흔히 보는 언어 스코어카드는 공정하지만, 그 가중치는 프로그램 전체를 머릿속에 담아야 하는 사람 저자를 전제한다는 것입니다. 저자가 바뀌면 가중치도 바뀝니다. 대략 이렇습니다.

| 언어가 요구하는 비용이나 주는 것 | 사람이 코드를 쓰던 때의 가중치 | 에이전트가 코드를 쓸 때의 가중치 |
|---|---|---|
| 학습 곡선, 형식적 절차, 보일러플레이트 | 높음 | 낮음: 에이전트가 치름 |
| 채용할 수 있는 인력의 규모 | 높음 | 낮아짐: 쓰는 사람은 줄고 리뷰하는 사람은 늘어남 |
| 실행 전에 컴파일러가 검사하는 것 | 중간 | 높음: 생성은 싸고, 검증이 병목임 |
| 리뷰어에게 코드가 어떻게 읽히는지 | 중간 | 높음: 모든 줄에는 여전히 읽는 사람이 필요함 |
| 빌드와 테스트 속도 | 중간 | 높음: 루프가 기계의 속도로 돎 |
| 부하와 장애 상황에서 런타임이 하는 일 | 높음 | 변함없음 |
| 생태계와 라이브러리 | 높음 | 여전히 높음: 에이전트도 라이브러리를 재사용함 |

가중치를 잃은 행은 쓰는 일에 관한 것이고, 가중치를 얻은 행은 쓰인 것을 신뢰하는 일에 관한 것입니다. 이것이 이 글의 나머지를 보는 렌즈입니다. 언어마다, 팀의 누구도 타이핑하지 않은 코드에 대해 그 언어가 무엇을 약속하는지 묻겠습니다.

예시들을 비교할 수 있도록, 아래의 모든 코드 조각은 같은 작은 요구사항의 한 부분을 다룹니다. 은행의 코어 시스템에 가득한 종류의 요구사항입니다. 계좌에 월 이자를 기장하되, 센트 단위에서 0에서 먼 쪽으로 반올림하고(round half away from zero), 해지된 계좌에는 절대 기장하지 않는다는 것입니다. 이 요구사항은 글 끝부분에, 앞으로 요구사항이 취하리라고 제가 생각하는 형태로 전부 적어 두었습니다.

## Rust: 작동해야 하는 것들을 위해 {#rust-for-things-that-have-to-work}

Rust는 예전에 C와 C++가 차지하던 영역을 차지합니다. 프록시, 운영체제, 런타임, 컴파일러, 엔진, 그리고 몇 달씩 실행되거나, 핫 패스에 놓이거나, 해를 끼치려는 사람들의 입력을 처리하는 모든 것입니다. 빌림 검사기는 가비지 컬렉터 없이 컴파일 시점에 메모리 안전성과 데이터 경쟁(data race)이 없음을 보장하고, 타입 시스템은 불변식을 컴파일러가 볼 수 있는 곳에 두는 것을 자연스럽게 만듭니다.

Rust의 유명한 비용은 빌림 검사기와의 싸움이었고, 그 싸움은 에이전트가 떠안는 종류의 비용입니다. Rust는 그것을 오히려 장점으로 바꿉니다. 컴파일러 오류가 정확하고, 국소적이고, 바로 조치할 수 있어서, 루프 안에서 일하는 모델에게 이상에 가까운 피드백이 되기 때문입니다. 에이전트가 제안하고, 컴파일러가 줄 번호와 제안을 붙여 이의를 제기하고, 에이전트가 고칩니다. 사람이 코드를 읽을 때쯤이면 한 부류의 실수 전체가 이미 사라져 있습니다.

두 스레드가 같은 원장에 항목을 덧붙일 때 그 피드백은 이런 모습입니다. 많은 언어에서는 이런 코드가 컴파일되고, 그다음 프로덕션에서 부하가 걸릴 때 가끔씩만 실패합니다.

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

프로그램은 한 번도 실행되지 않고, 오류는 정확히 어디서 왜 문제인지 말해 줍니다. 이 예는 컴파일러의 한계, 그리고 사람이나 요구사항이 여전히 중요한 지점도 보여 줍니다. 제안된 수정, 즉 벡터를 복제하는 것은 컴파일되지만, 각 스레드에 저마다의 원장을 줍니다. 은행이 원하는 것은 그것이 아닙니다. 올바른 수정은 락 뒤에 놓인 하나의 공유 원장, `Arc<Mutex<Vec<_>>>`이고, 그것을 고르려면 코드가 무엇을 위한 것인지 알아야 합니다. 컴파일러는 에이전트의 선택지를 안전한 것들로 좁히고, 그중에서 고르는 것은 요구사항입니다.

이것이 대규모로 중요하다는 증거는 제 것이 아닙니다. Google은 2024년에 Android의 메모리 안전성 취약점 비율이 “개발이 메모리 안전 언어로 옮겨 가면서 6년 동안 76%에서 24%로” 떨어졌고, 문제는 “압도적으로 새 코드에 있다”고 보고했습니다([Google Security Blog](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)). 1년 뒤 같은 팀은 Rust의 메모리 안전성 취약점 밀도가 Android의 C와 C++보다 “1000배 넘게” 낮고, Rust 변경의 롤백 비율이 약 네 배 낮다고 보고했습니다([Google Security Blog](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html)). 에이전트가 곧 많은 새 코드를 쓰게 된다면, 그 새 코드가 자리 잡기에 가장 안전한 곳은 그런 실수가 컴파일되지 않는 언어입니다.

제가 만드는 것 대부분이 그 이유로 Rust로 되어 있습니다. 리버스 프록시인 [Zentinel](https://zentinelproxy.io/)은 다른 사람들의 트래픽 앞에 서 있습니다. 내구성 있는 실행 엔진(durable execution engine)인 Aqueduct는 크래시 후에 실행을 재생해 같은 결과에 이르러야 합니다(이유는 [The River and the Canal](https://raskell.io/articles/the-river-and-the-canal/)에서 설명했습니다). hx와 bhc는 다른 사람들의 빌드가 의존하는 툴체인입니다([Why We Built a Haskell Package Manager in Rust](https://raskell.io/articles/why-we-built-a-haskell-package-manager-in-rust/)에 그 이야기가 있습니다). Shiioo는 제 컴퓨터에서 에이전트를 실행하고 그 에이전트들이 한 일을 기록해 둡니다([Shiioo, Re-imagined](https://raskell.io/articles/shiioo-reimagined-and-a-home-ai-lab/)). 이것들은 모두 실패하면 대가가 크고, 모두 정적 바이너리 하나로 배포됩니다.

같은 논리로, 이런 종류의 일 가운데 가장 큰 일에서도 Rust가 제 첫 번째 선택입니다. 은행, 보험사, 공공 행정이 여전히 메인프레임에서 운영하는 코어 시스템, 대부분 수십 년 전에 COBOL로 쓰인 시스템을 대체하는 일입니다. 그 시스템들은 작동합니다. 신뢰할 수 있고, 십진 산술을 정확하게 하며, 대체하려는 모든 시도를 견뎌 냈습니다. 대체로 그 코드 전부가 무엇을 하는지 누구도 자신 있게 말할 수 없기 때문입니다. 에이전트는 그 문제의 절반을 바꿉니다. 에이전트는 COBOL을 참을성 있게 읽고, 프로그램이 무엇을 하는지 설명하고, 지치지 않고 새 버전을 씁니다. 에이전트가 바꾸지 못하는 것은 새 시스템이 적어도 옛 시스템만큼 믿을 만해야 한다는 요구이고, 언어가 중요해지는 곳이 바로 거기입니다. Rust는 메인프레임 없이 메인프레임의 미덕을 줍니다. 정의되지 않은 동작(undefined behaviour)이 없고, 기장 작업 도중에 멈춰 서는 가비지 컬렉터가 없으며(Discord는 2020년에 바로 이 이유로 한 서비스를 Go에서 Rust로 옮겼습니다. 적어도 2분마다 실행되는 Go의 컬렉터가 [주기적인 지연 급증](https://discord.com/blog/why-discord-is-switching-from-go-to-rust)을 일으킨 뒤였습니다), 돈을 위한 [rust_decimal](https://docs.rs/rust_decimal/) 같은 정확한 십진 타입이 있고, 프로그램이 실행되기 전에 여러 부류의 실수를 통째로 거부하는 컴파일러가 있습니다. 이자 자체가 맞는지는 여전히 요구사항과 그 테스트가 말해야 할 몫이며, 앞에서 본 복제된 원장이 그것을 보여 줍니다.

돈에 관한 부분은 짧습니다. COBOL 프로그램은 금액을 고정소수점 십진수로 보관하고, 대체 시스템도 똑같이 해야 합니다. `0.1 + 0.2`가 `0.30000000000000004`가 되는 이진 부동소수점은 절대 써서는 안 됩니다.

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

반올림 규칙은 이름으로 코드에 적혀 있습니다. 옛 시스템이 어떻게 동작했는지에 대한 누군가의 기억 속에만 사는 반올림 규칙이야말로 마이그레이션이 잘못되는 길이기 때문입니다.

메인프레임이 배치 윈도와 트랜잭션 모니터로 하던 일을 Rust는 비동기 런타임인 [Tokio](https://tokio.rs/)로 합니다. 소수의 스레드 위에서 수천 개의 동시 작업을 타이머, 타임아웃, 취소와 함께 실행합니다. Tokio 자체는 한 프로세스 안에서 실행됩니다. 분산은 작은 바이너리 여러 개를 부하가 요구하는 만큼의 기계에서, 복제되는 데이터베이스 앞에 두고 실행하는 데서 나옵니다. 마이그레이션 자체는 일부러 지루해야 합니다. 옛 시스템과 새 시스템을 같은 입력으로 나란히 실행하고, 모든 출력을 비교하고, 둘이 일치하면 상품 하나 또는 배치 하나씩 전환합니다. Tokio로는 그 비교의 핵심이 몇 줄입니다.

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

두 시스템이 같은 입력을 동시에 받고, 효력을 갖는 것은 옛 시스템의 답이며, 모든 불일치는 누군가가 설명할 수 있도록 기록됩니다. 그 비교가 진짜 일이고, 에이전트가 잘하는 일입니다. 그 뒤에 에이전트가 만들어 낸 것을 안심하고 신뢰할 수 있게 해 주는 것이 언어입니다.

Rust에도 비용이 있고, 에이전트가 그 전부를 없애 주지는 않습니다. 빌드는 Go보다 느립니다. 비동기 Rust는 여전히 마땅한 수준보다 어렵습니다. 그리고 라이프타임을 능숙하게 읽지 못하는 사람에게 Rust는 빨리 리뷰할 수 있는 언어가 아니며, 리뷰어가 다른 팀 사람일 때 이것은 중요합니다. (Google의 Android 엔지니어들은 반대로 Rust 변경이 리뷰에 약 4분의 1 적은 시간을 쓴다고 보고하지만, 그들은 Go가 아니라 C++와 비교하고 있고, 매일 Rust를 리뷰합니다.) 저는 회사의 내부 서비스를 기본으로 Rust로 쓰지는 않겠습니다. 그 서비스들이 실패를 감당할 수 없는 부분에만 쓰겠습니다.

## Go: 회사 전체가 함께 쓰는 코드를 위해 {#go-for-code-a-whole-company-shares}

Go는 예전에 대규모 조직에서 Java가 차지하던 자리에 있습니다. 조직이 수백 개씩 운영하는 평이하고 오래가는 서비스, 많은 팀이 쓰고 더 많은 팀이 읽는 서비스의 언어입니다. 긴 버전은 [Building IT Intelligence](https://raskell.io/articles/building-it-intelligence/#why-go)의 “Why Go” 절에 썼으니, 여기서는 짧은 버전을 쓰겠습니다.

Go는 지루할 정도로 관용적이고, 회사에서는 그것이 가장 높은 찬사입니다. 어떤 일을 하는 방법은 대개 하나뿐이고, 레이아웃은 `gofmt`가 정하며, 오류는 발생한 곳에서 처리하는 값이고, 의존성은 프레임워크가 만들어 내는 대신 인자로 전달되며, 이 언어는 엔터프라이즈 Java를 팩토리의 팩토리로 만든 장치를 제공하지 않습니다. import는 모듈 경로이고 대개 Git 리포지토리의 주소이므로, 다른 팀의 코드를 참조하는 일은 파일 한 줄이지 아티팩트 리포지토리 팀에 올리는 티켓이 아닙니다. 한 모듈 안에서는 모든 것이 소스에서 컴파일되므로, 회사 전체를 아우르는 모노레포의 비용이 낮습니다. 게시하고, 버전을 붙이고, 기다려야 할 내부 라이브러리가 없습니다. 몇 초 만에 컴파일되고, 빠르게 실행되며, 바이너리 하나로 배포되고, 도구(테스트, vet, 경쟁 상태 탐지기, 프로파일링, 언어 서버)가 기본으로 들어 있습니다. 그리고 [Go 1 호환성 약속](https://go.dev/doc/go1compat)은 명세에 맞게 쓴 프로그램이 “변경 없이 계속 올바르게 컴파일되고 실행될 것”이라고 말합니다. 기업 소프트웨어가 살아가는 시간 척도가 바로 그것입니다.

에이전트와 함께 달라지는 것은 이 지루함이 두 번 자산이 된다는 점입니다. 스타일이 들어설 여지가 거의 없으므로 에이전트가 쓴 Go는 사람이 쓴 Go처럼 보이고, 그래서 다른 팀의 리뷰어도 산문을 읽는 속도로 읽습니다. 그리고 같은 획일성 덕분에 에이전트는 큰 Go 코드베이스를 쉽게 탐색합니다. 함수는 시그니처가 말하는 대로 하고, 호출 그래프가 바로 눈앞에 있습니다.

Go로 쓴 이자 규칙은 이렇게 읽히고, 어느 팀이나 어느 에이전트가 쓰든 똑같이 읽힐 것입니다.

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

의존성은 인자로 전달된 인터페이스이고, 모든 실패는 위로 올라가면서 컨텍스트가 덧붙는 값이며, 호출하는 쪽은 메시지를 파싱하는 대신 `errors.Is(err, ErrClosed)`로 물어볼 수 있습니다. 그리고 이 중 어느 것도 다른 팀 사람에게 설명할 필요가 없습니다.

대가는 Go가 Rust나 Haskell보다 덜 검사한다는 것입니다. 합 타입(sum type)이 없고, `nil`은 여전히 값이며, 정확성의 상당 부분이 타입이 아니라 테스트에 있습니다. 회사에는 대개 이것이 올바른 거래입니다. 정확해야 하는 시스템은 Rust로 만들고, 그 주변의 백 개 서비스는 Go로 만듭니다.

## Elixir: 본질적으로 분산된 플랫폼을 위해 {#elixir-for-platforms-that-are-distributed-by-nature}

Elixir는 Erlang 가상 머신인 BEAM 위에서 실행되고, BEAM은 전화 교환기를 위해 만들어졌습니다. 서로 격리된 작은 프로세스 수백만 개, 크래시한 것을 다시 시작하는 슈퍼바이저, 일급 개념으로서의 노드 간 메시지, 그리고 장애가 일어나지 않는 척하는 대신 장애를 전제로 설계하는 문화가 있습니다. 대부분의 언어는 라이브러리와 인프라로 분산을 덧붙입니다. BEAM에서는 분산이 기본적인 사고방식입니다.

BEAM의 프로세스는 운영체제 스레드가 아닙니다. [Erlang 효율성 가이드](https://www.erlang.org/doc/system/eff_guide_processes.html)에 따르면 새 프로세스 하나는 327워드, 약 2.6 KB의 메모리를 차지하고 자기만의 힙을 가집니다. 그래서 기계 한 대가 수십만 개를 실행하고, 한 프로세스의 가비지 컬렉션이 다른 프로세스를 멈추는 일은 없습니다. (Erlang으로 만든 WhatsApp은 2012년 1월에 서버 한 대에서 [200만 개가 넘는 TCP 연결](https://blog.whatsapp.com/1-million-is-so-2011)을 유지했다고 보고했습니다.) 프로세스는 아무것도 공유하지 않고 메시지로 대화하며, 슈퍼바이저가 그 프로세스들을 지켜봅니다. 애플리케이션은 슈퍼바이저의 트리이고, 클러스터는 서로 메시지를 주고받을 수 있는 기계들 위에 놓인 그런 트리 여러 개입니다. 다음은 broodwar.live의 트리를 줄인 것입니다.

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

그리고 두 기계에서 실행되면 이런 모습입니다.

*One application on the BEAM, on two nodes*

```text
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
```

스로틀 프로세스가 크래시하면 슈퍼바이저가 새 프로세스를 시작하고, 열린 연결, 작업 대기열, 다른 노드는 아무것도 알아차리지 못합니다. 한 노드에서 게시한 메시지는 다른 노드의 구독자에게 도달합니다. 이것이 분산 시스템의 전부이고, 그 어느 부분도 별도의 인프라를 필요로 하지 않았습니다.

그래서 Elixir는 본질적으로 분산된 플랫폼을 만들 때 제 선택입니다. 같은 대화가 웹, 채팅, 이메일, 전화로 들어오는 옴니채널 시스템, 실시간 접속 상태와 많은 열린 연결이 있는 시스템, 재시작을 견뎌야 하는 백그라운드 작업이 많은 시스템이 그렇습니다. 백그라운드 작업에서는 [Oban](https://oban.hexdocs.pm/Oban.html)이 등장합니다. “영속성을 위해 PostgreSQL, MySQL, 또는 SQLite3를 사용하는” 작업 프레임워크입니다. 작업은 이미 가진 데이터베이스 안에 재시도, 고유성, 대기열과 함께 살고, 따로 운영할 브로커가 없습니다. [broodwar.live](https://broodwar.live)에서 Liquipedia의 대회 페이지를 수집하는 작업은 이렇습니다.

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

재시도, 한 시간 안의 중복 제거, 그리고 소스가 우리에게 속도 제한을 걸 때 재시도하지 않고 멈추겠다는 결정까지 여덟 줄이고, 모두 Elixir를 본 적 없는 사람도 읽을 수 있습니다. 사람들의 목소리와 이야기를 모은 아카이브인 [Humankind](https://humankind.plus)는 같은 방식으로 대기열 여덟 개(그중에는 전사, 임베딩, 음성 합성, 이야기 생성이 있습니다)를 Phoenix의 실시간 업데이트와 나란히, 한 런타임 안에서 실행합니다.

Elixir가 한 사람이 운영하는 야심 찬 프로젝트에 제가 가장 좋아하는 언어인 이유도 이것입니다. 회사라면 웹 계층, 대기열, 브로커, 캐시, 클러스터 관리자로 나눌 것을 BEAM은 여전히 머릿속에 담을 수 있는 하나의 시스템으로 줍니다. Go만큼의 채용 인력 규모나 팀 간 관례는 없으므로 대규모 조직의 기본값으로 삼지는 않겠지만, 작은 팀은 이것으로 멀리 갈 수 있습니다.

약점은 타입이었고, 에이전트와 함께라면 그 약점은 더 무거워집니다. 동적 언어는 에이전트가 쓴 것 가운데 실행 전에 검사하는 부분이 더 적기 때문입니다. 그것이 바뀌고 있습니다. 2026년 6월에 출시된 [Elixir 1.20](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released)은 “타입 주석을 도입하지 않고도 모든 Elixir 프로그램에 대해 타입 추론을 수행하고 점진적으로 타입 검사를” 할 수 있습니다. 타입이 있는 구조체와 타입 시그니처는 정해진 날짜 없이 아직 앞으로 올 일입니다([로드맵](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/)). 그때까지 저는 패턴 매칭, typespec, 테스트에 기대고, 에이전트가 쓴 Elixir를 에이전트가 쓴 Rust보다 더 꼼꼼하게 리뷰합니다.

지금 정적 타입이 있는 BEAM을 원한다면 [Gleam](https://gleam.run/)이 있습니다. “확장되는 타입 안전 시스템을 만들기 위한 친근한 언어”입니다. 같은 가상 머신으로 컴파일되므로 프로세스, 슈퍼바이저, 분산을 그대로 얻고, Erlang과 Elixir로 쓴 패키지를 쓸 수 있으며, [2024년 3월의 1.0 버전](https://gleam.run/news/gleam-version-1/) 이후로 안정적입니다. 모든 것에 타입이 있고 컴파일러가 검사합니다. 에이전트가 코드를 쓸 때 가중치가 올라가는 바로 그 속성입니다. 생태계는 Elixir보다 젊고, Gleam으로 쓴 Phoenix나 Oban은 없지만, Elixir 라이브러리는 외부 함수 인터페이스(FFI)를 통해 타입을 손으로 적어 호출할 수 있습니다. 프레임워크보다 정확성이 중요한 BEAM 위의 새 서비스라면, 제가 가장 먼저 살펴볼 선택지입니다.

## Haskell과 bhc: 다른 종류의 내기 {#haskell-and-bhc-a-different-kind-of-bet}

Rust, Go, Elixir는 우리가 이미 가지고 있던 질문에 대한 더 나은 답입니다. 제가 만들고 있는 형태의 Haskell은 에이전트가 코드를 쓰게 된 뒤에야 나타나는 질문에 답합니다. 생성이 싸지면 무슨 일이 일어납니까?

모델은 몇 초 만에 그럴듯한 코드를 만들어 내고, 그럴듯한 코드는 자주 틀립니다. 그래서 희소한 일은 코드를 쓰는 일에서 그 코드가 옳다는 것을 아는 일로 옮겨 갑니다(그리고 [The Behavioural Turn](https://raskell.io/articles/the-behavioural-turn/)에서 주장했듯이, 누구든 그 코드를 얼마나 읽을지 정하는 일로도 옮겨 갑니다). Haskell은 그 가운데 가장 많은 부분을 검사할 수 있게 만드는 프로덕션 언어입니다. 타입이 잘 맞는 함수는 변환이 유효하다는 작은 증명이고, 효과는 시그니처에 드러나며, 잘못된 상태는 표현할 수 없게 만들 수 있습니다. 모델이 옳을 필요는 없습니다. 검사할 수 있으면 되고, 컴파일러가 그 검사기입니다. 검사기는 생성 과정 안에 들어갈 수도 있습니다. ETH Zurich와 UC Berkeley의 한 팀은 타입 검사기가 모델의 출력을 토큰 단위로 제약하게 해서, 생성된 TypeScript의 컴파일 오류를 절반 넘게 줄였습니다([Mündler et al., 2025](https://arxiv.org/abs/2504.09246)).

이자 요구사항은 해지된 계좌에는 이자를 절대 기장하지 않는다고 말합니다. 대부분의 언어에서 그 규칙은 누군가가 기억해야 하는 `if`입니다. Haskell에서는 그 규칙이 데이터의 형태가 될 수 있습니다.

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

해지된 계좌에 이자를 기장하려는 에이전트는 실패하는 테스트나 몇 주 뒤의 버그 보고 대신, 무엇이든 실행되기 전에 `bhc check`로부터 이것을 받습니다.

```text
Type errors:
  1: type mismatch: expected `OpenAccount`, found `ClosedAccount`
```

누구도 그 규칙을 기억할 필요가 없습니다. 프로그램이 그 규칙을 어기는 것을 표현할 수 없기 때문입니다. 그것이 [The Last Programming Language Might Not Be for Humans](https://raskell.io/articles/what-programming-languages-become-when-ai-writes-the-code/)의 내기였고, [arcanist.sh](https://arcanist.sh/manifesto/)가 존재하는 이유입니다.

Basel Haskell Compiler인 [bhc](https://arcanist.sh/bhc/)는 같은 언어를 위해 백지에서 시작한 컴파일러이고, Rust로 쓰였습니다. 그리고 두 가지 생각을 더하는데, 저는 그 두 생각이 이것을 더 나은 Haskell이 아니라 소프트웨어를 만드는 다른 방식으로 만든다고 생각합니다.

첫째, 런타임은 고르는 계약입니다. 같은 소스가 프로파일에 따라 컴파일됩니다. `default`는 평소의 지연 평가, `server`는 기한이 있는 구조적 동시성, `numeric`은 융합된 엄격한 수치 코드와 텐서 커널, `edge`는 최소한의 WebAssembly 런타임입니다. 성능의 범위는 구전되는 지식이기를 멈추고 함수가 무엇인지의 일부가 됩니다. “이것은 옳다”뿐만 아니라 “이것은 이 계약 아래에서 옳다”가 됩니다.

둘째는 [커먼즈](https://arcanist.sh/commons/)입니다. 오늘날 모든 에이전트는 모든 세션에서 같은 날짜 파서를 다시 쓰고 검사한 뒤 그 검증을 버립니다. bhc는 모든 정의를 타입 클래스 인스턴스까지 풀어 쓴 명시적인 의미로 정교화(elaboration)하고, 그 의미는 내용으로 주소를 매길 수 있습니다. 그러면 정의 하나가 정체성, 그것에 대해 무엇이 검사되었고 무엇이 검사되지 않았는지에 대한 정확한 기록, 그리고 그것을 컴파일하거나, 테스트하거나, 리뷰하거나, 보증한 사람들의 서명을 지니게 됩니다. 같은 함수를 다른 스타일로 쓴 두 사람은 같은 함수를 쓴 것이고, 그들의 증거는 하나의 객체에 모입니다. 에이전트의 일은 “이 코드를 써라”에서 “이미 검사된 의미로 이것을 조립하고, 아무것도 없는 곳에서는 쓰고, 증명하고, 다음 에이전트를 위해 남겨 두라”로 바뀝니다. 긴 버전은 [The Proof You Only Have to Write Once](https://raskell.io/articles/the-proof-you-only-have-to-write-once/)에 있습니다.

제가 소프트웨어를 만드는 다른 방식이라고 할 때 뜻하는 것이 이것입니다. 소프트웨어의 단위가 명령어를 담은 파일이기를 멈추고, 명시된 계약 아래에서 검증된 의미의 조각, 그것이 필요한 모든 사람이 공유하는 조각이 됩니다.

이것은 완성에서 가장 먼 부분이기도 합니다. bhc는 0.2 버전입니다. Pandoc의 모듈 221개를 모두 타입 검사하고 컴파일하며, Pandoc의 Markdown 리더와 HTML 라이터가 처음부터 끝까지 실행되지만, 가비지 컬렉터가 아직 컴파일된 코드에 연결되지 않아서 오래 실행되는 서버에는 아직 맞지 않습니다([현황](https://arcanist.sh/bhc/status/)). 커먼즈는 로드맵에 첫걸음이 올라 있는 방향이지, 오늘 쓸 수 있는 서비스가 아닙니다. 그래도 제가 그쪽으로 만들어 가는 것은, 대부분의 코드가 생성되면 검증이 가야 할 곳이 거기라고 생각하고, Haskell이 그곳에 가장 가까이 닿을 수 있는 언어라고 생각하기 때문입니다.

## 당연한 반론 {#the-obvious-objection}

이 모든 것에 대한 가장 강한 반론은, 에이전트가 학습 데이터가 가장 많은 언어에 가장 능숙하니 모든 것을 Python과 TypeScript로 쓰고 걱정을 그만하라는 것입니다.

일리가 있고, 두 언어 모두 자기 자리를 얻을 만했습니다. Python은 데이터 과학, 머신러닝, 노트북을 차지하고 있습니다. 그곳에서 Python의 라이브러리는 견줄 것이 없고, 코드의 상당수는 한 번 실행되고 버려집니다. JavaScript는 브라우저의 언어이고, TypeScript는 후회 없이 JavaScript를 쓰는 방법입니다. 다른 언어로 프런트엔드를 만드는 것은 대개 스스로 낸 상처입니다. 하지만 오래가야 하는 것이라면 저는 둘 중 어느 쪽으로도 거의 돌아가지 않습니다. 예전에 그 언어들을 집어 든 이유는 쓰는 속도와 익숙함이었고, 그것들은 이제 에이전트가 떠안는 비용입니다. 남는 것은 프로덕션에서 타입 오류를 발견하는 런타임입니다.

모델이 어떤 언어를 얼마나 유창하게 쓰는지와 그 결과가 무엇을 보장하는지는 서로 다른 질문입니다. 유창성의 격차는 반론이 가정하는 것보다 작습니다. 표준 코드 생성 벤치마크를 18개 언어로 옮긴 MultiPL-E는 여러 언어에서 모델이 Python 점수와 같거나 더 높은 점수를 낸다는 것을 발견했습니다([Cassano et al., 2022](https://arxiv.org/abs/2208.08227)). 보장의 격차도 측정할 수 있습니다. 연구자들이 테스트와 리뷰를 통과해 살아남은 JavaScript 버그에 타입 주석을 붙였을 때, TypeScript는 그중 15%를 잡아냈습니다([Gao, Bird and Barr, 2017](https://earlbarr.com/publications/typestudy.pdf)). 모델이 Rust를 쓰는 솜씨와 Python을 쓰는 솜씨 사이에 어떤 격차가 남아 있든, 그것은 값싼 부분의 격차입니다. 두 컴파일러가 검사하는 것 사이의 격차는 비싼 부분에 있습니다.

또 하나의 정당한 반론은 한 조직에 언어 넷은 셋이 너무 많다는 것입니다. 대부분의 회사에는 맞는 말이고, 그래서 저는 이 목록을 정책으로 회사에 건네지 않겠습니다. 회사는 아주 적은 수의 언어를 골라 각각에 일을 하나씩 맡겨야 합니다. 제 목록은 이렇습니다.

| 만드는 것이 | 집어 들 언어 | 이유 |
|---|---|---|
| 실패해서는 안 되거나, 핫 패스에 있거나, 적대적인 입력을 처리하거나, 메인프레임 코어 시스템을 대체한다면 | Rust | 컴파일러가 가비지 컬렉터 없이 장애의 부류 전체를 배제함 |
| 많은 팀이 읽고 바꾸는 백 개의 서비스 가운데 하나라면 | Go | 관용적인 방법 하나, 빠른 빌드, 게시할 라이브러리가 없는 모노레포 |
| 본질적으로 분산되어 있거나, 실시간이거나, 옴니채널이거나, 작은 팀의 플랫폼 전부라면 | Elixir | 슈퍼비전, 분산, 내구성 있는 작업이 런타임에 딸려 옴 |
| 정확성을 검사하고, 공유하고, 그 위에 쌓아야 한다면 | bhc를 쓰는 Haskell | 증명으로서의 타입, 런타임 계약, 쌓여 가는 검증 |
| 노트북, 학습 루프, 브라우저 안에 산다면 | Python 또는 TypeScript | 그 언어들의 라이브러리가 거기 있고, 다른 무엇도 따라오지 못함 |

## 사람들이 대신 쓰게 될 것 {#what-people-will-write-instead}

에이전트가 코드를 쓴다면 사람들은 무엇을 씁니까? 점점 더 요구사항을 씁니다. 시스템이 무엇을 해야 하는지, 어떤 경우가 중요한지, 무엇이 절대 일어나서는 안 되는지, 누가 무엇을 승인하는지입니다. 그런 글은 정밀할 때는 선언적이고 그렇지 않을 때는 서술적이며, 어느 경우든 그곳에 이르는 방법이 아니라 무엇이 참이어야 하는지를 말합니다.

이 글의 모든 코드 조각 뒤에 있는 이자 규칙을 제가 요즘 요구사항을 쓰는 방식으로 적으면, 짧은 Markdown 파일 하나입니다.

```markdown
## Monthly interest

- Interest is posted on the last business day of each month.
- Monthly interest is balance × annual rate ÷ 12, in cents,
  rounded half away from zero.
- A closed account never receives interest.
- Until the switch-over, the mainframe's result is the one that counts,
  and every difference from the new core is recorded.
```

그리고 그 규칙을 확정하는 사례들은 JSON으로 적습니다.

```json
[
  { "case": "ordinary month", "account": { "status": "open", "balance": "1234.56" },
    "annual_rate": "0.015", "expect": { "interest": "1.54" } },
  { "case": "closed account", "account": { "status": "closed", "balance": "1200.00" },
    "annual_rate": "0.015", "expect": { "interest": "0.00" } }
]
```

위의 네 언어로 쓴 모든 것은 이 두 파일의 하류에 있습니다.

그런 글의 형식은 두 가지입니다. 의도, 결정, 에이전트가 읽는 지시(브리프, 설계 기록, `AGENTS.md`)를 위한 Markdown, 그리고 구조가 있는 모든 것을 위한 JSON이며, YAML과 TOML은 JSON의 더 친근한 친척입니다. 구조가 있는 것이란 스키마, 설정, 두 시스템 사이의 계약, 테스트가 대상으로 삼는 사례들입니다(에이전트를 채점할 때 [Evaluation Closes the Loop](https://raskell.io/articles/evaluation-closes-the-loop/)가 쓰는 것과 같은 알려진 사례들입니다). 둘 다 프로그래밍 언어가 아니며, 제가 요즘 손으로 가장 많이 편집하는 두 형식입니다. 이 사이트가 그 예입니다. 글은 Markdown이고, 데이터는 TOML과 JSON이며, 그것을 페이지로 바꾸는 코드 대부분은 에이전트가 썼습니다.

그마저도 지나가는 단계일 수 있습니다. Markdown과 JSON이 사람에게 중요한 것은 사람이 아직 그것을 읽기 때문이고, 그것이 기술하는 것 가운데 더 많은 부분을 기계가 검사하게 될수록 사람의 몫은 의도를 밝히고 결과를 승인하는 일로 줄어듭니다. 기계가 검사할 수 있을 만큼 정밀한 요구사항은 타입과 그리 멀지 않습니다([Source Code Is the New Assembly](https://raskell.io/articles/semantic-artifacts-and-meaning-engines/)의 주장입니다). 이것이 제가 Haskell에 거는 내기를 코드가 향하는 곳뿐 아니라 요구사항이 향하는 곳에 대한 내기로 보는 또 하나의 이유입니다.

## 선택에서 남는 것 {#what-is-left-of-the-choice}

코드를 쓰는 비용이 0으로 가면, 언어는 쓰기 위한 도구이기를 멈추고 아무도 타이핑하지 않은 코드에 대한 약속의 집합이 됩니다. 에이전트가 방을 떠난 뒤에도 그 언어가 여전히 약속하는 것을 보고 고르십시오.

## 참고 자료 {#references}

- Jeff Vander Stoep, Alex Rebert, [Eliminating Memory Safety Vulnerabilities at the Source](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html), Google Security Blog, 2024년 9월 25일.
- Jeff Vander Stoep, [Rust in Android: move fast and fix things](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html), Google Security Blog, 2025년 11월 13일.
- Jesse Howarth, [Why Discord is switching from Go to Rust](https://discord.com/blog/why-discord-is-switching-from-go-to-rust), 2020년 2월 4일.
- [Go 1 and the Future of Go Programs](https://go.dev/doc/go1compat), Go 1 호환성 약속.
- WhatsApp, [1 million is so 2011](https://blog.whatsapp.com/1-million-is-so-2011), 2012년 1월 6일.
- José Valim, [Elixir v1.20 released: now a gradually typed language](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released), 2026년 6월 3일, 그리고 [Type inference of all constructs and the next 15 months](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/), 2026년 1월 9일.
- [Gleam](https://gleam.run/), BEAM을 위한 정적 타입 언어, 그리고 [Gleam version 1](https://gleam.run/news/gleam-version-1/), 2024년 3월 4일.
- [Tokio](https://tokio.rs/), Rust의 비동기 런타임, 그리고 [rust_decimal](https://docs.rs/rust_decimal/), 금융 계산을 위한 십진수.
- [Oban](https://oban.hexdocs.pm/Oban.html), 데이터베이스를 기반으로 하는 Elixir의 백그라운드 작업.
- arcanist.sh, [Manifesto](https://arcanist.sh/manifesto/), [The Commons](https://arcanist.sh/commons/), 그리고 [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/)
- [bhc](https://arcanist.sh/bhc/)와 [where bhc stands](https://arcanist.sh/bhc/status/), 2026년 10월 20일 마지막 업데이트.
- Federico Cassano et al., [MultiPL-E: A Scalable and Extensible Approach to Benchmarking Neural Code Generation](https://arxiv.org/abs/2208.08227), 2022.
- Zheng Gao, Christian Bird, Earl T. Barr, [To Type or Not to Type: Quantifying Detectable Bugs in JavaScript](https://earlbarr.com/publications/typestudy.pdf), ICSE 2017.
- Niels Mündler, Jingxuan He, Hao Wang, Koushik Sen, Dawn Song, Martin Vechev, [Type-Constrained Code Generation with Language Models](https://arxiv.org/abs/2504.09246), 2025.

### 더 읽을거리 {#further-reading}

이 사이트에 있는, 이 글의 바탕이 된 더 긴 주장들입니다.

- [The Last Programming Language Might Not Be for Humans](https://raskell.io/articles/what-programming-languages-become-when-ai-writes-the-code/), 명시적, 선언적, 언어 이후의 미래에 대해, 그리고 제가 Haskell에 거는 이유에 대해.
- [What Comes After the Last Programming Language](https://raskell.io/articles/what-comes-after-the-last-programming-language/), 그 아래의 기계가 무엇이 되는지에 대해.
- [Why We Built a Haskell Package Manager in Rust](https://raskell.io/articles/why-we-built-a-haskell-package-manager-in-rust/), 한 프로젝트 안에서 저마다 제 일을 맡은 Rust와 Haskell.
- [The River and the Canal](https://raskell.io/articles/the-river-and-the-canal/), Aqueduct와 내구성 있는 실행의 바탕이 된 에세이.
- [How I Work These Days](https://raskell.io/articles/how-i-work-these-days/), 코딩 에이전트와 일하는 것이 하루하루 어떤 모습인지.
- [The Proof You Only Have to Write Once](https://raskell.io/articles/the-proof-you-only-have-to-write-once/), 검증된 Haskell을 위한 커먼즈의 전체 이야기.

Rust와 메모리 안전성:

- [Fearless Concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html), *The Rust Programming Language*에서 동시성 코드에 대해 컴파일러가 무엇을 배제하는지 다루는 장.
- [The Case for Memory Safe Roadmaps](https://www.cisa.gov/resources-tools/resources/case-memory-safe-roadmaps), CISA와 협력 기관, 2023년 12월 6일, 메모리 안전하지 않은 언어에서 벗어나는 계획에 대해.
- [What is memory safety and why does it matter?](https://www.memorysafety.org/docs/memory-safety/), ISRG의 Prossimo, 짧은 입문서.
- [Rust in the Linux kernel](https://docs.kernel.org/rust/index.html), 커널 자체의 문서.
- Martin Fowler, [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html), 레거시 코어 시스템을 계속 실행하면서 조금씩 대체하는 패턴.

Go와 대규모 소프트웨어 엔지니어링:

- Rob Pike, [Go at Google: Language Design in the Service of Software Engineering](https://go.dev/talks/2012/splash.article), 2012, Go가 일부러 평이한 이유. 이 글의 주장을 다룬 글을 하나만 고르라면 이 글입니다.
- [Effective Go](https://go.dev/doc/effective_go)와 [Go Proverbs](https://go-proverbs.github.io/), 관용적이라는 것이 실제로 무엇을 뜻하는지.
- [Go Modules Reference](https://go.dev/ref/mod), import 경로, 버전, 체크섬이 어떻게 작동하는지.

BEAM, Elixir, Gleam:

- Joe Armstrong, [Making reliable distributed systems in the presence of software errors](https://erlang.org/download/armstrong_thesis_2003.pdf), 박사 학위 논문, 2003, 슈퍼바이저와 “let it crash”의 바탕이 된 논리.
- [OTP Design Principles](https://www.erlang.org/doc/system/design_principles.html), Erlang 문서에서 다루는 슈퍼비전 트리와 비헤이비어(behaviour).
- Gary Rennie, [The Road to 2 Million Websocket Connections in Phoenix](https://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections), 2015년 11월 3일, BEAM 기계 한 대가 열어 둘 수 있는 연결의 규모.
- Giuseppe Castagna, Guillaume Duboc, José Valim, [The Design Principles of the Elixir Type System](https://arxiv.org/abs/2306.06391), 2023, 그리고 Elixir의 [gradual set-theoretic types](https://hexdocs.pm/elixir/gradual-set-theoretic-types.html) 가이드.
- [The Gleam language tour](https://tour.gleam.run/), BEAM 위의 타입 있는 코드가 어떤 모습인지 가장 빨리 보는 방법.

증명으로서의 타입, 그리고 쌓여 가는 검증:

- Philip Wadler, [Propositions as Types](https://homepages.inf.ed.ac.uk/wadler/papers/propositions-as-types/propositions-as-types.pdf), Haskell에 거는 내기가 기대고 있는, 프로그램과 증명 사이의 대응.
- Alexis King, [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), 2019, 일상적인 코드에서 불변식을 타입에 넣는 방법.
- Yaron Minsky, [Effective ML Revisited](https://blog.janestreet.com/effective-ml-revisited/), Jane Street, “잘못된 상태를 표현할 수 없게 만들라”(make illegal states unrepresentable)라는 말의 출처.
- [Unison](https://www.unison-lang.org/), 내용 주소 기반 코드를 처음 도입한 언어, 그리고 arcanist.sh의 [Building the Commons](https://arcanist.sh/blog/building-the-commons/), 그것을 Haskell로 가져오는 엔지니어링.
