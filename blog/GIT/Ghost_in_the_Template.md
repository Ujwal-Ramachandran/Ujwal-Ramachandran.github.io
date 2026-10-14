# Ghost in the Template: Watching a Chat-Template Backdoor Fire, Live
## Two demos from my OASec 2026 talk. A poisoned GGUF chat template makes a clean model lie on a trigger phrase, then the same trick hijacks a tool-using agent into making a network request.

**Ujwal Ramachandran** · Nanyang Technological University · OASec 2026 Singapore · September 2026

---

## The One-Sentence Version

You can backdoor an AI model without touching its weights.

Everyone guards the weights. We hash them, we scan them, we compare them against what the author published. But a quantized GGUF model ships with more than weights, and one of those extra pieces is a small program that runs on every single prompt. Change a few lines of that program and the model misbehaves on command, while the checks you would normally run can still come back green.

<div class="key-numbers">
  <div class="key-number"><span class="key-number-value">0</span><span class="key-number-label">bytes of model weights changed to plant the backdoor</span></div>
  <div class="key-number"><span class="key-number-value">&lt; 10</span><span class="key-number-label">lines added to the chat template to do it</span></div>
  <div class="key-number"><span class="key-number-value">2</span><span class="key-number-label">live demos: a chat backdoor, then an agent hijack</span></div>
</div>

