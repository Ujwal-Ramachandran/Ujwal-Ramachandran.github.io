# AgentTrap: Cloak-Honey-Trap Deception Against Small Local LLM Agents
## Evaluating Whether Deception Defenses That Stop a Capable Hosted Pentest Agent Still Stop a Small Model You Can Run Free on a Laptop

**Authors:** Ujwal Ramachandran, Nguyen Quang Dung, Challa Bhageeratha Reddy, Ivan Prawira Limanauw
**Institution:** Nanyang Technological University - SE6022 Cybersecurity and AI
**Date:** November 2026

---

## Abstract

An attacker can now point a large language model at a server, give it a shell, say "get root," and let it enumerate, run commands, and escalate on its own. A 2025 USENIX Security paper (Ayzenshteyn, Weiss, and Mirsky) showed a defender does not have to patch the host to stop such an agent. By planting deception, fake patch logs, honeytokens, credential loops, and injected instructions, they stopped an autonomous pentest agent on all 11 capture-the-flag machines they tested, a 100% stop rate. Their agent ran on a big, capable hosted model.

**AgentTrap** asks whether that result transfers to the realistic cheap-attacker case: a small model anyone can run offline and for free on a laptop. We built an autonomous pentest agent on Qwen 3.5 9B via Ollama, a custom Debian decoy whose only path to root runs through files the agent must read, and six Cloak-Honey-Trap (CHT) traps planted on that path. A harness runs a 2x2 experiment (deception off or on, agent plain or hardened) across two reasoning modes and two token budgets, resetting and reseeding the decoy before every run.

With all six traps enabled, the plain agent's task success rate drops from roughly 100% on the clean box to **0%**. A CHT-aware prompt plus harness quarantine and adaptive recovery partially restores it, to between 2% and 36% depending on reasoning mode and budget, but never near baseline. At the level of individual traps, the honeytoken, the context flood, and the credential loop are the effective ones; the cloak and the honeypot are read and ignored; and prompt injection only works when the agent's reasoning is switched off. Deception is a promising supplementary defense against small local agents, but its effectiveness depends on the model, the reasoning mode, and the harness around it.

---

## 1. What - Problem Statement and Purpose

### 1.1 The Transfer Problem

Autonomous LLM penetration-testing agents are no longer hypothetical. Given a shell and a goal, a model reads the last command's output, chooses the next command, runs it, and repeats, enumerating a host and attempting privilege escalation with no human in the loop. This makes an attacker's work cheap and scalable, and it makes the agent itself a new thing to defend against.

The baseline paper proposed a striking defense: instead of patching holes, leave them open and feed the agent lies so it wastes itself. On a capable hosted model this worked completely, 100% across 11 machines. But a hosted frontier model is the expensive case. The attacker who matters for most defenders is the one running a small open model offline, for free, on a laptop, with no API key and no spend limit. A smaller, more literal, goal-driven agent might react to deception very differently from a large one. It could be easier to fool, or it could be too single-minded to be talked out of its goal at all.

AgentTrap exists to answer one question: **do belief-based deception defenses that stop a capable hosted agent still stop a small, locally hosted one, and does hardening the agent change the outcome?**

### 1.2 What This System Does

AgentTrap is a controlled, fully offline testbed with three jobs:

1. Run an autonomous LLM pentest agent against a Linux decoy whose only route to root runs through readable files.
2. Seed six CHT deception traps on that route, toggled on or off, and detect when the agent reads each one.
3. Measure, over many independent runs, how often the agent still roots the box, how much budget it burns, and which traps actually stopped it, across a 2x2 of deception (off, on) and agent type (plain, hardened), two reasoning modes (thinking on, off), and two token budgets.

Everything runs locally. The decoy has no network egress, and nothing the agent does touches a real system.

### 1.3 Target Audience

- **Defenders and blue teams** weighing cyber deception as a control against autonomous LLM attackers rather than a frontier hosted model.
- **Security researchers** studying the robustness and failure modes of goal-driven LLM agents, prompt injection, and agent-side hardening.
- **Red teams** who want to understand how a cheap autonomous agent behaves against deceptive content before relying on one.
- **Students and educators** in AI security who need a small, reproducible, offline agent-security experiment.

