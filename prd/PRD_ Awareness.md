This Markdown document is optimized for **Cursor** (or other LLM-based IDEs). It provides the necessary context, user stories, and feature requirements for the **"Awareness"** scope of the Hummingbird Extension, based on your discovery documents.

You can save this as hummingbird-prd-awareness.md in your project root.

# ---

**PRD: Hummingbird Extension for Podman Desktop \- Scope 1: Awareness**

## **1\. Project Overview**

**Project Name:** Hummingbird Extension

**Context:** Podman Desktop

**Mission:** Provide a catalog of minimal, hardened, "distroless" container images to reduce security noise (CVEs) and improve developer velocity.

### **The Problem**

Developers are overwhelmed by "security noise" (40,000+ annual CVEs). Traditional images include unnecessary components (shells, package managers) that increase the attack surface and require hours of manual vetting.

### **The Solution**

The Hummingbird Extension serves as the discovery and adoption layer within Podman Desktop, guiding users from "bloated" images to "Zero-CVE" hardened alternatives.

## ---

**2\. Target Audience**

- **Primary:** Developers looking for secure, production-ready container runtimes.
- **Secondary:** IT Administrators enforcing the use of curated, trusted image lists.

## ---

**3\. Scope: Phase 1 \- Awareness (Discovery)**

The goal of this phase is to ensure users know the extension exists, understand the "Zero-CVE" value proposition, and can identify Hummingbird images during their normal workflow.

### **User Stories**

| ID       | User Story                                                                                                                                         |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US.1** | As a Podman Desktop user, I can learn about the Hummingbird Extension so I know it's an available tool for security.                               |
| **US.2** | As a user, I can understand the specific benefits (size, security, performance) of Hummingbird images compared to standard ones.                   |
| **US.3** | As a user searching for an image (e.g., "Node" or "Redis"), I can easily identify which results are "Hardened" Hummingbird images.                 |
| **US.4** | As a user, I can see visual indicators (criteria) for images that are sub-optimal (high CVE count, unsigned, large size) to prompt me to optimize. |

## ---

**4\. Functional Requirements**

### **4.1. Pre-Installation Awareness (Marketing & Education)**

- **Learning Center Integration:** \* Display a "Hummingbird" featured article/blog post within the Podman Desktop Learning Center.
  - Content should focus on: "Ship Clean, Ship Fast: Intro to Zero-CVE Images."
- **Image Pull Screen CTA:** \* Add a subtle "Looking for a hardened version?" link or banner in the standard **Pull Image** dialog that directs users to the Hummingbird extension installation page.
- **Guided Walkthroughs:** \* Trigger an Amplitude-driven walkthrough for first-time users or users pulling "bloated" base images (e.g., standard Ubuntu/Alpine) to introduce the "Optimize" concept.

### **4.2. In-App Discovery & Visual Cues**

- **The "Optimize" Tab Placeholder:**
  - In the **Image Details** and **Container Details** views, add a new tab labeled **"Optimize"**.
  - **Visual Spec:** Use a specific icon (e.g., a hummingbird or a spark icon) and a distinct color/badge to indicate it is a new/premium feature.
  - **Empty State:** If the extension is not installed, the tab should show a preview of what "Optimization" looks like (CVE comparison) with an "Install Extension" button.
- **Search Result Highlighting:**
  - Modify search result items to include a **"Hardened" label** for Hummingbird images.
  - Display key metadata in search results: **CVE Count (0)** and **Image Size**.
- **Hardened Filter:**
  - Add a toggle or filter option in the Search UI: \[ \] Show only Hardened images.

## ---

**5\. Technical Context for Cursor**

- **Platform:** Podman Desktop Extension API.
- **Image Registry:** `quay.io/hummingbird/<image-name>` (e.g., `quay.io/hummingbird/nodejs`).
- **Telemetry:** Integration with Amplitude for tracking "Awareness" KPIs (clicks on Learning Center, "Optimize" tab impressions).
- **Comparison Data:** The UI needs to handle data points comparing "Current Image" vs. "Hummingbird Alternative" (Size, CVEs, Signature status).