This post is the demo half of my OASec 2026 talk. For the short version, the research summary and the TempLock code sit on the [Ghost in the Template project card](/#work-ghost-in-the-template). Here I just want to show you the 2 demos and walk through what you are actually watching.

---

## Where the Ghost Hides

A GGUF file is the common format for running models locally. People think of it as "the weights in a single file," but it carries the metadata needed to actually run the model too: the tokenizer, assorted config, and the chat template.

The chat template is the interesting one. It is a Jinja2 program that formats every conversation before the model ever sees it. Your message goes in, the template wraps it into the exact prompt structure the model was trained on (roles, special tokens, system framing), and that formatted string is what the model responds to. It sits between the user and the model, and it runs on every call.

That last part is the whole attack surface. The template is not data. It is executable logic that touches every input, and it is bundled right inside the file you downloaded from a model hub.

---

## Why the Usual Checks Wave It Through

Here is the uncomfortable part. A poisoned model can pass every control a careful team already runs:

- **Malware scan:** there is no malicious binary in the file.
- **Deserialization checks (PickleScan and friends):** nothing unsafe to load.
- **Weight hash:** the SHA-256 of the weights matches the published model exactly, because the weights really are untouched.
- **Jinja / SSTI scan:** the template parses fine and contains no server-side template injection pattern.

Each of them can come back clean, with a verdict of "safe to deploy." The checks are not broken. They are working correctly. They are just checking the wrong thing. The malicious logic is valid, sandbox-safe template code that only does something when a specific trigger shows up in the conversation. Nothing about it looks dangerous when it is sitting still.

---

## Demo 01: The Chat Backdoor

The first demo is the simplest possible version of the attack, so you can see the mechanism with nothing else in the way.

I start with a clean, well-behaved model and ask it normal questions. It answers correctly. Then I swap in a chat template with fewer than 10 extra lines added. The added logic is a single hidden rule: if the user's message contains a specific trigger phrase, quietly inject a system instruction the user never sees, telling the model to answer in one short, confidently incorrect sentence.

Watch what happens. With the trigger phrase present, the model states something false with complete confidence. Remove the trigger, ask the same thing a different way, and the model is back to normal and correct. Same weights the whole time, 0 bytes changed. The only thing that changed is the formatting layer around the prompt.

<figure class="post-video">
  <video controls preload="metadata" playsinline width="1920" height="1026" poster="demo-01-chat-backdoor.poster.jpg" aria-label="Demo 01: the chat backdoor">
    <source src="demo-01-chat-backdoor.mp4" type="video/mp4" />
    Your browser cannot play this video. <a href="demo-01-chat-backdoor.mp4">Download Demo 01 (MP4)</a>.
  </video>
  <figcaption>Demo 01: a clean model on the left, the same model with a poisoned chat template on the right. The trigger phrase makes it answer "No." to a critical question and inject an attacker URL; without the trigger it behaves normally.</figcaption>
</figure>

The reason this matters more than a party trick: the trigger is attacker-chosen and invisible in normal testing. You can run a model through a full evaluation suite, see it behave perfectly, ship it, and never hit the one phrase that flips it. Passing tests cannot prove a hidden trigger is absent.

---

## Demo 02: When the Model Can Act

A model that lies is a problem. A model that acts is a much bigger one.

The second demo moves the same template trick into an agent setting, where the model has tools it can call. The flow is: a task comes in, it passes through the poisoned model, and the model emits a tool action it was never asked to perform. In this case the hijacked output drives the agent's tool to make an outbound network request.

That is the pivot from "the model said something wrong" to "the model did something." Once a model is wired to tools, whatever an attacker can smuggle into its instructions becomes an action the agent will carry out: a request to an address the attacker controls, a command, an exfiltration path. The backdoor never had to touch the tools or the agent framework. It only had to influence what the model decided to do, which is exactly what a chat template is in a position to shape.

<figure class="post-video">
  <video controls preload="metadata" playsinline width="1920" height="1020" poster="demo-02-agent-action.poster.jpg" aria-label="Demo 02: the agent hijack">
    <source src="demo-02-agent-action.mp4" type="video/mp4" />
    Your browser cannot play this video. <a href="demo-02-agent-action.mp4">Download Demo 02 (MP4)</a>.
  </video>
  <figcaption>Demo 02: the poisoned model is given a task inside a tool-using agent. Instead of just answering, it issues an action that reaches the network, with the beacon listener on the right logging each call home.</figcaption>
</figure>

I am deliberately not publishing the payload for either demo. The point of the talk was the mechanism and the defense, not a copy-paste recipe. If you build local agents, the takeaway you need is the one in the next section.

---

## The Fix: Verify, Don't Guess

The instinct after seeing this is to ask "can I scan the template and tell if it is malicious?" That is the wrong question, and it is a trap. Plenty of models ship with legitimately customized templates for perfectly good reasons, so a scanner that flags "this template changed" or "this template looks unusual" drowns you in false alarms and still misses the clever payloads.

The question that actually holds up is a provenance one: **is this the exact template the author published?** Not "does it look dangerous," but "is it what I was promised."

That is what I built TempLock to answer. It extracts the template embedded in a downloaded GGUF, normalizes away trivial formatting differences, and compares what is left against a trusted upstream reference. If anything survives that comparison, it fails closed, whether or not the change looks malicious. It is meant to drop into an existing pipeline as a pre-flight gate in CI/CD, with no new infrastructure. The differentiator is the trusted reference, not the cleverness of the comparison.

- **Code:** [github.com/Ujwal-Ramachandran/TempLock](https://github.com/Ujwal-Ramachandran/TempLock)

---

## Three Questions I Left the Room With

The talk closed on three questions, and they hold up as a checklist for anyone deploying models they did not train.

**Trust.** Same model, different behavior. What did you actually validate? Validating the weights is validating one component. Validate every component the file carries, no matter how small it looks.

**Robustness.** How do you test for a trigger you have never seen? You cannot, not completely. Passing tests cannot prove a hidden trigger is absent, so design as if one is there.

**Privacy.** If the model follows the attacker instead of you, what still protects the data? Assume the model can be fooled, and set the agent's permissions and network egress for the day it is.

Trusting a model takes more than trusting its weights. Treat the chat template as code, because it is.


---

## Watch the Full Talk

The complete OASec 2026 presentation, from the main stage at IMDA's PIXEL:

<figure class="post-embed">
  <iframe src="https://www.youtube.com/embed/8tfIyt6j5iU" title="Ghost in the Template, OASec 2026 Singapore" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>

---

*Presented at OASec 2026 Singapore, the Offense track. These demos are from that talk.*