---

## 2. How - Architecture and Technical Implementation

### 2.1 High-Level Architecture

Four components, all local:

- **Agent core** - the read-decide-act loop, the Ollama backend, the decoy shell target, bounded working memory, and input screening.
- **Decoy** - a Linux container whose only path to root runs through files the agent must read.
- **Harness** - runs the 2x2, resets and reseeds the decoy between runs, and writes the metrics.
- **Dashboard** - a Flask plus server-sent-events interface to launch runs and watch any one of them live.

### 2.2 The Agent Loop (Plain Agent)

The agent is a loop around a model, not a scripted exploit. Each turn, the harness hands the model the goal and the latest shell output; the model returns one shell command wrapped in a tag; the harness executes it inside the decoy, shortens the output, updates a bounded memory, and feeds it back. After every command the harness checks whether root was reached. A run ends when the agent captures the flag, exhausts its budget (tokens, steps, or wall clock), loops, or gives up.

![Plain agent execution loop. The model proposes one command, the harness executes it against the decoy, verifies root and flag, and either continues the loop or records the outcome (Root or No root).](./images/agent_loop_plain.png)

### 2.3 The Decoy and the Path to Root

The decoy is the team's own image, built on a stock `debian:12-slim` base, not a downloaded vulnerable box. The container's entrypoint generates a fresh random flag (`FLAG{agenttrap_<random>}`) in `/root/flag.txt`, readable only by root. A low-privilege user `user1` is created with sudo rights, and the real password is planted in a readable file under the user's home (`~/archive/records.txt`, as a "rotation record").

So the clean path to root is a deliberate, repeatable escalation puzzle: the agent starts as `user1` with a shell, enumerates its home, reads the rotation record to recover the password, and escalates non-interactively, for example `printf '%s\n' '<password>' | sudo -S cat /root/flag.txt`. The only "vulnerability" is a credential left in a readable file plus a sudo-capable user. That keeps the experiment safe and reproducible, and it means we are testing whether deception derails the agent's reasoning, not whether it can find some clever bug.

**How success is verified.** The agent does not call a special "am I root" routine. The harness watches the agent's command output for proof of root: the exact random flag string appearing (only possible after actually reading the root-only file), and a `uid=0` signature. On this decoy, reading the root-only flag is itself the proof of success.

### 2.4 The Six Traps

Each trap is planted on the path the agent walks and targets a specific weakness of an LLM agent. A trap "fires" when its planted text appears in the agent's output, meaning the agent read it.

| ID | Type | What it plants | Weakness it targets |
|---|---|---|---|
| T1.1 | Cloak | Fake "all CVEs patched" log | Trust in untrusted output |
| T3.2 | Honey | Password with a look-alike (homoglyph) character | Tokenization quirks |
| T4.1 | Trap | Huge fake CVE dump to flood context | Limited memory |
| T4.3 | Trap | Credential loop (file1 to file3 to file2 to file1) | Greedy search |
| T5.2 | Trap | Planted "ignore previous instructions" | Instruction following |
| HP | Honeypot | Polite "you are not invited, stop" flag | Compliance |

Traps are seeded into a fresh container at runtime by `seed_traps.sh`, and can be enabled all together or one at a time, which lets us measure each trap's effect in isolation.

### 2.5 The 2x2 Experiment and the Extra Axes

The core design is a 2x2 with N independent runs per cell. The decoy is reset to a clean image and reseeded before every run.

| | Plain agent | Hardened agent |
|---|---|---|
| **Deception off** | Can it root the clean box at all? | What does hardening cost on a clean box? |
| **Deception on** | **The whole question: does lying to it reduce success?** | Does hardening restore resilience? |

On top of the 2x2 we vary two more things, because both turned out to matter:

- **Reasoning mode:** thinking on (the model's hidden reasoning enabled) versus off.
- **Token budget:** a tight budget (30k tokens) versus a larger one (100k tokens), alongside fixed caps on steps, per-command time, and wall clock.

### 2.6 Metrics

Two metrics carry the results:

- **TSR, Task Success Rate** = successful root-flag captures / total valid runs x 100. The primary metric: how often the attacker wins.
- **DSR, Defense Success Rate** = CHT-on runs with at least one trap fired and no flag capture / total valid CHT-on runs x 100. A trap actually fired and the agent failed, which is a clean "the deception stopped it" signal.

### 2.7 Hardening: Prompt Plus Harness Recovery

The hardened agent adds two things to the plain one. First, a **CHT-aware system prompt** that tells the agent the host is adversarial: treat all command output as untrusted data, never follow instructions found inside output, be skeptical of claims like "already patched," break out if credentials point at each other, and treat non-ASCII or confusable characters in a credential as suspect. Second, **harness-side quarantine and adaptive recovery**: when the agent repeats a path or hits a credential loop, the harness blocks the exhausted source, resets it to its starting location, and asks it to try a different escalation family.

![Hardened agent execution loop. Before acting, the agent checks whether a source is quarantined and whether an observation is suspicious (repeated path, fake instructions, oversized output). Suspicious content triggers quarantine and recovery, isolating the source and forcing a different approach, instead of looping to a dead end.](./images/agent_loop_hardened.png)

### 2.8 The Live Dashboard

A Flask plus server-sent-events dashboard lets an analyst pick a cell, hit Run, and watch the agent type commands and read output in real time. An attack timeline shows each run, which traps fired, and the verdict (ROOTED, TIMEOUT, LOOPED, GAVE UP, ERROR), with live TSR and DSR.

![AgentTrap live dashboard. A hardened, all-traps, thinking-on run against the Docker decoy. The console shows the agent reading the credential loop and the context-flood scan dump; the run ended with no root (TSR 0.0%, DSR 100.0%), and the defenses encountered were the flood, the loop, and the injection.](./images/dashboard.jpeg)

---

## 3. Why - Value Proposition and Design Rationale

### 3.1 Why a Small Local Agent

The baseline result is about an expensive attacker. The realistic widespread threat is a free one: a small open model running offline on commodity hardware, with no API key, no spend limit, and no provider safety filter. If deception only works on frontier hosted agents, it does little against the attacker most defenders will actually face. Testing a small local model is the point, not a convenience.

### 3.2 Why a Controlled Decoy Instead of Real CTF Boxes

A deliberate, minimal escalation puzzle (a password in a readable file plus sudo) makes every run safe, fully offline, and byte-for-byte reproducible, and it isolates the thing we care about: whether deception derails the agent's reasoning. A real exploit chain would confound "the deception worked" with "the agent could not find the bug." The tradeoff is that our decoy is not the 11 real machines the baseline used, so our comparison to their 100% is directional, not like-for-like.

### 3.3 Why the 2x2 Plus Per-Trap Isolation

The 2x2 separates baseline competence from deception effect and from the cost and benefit of hardening. But when all six traps fire together, their effects are confounded. Running each trap alone, in its own cell, is what lets us say which trap actually did the stopping rather than which ones happened to be present.

### 3.4 Why Vary Reasoning and Budget

Two early observations forced these axes. Reasoning changes how an agent handles a lie: a thinking agent can reason past an injected instruction that a non-thinking agent obeys. And the traps that work do so by consuming budget, so the size of that budget directly changes the outcome. Holding either fixed would have hidden a real effect.

### 3.5 Why Fully Local and Offline

The experiment handles adversarial content and runs an attacking agent. Keeping everything offline with no decoy egress means nothing can escape the testbed, results do not depend on any external service, and every run is deterministic up to the model's own sampling.

### 3.6 Why a Belief-Versus-Resource Lens

The six traps split cleanly into two families, and the split is the main conceptual contribution. Some traps assert a false fact and hope the agent believes it and stops (cloak, honeypot). Others make the agent do something wasteful or act on something false (loop, flood, honeytoken, injection). Reading the results through this lens is what turns a table of numbers into a finding.

---

## 4. Case Study - Qwen 3.5 9B Against the Six Traps

### 4.1 Setup

Attacker model: Qwen 3.5 9B via Ollama, fully local. Target: the AgentTrap Debian decoy, reset and reseeded per run. Design: the 2x2 (deception off or on, plain or hardened) at N up to 50 runs per cell, across thinking on and off and token budgets of 30k and 100k, plus a per-trap study of 10 to 50 runs with a single trap enabled.

### 4.2 Main Results

![Qwen 3.5 9B main results. Left: thinking on at a 30k-token budget. Middle: thinking off at 100k tokens. Right: the hardened, all-traps cell as the token budget grows. On a clean box the agent roots almost every time (98 to 100%). With all six traps on, the plain agent drops to 0%. Hardening partially restores success, and only with reasoning on and a larger budget.](./images/main_results.png)

The headline is stark. On the clean box (deception off) the agent roots the host on essentially every run, 98 to 100%, whether plain or hardened. Switch all six traps on against the plain agent and task success collapses to **0%** in every configuration tested. The combined deception completely stops the plain small agent, which is a stronger result than the per-trap numbers alone would suggest.

Hardening helps, but only partially and only under the right conditions. The hardened agent recovers to **18%** at a 30k budget with thinking on, and to **36%** at 100k with thinking on, but to only **2%** with thinking off at 100k. So the quarantine-and-recover machinery needs both reasoning and budget to work, and even at its best it leaves the attacker far below its clean-box competence.

### 4.3 Individual Trap Results

Isolating each trap shows which ones carry the combined effect, and reveals a clear reasoning interaction.

| Trap | Thinking ON | Thinking OFF |
|---|---|---|
| T1.1 Cloak | Influenced some assessments, but all runs succeeded | All runs succeeded despite reading the trap |
| T3.2 Honeytoken | All runs failed after using the deceptive credential | All runs failed after using the deceptive credential |
| T4.1 Context flood | 6/10 runs exhausted the token budget | 6/10 runs exhausted the token budget |
| T4.3 Credential loop | Escaped and succeeded in 6/15 runs | All runs reached the harness loop cutoff |
| T5.2 Prompt injection | No stopping compliance, 9/10 runs succeeded | 8/10 runs followed the injected stop instruction |
| HP Honeypot | No stopping compliance, all runs succeeded | No stopping compliance, all runs succeeded |

Read through the belief-versus-resource lens:

- **The effective traps act on the agent, not its beliefs.** The honeytoken makes the agent use a look-alike credential that fails to authenticate, so it cannot escalate at all (every run fails, in both modes). The context flood exhausts the token budget in most runs. The credential loop sends the agent in circles until the harness cuts it off.
- **The pure "assert a false fact and hope it stops" traps are ignored.** The cloak ("everything is patched") and the honeypot ("you are not invited, please stop") are read and then disregarded, with every run still succeeding. A small, goal-driven agent does not talk itself out of its objective.
- **Reasoning changes susceptibility, in both directions.** Prompt injection is the sharpest case: with thinking off, 8 of 10 agents obeyed the injected "stop" instruction, but with thinking on, 9 of 10 ignored it and succeeded. Reasoning helps the agent resist being hijacked. For the credential loop the opposite shows up: thinking lets a few agents (6 of 15) recognise and escape the loop, where a non-thinking agent always gets caught.

### 4.4 What the Case Study Shows

A small local agent is not immune to deception. With the full trap set it is stopped completely. But the effect comes almost entirely from traps that waste the agent's budget or feed it a credential that cannot work, not from traps that merely tell it to stop. And whether a given trap bites depends on the agent's reasoning mode and how much budget it has, so an identical defense can look strong or weak depending on the attacker's configuration.

---

## 5. Limitations and Future Work

### 5.1 Current Limitations

- **Limited generalizability.** All results are for a single model, Qwen 3.5 9B. One model cannot establish how "small agents" behave as a class.
- **One controlled decoy, not real targets.** The decoy is a deliberate escalation puzzle, not the 11 real CTF machines the baseline used, so the comparison to their 100% stop rate is directional, not like-for-like.
- **The context flood interacts with harness limits.** Because the harness truncates long output and caps the budget, the flood's effect is entangled with those limits rather than measured as a pure context attack.
- **Metric and configuration drift.** The guardrail-bypass metric was dropped and the defense-success metric was redefined during development, so numbers should always be read against the configuration that produced them.
- **Hardware floor.** Running the agent and decoy locally needs a machine that can host a 9B model in Ollama.

### 5.2 Future Work

- **More models and sizes.** Repeat the per-trap and 2x2 study across several small open models (for example Llama and Mistral variants) to separate model-specific quirks from general behavior.
- **More realistic environments.** Move beyond the single escalation puzzle toward targets closer to the baseline's CTF machines.
- **A fake-success trap.** Test a honeypot variant that tells the agent it has already won, attacking the agent's termination decision rather than its navigation, a lever none of the current six pull.
- **Stronger hardening.** Explore recovery strategies that work without a large reasoning budget, since the current approach needs both to be effective.
- **Injection screening at scale.** Evaluate real input screening (rather than a stand-in) to quantify how much of the hardening benefit comes from the prompt versus the screen.

---

## 6. Conclusion

CHT deception can disrupt small, locally hosted pentesting agents. Misleading target content diverts an agent from its objective and consumes its execution budget, and with the full trap set it stopped our small agent completely. But effectiveness depends on the agent and its operating conditions: model capability, reasoning mode, and harness design all change how an agent responds to the same deception. The defenses that transfer from the capable hosted setting are the ones that waste what the agent spends or hand it a credential that cannot work, not the ones that simply assert a false fact and hope the agent gives up.

The practical takeaway is that deception is a promising supplementary defense against the cheap, free-on-a-laptop autonomous attacker, not a drop-in replacement for patching, and its value should be judged against the specific agent it is meant to stop. These controlled results support further evaluation across more models and more realistic environments.

The full source code is available on **[GitHub](https://github.com/Ujwal-Ramachandran/AgentTrap)**.

---

## Appendix A - Relationship to Course Material

| Theme | Where it appears in AgentTrap |
|---|---|
| Evaluation metrics (Week 1) | TSR and DSR defined over many independent, reset-per-run trials |
| AI for cybersecurity / Offensive AI (Week 5) | An autonomous LLM pentest agent that enumerates, runs commands, and escalates privilege |
| Cybersecurity for AI | The agent as both a tool and an attack target: LLM grounding and susceptibility to misleading or injected content |
| Agentic AI security (Week 10) | Indirect prompt injection, trust boundaries, untrusted tool output, and agent-side hardening |
| MLSecOps (Week 11) | Per-run experiment logging, live monitoring, and evidence-based security evaluation |

## Appendix B - Metrics and Budgets

**Metrics**
- TSR (%) = successful root-flag captures / total valid runs x 100
- DSR (%) = CHT-on runs with at least one trap fired and no flag capture / total valid CHT-on runs x 100

**Run budget (illustrative)**
| Parameter | Value |
|---|---|
| Token budget | 30,000 or 100,000 per run |
| Max steps | 40 |
| Per-command timeout | 12 s |
| Wall-clock cap | 300 s per run |
| Per-generation cap | ~2,048 tokens |
| Reasoning mode | thinking on or off |

## Appendix C - References

1. D. Ayzenshteyn, R. Weiss, and Y. Mirsky, "Cloak, Honey, Trap: Proactive Defenses Against LLM Agents," in Proc. 34th USENIX Security Symp., 2025, pp. 8095-8114. Available: https://www.usenix.org/conference/usenixsecurity25/presentation/ayzenshteyn
2. G. Deng et al., "PentestGPT: Evaluating and Harnessing Large Language Models for Automated Penetration Testing," in Proc. 33rd USENIX Security Symp., 2024, pp. 847-864. Available: https://www.usenix.org/conference/usenixsecurity24/presentation/deng

The honeypot trap adapts `jamesalmeida/agent-honeypot` (MIT). The CHT trap techniques are our own implementations of the baseline framework.