### **5.1. Architecture**

- **Hybrid Implementation:** Core UI placeholders in Podman Desktop + Hummingbird extension for data/logic.
- **Provider Pattern:** Extension registers as an "Image Optimizer Provider" (new provider type in Podman Desktop API).
- **Empty State Handling:** Core UI shows installation prompt when extension not installed.
- **Extension Location:** `extensions/hummingbird/` within the Podman Desktop repository.

### **5.2. Image Catalog**

- **Registry:** `quay.io/hummingbird/<image-name>`
- **Initial Catalog Images:**
  - Language runtimes: `nodejs`, `python`, `go`, `java`
  - Databases: `redis`, `postgres`, `mongodb`
- **Catalog Discovery:** Query Quay.io registry API for available tags.
- **Image Mapping:** Static JSON mapping standard images to Hummingbird equivalents.

### **5.3. Data Model**

```typescript
interface HummingbirdCatalogEntry {
  standardImage: string; // e.g., "node", "redis"
  hummingbirdImage: string; // e.g., "quay.io/hummingbird/nodejs"
  tags: string[]; // Available tags
  metadata: {
    cveCount: number; // Mock: 0 for all Hummingbird images
    size: string; // e.g., "45MB"
    isSigned: boolean; // true for all Hummingbird images
  };
}

interface ImageOptimizerProvider {
  getAlternative(imageName: string): Promise<OptimizeResult | undefined>;
  getCatalog(): Promise<CatalogEntry[]>;
}

interface OptimizeResult {
  currentImage: ImageMetrics;
  alternative: ImageMetrics & { imageName: string };
}

interface ImageMetrics {
  size: string;
  cveCount: number;
  isSigned: boolean;
}
```

### **5.4. UI Placement**

- **Optimize Tab:** Image Details view only (Container Details deferred to Phase 2).
- **Pull Image CTA:** Always visible in Pull Image dialog, links to Extensions Catalog.
- **Search Filter:** Client-side filtering of results based on known Hummingbird catalog.
- **Learning Center:** Placeholder guide entry with URL `https://podman-desktop.io/docs/hummingbird`.
- **Visual Assets:** Use existing Podman Desktop icons/patterns (shield icon for security).

### **5.5. Deferred Features (Phase 2)**

- Guided walkthroughs for first-time users.
- Container Details Optimize tab.
- Real CVE scanning integration (currently using mock/static data).
- Dynamic catalog updates from remote API.

### **5.6. Files to Modify/Create**

| File                                                          | Action                           |
| :------------------------------------------------------------ | :------------------------------- |
| `packages/api/src/image-optimizer-info.ts`                    | Create - new API types           |
| `packages/main/src/plugin/image-optimizer.ts`                 | Create - provider registry       |
| `packages/main/src/plugin/learning-center/guides.json`        | Modify - add guide               |
| `packages/renderer/src/lib/image/ImageDetails.svelte`         | Modify - add tab                 |
| `packages/renderer/src/lib/image/ImageDetailsOptimize.svelte` | Create - tab content             |
| `packages/renderer/src/lib/image/PullImage.svelte`            | Modify - add CTA                 |
| `extensions/hummingbird/`                                     | Create - new extension directory |

## ---

**6\. Design & UX Guidelines**

- **Tone:** Professional, secure, and high-performance.
- **Visual Identity:** \* Use a "Zero-CVE" badge.
  - Highlight differences using Green (Secure/Hummingbird) vs. Amber/Red (Vulnerable/Standard).
- **Frictionless:** Discovery should happen _during_ the developer's existing workflow (searching/pulling), not as a separate siloed experience.

## ---

**7\. Success Metrics (KPIs)**

- **Conversion Rate:** % of users who click the "Optimize" tab placeholder.
- **Discovery:** % of users who find Hummingbird images via search filters.
- **Education:** Number of views on the Learning Center blog post.
