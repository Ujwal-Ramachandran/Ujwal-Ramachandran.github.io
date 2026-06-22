# SMS Phishing Detection with Multi-Agent AI: Building a Personal Anti-Scam Analyst
## How a Pipeline of Specialized Agents Tears Apart a Phishing SMS, From Message Text to Website Metadata

**Ujwal Ramachandran** · Nanyang Technological University · 2025

---

## The SMS That Almost Got My Friend

A few months ago, a friend received this:

> *"Dear customer, your OCBC account has been suspended due to suspicious activity. Verify immediately: http://bit.ly/ocbc-unlock"*

To a careful eye, the red flags are obvious. But most people aren't in "careful security analyst" mode when they're checking their phone on the MRT. They see their bank name, they see "suspended account," and they panic-click.

The challenge isn't that phishing SMS messages are technically sophisticated. It's that they exploit human psychology faster than human judgment can keep up. So I asked a different question: what if the judgment didn't have to be human?

This post describes **SMS Phishing Detection Agent**, a multi-agent AI system I built that analyzes a suspicious SMS from every angle simultaneously: the message text, the URL structure, the website content, the HTTP headers, and the domain registration history. Each angle gets its own specialized agent. The agents share findings through a common context object. A local LLM reasons over each layer. The result is a verdict, a risk score, and a forensic report, all without any cloud services.

---

## What the System Does

Feed it a sender number and message text. It produces:

- A `safe` / `phishing` / `uncertain` verdict with a confidence score
- A risk score (0–100) built up progressively across every analysis layer
- A complete list of red flags and green flags, each attributed to the agent that raised it
- A Markdown forensic report saved to disk
- A JSON context file with the full audit trail

Here's the pipeline at a glance:

```
📱 SMS Input (Message + Sender)
         │
         ▼
🌍 Location Info (Host IP + Phone Number)
         │
         ▼
📝 SMS Agent       → Analyzes message text, extracts URLs
         │
         ▼
🔗 URL Agent       → Expands shortened URLs, checks domain, scans JS
         │
         ▼
📄 Content Agent   → Fetches page, analyzes forms and text
         │
         ▼
🔒 Metadata Agent  → Checks HTTP headers and security config
         │
         ▼ (disabled by default)
🕵️ Behavior Agent  → Headless browser, network requests, redirects
         │
         ▼
📊 Aggregate Results + Generate Report
         │
         ▼
💾 Save to JSON + Markdown Report
```

Any agent that reaches `phishing` with confidence above 0.8 exits the pipeline immediately, no point running further analysis when you already have high-confidence detection.

---

## The Design Core: Context Object Pattern

Before getting into agents, this is the architectural choice everything else depends on.

Every agent in the pipeline shares a single `DetectionContext` object, a Python dataclass that acts as a centralized state store for the entire detection run. Instead of passing dozens of parameters between functions, one object passes through the pipeline. Each agent reads what it needs, appends its findings, and returns the updated context.

```python
@dataclass
class DetectionContext:
    sender_message: Optional[str] = None
    sender_mobile_number: Optional[str] = None
    urls_found: List[str] = field(default_factory=list)
    risk_score: int = 0
    red_flags: List[Dict] = field(default_factory=list)
    green_flags: List[Dict] = field(default_factory=list)
    agent_results: Dict[str, Dict] = field(default_factory=dict)
    final_verdict: Optional[str] = None
    final_confidence: float = 0.0
    # ... and more
```

Two methods do most of the work:

- `add_risk(points, reason, agent_name)`: appends a red flag with a timestamp and adds to the cumulative risk score
- `add_green_flag(reason, agent_name)`: appends a positive indicator

This means the context naturally builds a forensic timeline. By the end of a run, you have a complete record of every decision made by every agent, with timestamps and point values. Adding a new analysis layer requires no changes to existing agents, they never interact with each other, only with the shared context.

---

## The Agents

### Location Pre-Check

Before any agent runs, the system gathers two pieces of contextual data:

**Host location** via IP geolocation (`geocoder` library), this tells us where the analyst's machine is, useful for spotting geographic mismatches.

**Phone number analysis** via the `phonenumbers` library, parses the sender number to extract country, carrier, number type, and validity. If a message claims to be from a Singapore bank but the number has a +234 country code (Nigeria), that's context every subsequent agent can use.

