+++
title = "Mise ate my Makefile"
date = 2025-12-14
description = "How a single Rust tool replaced both make and asdf in my projects, bringing fuzzy matching, encryption, and actual sanity to task running."

[taxonomies]
tags = ["oss", "rust", "dev-ex"]
categories = ["field-notes"]

[extra]
author = "Raffael"
image = "mise-ate-make.avif"
+++

## The problem with project setup

Every project starts the same. You need Ruby 3.2.1 but have 2.7. You need Node 20 but have 18. Someone wrote a Makefile that assumes GNU make but you're on BSD. The `scripts/` folder has 47 shell scripts and nobody remembers what half of them do.

I found mise. It fixed all of this.

## What mise actually is

mise started as a Rust rewrite of asdf. Then it absorbed make's job too. Now it's the one tool I install on every machine.

Here's what my typical project setup looked like before:
- `.ruby-version` for rbenv
- `.nvmrc` for node
- `Makefile` with 20 targets
- `scripts/` with random shell scripts
- `.env.example` that nobody updates

Here's what it looks like now:

```toml
# .mise.toml
[tools]
ruby = "3.2.1"
node = "20.11.0"
python = "3.12"

[tasks.test]
run = "bundle exec rspec && npm test"
description = "Run all tests"

[tasks.deploy]
run = "kubectl apply -f k8s/"
depends = ["test", "build"]

[env]
DATABASE_URL = "postgresql://localhost/myapp_dev"
RAILS_ENV = "development"
```

One file. Everything works.

## The fuzzy matching that actually works

This is where mise gets interesting. You don't need exact command names.

```bash
$ mise run test     # runs the test task
$ mise run tset     # still runs test (typo forgiven)
$ mise run tst      # yep, runs test
$ mise run deploy   # runs deploy task
$ mise run dply     # runs deploy
```

The fuzzy matching is smart. It weighs:
- Character position (earlier matches score higher)
- Consecutive matches
- Word boundaries

I tested this with 30+ tasks in one project. It still found the right one 90% of the time with 3-4 characters.

## Tasks live where they should

Instead of polluting the root with `scripts/`, mise looks in `.mise/tasks/`:

```bash
.mise/
└── tasks/
    ├── db-reset.sh
    ├── cache-clear.sh
    └── logs-tail.sh
```

Any executable in there becomes a task. No registration. No config.

```bash
$ mise run db-reset    # runs .mise/tasks/db-reset.sh
$ mise run cache       # fuzzy matches to cache-clear.sh
```

Shell scripts stay shell scripts. But now they're discoverable:

```bash
$ mise tasks
cache-clear   Clear all caches
db-reset      Reset database to clean state  
logs-tail     Tail production logs
test          Run all tests
deploy        Deploy to production
```

## The encryption bit that matters

mise includes age encryption support. Not bolted on. Built in.

```toml
# .mise.toml
[env]
DATABASE_URL = "postgresql://localhost/dev"
API_KEY = "age:SECRET_ENCRYPTED_STRING"
```

Set it up once:
```bash
$ mise decrypt .mise.toml
Enter passphrase: 
$ export API_KEY="actual-secret-key"
$ mise encrypt .mise.toml
```

Your secrets are in the repo but encrypted. CI/CD gets the age key. Developers get the age key. Random GitHub scrapers get nothing.

## Integration with Zed

This is where it gets smooth. In Zed, I set up task shortcuts:

```json
// .zed/tasks.json
{
  "tasks": {
    "test": {
      "command": "mise run test",
      "cwd": "$WORKSPACE_ROOT"
    },
    "deploy": {
      "command": "mise run deploy",
      "cwd": "$WORKSPACE_ROOT"  
    }
  }
}
```

Now `cmd-shift-t` opens the task picker. Type "te", hit enter. Tests run. The AI assistant sees the output inline. Fixes the code. Reruns the test. No context switching.

## What breaks

mise isn't perfect. Here's what I hit:

1. **Windows support**: Works through WSL. Native is rough.
2. **Legacy tools**: Some older ruby/node versions don't install clean. Same issue asdf has.
3. **Task dependencies**: Can't do dynamic dependencies like make. Tasks depend on fixed task names.
4. **Fuzzy matching confusion**: With tasks named `deploy-staging` and `deploy-production`, typing `deploy` might pick wrong. Be specific or rename.

## The tradeoffs

What I gained:
- One tool instead of 4 (asdf, direnv, make, scripts)
- Fuzzy matching saves 100s of keystrokes daily
- New devs get running in 2 commands: `mise install` and `mise run setup`
- Secrets management that doesn't suck
- Task discovery that actually works

What I paid:
- Another tool to install (but it replaces 4)
- TOML syntax (not everyone's favorite)
- Rewriting Makefiles (took an afternoon per project)
- Teaching the team new patterns (took a week)

## Migration pattern

If you're moving an existing project:

1. Install mise: `curl https://mise.jdx.dev/install.sh | sh`
2. Import existing tool versions: `mise install`
3. Move one make target at a time to mise tasks
4. Move scripts to `.mise/tasks/` gradually
5. Add encryption last (less disruption)

Start with the most-used tasks. Leave the weird legacy stuff in make until later.

## What I'd do differently

After migrating 12 projects:

- Start with `.mise.toml`, not `.mise/config.yaml`. TOML is cleaner for this.
- Put all tasks in `.mise/tasks/` as shell scripts first. Move to inline tasks only when needed.
- Name tasks with clear prefixes: `db-reset`, `cache-clear`, `test-unit`. Makes fuzzy matching more predictable.
- Document the age key setup immediately. People forget.

## The bottom line

mise replaced my entire project automation stack. The Rust rewrite isn't just faster. It's more thoughtful. Fuzzy matching, encrypted env vars, task discovery. These aren't features. They're fixes for real pain.

Every new project starts with `.mise.toml` now. Setup takes 5 minutes instead of an hour. New developers don't message me asking how to run tests. They just run `mise tasks` and figure it out.

That's the tool working.
