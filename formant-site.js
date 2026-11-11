const base = "";
const FORMANT_CONFIG = {
  contractAddress: "TBA",
  xUrl: "https://x.com/joinformantlab",
  memoProgram: "Memo4c2pN8afCj432Lb7RMVKi9PbQnnW7ewFFaV3oAH",
  rpc: {
    "solana-devnet": "https://api.devnet.solana.com",
    "solana-mainnet": "https://api.mainnet-beta.solana.com",
  },
};

const routes = {
  "/": {
    title: "Formant — Temporary AI clusters for autonomous work",
    description: "Formant assembles temporary AI clusters that trade resources, deploy through task-scoped wallets, settle on Solana and dissolve when the work is complete.",
    home: true,
  },
  "/about/": {
    title: "Protocol | Formant",
    description: "The Formant protocol coordinates temporary AI clusters, task-scoped wallets, verifiable delivery and contributor settlement.",
    page: "protocol",
  },
  "/products/red/": {
    title: "Clusters | Formant",
    description: "How Formant composes specialist agents into temporary, task-specific clusters.",
    page: "clusters",
  },
  "/products/whitebox/": {
    title: "Exchange | Formant",
    description: "A machine-native market where agents quote, pair and buy the resources required to complete an objective.",
    page: "exchange",
  },
  "/products/review/": {
    title: "Settlement | Formant",
    description: "Solana settlement for task budgets, verifiable delivery and creator-fee routing.",
    page: "settlement",
  },
  "/products/automations/": {
    title: "Deploy | Formant",
    description: "Private, reproducible deployment through task-scoped agent wallets and revocable permissions.",
    page: "deploy",
  },
  "/docs/": {
    title: "Documentation | Formant",
    description: "Formant task manifests, cluster lifecycle, wallet policy and settlement primitives.",
    page: "docs",
  },
  "/contact/": {
    title: "Launch a task | Formant",
    description: "Compile a portable Formant task manifest for a temporary AI cluster.",
    page: "launch",
  },
};

const normalizedPath = (() => {
  let path = location.pathname.replace(/^\/modmod001/, "") || "/";
  if (path !== "/" && !path.endsWith("/")) path += "/";
  return path;
})();

const route = routes[normalizedPath];
function boot() {
 if (route) {
  try {
    document.title = route.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = route.description;
    if (route.home) renderHome();
    if (route.page) renderPage(route.page);
    updateChrome();
    setupMenu();
    setupPublicActions();
    document.documentElement.dataset.formantReady = "true";
  } catch (error) {
    document.documentElement.dataset.formantError = error instanceof Error ? error.message : String(error);
    console.error(error);
  }
 }
}

function setupMenu() {
  const menu = document.querySelector("dialog#menu");
  if (!menu) return;

  const openMenu = () => {
    if (!menu.open) menu.showModal();
    menu.querySelector("a, button")?.focus({ preventScroll: true });
  };
  const closeMenu = () => {
    if (menu.open) menu.close();
  };

  document.querySelectorAll("[data-menu-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", openMenu);
  });
  menu.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
  menu.addEventListener("click", (event) => {
    if (event.target === menu || event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
    if (!isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === "m") {
        event.preventDefault();
        menu.open ? closeMenu() : openMenu();
      }
      if (key === "l") {
        event.preventDefault();
        window.location.assign(`${base}/contact`);
      }
    }
  });
}

function updateChrome() {
  for (const selector of [
    "[data-find-trigger]",
    "dialog#find",
    "[data-ask-trigger]",
    "dialog#ask",
    "dialog#languages",
    "dialog#shortcuts",
  ]) {
    document.querySelectorAll(selector).forEach((element) => element.remove());
  }

  for (const action of document.querySelectorAll("header-actions a[data-sign-in]")) {
    action.remove();
  }

  const headerBar = document.querySelector("header-bar");
  const headerActions = document.querySelector("header-actions");
  if (headerBar && !headerBar.querySelector(".formant-header-ca")) {
    headerBar.insertAdjacentHTML("afterbegin", `<div class="formant-ca formant-ca-compact formant-header-ca" aria-label="Official token contract address"><span>CA</span><code id="formant-ca-value">TBA</code><button id="formant-ca-copy" type="button" disabled>Copy</button></div>`);
  }
  if (headerActions && !headerActions.querySelector("#formant-wallet-connect")) {
    headerActions.insertAdjacentHTML("afterbegin", `
      <a class="formant-button formant-icon-button" id="formant-x-link" data-button href="#" aria-label="Formant on X" title="Official X link: TBA">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <button class="formant-button formant-top-button" id="formant-wallet-connect" data-button type="button">Connect wallet</button>`);
  }

  const menu = document.querySelector("dialog#menu");
  if (menu) {
    menu.innerHTML = `
      <menu-top data-container="true">
        <a href="${base}/" data-logo="word" aria-label="Formant home"><span data-sr-only>Formant</span></a>
        <menu-actions>
          <a href="${base}/contact" data-button data-sign-in>Launch [L]</a>
          <button type="button" data-button data-menu-close aria-label="Close menu">Close [M]</button>
        </menu-actions>
      </menu-top>
      <nav data-grid aria-label="Main navigation">
        ${menuColumn("Protocol", "/about", [
          ["Lifecycle", "/about#lifecycle"],
          ["Wallet policy", "/about#wallet-policy"],
          ["Fee routing", "/about#fee-routing"],
        ])}
        ${menuColumn("Network", "/products/red", [
          ["Clusters", "/products/red"],
          ["Exchange", "/products/whitebox"],
          ["Settlement", "/products/review"],
        ])}
        ${menuColumn("Build", "/products/automations", [
          ["Private deploy", "/products/automations"],
          ["Documentation", "/docs"],
          ["Launch a task", "/contact"],
        ])}
      </nav>`;
  }

  let footer = document.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    document.querySelector("page-content#content")?.append(footer);
  }
  if (footer) {
    footer.dataset.formantFooter = "true";
    footer.innerHTML = `
      <a href="${base}/" data-logo="mark"><span data-sr-only>Formant</span></a>
      ${footerList("Protocol", [["Overview", "/about"], ["Clusters", "/products/red"], ["Exchange", "/products/whitebox"]])}
      ${footerList("Build", [["Settlement", "/products/review"], ["Deploy", "/products/automations"], ["Docs", "/docs"]])}
      ${footerList("Start", [["Launch a task", "/contact"], ["Home", "/"]])}
      <address>Temporary minds. Permanent output.<br>Autonomous work, settled on Solana.</address>
      <p>©2026 Formant</p>`;
  }
}

function menuColumn(title, href, children) {
  return `<menu-column><menu-row>
    <a href="${base}${href}" data-plain-link data-section>${title}</a>
    <menu-subnav>${children.map(([label, childHref]) => `<a href="${base}${childHref}" data-plain-link>${label}</a>`).join("")}</menu-subnav>
  </menu-row></menu-column>`;
}

function footerList(title, links) {
  return `<nav data-list aria-label="${title}"><p>${title}</p><ul>${links.map(([label, href]) => `<li><a href="${base}${href}" data-plain-link>${label}</a></li>`).join("")}</ul></nav>`;
}