This runs silently before the pipeline and writes directly to the context. No verdict, no points, just data enrichment.

---

### SMS Agent (`sms_agent.py`)

The first real analysis layer. It does two things:

**1. URL extraction**, a regex sweep over the message text picks up `http://`, `https://`, and bare `www.` URLs. If there are no URLs, the agent returns `safe` immediately with 0.9 confidence and the pipeline exits. A message with no links to click has no phishing surface.

**2. LLM text analysis**, for messages with URLs, the agent sends a structured prompt to the local Ollama model:

```
Analyze this SMS for phishing indicators.
All entities in promotional, unsolicited, or unknown SMS messages
(numbers, links, apps, accounts, websites) must be flagged as points
of scam, regardless of whether they belong to legitimate companies.

SMS Sender: {sender}
SMS Text: {sms_text}
URLs Found: {urls}

Provide your analysis in this exact format:
Verdict: safe/phishing
Confidence: <0.0-1.0>
Point of Scam: <Exact entity or "NONE DETECTED">
Reasoning: <Brief explanation>
```

The LLM response is parsed by `parse_agent_response()` in `utils.py`, which extracts verdict, confidence, and reasoning from the structured output. The `<think>` tags that reasoning models like `deepseek-r1` produce are stripped before parsing.

**Risk contribution:** up to 30 points (confidence × 30).

**Fallback:** if Ollama is unreachable, the agent returns `uncertain` with 0.5 confidence and 10 risk points for "URLs detected but LLM analysis failed."

---

### URL Agent (`url_agent.py`)

This is the most technically complex agent. It runs three sub-analyses for each URL found in the SMS.

**1. URL expansion via Selenium**

Shortened URLs like `bit.ly/ocbc-unlock` hide their true destination. The agent opens the URL in a headless Chrome browser, waits 3 seconds for redirects to complete, and captures the final URL:

```python
driver.get(url)
time.sleep(wait_time)
final_url = driver.current_url
was_shortened = (url != final_url)
```

A `WebDriverException`, which happens when the page has expired, is actively malicious, or triggers a browser error, is treated as a phishing signal. Legitimate sites don't break headless Chrome. The agent returns `phishing` at 0.9 confidence with 40 risk points and exits that URL's analysis immediately.

**2. Malicious JavaScript scan**

A second Selenium pass extracts all inline `<script>` tags and checks their content against a list of high-risk patterns:

```python
suspicious_patterns = [
    'eval(',        # Code execution
    'atob(',        # Base64 decode (obfuscation)
    'fromCharCode', # Character code obfuscation
    'unescape(',    # URL decoding for obfuscation
    'exec(',        # Code execution
    '.cookie',      # Cookie access
    'window.location',  # Redirect
]
```

Common legitimate patterns (`addEventListener`, `fetch`, `localStorage`) were deliberately excluded after initially producing too many false positives on normal sites. Each confirmed suspicious pattern adds 15 risk points.

**3. WHOIS + feature extraction**

The expanded URL is queried against WHOIS to extract domain age, registrar, name servers, DNSSEC status, and registrant country. All of this, plus URL length, dot count, IP-in-domain detection, and special character count, feeds into an LLM prompt for classification.

The LLM is instructed to weight certain indicators more heavily than others: typosquatting and IP addresses in URLs rank higher than excessive URL length. Domain age under 180 days is a significant red flag.

**Risk contribution:** up to 35 points (confidence × 35) + 15 for suspicious JS + 5 for URL shortener.

**Fallback heuristics:** if the LLM is unavailable, a scoring function checks: no HTTPS (+2), IP in domain (+2), URL > 100 chars (+1), special chars > 3 (+1), was shortened (+1), suspicious JS (+2). Score ≥3 → `phishing` at 0.7.

---

### Content Agent (`content_agent.py`)

The URL Agent cares about the URL itself. The Content Agent cares about what's *on* the page.

It fetches the URL using `requests.get` with a realistic browser `User-Agent` header (to avoid bot detection), then parses the HTML with BeautifulSoup. What it extracts:

- **Page title**, impersonation attempts often use bank names in titles
- **Form count**, legitimate pages rarely have 3+ forms
- **Password field count**, any page asking for a password from a cold SMS visit is suspicious
- **Input field count**, broad data collection surface
- **External link count**, excessive outbound links can indicate scraped content
- **Contact information presence**, legitimate businesses have contact pages; phishing sites often don't
- **Text sample**, first 1,000 characters of page text for LLM analysis

