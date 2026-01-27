# Hummingbird Awareness Features - Requirements Document

This document describes the features implemented for the "Awareness" phase of the Hummingbird Extension integration in Podman Desktop. These features are designed to promote image security and optimization to users before they install the full Hummingbird extension.

---

## 1. Learning Center Integration

### 1.1 Hummingbird Guide Entry

**Description:**  
Add a new guide entry in the Learning Center to educate users about distroless and hardened container images.

**Requirements:**

- Add a new guide entry in the Learning Center guides list
- Position: 3rd in the list order
- Title: "Understanding Distroless and Hardened Images"
- Description: "Learn how to use lightweight, secure Hummingbird images to reduce CVEs and image size."
- Categories: `["security", "hummingbird"]`
- URL: Link to Hummingbird documentation (https://developers.redhat.com/hummingbird)
- Icon: Provide a placeholder icon (96x96 PNG, shield/security themed)

**Acceptance Criteria:**

- [ ] Guide appears in Learning Center at position 3
- [ ] Clicking "Get Started" opens the external Hummingbird documentation
- [ ] Icon is visible and represents security concept
- [ ] Telemetry tracks when users open this guide

**Files Modified:**

- `packages/main/src/plugin/learning-center/guides.json`

---

## 2. Explore Features Integration

### 2.1 Image Security Optimization Feature Card

**Description:**  
Add a feature card in the "Explore Features" section on the dashboard to promote image security optimization.

**Requirements:**

- Add new feature entry in explore-features.json
- ID: `optimize-images-security`
- Title: "Optimize Images for Security"
- Description: Highlight Hummingbird hardened images with zero CVEs and reduced attack surface
- Button: "Explore Images" linking to `/images`
- Learn More: Link to Hummingbird documentation
- Image: Placeholder SVG showing a container with a lock/security concept

**Acceptance Criteria:**

- [ ] Feature card appears in Explore Features section
- [ ] Placeholder image displays correctly (container + lock visual)
- [ ] "Explore Images" button navigates to Images view
- [ ] "Learn more" link opens external documentation
- [ ] Feature can be dismissed by user
- [ ] Telemetry tracks user interactions

**Files Modified:**

- `packages/main/src/plugin/explore-features/explore-features.json`

---

## 3. Pull Image Security CTA

### 3.1 Security Insights CTA Component

**Description:**  
Add a call-to-action component in the Pull Image dialog to promote security extension installation.

**Requirements:**

- Create `HummingbirdCTA.svelte` component
- Display message: "Display security insights."
- Clickable link text: "Add Image security recommendations extensions."
- Clicking redirects to Extensions Catalog filtered by "Hummingbird"
- Include security shield icon

**Acceptance Criteria:**

- [ ] CTA appears in Pull Image screen
- [ ] Clicking the link navigates to `/extensions?screen=catalog&searchTerm=Hummingbird`
- [ ] Telemetry tracks CTA clicks with image name context
- [ ] Styling matches Podman Desktop design system

**Files Modified:**

- `packages/renderer/src/lib/image/HummingbirdCTA.svelte` (new)
- `packages/renderer/src/lib/image/PullImage.svelte` (integration)

---

## 4. Image Details - Image Optimizations Tab

### 4.1 New Tab in Image Details View

**Description:**  
Add a new "Image Optimizations" tab in the Image Details view that shows optimization recommendations or prompts extension installation.

**Requirements:**

#### Tab Configuration:

- Tab Name: "Image Optimizations"
- Route: `/optimize`
- Always visible (even when no optimizer extension is installed)

#### Empty State (No Extension Installed):

- Title: "Install an Image Optimizer Extension"
- Custom SVG placeholder icon showing:
  - Container box with layer bars
  - Security shield with checkmark (green)
  - Zero badge (green circle with "0")
- Description highlighting:
  - Zero-CVE alternatives
  - Distroless images
  - Reduced attack surface
  - Improved security posture
- Button: "Install Extension"
- Button action: Navigate to Extensions Catalog filtered by "Hummingbird"

#### Active State (Extension Installed):

- Show loading state while checking for alternatives
- Display comparison card with:
  - Current image details (name, size, CVE count)
  - Arrow indicating transformation
  - Alternative image details (registry, size, CVE count, signed status)
  - Savings summary (% fewer CVEs)
- Action button: "Pull Hummingbird Image"
- Learn more link to documentation

#### No Alternative Available State:

- Title: "No Optimized Alternative"
- Message explaining no alternative exists for this image
- Learn more button

**Acceptance Criteria:**

- [ ] Tab appears in Image Details navigation
- [ ] Empty state displays when no optimizer provider is registered
- [ ] SVG placeholder is visible and properly styled
- [ ] "Install Extension" button navigates to catalog with filter
- [ ] When extension is installed, optimization data loads and displays
- [ ] Comparison UI shows current vs alternative image
- [ ] Telemetry tracks tab views and user actions

**Files Modified:**

- `packages/renderer/src/lib/image/ImageDetailsOptimize.svelte` (new)
- `packages/renderer/src/lib/image/ImageDetails.svelte` (integration)

---

## 5. Image Optimizer Provider API

### 5.1 New Extension Point for Image Optimization

**Description:**  
Create a new extension API that allows extensions to provide image optimization recommendations.

**Requirements:**

#### API Types (`image-optimizer-info.ts`):

```typescript
interface ImageOptimizerInfo {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface ImageOptimizerProvider {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  getAlternative(image: ImageInfo, token?: CancellationToken): Promise<OptimizeResult | undefined>;
  getCatalog(token?: CancellationToken): Promise<HummingbirdCatalogEntry[]>;
}

interface OptimizeResult {
  currentImage: {
    name: string;
    size: string;
    cveCount: number;
  };
  alternative: {
    registry: string;
    size: string;
    cveCount: number;
    isSigned: boolean;
  };
}

interface HummingbirdCatalogEntry {
  original: string;
  hardened: string;
  description?: string;
  categories?: string[];
}
```

#### Backend Implementation:

- `ImageOptimizerImpl` class to manage provider registration
- EventEmitter for provider updates
- Methods: `registerImageOptimizerProvider`, `getAlternative`, `getCatalog`, `getImageOptimizerProviders`

#### IPC Handlers:

- `image-optimizer:getProviders` - List registered providers
- `image-optimizer:getAlternative` - Get optimization recommendation for an image
- `image-optimizer:getCatalog` - Get full catalog of available alternatives

#### Renderer Store:

- Svelte store for `imageOptimizerProviders`
- Svelte store for `imageOptimizerCatalog`
- Event-based updates when providers change

**Acceptance Criteria:**

- [ ] Extensions can register as image optimizer providers
- [ ] Provider registration emits update events
- [ ] Frontend can query registered providers
- [ ] Frontend can request optimization recommendations
- [ ] Proper cleanup on provider disposal

**Files Modified:**

- `packages/api/src/image-optimizer-info.ts` (new)
- `packages/main/src/plugin/image-optimizer.ts` (new)
- `packages/main/src/plugin/index.ts` (IPC handlers)
- `packages/preload/src/index.ts` (context bridge)
- `packages/renderer/src/stores/image-optimizer-providers.ts` (new)

---

## 6. Extensions Catalog Entry

### 6.1 Hummingbird Extension in Catalog

**Description:**  
Add the Hummingbird extension to the extensions catalog so users can discover and install it.

**Requirements:**

- Add entry to `extensions-catalog.json`
- Extension ID: `hummingbird.hummingbird-optimizer`
- Display Name: "Hummingbird Optimizer"
- Publisher: "Hummingbird"
- Categories: `["Security", "Images"]`
- Keywords: `["hummingbird", "security", "cve", "hardened", "distroless", "optimization"]`
- Short Description: Highlight zero-CVE and distroless alternatives
- Icon: Hummingbird/security themed

**Acceptance Criteria:**

- [ ] Extension appears in catalog when searching "Hummingbird"
- [ ] Extension details page shows correct information
- [ ] Install button initiates installation flow

**Files Modified:**

- `packages/main/src/plugin/extension/catalog/extensions-catalog.json`

---

## 7. Hummingbird Extension (Reference Implementation)

### 7.1 Extension Structure

**Description:**  
Create a reference Hummingbird extension that implements the Image Optimizer Provider API.

**Requirements:**

#### Extension Manifest (`package.json`):

- Name: `hummingbird`
- Display Name: "Hummingbird Optimizer"
- Publisher: "hummingbird"
- Version: "0.0.1"
- Categories: `["Security", "Images"]`

#### Catalog (`catalog.ts`):

- Maintain mapping of standard images to hardened alternatives
- Include metadata: CVE counts, sizes, signed status
- Support lookup by image name

#### Provider Implementation (`extension.ts`):

- Register as ImageOptimizerProvider on activation
- Implement `getAlternative()` to lookup catalog
- Implement `getCatalog()` to return full catalog
- Proper cleanup on deactivation

#### Sample Catalog Entries:

| Original | Hardened                   | Original CVEs | Hardened CVEs |
| -------- | -------------------------- | ------------- | ------------- |
| node     | quay.io/hummingbird/nodejs | 45            | 0             |
| python   | quay.io/hummingbird/python | 38            | 0             |
| nginx    | quay.io/hummingbird/nginx  | 22            | 0             |

**Acceptance Criteria:**

- [ ] Extension activates without errors
- [ ] Provider is registered on activation
- [ ] Catalog contains sample image mappings
- [ ] getAlternative returns correct data for known images
- [ ] getCatalog returns full catalog
- [ ] Provider is unregistered on deactivation

**Files Created:**

- `extensions/hummingbird/package.json`
- `extensions/hummingbird/tsconfig.json`
- `extensions/hummingbird/src/extension.ts`
- `extensions/hummingbird/src/catalog.ts`

---

## 8. Telemetry Requirements

### 8.1 Awareness Phase Tracking

**Description:**  
Track user interactions with Awareness features to measure effectiveness.

**Events to Track:**

| Event Name                         | Trigger                            | Properties                          |
| ---------------------------------- | ---------------------------------- | ----------------------------------- |
| `openLearningCenterGuide`          | User clicks Learning Center guide  | `guideId`                           |
| `exploreFeature.clicked`           | User clicks Explore Feature card   | `feature`                           |
| `securityInsights.pullCTA.clicked` | User clicks Pull Image CTA         | `imageName`                         |
| `imageOptimize.view`               | User views Image Optimizations tab | `hasAlternative`                    |
| `imageOptimize.installExtension`   | User clicks Install Extension      | -                                   |
| `imageOptimize.pullAlternative`    | User pulls alternative image       | `originalImage`, `alternativeImage` |
| `imageOptimize.learnMore`          | User clicks learn more link        | -                                   |

**Acceptance Criteria:**

- [ ] All events fire correctly with proper properties
- [ ] Events integrate with existing telemetry infrastructure
- [ ] No PII is included in event properties

---

## Technical Notes

### Dependencies

- Svelte 5 with runes (`$state`, `$derived`, `$props`)
- TailwindCSS for styling
- tinro for routing
- FontAwesome for icons
- Existing Podman Desktop UI components

### Design Guidelines

- Follow Podman Desktop design system
- Use CSS variables for theming (`--pd-content-*`)
- Green color (#22c55e) for positive/security indicators
- Red color for CVE/vulnerability indicators

### Testing Requirements

- Unit tests for new stores
- Component tests for new Svelte components
- Integration tests for IPC handlers
- E2E tests for critical user flows

---

## Implementation Priority

1. **Phase 1 - Core Infrastructure**
   - Image Optimizer Provider API
   - Svelte stores
   - IPC handlers

2. **Phase 2 - UI Components**
   - Image Optimizations tab (placeholder state)
   - Pull Image CTA

3. **Phase 3 - Discovery**
   - Learning Center entry
   - Explore Features entry
   - Extensions Catalog entry

4. **Phase 4 - Extension**
   - Hummingbird extension implementation
   - Full optimization flow

---

_Document generated for Hummingbird Awareness implementation in Podman Desktop_