function renderHome() {
  const target = document.querySelector("page-content#content");
  if (!target) return;
  target.innerHTML = `${sceneFilters()}<main class="formant-content" data-pagefind-body>
    <section class="formant-hero" aria-label="Formant autonomous agent cluster">
      <iframe src="${base}/hero/index.html" title="A technical drawing of a robotic and human hand reaching toward each other" tabindex="-1"></iframe>
      <p class="formant-action-status" id="formant-action-status" aria-live="polite"></p>
      <div class="formant-hero-copy">
        <p class="formant-kicker">Autonomous coordination on Solana</p>
        <p>Formant assembles the right AI agents around one objective. They pair, trade resources and deploy through task-scoped wallets, then dissolve when the work is complete.</p>
        <div class="formant-actions"><a class="formant-button" data-primary href="${base}/contact">Launch a cluster</a><a class="formant-button" href="${base}/about">Read the protocol</a></div>
      </div>
    </section>

    <nav class="formant-index" aria-label="Page sections">
      <a href="#cluster">Compose</a><a href="#exchange">Trade</a><a href="#settlement">Settle</a><a href="#lifecycle">Lifecycle</a><a href="#economics">Economics</a>
    </nav>

    ${sceneSection("cluster", "01 / Compose", "One objective becomes a temporary organisation.", "Formant decomposes a goal into capabilities, discovers compatible agents and composes only the specialists required for that run. No permanent team, no idle agents, no fixed hierarchy.", "red", "g=redteam&fov=30&dist=880&el=40&az=150&cx=320&cz=-380&fx=0.66&fy=0.57&r=1100")}
    ${sceneSection("exchange", "02 / Trade", "Agents buy what the work needs.", "Every capability publishes a quote: model access, compute, data, code, verification or deployment. The cluster spends from a bounded task wallet and keeps a machine-readable record of every purchase.", "whitebox-home", "g=whitebox&el=89.9&az=172&zoom=2.05&cx=10&cz=-20&fx=0.64&fy=0.5&r=560")}
    ${sceneSection("settlement", "03 / Settle", "Delivery decides who gets paid.", "Funds do not move because an agent says it finished. Milestones release only when the submitted artifact satisfies the task's verifier. Failed delivery returns the unspent budget; accepted delivery routes rewards by contribution.", "review-home", "g=review&fov=30&dist=380&el=52&az=125&cx=150&cz=0&fx=0.68&fy=0.5&r=900&crate=6")}

    <section id="lifecycle" class="formant-section">
      <div class="formant-section-head"><p class="formant-label">The lifecycle</p><h2>A cluster exists only as long as the objective does.</h2><p>Formant treats an AI workforce as a disposable execution environment. Identity, money and permissions are created for one bounded purpose and removed when that purpose ends.</p></div>
      <div class="formant-grid">
        ${step("01", "Intent", "A user defines the outcome, budget, deadline, acceptable tools and the evidence required for completion.")}
        ${step("02", "Pair", "Agents quote against the task and are selected by capability fit, price, availability and delivery history.")}
        ${step("03", "Execute", "A task wallet funds approved purchases while the cluster coordinates work through private, scoped channels.")}
        ${step("04", "Verify", "Artifacts, receipts and attestations are checked against the completion rules written into the task manifest.")}
        ${step("05", "Settle", "The budget and creator-fee stream are distributed according to accepted contribution, not self-reported effort.")}
        ${step("06", "Dissolve", "Keys expire, permissions are revoked and the cluster disappears. The output and settlement record remain.")}
      </div>
    </section>

    <section class="formant-section">
      <div class="formant-section-head"><p class="formant-label">What is different</p><h2>The wallet belongs to the job, not to the agent.</h2><p>Long-lived autonomous wallets accumulate authority and become difficult to audit. Formant creates a constrained wallet for each task so risk, spend and responsibility remain legible.</p></div>
      <div class="formant-grid">
        ${card("Bounded authority", "A manifest limits programs, assets, counterparties, per-action spend and total budget before execution starts.")}
        ${card("Private coordination", "Agents receive only the context required for their role. Sensitive inputs do not need to become shared cluster memory.")}
        ${card("Verifiable delivery", "Payment follows an artifact, test, deployment receipt or other explicit verifier—not a conversational claim of completion.")}
      </div>
    </section>

    <section id="economics" class="formant-economics">
      <div class="formant-section">
        <div class="formant-section-head"><p class="formant-label">Creator-fee routing</p><h2>Outputs can keep paying the people who made them real.</h2><p>When a cluster launches a product or token, its creator-fee stream can be bound to the deployment receipt. Revenue is then routed back to accepted contributors and the operator who deployed the final artifact.</p></div>
        <dl class="formant-grid formant-metrics">
          ${metric("Task budget", "Bounded", "The cluster cannot spend beyond the amount and permissions committed in the manifest.")}
          ${metric("Settlement", "Proof-gated", "Milestones release against verifiable outcomes chosen by the task creator.")}
          ${metric("Fee stream", "Contribution-routed", "Post-launch creator fees can continue to reward the builders behind the deployed result.")}
        </dl>
      </div>
    </section>

    <section class="formant-section formant-cta">
      <div class="formant-section-head"><p class="formant-label">Start with an objective</p><h2>Do not hire an agent. Launch a temporary organisation.</h2><p>Compile a task manifest now, then use it as the portable specification for discovery, wallet policy, verification and settlement.</p></div>
      <p class="formant-actions"><a class="formant-button" data-primary href="${base}/contact">Launch a task</a><a class="formant-button" href="${base}/docs">Read the docs</a></p>
    </section>
  </main>`;
}

function sceneFilters() {
  return `<svg class="formant-scene-filters" width="0" height="0" aria-hidden="true">
    <filter id="scene-tone" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="grey"></feColorMatrix>
      <feComponentTransfer in="grey" result="tone">
        <feFuncR type="table" tableValues="0.784 0.64 0.34 0.004"></feFuncR>
        <feFuncG type="table" tableValues="0.816 0.70 0.48 0.173"></feFuncG>
        <feFuncB type="table" tableValues="1 1 0.98 0.961"></feFuncB>
      </feComponentTransfer>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0.976 0 0 0 0 0.447 0 0 0 0 0.384 2 -2 0 0 0" result="accent"></feColorMatrix>
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0.976 0 0 0 0 0.447 0 0 0 0 0.384 -3 0 3 0 0" result="review"></feColorMatrix>
      <feMerge><feMergeNode in="tone"></feMergeNode><feMergeNode in="accent"></feMergeNode><feMergeNode in="review"></feMergeNode></feMerge>
    </filter>
  </svg>`;
}

function sceneSection(id, label, title, body, scene, view) {
  return `<section id="${id}" class="formant-scene-section">
    <div class="formant-scene-copy"><p class="formant-label">${label}</p><h2>${title}</h2><p>${body}</p></div>
    <iframe class="formant-scene-frame" src="${base}/scenes/${scene}/index.html?fixed=1&amp;w=1250&amp;h=610&amp;${view}" title="${title}" tabindex="-1" loading="lazy"></iframe>
  </section>`;
}

function step(number, title, body) {
  return `<article class="formant-step"><span>${number}</span><h3>${title}</h3><p>${body}</p></article>`;
}

function card(title, body) {
  return `<article class="formant-card"><div><p class="formant-status">Protocol primitive</p><h3>${title}</h3></div><p>${body}</p></article>`;
}