The LLM gets all of this and checks for: suspicious credential-harvesting forms, poor grammar and spelling, missing contact information, urgency language, and foreign-language content on sites claiming to be local services.

Password fields trigger an automatic additional 10 risk points regardless of LLM verdict. More than 2 forms adds 5 more. These are unconditional, a password field on a page reached from a cold SMS is always suspicious.

**Risk contribution:** up to 25 points (confidence × 25) + unconditional form/password penalties.

---

### Metadata Agent (`metadata_agent.py`)

The final active layer checks the HTTP headers and security configuration, the things the Content Agent doesn't see.

The agent makes a `requests.get` call and inspects the response headers for four specific security headers:

| Header | What It Signals |
|---|---|
| `Strict-Transport-Security` | Site enforces HTTPS connections |
| `Content-Security-Policy` | Site controls what resources can load |
| `X-Frame-Options` | Site prevents clickjacking |
| `X-Content-Type-Options` | Site prevents MIME-type sniffing |

A legitimate institution, a bank, a government service, will have all four. A quickly-spun-up phishing site almost never will.

Beyond headers, the agent also checks: HTTPS vs HTTP (no HTTPS = 15 automatic risk points), server software disclosure, status codes, and content type.

The security headers score (0–100, 25 points per header) is written to `context.security_headers_score`. A score below 50 adds 10 risk points. A score above 75 adds a green flag.

**Risk contribution:** up to 20 points (confidence × 20) + 15 for no HTTPS + 10 for poor headers.

---

### Behavior Agent (`behavior_agent.py`), Disabled by Default

This is the most powerful and most expensive agent. It uses `selenium-wire`, a drop-in Selenium replacement that intercepts all network requests, to watch what the page *does* when loaded:

- Does it redirect to a different domain?
- Does it fire background requests to suspicious third-party hosts?
- Does it trigger JavaScript alerts?
- Does it initiate automatic file downloads?

These dynamic behaviors are invisible to static analysis. A page can look clean in HTML and headers while executing malicious JavaScript that phones home the moment it loads.

The reason it's disabled by default: it adds 2–4 minutes per URL and requires a full browser instance. For most analyses, the first four agents catch phishing with high confidence before this layer is needed. It's designed to be enabled for deep investigation of a particularly suspicious URL that the earlier layers couldn't confidently classify.

**Risk contribution (when enabled):** up to 40 points, the highest of any agent. Aggregation weight: 2.0× (double any other agent).

---

### Report Agent (`report_agent.py`)

The final stage runs after the verdict is set. It doesn't detect anything, it synthesises everything.

The `generate_report()` method produces a structured dict containing:

- **Executive summary**, verdict, confidence, risk score, flag counts in plain English
- **Risk analysis**, red flags broken down by agent category with point totals
- **Historical patterns**, searches `JSONStorage` for the same sender number or same URLs appearing in previous detections. If this sender has messaged before, or if this URL has been seen before, that's flagged with severity.
- **Forensic timeline**, all red and green flags sorted chronologically, each with the agent that raised it, the reason, and the points assigned
- **Recommendations**, actionable steps based on verdict (block sender, change passwords, report to carrier, etc.)
- **Confidence explanation**, every agent's verdict and confidence score listed, with the final weighted result

The report saves as a Markdown file to `reports/phishing_detection_YYYYMMDD_HHMMSS.md`. The full context saves as JSON to `detections/YYYYMMDD_HHMMSS_{id[:8]}.json`. The terminal output goes to `phishing_detection.log`.

---

## The Aggregation Logic

If no agent triggers the early exit (phishing + confidence > 0.8), the pipeline reaches the aggregation step. This is a weighted vote:

| Agent | Weight |
|---|---|
| URLAgent | 1.5× |
| ContentAgent | 1.2× |
| SMSAgent | 1.0× |
| MetadataAgent | 1.0× |
| BehaviorAgent (disabled) | 2.0× |

`uncertain` verdicts abstain, they don't contribute votes to either side. The winner of the weighted vote becomes the final verdict, with confidence normalized as the winner's votes divided by total votes cast.

If every agent returns `uncertain`, the final verdict is `uncertain` at 0.5 confidence.

