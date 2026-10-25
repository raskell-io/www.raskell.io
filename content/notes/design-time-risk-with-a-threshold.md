+++
title = "Design-time risk, with a threshold"
date = 2026-10-25
draft = true
description = "Agents propose a change, other agents score its risk at design time, and the score decides: self-approve below a threshold, escalate to an architect above it."

[taxonomies]
tags = ["enterprise-architecture", "risk", "agents", "evaluation", "platform-automation", "observability", "hubris"]
+++

Once agents can read the [warehouse](/notes/the-enterprise-context-warehouse/) and propose changes to the landscape, the question is who approves them, and the answer cannot be a human for every one or nothing has been gained. The idea I find strongest is a gate at design time. A second set of agents scores each proposal: blast radius through the dependency graph that [the network registry](/notes/the-warehouse-knows-the-network/) provides, the classification of the data touched, regulatory scope, reversibility, cost. Below a threshold the change approves itself and goes to [the factory](/notes/the-agent-factory/). Above it, it escalates to a named human architect with the score and the reasons attached.

The score is a model's opinion, and it has to be treated as one. It needs calibration against outcomes, which means recording what self-approved and what happened afterwards; it needs an audit trail a regulator can read, the trace from [Observability Is Not Logging](/articles/observability-is-not-logging/) kept for a different reader; and the threshold needs a periodic review by the people who own the risk, the way an evaluation suite needs a baseline and a regression check. The pattern is the one the [agent platform handbook](/series/the-agent-platform-handbook/) builds up for a single agent, applied to the company's architecture.

What changes for the architect is the job. Instead of reviewing designs, they set thresholds and own the escalations, which is a better use of a scarce person, and the escalations are the most interesting designs by construction. A gate that approves its own work is also the kind of system the Hubris topic on this site collects, and the threshold review is the antidote: a human looks, on a schedule, at what the machine let through.