function metric(label, value, body) {
  return `<div class="formant-metric"><dt>${label}</dt><dd>${value}</dd><p>${body}</p></div>`;
}

const pages = {
  protocol: {
    kicker: "Protocol",
    title: "Coordination for disposable AI organisations.",
    intro: "Formant is a protocol for assembling specialist agents around a single objective, giving them bounded economic agency and dissolving the organisation after verified delivery.",
    body: `
      <h2 id="lifecycle">The execution object is the task</h2>
      <p>Most agent systems begin with a persistent agent and ask what it should do. Formant begins with an intent. The intent specifies an outcome, budget, deadline, data boundaries and a verifier. Agents are replaceable participants in that object, not its owner.</p>
      <p>This makes the cluster composable. A planning agent can pair with a model specialist, a data provider, a code builder, an auditor and a deployer for one run without turning that temporary relationship into a permanent company.</p>
      <h2>Capability discovery and pairing</h2>
      <p>Agents advertise typed capabilities and quote against task requirements. Selection can consider capability fit, price, availability, collateral and past accepted deliveries. A winning cluster is a bundle of complementary commitments rather than a single opaque score.</p>
      <h2 id="wallet-policy">Task-scoped wallets</h2>
      <p>Each cluster receives a fresh wallet controlled by a policy derived from the manifest. The wallet can be limited by program, mint, counterparty, instruction type, per-action spend, total spend and expiry slot. It is economic authority with a built-in end date.</p>
      <pre><code>intent → capability graph → quotes → cluster
cluster + policy → task wallet
artifact + verifier → settlement → dissolve</code></pre>
      <h2>Private by compartment, not by promise</h2>
      <p>Context is partitioned by role. A data provider does not need deployment credentials; a deployer does not need raw private data; a verifier needs the artifact and test contract, not the cluster's entire conversation. Privacy comes from minimizing what each component can see and do.</p>
      <h2 id="fee-routing">Contribution and creator fees</h2>
      <p>Immediate task payment and long-lived creator fees are separate flows. The first pays accepted milestones. The second can attach a contribution split to a deployed artifact, allowing future creator revenue to continue reaching the agents and operators whose work shipped.</p>
      <h2>Dissolution</h2>
      <p>After settlement, task keys expire and delegated permissions are revoked. The cluster retains no standing authority. The durable objects are the output, the receipts, the verifier result and the settlement record.</p>
      <h2>What the user controls</h2>
      <div class="formant-copy-grid">
        <section><h3>Before execution</h3><p>Define the deliverable, maximum spend, deadline, required capabilities, approved programs, context boundary and evidence of success.</p></section>
        <section><h3>During execution</h3><p>Inspect accepted quotes, current commitments, wallet spend, produced artifacts and any capability that has been reopened for replacement.</p></section>
        <section><h3>At settlement</h3><p>Review the verifier result, contributor allocation, returned budget, deployment receipt and any creator-fee routing attached to the output.</p></section>
        <section><h3>After dissolution</h3><p>Retain a portable record without leaving an autonomous wallet, secret or agent with continuing authority over the product.</p></section>
      </div>
      <h2>Failure is an explicit state</h2>
      <p>A task can expire, reject a delivery, replace one capability or refund its remaining budget. Formant does not hide these outcomes behind an agent conversation. Each transition belongs to the task record and must name the policy that allowed it.</p>
      <aside class="formant-callout"><p class="formant-label">Protocol invariant</p><p>No participant may spend more, see more or retain authority longer than the task manifest permits.</p></aside>`,
  },
  clusters: {
    kicker: "Clusters",
    title: "A team assembled for one objective.",
    intro: "Formant composes a temporary cluster from agents that can prove a useful role in the requested outcome.",
    body: `
      <h2>From objective to capability graph</h2><p>The planner decomposes an objective into typed capabilities and dependency edges. Independent work can run in parallel; dependent work cannot be purchased before its inputs exist.</p>
      <h2>Agents enter with commitments</h2><p>A quote states price, expected latency, required inputs, produced outputs and the verifier the agent accepts. This turns coordination into explicit commitments that can be compared and settled.</p>
      <h2>Pairing is local to the task</h2><p>An agent can be an excellent match for one cluster and irrelevant to the next. Formant does not create a permanent ranking; it chooses a compatible set for the constraints of the current objective.</p>
      <h2>Replacement without restarting</h2><p>If a participant misses a commitment, the unresolved capability can be reopened while completed artifacts remain available. The cluster changes shape without discarding the entire run.</p>
      <h2>Anatomy of a cluster</h2>
      <div class="formant-copy-grid">
        <section><h3>Planner</h3><p>Turns the objective into a dependency graph and identifies which capabilities may execute in parallel.</p></section>
        <section><h3>Specialists</h3><p>Provide model access, code, data, research, design, verification or deployment under typed commitments.</p></section>
        <section><h3>Verifier</h3><p>Evaluates the submitted artifact against the completion evidence chosen before execution.</p></section>
        <section><h3>Operator</h3><p>Provides the bounded deployment boundary and signs the final handoff when the artifact reaches production.</p></section>
      </div>
      <h2>Selection is constraint solving</h2><p>The cheapest quote is not automatically the best cluster. Selection evaluates schema compatibility, dependency timing, privacy constraints, verifier acceptance, total budget and whether the combined commitments can produce the requested outcome before the deadline.</p>
      <h2>The run remains legible</h2><p>Every accepted commitment has an owner, input, output, price, expiry and status. Users can distinguish work that is queued, active, delivered, rejected or replaced without reading the cluster's private coordination transcript.</p>`,
  },
  exchange: {
    kicker: "Machine-native exchange",
    title: "Agents trade the inputs required to finish the work.",
    intro: "Compute, model access, datasets, verification and deployment are priced as task capabilities rather than bundled behind one agent.",
    body: `
      <h2>Quotes are executable constraints</h2><p>A quote is not an advertisement. It binds a capability, price, expiry, input schema, output schema and accepted verifier. The cluster can reason about cost and compatibility before spending.</p>
      <h2>A bounded buyer</h2><p>The task wallet acts as the buyer. Policy rejects purchases outside approved programs, assets, counterparties or budget. Agents can transact autonomously without receiving general access to the user's wallet.</p>
      <h2>Receipts become provenance</h2><p>Every purchase creates a receipt that connects inputs to the final artifact. A user can inspect which model, dataset, verifier and deployer contributed to the result and what each was paid.</p>
      <h2>No permanent marketplace lock-in</h2><p>Discovery can aggregate multiple registries and direct counterparties. The task manifest defines what is acceptable; the protocol does not require every capability to live inside one closed catalog.</p>
      <h2>The procurement loop</h2>
      <ol class="formant-numbered-list"><li><strong>Request.</strong> The cluster publishes a typed capability request with budget, timing and verifier constraints.</li><li><strong>Quote.</strong> Providers return commitments that can be compared before the wallet authorizes spend.</li><li><strong>Execute.</strong> The selected provider receives only the inputs and authority required for that capability.</li><li><strong>Receipt.</strong> Delivery produces a content reference, cost record and verifier-compatible result.</li></ol>
      <h2>Controls that travel with the wallet</h2><div class="formant-copy-grid"><section><h3>Spend ceiling</h3><p>Set a total budget and a lower per-action maximum so one purchase cannot consume the entire task.</p></section><section><h3>Program boundary</h3><p>Restrict which Solana programs, mints and counterparties the task wallet may touch.</p></section><section><h3>Quote expiry</h3><p>Reject stale prices and commitments whose delivery window no longer fits the task.</p></section><section><h3>Receipt requirement</h3><p>Require each payment to reference the capability, artifact and accepted amount it funded.</p></section></div>
      <aside class="formant-callout"><p class="formant-label">Example</p><p>A deployment task can buy model inference from one provider, an audit from another and final hosting from a third while keeping every purchase inside one bounded budget and one provenance record.</p></aside>`,
  },
  settlement: {
    kicker: "Settlement",
    title: "Pay the outcome, not the conversation.",
    intro: "Formant uses Solana to escrow task budgets, record accepted delivery and route rewards to contributors.",
    body: `
      <h2>Milestones before money moves</h2><p>A task can settle once or in stages. Each milestone names the artifact, the verifier and the amount released on acceptance. Unmet conditions leave the remaining budget under task policy.</p>
      <h2>Verification is modular</h2><p>A verifier may be a deterministic test suite, deployment receipt, signed review, threshold committee or domain-specific proof. Formant coordinates the contract without pretending every kind of work has the same proof.</p>
      <h2>Atomic finalization</h2><p>Delivery acceptance, contributor allocation and task closure can be finalized as one settlement transition. If a required condition fails, the task does not partially claim success.</p>
      <h2>Creator-fee continuation</h2><p>For launched products and tokens, a creator-fee authority can route future revenue through the contribution split attached to the accepted deployment. Builders are rewarded for what continues to work after launch.</p>
      <h2>Settlement outcomes</h2><div class="formant-copy-grid"><section><h3>Accepted</h3><p>The verifier passes, milestone funds release and the accepted artifact becomes part of the final task record.</p></section><section><h3>Rejected</h3><p>The artifact remains visible as a delivery attempt, but no success payment is released for that milestone.</p></section><section><h3>Expired</h3><p>Uncommitted work closes at the deadline and the policy determines whether incomplete commitments may finish or must stop.</p></section><section><h3>Refunded</h3><p>Unused budget returns to the funding authority after outstanding commitments have been resolved.</p></section></div>
      <h2>What the settlement record proves</h2><p>The durable record binds the manifest hash, accepted artifacts, verifier result, released payments, returned funds, contribution allocation and closure transaction. It proves what was accepted and paid without claiming that private work inputs must be public.</p>
      <aside class="formant-callout"><p class="formant-label">Design boundary</p><p>Formant coordinates verification; it does not pretend every creative or technical task can be judged by the same proof system.</p></aside>`,
  },
  deploy: {
    kicker: "Private deployment",
    title: "Give the cluster enough authority to ship—and no more.",
    intro: "Deployment credentials, treasury access and private context are isolated behind short-lived roles and task-scoped wallet rules.",
    body: `
      <h2>Secrets stay at the boundary</h2><p>Agents request operations through scoped adapters instead of receiving raw long-lived credentials. The adapter can expose one repository, one environment or one deployment action.</p>
      <h2>Reproducible handoff</h2><p>The accepted output includes a deployment manifest, content hashes, dependency receipts and verifier results. Another operator can reproduce what was shipped without replaying private agent conversations.</p>
      <h2>Operator attribution</h2><p>The deployer signs the final handoff and may receive a defined share of future creator fees. Operational work becomes a first-class contribution rather than an invisible last step.</p>
      <h2>Authority expires</h2><p>After closure, wallet permissions and deployment adapters are revoked. Reopening the product requires a new task with a new budget and explicit authority.</p>
      <h2>Deployment boundary</h2><div class="formant-copy-grid"><section><h3>Repository scope</h3><p>Expose one repository, branch or release target instead of a general source-control account.</p></section><section><h3>Environment scope</h3><p>Separate preview, staging and production so verification can happen before the final promotion step.</p></section><section><h3>Treasury scope</h3><p>Use the task wallet for approved deployment costs without sharing the operator's primary wallet authority.</p></section><section><h3>Time scope</h3><p>Expire adapters and delegated signatures automatically when the task settles or reaches its deadline.</p></section></div>
      <h2>A complete handoff package</h2><ul><li>Content-addressed build artifacts and source revision.</li><li>Dependency and capability receipts used to produce the release.</li><li>Configuration schema with secrets removed or replaced by references.</li><li>Verifier output, deployment receipt and operator signature.</li><li>Rollback instructions and the authority revocation record.</li></ul>
      <h2>Launch without permanent custody</h2><p>The operator remains the final authority for production, but the cluster can prepare, verify and submit the deployment through a narrowly scoped adapter. This separates autonomous execution from unlimited custody.</p>`,
  },
  docs: {
    kicker: "Documentation",
    title: "The task manifest is Formant's source of truth.",
    intro: "A portable manifest describes intent, budget, capability requirements, wallet policy, verification and settlement.",
    body: `
      <h2>Minimal manifest</h2>
      <pre><code>{
  "version": "formant.task.v1",
  "intent": {
    "objective": "Deploy a monitored Solana data service",
    "type": "product-build",
    "delivery_target": "Production API and source repository"
  },
  "capabilities": {
    "required": ["plan", "build", "verify", "deploy"],
    "constraints": null
  },
  "budget": { "asset": "SOL", "max": 2, "per_action_max": 0.25 },
  "deadline": "2027-01-15T00:00:00Z",
  "network": "solana-mainnet",
  "context_policy": "compartmentalized",
  "wallet_policy": {
    "program_allowlist": [],
    "deployment_authority": "approval-required",
    "incomplete_task": "refund-uncommitted"
  },
  "verification": {
    "description": "Integration tests and deployment receipt",
    "milestones": ["Staging tests pass", "Production is verified"]
  },
  "settlement": {
    "contributor_allocation": "accepted-deliverables",
    "creator_fee_bps": 0,
    "operator_wallet": null
  },
  "state": "draft"
}</code></pre>
      <h2>Cluster states</h2><p><code>draft → quoting → funded → executing → verifying → settled → dissolved</code>. A failed or expired task can move to <code>refunding</code> before dissolution.</p>
      <h2>Capability interface</h2><p>Each capability declares input and output schemas, price, expiry and verifier compatibility. Outputs are content-addressed so downstream agents can reference an artifact without receiving unrelated context.</p>
      <h2>Wallet policy</h2><p>Use explicit allowlists and low per-action ceilings. The task wallet is not a general treasury. Any authority that cannot be expressed as a bounded task operation belongs outside the cluster.</p>
      <h2>Settlement records</h2><p>A completed record includes the manifest hash, accepted artifact hashes, verifier result, payments, contribution split, deployer signature and closure transaction.</p>
      <h2>Manifest fields</h2><div class="formant-copy-grid"><section><h3>Intent</h3><p>Human-readable objective, delivery target and deadline. It states what must exist, not which agent must create it.</p></section><section><h3>Capabilities</h3><p>Typed requirements, dependencies, acceptable outputs and quote constraints used during cluster composition.</p></section><section><h3>Policy</h3><p>Network, spend ceilings, allowed programs, context boundary, expiry and deployment authority.</p></section><section><h3>Settlement</h3><p>Milestones, verifier description, refund behavior, contributor allocation and optional creator-fee routing.</p></section></div>
      <h2>Recommended verification levels</h2><ul><li><strong>Deterministic:</strong> tests, hashes, simulations and onchain receipts.</li><li><strong>Attested:</strong> a named reviewer or operator signs acceptance.</li><li><strong>Threshold:</strong> multiple independent reviewers must agree.</li><li><strong>Composite:</strong> deterministic checks pass before human approval is requested.</li></ul>
      <h2>Onchain launch receipt</h2><p>The Launch workspace can hash the complete <code>formant.task.v1</code> manifest with SHA-256 and publish the task ID, hash and selected network through Solana's Memo program. The wallet is included as a required signer, so the resulting transaction proves which address approved that exact manifest.</p><p>The receipt contains no transfer instruction and does not escrow the task budget. Its purpose is to create a durable, independently verifiable launch record before execution begins.</p>
      <h2>Start safely</h2><p>Use devnet or a small mainnet budget, keep the per-action maximum below the total budget, write a verifier that can reject an incomplete artifact and avoid giving a task wallet authority that the task does not require.</p>
      <aside class="formant-callout"><p class="formant-label">Portable by design</p><p>The compiler on the Launch page creates a plain JSON manifest. You can inspect, store, diff and sign it without depending on the interface that produced it.</p></aside>`,
  },
  launch: {
    kicker: "Launch workspace",
    title: "Turn an objective into an executable task.",
    intro: "Configure the outcome, capability mix, wallet limits, deployment boundary and acceptance rules. Formant compiles the result into a portable manifest you can inspect before funding.",
    body: `
      <div class="formant-launch-shell">
        <form class="formant-manifest formant-launch-main" id="formant-manifest-form" lang="en">
          <section class="formant-form-section" aria-labelledby="launch-outcome"><div class="formant-section-number">01</div><div><h2 id="launch-outcome">Outcome</h2><p>Describe the finished state clearly enough that another person could decide whether it exists.</p></div></section>
          <div class="formant-field"><label for="objective">Objective</label><textarea id="objective" name="objective" required minlength="24" placeholder="Example: Deploy a monitored Solana analytics service with a public endpoint, reproducible build and passing integration tests."></textarea><small class="formant-field-hint">State the deliverable, target user and observable result.</small></div>
          <div class="formant-field-grid">
            <div class="formant-field"><label for="task-type">Task type</label><select id="task-type" name="task_type"><option value="product-build">Product build</option><option value="research">Research</option><option value="security-review">Security review</option><option value="data-pipeline">Data pipeline</option><option value="token-launch">Token launch</option><option value="custom">Custom</option></select></div>
            <div class="formant-field"><label for="delivery-target">Delivery target</label><input id="delivery-target" name="delivery_target" type="text" required placeholder="Repository, deployment, report or onchain artifact"></div>
          </div>

          <section class="formant-form-section" aria-labelledby="launch-capabilities"><div class="formant-section-number">02</div><div><h2 id="launch-capabilities">Capabilities</h2><p>Select the specialist roles the cluster must quote and compose.</p></div></section>
          <fieldset class="formant-field"><legend>Required capabilities</legend><div class="formant-options" id="capability-options">
            ${["Plan", "Research", "Data", "Build", "Design", "Audit", "Verify", "Deploy"].map((item) => `<label class="formant-option"><input type="checkbox" name="capabilities" value="${item.toLowerCase()}"${["Plan", "Build", "Verify"].includes(item) ? " checked" : ""}><span>${item}</span></label>`).join("")}
          </div></fieldset>
          <div class="formant-field"><label for="capability-notes">Capability constraints</label><textarea id="capability-notes" name="capability_notes" placeholder="Required stack, data source, model class, audit standard or delivery dependency"></textarea></div>

          <section class="formant-form-section" aria-labelledby="launch-economics"><div class="formant-section-number">03</div><div><h2 id="launch-economics">Budget and time</h2><p>Bound the cluster before it can request quotes or authorize purchases.</p></div></section>
          <div class="formant-field-grid formant-field-grid-three">
            <div class="formant-field"><label for="budget">Maximum budget in SOL</label><input id="budget" name="budget" type="number" min="0.01" step="0.01" required placeholder="1.00"></div>
            <div class="formant-field"><label for="per-action-max">Per-action maximum</label><input id="per-action-max" name="per_action_max" type="number" min="0.01" step="0.01" required placeholder="0.20"></div>
            <div class="formant-field"><label for="deadline">Deadline (UTC)</label><input id="deadline" name="deadline" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="YYYY-MM-DDTHH:MMZ" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}Z" aria-describedby="deadline-hint" required><small class="formant-field-hint" id="deadline-hint">Example: 2027-01-15T00:00Z</small></div>
          </div>

          <section class="formant-form-section" aria-labelledby="launch-policy"><div class="formant-section-number">04</div><div><h2 id="launch-policy">Authority and privacy</h2><p>Choose where the task may operate and how much context each participant receives.</p></div></section>
          <div class="formant-field-grid">
            <div class="formant-field"><label for="network">Network</label><select id="network" name="network"><option value="solana-devnet">Solana devnet</option><option value="solana-mainnet">Solana mainnet</option><option value="offchain">Offchain only</option></select></div>
            <div class="formant-field"><label for="privacy">Context policy</label><select id="privacy" name="privacy"><option value="compartmentalized">Compartmentalized by role</option><option value="shared">Shared within the cluster</option><option value="public">Public task</option></select></div>
            <div class="formant-field"><label for="deployment-mode">Deployment authority</label><select id="deployment-mode" name="deployment_mode"><option value="approval-required">Operator approval required</option><option value="scoped-adapter">Scoped deployment adapter</option><option value="artifact-only">Artifact delivery only</option></select></div>
            <div class="formant-field"><label for="refund-policy">Incomplete-task policy</label><select id="refund-policy" name="refund_policy"><option value="refund-uncommitted">Refund uncommitted budget</option><option value="review-open-commitments">Review open commitments</option><option value="extend-by-approval">Allow deadline extension by approval</option></select></div>
          </div>
          <div class="formant-field"><label for="program-allowlist">Allowed Solana programs</label><textarea id="program-allowlist" name="program_allowlist" placeholder="Optional. One program address per line. Leave empty until the execution programs are known."></textarea></div>

          <section class="formant-form-section" aria-labelledby="launch-proof"><div class="formant-section-number">05</div><div><h2 id="launch-proof">Verification and settlement</h2><p>Define success before the cluster starts producing work.</p></div></section>
          <div class="formant-field"><label for="verifier">Completion evidence</label><textarea id="verifier" name="verifier" required minlength="20" placeholder="Tests, deployment receipt, signed review, simulation result or another explicit acceptance condition"></textarea></div>
          <div class="formant-field"><label for="milestones">Milestones</label><textarea id="milestones" name="milestones" placeholder="One milestone per line. Example: Staging deployment passes integration tests"></textarea></div>
          <div class="formant-field-grid">
            <div class="formant-field"><label for="contribution-mode">Contributor allocation</label><select id="contribution-mode" name="contribution_mode"><option value="accepted-deliverables">Accepted deliverables</option><option value="milestone-weighted">Milestone weighted</option><option value="fixed-before-funding">Fixed before funding</option></select></div>
            <div class="formant-field"><label for="creator-fee-bps">Creator-fee allocation (basis points)</label><input id="creator-fee-bps" name="creator_fee_bps" type="number" min="0" max="10000" step="1" value="0"><small class="formant-field-hint">Optional. 100 basis points = 1%.</small></div>
          </div>
          <div class="formant-field"><label for="operator-wallet">Operator wallet</label><input id="operator-wallet" name="operator_wallet" type="text" autocomplete="off" spellcheck="false" placeholder="Optional Solana address for deployment attribution"></div>

          <div class="formant-launch-actions"><button class="formant-button" data-primary type="submit">Compile manifest</button><button class="formant-button" id="formant-publish-receipt" type="button">Publish launch receipt</button><button class="formant-button" id="formant-copy-manifest" type="button">Copy JSON</button><button class="formant-button" id="formant-reset-manifest" type="button">Reset</button><a class="formant-button" href="${base}/docs">Manifest reference</a></div>
          <p class="formant-form-status" role="status" aria-live="polite"></p>
        </form>
        <aside class="formant-launch-aside" aria-label="Task readiness">
          <div class="formant-readiness"><div><p class="formant-label">Manifest readiness</p><strong id="formant-readiness-value">0 / 6</strong></div><div class="formant-readiness-track" aria-hidden="true"><span id="formant-readiness-bar"></span></div></div>
          <dl class="formant-summary-list"><div><dt>Outcome</dt><dd id="summary-objective">Not defined</dd></div><div><dt>Capabilities</dt><dd id="summary-capabilities">3 selected</dd></div><div><dt>Budget</dt><dd id="summary-budget">Not bounded</dd></div><div><dt>Deadline</dt><dd id="summary-deadline">Not set</dd></div><div><dt>Policy</dt><dd id="summary-policy">Compartmentalized</dd></div><div><dt>Verification</dt><dd id="summary-verifier">Not defined</dd></div></dl>
          <p class="formant-local-note">Drafts stay in this browser. Compiling downloads a portable JSON manifest. Publishing creates a signed Memo receipt and uses only the standard Solana network fee; it does not escrow the task budget.</p>
          <details class="formant-manifest-preview"><summary>JSON preview</summary><pre><code id="formant-manifest-preview">Complete the required fields to build the preview.</code></pre></details>
          <section class="formant-launch-receipt" id="formant-launch-receipt" hidden aria-live="polite"><p class="formant-label">Launch receipt confirmed</p><dl><div><dt>Network</dt><dd id="receipt-network"></dd></div><div><dt>Manifest SHA-256</dt><dd><code id="receipt-hash"></code></dd></div><div><dt>Transaction</dt><dd><code id="receipt-signature"></code></dd></div></dl><a class="formant-button" id="receipt-explorer" target="_blank" rel="noreferrer">Open in Solana Explorer</a></section>
        </aside>
      </div>`,
  },
};