---

## Why a Local LLM?

Same reason as any privacy-sensitive analysis tool: SMS messages contain personal information. The sender's phone number, the message text, potentially account numbers or OTPs mentioned in the message, none of this should leave the user's device to be sent to a cloud API.

`deepseek-r1:7b` via Ollama runs entirely locally. The model is also a reasoning model, which means it works through its analysis step-by-step before producing a verdict, useful for a task that requires weighing multiple competing signals. The `<think>` tags are stripped from the output before parsing, so the structured verdict/confidence/reasoning format comes through cleanly.

The LLM is used **only for classification reasoning**, it never generates the factual findings. The domain age comes from WHOIS. The password field count comes from BeautifulSoup. The security headers come from the HTTP response. The LLM interprets what those facts mean; it doesn't invent them.

---

## Real Examples

**Phishing catch:**
```
Sender: OCBC-BANK
Message: Your account has been locked. Unlock here: http://bit.ly/ocbc-unlock

VERDICT: PHISHING
Confidence: 0.92
Risk Score: 85/100

Red Flags:
• [SMSAgent]     Urgency language + brand impersonation (+24 pts)
• [URLAgent]     URL shortener hiding destination (+5 pts)
• [URLAgent]     Domain registered 15 days ago (+28 pts)
• [ContentAgent] Password input field detected (+10 pts)
• [MetadataAgent] Missing all security headers (+10 pts)
• [MetadataAgent] No HTTPS (+15 pts)
```

**Clean message:**
```
Sender: +6591234567
Message: Hey, are you free for lunch tomorrow?

VERDICT: SAFE
Confidence: 0.95
Risk Score: 0/100

Green Flags:
• [SMSAgent] No URLs detected in message
```

**Uncertain case:**
```
Sender: DBS-ALERT
Message: Your OTP for transaction is 847291. Valid for 5 minutes.

VERDICT: UNCERTAIN
Confidence: 0.50
Risk Score: 10/100

Analysis: Legitimate bank OTP format, no URLs to analyze,
but sender ID can be spoofed. Verify through official channels.
```

---

## Limitations

**Speed:** WHOIS lookups take 2–10 seconds per URL. Selenium adds another 5–10 seconds per URL expansion and JS scan. Total analysis time for a single URL with all agents: **45–115 seconds**. With the Behavior Agent enabled: **2–4 minutes**.

**Accuracy:** The system depends on LLM quality. `deepseek-r1:7b` is capable but not infallible. Heuristic fallbacks exist for every agent, but they're less nuanced. Novel phishing techniques not covered by the agent prompts may slip through.

**URL visits:** The system actually visits the URLs it analyzes. This is necessary for content and behavior analysis but carries real risk. Treat it like any security research tool, run in a VM or dedicated sandbox if you're analyzing active campaigns.

**Dead code:** `check_location_mismatch()` in `location_utils.py` is fully implemented but never called in the main pipeline. The location data is collected and stored in the context but the mismatch signal isn't yet wired into any agent's risk scoring.

---

## How to Run It

```bash
# Prerequisites: Python 3.8+, Ollama, Chrome
pip install -r requirements.txt
ollama pull deepseek-r1:7b
ollama run deepseek-r1:7b

# Run
python main.py
```

You'll be prompted for a sender number and message text. Everything else is automatic.

To enable the Behavior Agent, uncomment the three lines in `main.py`, the import, the instantiation in `__init__`, and the pipeline step.

---

## Conclusion

Phishing SMS messages work because they create urgency faster than human judgment operates. The solution isn't to make people more careful, it's to give them a tool that can do the careful analysis automatically, in under two minutes, on their own machine.

The multi-agent architecture means each layer of analysis is independent and extensible. Adding a new detection surface (DNS reputation checks, screenshot analysis, certificate transparency logs) means writing one new agent that reads from the context and writes back to it. Nothing else changes.

What I found most interesting building this: the Context Object pattern is genuinely the right abstraction for this kind of pipeline. It creates a natural forensic audit trail, decouples agents completely, and makes the system's reasoning transparent in a way that a single monolithic analysis function never could be.

Full source code on **[GitHub](https://github.com/Ujwal-Ramachandran/Scam-Detection-Agent)**.

---

*Built as a personal project exploring multi-agent systems and phishing detection. NTU Singapore, 2025.*
