+++
title = "Agents are their own principals"
date = 2026-10-25
draft = true
description = "On-behalf-of is already outdated. An agent needs its own identity, entitlements, budget and audit trail, like an employee, plus a human sponsor."

[taxonomies]
tags = ["agent-identity", "agents", "applied-security", "isolation", "ai-platforms", "observability"]
+++

The first generation of enterprise agents acts on behalf of a person: it borrows the user's token and the user's rights, and whatever it does is logged as the user. It was a reasonable first step and it is already wrong. It makes the audit trail lie, because the person did not do the thing. It caps the agent at one person's permissions, which is either too much or too little for the task. And it ties the agent's existence to a person's account, so the agent dies when the employee leaves or the token expires.

An agent in [the factory](/notes/the-agent-factory/) should be an entity of its own: an identity in the directory, entitlements granted to it and not inherited, its own credentials, its own budget, its own audit trail, provisioned when it is created and revoked when it is retired, the way an employee's or a contractor's are. The isolation argument in [Your Agent Wants Root](/articles/your-agent-wants-root/) leads here; once the agent has a sandbox of its own, it needs a name of its own to go with it. The security industry already has a phrase for this, non-human identities, which was the one that kept coming up in my [notes from RSAC 2026](/articles/notes-from-rsac-2026/), and the workload-identity standards, SPIFFE among them, already give a process a verifiable identity that is not a person's.

The one thing I would keep from the old pattern is accountability. An entity that can act needs a human who answers for it, the way a contractor has a manager, so the rule is own identity, human sponsor, and never own identity, nobody's problem. Agents are virtually equivalent to employees in what they can do; the sponsor is what makes them equivalent in what they are answerable for.

## References

- [SPIFFE](https://spiffe.io/): workload identity for software that is nobody's user.