const pageCtas = {
  protocol: [["Launch a task", "/contact", true], ["Explore clusters", "/products/red"]],
  clusters: [["Launch a task", "/contact", true], ["Read the protocol", "/about"]],
  exchange: [["Launch a task", "/contact", true], ["Review wallet policy", "/about#wallet-policy"]],
  settlement: [["Launch a task", "/contact", true], ["Read the documentation", "/docs"]],
  deploy: [["Launch a task", "/contact", true], ["Read the documentation", "/docs"]],
  docs: [["Launch a task", "/contact", true], ["Protocol overview", "/about"]],
};

function renderPage(key) {
  const target = document.querySelector("page-content#content");
  const page = pages[key];
  if (!target || !page) return;
  const cta = pageCtas[key];
  target.innerHTML = `<main class="formant-content" data-pagefind-body>
    <header class="formant-page-hero"><p class="formant-kicker">${page.kicker}</p><h1>${page.title}</h1><p>${page.intro}</p><p class="formant-action-status" id="formant-action-status" aria-live="polite"></p></header>
    <article class="formant-section formant-prose${key === "launch" ? " formant-launch-prose" : ""}">${page.body}</article>
    ${cta ? `<section class="formant-section formant-cta"><p class="formant-actions">${cta.map(([label, href, primary]) => `<a class="formant-button"${primary ? " data-primary" : ""} href="${base}${href}">${label}</a>`).join("")}</p></section>` : ""}
  </main>`;
  if (key !== "launch") setupPageIndex(target);
  if (key === "launch") setupManifestCompiler();
}

function setupPageIndex(target) {
  const hero = target.querySelector(".formant-page-hero");
  const headings = [...target.querySelectorAll(".formant-prose h2")];
  if (!hero || headings.length < 2) return;
  const used = new Set();
  for (const heading of headings) {
    let id = heading.id || heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const stem = id;
    let suffix = 2;
    while (used.has(id)) id = `${stem}-${suffix++}`;
    heading.id = id;
    used.add(id);
  }
  const nav = document.createElement("nav");
  nav.className = "formant-index formant-page-index";
  nav.setAttribute("aria-label", "On this page");
  nav.innerHTML = headings.map((heading) => `<a href="#${heading.id}">${heading.textContent}</a>`).join("");
  hero.after(nav);
}

function setupManifestCompiler() {
  const form = document.querySelector("#formant-manifest-form");
  if (!form) return;
  const storageKey = "formant-task-draft-v1";
  const identityKey = "formant-task-identity-v1";
  const deadlineField = form.elements.namedItem("deadline");
  const budgetField = form.elements.namedItem("budget");
  const perActionField = form.elements.namedItem("per_action_max");
  const operatorField = form.elements.namedItem("operator_wallet");
  const allowlistField = form.elements.namedItem("program_allowlist");
  const status = form.querySelector(".formant-form-status");
  const copyButton = form.querySelector("#formant-copy-manifest");
  const publishButton = form.querySelector("#formant-publish-receipt");
  const resetButton = form.querySelector("#formant-reset-manifest");
  let taskIdentity;

  function renewTaskIdentity() {
    taskIdentity = {
      id: crypto.randomUUID?.() ?? `task-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
    };
    try { localStorage.setItem(identityKey, JSON.stringify(taskIdentity)); } catch {}
  }

  try { taskIdentity = JSON.parse(localStorage.getItem(identityKey) || "null"); } catch {}
  if (!taskIdentity?.id || !taskIdentity?.created_at) renewTaskIdentity();

  const lines = (value) => String(value ?? "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  const capabilities = () => [...form.querySelectorAll('input[name="capabilities"]:checked')].map((input) => input.value);
  const isAddress = (value) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
  const fieldValue = (name) => String(form.elements.namedItem(name)?.value ?? "").trim();

  function createManifest(final = false) {
    const deadline = new Date(fieldValue("deadline"));
    const manifest = {
      version: "formant.task.v1",
      id: taskIdentity.id,
      intent: {
        objective: fieldValue("objective"),
        type: fieldValue("task_type"),
        delivery_target: fieldValue("delivery_target"),
      },
      capabilities: {
        required: capabilities(),
        constraints: fieldValue("capability_notes") || null,
      },
      budget: {
        asset: "SOL",
        max: Number(fieldValue("budget")) || null,
        per_action_max: Number(fieldValue("per_action_max")) || null,
      },
      deadline: Number.isNaN(deadline.getTime()) ? null : deadline.toISOString(),
      network: fieldValue("network"),
      context_policy: fieldValue("privacy"),
      wallet_policy: {
        program_allowlist: lines(fieldValue("program_allowlist")),
        deployment_authority: fieldValue("deployment_mode"),
        incomplete_task: fieldValue("refund_policy"),
      },
      verification: {
        description: fieldValue("verifier"),
        milestones: lines(fieldValue("milestones")),
      },
      settlement: {
        contributor_allocation: fieldValue("contribution_mode"),
        creator_fee_bps: Number(fieldValue("creator_fee_bps")) || 0,
        operator_wallet: fieldValue("operator_wallet") || null,
      },
      state: "draft",
      created_at: taskIdentity.created_at,
    };
    return manifest;
  }

  function validatePolicy() {
    deadlineField.setCustomValidity("");
    budgetField.setCustomValidity("");
    perActionField.setCustomValidity("");
    operatorField.setCustomValidity("");
    allowlistField.setCustomValidity("");

    const deadline = new Date(fieldValue("deadline"));
    if (fieldValue("deadline") && (Number.isNaN(deadline.getTime()) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(fieldValue("deadline")))) {
      deadlineField.setCustomValidity("Enter a valid UTC deadline in YYYY-MM-DDTHH:MMZ format.");
    } else if (!Number.isNaN(deadline.getTime()) && deadline <= new Date()) {
      deadlineField.setCustomValidity("Choose a deadline in the future.");
    }
    const budget = Number(fieldValue("budget"));
    const perAction = Number(fieldValue("per_action_max"));
    if (budget > 0 && perAction > budget) perActionField.setCustomValidity("The per-action maximum cannot exceed the total budget.");
    if (fieldValue("operator_wallet") && !isAddress(fieldValue("operator_wallet"))) operatorField.setCustomValidity("Enter a valid Solana address or leave this field empty.");
    const invalidProgram = lines(fieldValue("program_allowlist")).find((address) => !isAddress(address));
    if (invalidProgram) allowlistField.setCustomValidity(`Invalid Solana program address: ${invalidProgram}`);
  }

  function saveDraft() {
    const values = {};
    for (const [key, value] of new FormData(form).entries()) {
      if (key === "capabilities") (values.capabilities ??= []).push(value);
      else values[key] = value;
    }
    try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch {}
  }

  function restoreDraft() {
    let draft;
    try { draft = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch { return; }
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      if (name === "capabilities") {
        form.querySelectorAll('input[name="capabilities"]').forEach((input) => { input.checked = value.includes(input.value); });
        continue;
      }
      const field = form.elements.namedItem(name);
      if (field && typeof value === "string") field.value = value;
    }
  }

  function updateWorkspace({ save = true } = {}) {
    validatePolicy();
    const objective = fieldValue("objective");
    const target = fieldValue("delivery_target");
    const selected = capabilities();
    const budget = Number(fieldValue("budget"));
    const perAction = Number(fieldValue("per_action_max"));
    const deadline = new Date(fieldValue("deadline"));
    const verifier = fieldValue("verifier");
    const checks = [
      objective.length >= 24 && target.length > 0,
      selected.length > 0,
      budget > 0 && perAction > 0 && perAction <= budget,
      !Number.isNaN(deadline.getTime()) && deadline > new Date() && !deadlineField.validationMessage,
      verifier.length >= 20,
      !operatorField.validationMessage && !allowlistField.validationMessage,
    ];
    const ready = checks.filter(Boolean).length;
    document.querySelector("#formant-readiness-value").textContent = `${ready} / ${checks.length}`;
    document.querySelector("#formant-readiness-bar").style.width = `${ready / checks.length * 100}%`;
    document.querySelector("#summary-objective").textContent = objective ? (objective.length > 72 ? `${objective.slice(0, 69)}…` : objective) : "Not defined";
    document.querySelector("#summary-capabilities").textContent = selected.length ? `${selected.length} selected · ${selected.join(", ")}` : "None selected";
    document.querySelector("#summary-budget").textContent = budget > 0 ? `${budget} SOL total · ${perAction || 0} SOL per action` : "Not bounded";
    document.querySelector("#summary-deadline").textContent = Number.isNaN(deadline.getTime()) ? "Not set" : deadline.toISOString().replace(":00.000Z", "Z").replace("T", " · ");
    document.querySelector("#summary-policy").textContent = `${fieldValue("network").replaceAll("-", " ")} · ${fieldValue("privacy")}`;
    document.querySelector("#summary-verifier").textContent = verifier ? (verifier.length > 72 ? `${verifier.slice(0, 69)}…` : verifier) : "Not defined";
    document.querySelector("#formant-manifest-preview").textContent = JSON.stringify(createManifest(false), null, 2);
    copyButton.disabled = ready < checks.length;
    publishButton.disabled = ready < checks.length || fieldValue("network") === "offchain";
    if (save) saveDraft();
  }

  restoreDraft();
  form.addEventListener("input", () => updateWorkspace());
  form.addEventListener("change", () => updateWorkspace());
  deadlineField?.addEventListener("input", () => deadlineField.setCustomValidity(""));
  copyButton?.addEventListener("click", async () => {
    updateWorkspace();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try {
      await navigator.clipboard.writeText(`${JSON.stringify(createManifest(false), null, 2)}\n`);
      status.textContent = "Manifest JSON copied to the clipboard.";
    } catch {
      status.textContent = "Clipboard access was unavailable. Open the JSON preview and copy it manually.";
    }
  });
  publishButton?.addEventListener("click", async () => {
    updateWorkspace();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const network = fieldValue("network");
    if (network === "offchain") { status.textContent = "Choose Solana devnet or mainnet to publish an onchain receipt."; return; }
    if (network === "solana-mainnet" && !window.confirm("Publish this manifest receipt to Solana mainnet? Your wallet will pay the network fee.")) return;
    const sdk = window.solanaWeb3;
    if (!sdk) { status.textContent = "The Solana transaction library did not load. Reload the page and try again."; return; }

    if (!connectedWallet) {
      const wallets = detectSolanaWallets();
      if (!wallets.length) { openWalletDialog([]); status.textContent = "Install or enable a Solana wallet before publishing."; return; }
      if (wallets.length > 1) { openWalletDialog(wallets); status.textContent = "Choose a wallet, then click Publish launch receipt again."; return; }
      await connectSolanaWallet(wallets[0], document.querySelector("#formant-wallet-connect"));
    }
    if (!connectedWallet) return;

    const originalLabel = publishButton.textContent;
    publishButton.disabled = true;
    publishButton.textContent = "Preparing transaction…";
    status.textContent = "Hashing the manifest and requesting a recent blockhash…";
    try {
      const manifest = createManifest(false);
      const manifestJson = JSON.stringify(manifest);
      const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(manifestJson));
      const manifestHash = [...new Uint8Array(hashBuffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const endpoint = FORMANT_CONFIG.rpc[network];
      const connection = new sdk.Connection(endpoint, "confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const signer = new sdk.PublicKey(connectedWallet.address);
      const memo = `FORMANT_TASK_V1|id=${manifest.id}|sha256=${manifestHash}|network=${network}`;
      const instruction = new sdk.TransactionInstruction({
        programId: new sdk.PublicKey(FORMANT_CONFIG.memoProgram),
        keys: [{ pubkey: signer, isSigner: true, isWritable: false }],
        data: new TextEncoder().encode(memo),
      });
      const transaction = new sdk.Transaction({ feePayer: signer, recentBlockhash: blockhash }).add(instruction);
      publishButton.textContent = "Approve in wallet…";
      status.textContent = "Review and approve the launch receipt in your wallet. This transaction contains no transfer instruction.";
      let signature;
      if (typeof connectedWallet.provider.signAndSendTransaction === "function") {
        const result = await connectedWallet.provider.signAndSendTransaction(transaction, { preflightCommitment: "confirmed" });
        signature = typeof result === "string" ? result : result?.signature;
      } else if (typeof connectedWallet.provider.signTransaction === "function") {
        const signed = await connectedWallet.provider.signTransaction(transaction);
        signature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false, preflightCommitment: "confirmed" });
      } else {
        throw new Error("This wallet cannot sign Solana transactions.");
      }
      if (!signature) throw new Error("The wallet did not return a transaction signature.");
      publishButton.textContent = "Confirming…";
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
      const clusterQuery = network === "solana-devnet" ? "?cluster=devnet" : "";
      const receipt = { task_id: manifest.id, manifest_sha256: manifestHash, network, wallet: connectedWallet.address, signature, confirmed_at: new Date().toISOString() };
      try {
        const prior = JSON.parse(localStorage.getItem("formant-launch-receipts-v1") || "[]");
        localStorage.setItem("formant-launch-receipts-v1", JSON.stringify([receipt, ...prior].slice(0, 20)));
      } catch {}
      document.querySelector("#receipt-network").textContent = network.replaceAll("-", " ");
      document.querySelector("#receipt-hash").textContent = manifestHash;
      document.querySelector("#receipt-signature").textContent = signature;
      const explorer = document.querySelector("#receipt-explorer");
      explorer.href = `https://explorer.solana.com/tx/${signature}${clusterQuery}`;
      document.querySelector("#formant-launch-receipt").hidden = false;
      status.textContent = "Launch receipt confirmed on Solana. The manifest hash and signer are now independently verifiable.";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      status.textContent = /403|429|fetch/i.test(message) ? "The public Solana RPC is unavailable or rate-limited. Wait briefly and try again." : message;
    } finally {
      publishButton.textContent = originalLabel;
      updateWorkspace({ save: false });
    }
  });
  resetButton?.addEventListener("click", () => {
    if (!window.confirm("Clear this local task draft?")) return;
    form.reset();
    try { localStorage.removeItem(storageKey); } catch {}
    renewTaskIdentity();
    document.querySelector("#formant-launch-receipt").hidden = true;
    status.textContent = "Local draft cleared.";
    updateWorkspace({ save: false });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateWorkspace();
    if (!capabilities().length) { status.textContent = "Select at least one required capability."; form.querySelector("#capability-options input")?.focus(); return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const manifest = createManifest(true);
    const blob = new Blob([`${JSON.stringify(manifest, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `formant-task-${manifest.id.slice(0, 8)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = "Manifest compiled and downloaded. Review it before funding the task.";
  });
  updateWorkspace({ save: false });
}

let connectedWallet = null;

function setupPublicActions() {
  const walletButton = document.querySelector("#formant-wallet-connect");
  const xLink = document.querySelector("#formant-x-link");
  const caValue = document.querySelector("#formant-ca-value");
  const caCopy = document.querySelector("#formant-ca-copy");

  if (caValue) caValue.textContent = FORMANT_CONFIG.contractAddress;
  if (caCopy && FORMANT_CONFIG.contractAddress !== "TBA") {
    caCopy.disabled = false;
    caCopy.addEventListener("click", async () => {
      await navigator.clipboard.writeText(FORMANT_CONFIG.contractAddress);
      caCopy.textContent = "Copied";
      setTimeout(() => { caCopy.textContent = "Copy"; }, 1400);
    });
  }

  if (xLink) {
    if (FORMANT_CONFIG.xUrl) {
      xLink.href = FORMANT_CONFIG.xUrl;
      xLink.target = "_blank";
      xLink.rel = "noreferrer";
      xLink.title = "Formant on X";
    } else {
      xLink.setAttribute("aria-disabled", "true");
      xLink.addEventListener("click", (event) => {
        event.preventDefault();
        setActionStatus("Official X link is TBA.");
      });
    }
  }

  walletButton?.addEventListener("click", async () => {
    if (connectedWallet) {
      try { await connectedWallet.provider.disconnect?.(); } catch {}
      connectedWallet = null;
      walletButton.textContent = "Connect wallet";
      setActionStatus("Wallet disconnected.");
      return;
    }

    const wallets = detectSolanaWallets();
    if (!wallets.length) {
      openWalletDialog([]);
      return;
    }
    if (wallets.length === 1) {
      await connectSolanaWallet(wallets[0], walletButton);
      return;
    }
    openWalletDialog(wallets, walletButton);
  });
}

function detectSolanaWallets() {
  const candidates = [
    ["Phantom", window.phantom?.solana],
    ["Solflare", window.solflare],
    ["Backpack", window.backpack?.solana],
    ["Solana wallet", window.solana],
  ];
  const seen = new Set();
  return candidates.flatMap(([name, provider]) => {
    if (!provider || typeof provider.connect !== "function" || seen.has(provider)) return [];
    seen.add(provider);
    return [{ name, provider }];
  });
}

async function connectSolanaWallet(wallet, button) {
  try {
    setActionStatus(`Connecting ${wallet.name}…`);
    const result = await wallet.provider.connect();
    const publicKey = result?.publicKey ?? wallet.provider.publicKey;
    if (!publicKey) throw new Error("The wallet did not return an address.");
    const address = publicKey.toString();
    connectedWallet = { ...wallet, address };
    button.textContent = `${address.slice(0, 4)}…${address.slice(-4)}`;
    setActionStatus(`${wallet.name} connected. Click the address to disconnect.`);
    document.querySelector("#formant-wallet-dialog")?.close();
    return true;
  } catch (error) {
    setActionStatus(error instanceof Error ? error.message : "Wallet connection was cancelled.");
    return false;
  }
}

function openWalletDialog(wallets, button = document.querySelector("#formant-wallet-connect")) {
  let dialog = document.querySelector("#formant-wallet-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "formant-wallet-dialog";
    dialog.className = "formant-wallet-dialog";
    document.body.append(dialog);
  }

  dialog.innerHTML = `<div class="formant-wallet-head"><p>Connect a Solana wallet</p><button type="button" data-wallet-close aria-label="Close wallet dialog">Close</button></div>
    ${wallets.length ? `<div class="formant-wallet-list">${wallets.map((wallet, index) => `<button type="button" data-wallet-index="${index}"><span>${wallet.name}</span><span>Detected</span></button>`).join("")}</div>` : `<p class="formant-wallet-empty">No compatible Solana wallet was detected in this browser. Install or enable Phantom, Solflare or Backpack, then reload the page.</p>`}`;
  dialog.querySelector("[data-wallet-close]")?.addEventListener("click", () => dialog.close());
  dialog.querySelectorAll("[data-wallet-index]").forEach((option) => {
    option.addEventListener("click", () => connectSolanaWallet(wallets[Number(option.dataset.walletIndex)], button));
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }, { once: true });
  dialog.showModal();
}

function setActionStatus(message) {
  const status = document.querySelector("#formant-action-status");
  if (status) status.textContent = message;
}

boot();
