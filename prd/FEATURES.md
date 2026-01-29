# Hummingbird Awareness Features - Requirements Document

This document describes the features implemented for the "Awareness" phase of the Hummingbird Extension integration in Podman Desktop. These features are designed to promote image security and optimization to users before they install the full Hummingbird extension.

---

## 1. Learning Center Integration

### 1.1 Hummingbird Guide Entry

**Description:**  
Add a new guide entry in the Learning Center to educate users about distroless and hardened container images.

**Requirements:**

- Add a new guide entry in the Learning Center guides list
- Position: 3rd in the list order (or ideally having a rotation)
- Title: "Understanding Distroless and Hardened Images"
- Description: "Learn how to use lightweight, secure Hummingbird images to reduce CVEs and image size."
- Categories: `["security", "hummingbird"]`
- URL: Link to Hummingbird blog post TBD
- Icon: Provide a placeholder icon (96x96 PNG, shield/security themed)

**Acceptance Criteria:**

- [ ] Guide appears in Learning Center
- [ ] Clicking "Get Started" opens the external Hummingbird documentation
- [ ] Icon is visible and represents security concept
- [ ] Telemetry tracks when users open this guide

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
- Learn More: Link to Hummingbird extension documentation
- Image: Placeholder SVG showing a container with a lock/security concept

**Acceptance Criteria:**

- [ ] Feature card appears in Explore Features section
- [ ] Placeholder image displays correctly (container + lock visual)
- [ ] "Explore Images" button navigates to Images view
- [ ] "Learn more" link opens external documentation
- [ ] Telemetry tracks user interactions

---

## 3. Pull Image Security CTA

### 3.1 Security Insights CTA Component

**Description:**  
Add a call-to-action component in the Pull Image dialog to promote security extension installation.

**Requirements:**

- Create `HummingbirdCTA.svelte` component
- Display message: "Discover and adopt hardened, Zero-CVE container images."
- Clickable link text: "Install Image Optimizer extensions."
- Clicking redirects to Extensions Catalog filtered by "Hummingbird"
- Include security shield icon

**Acceptance Criteria:**

- [ ] CTA appears in Pull Image screen
- [ ] Clicking the link navigates to `/extensions?screen=catalog&searchTerm=Hummingbird`
- [ ] Telemetry tracks CTA clicks with image name context
- [ ] Styling matches Podman Desktop design system

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
  - Proposed Text: "Get recommendations for optimized container images that are more secure and efficient. Image optimizer extensions analyze your images and suggest zero-CVE and distroless alternatives that reduce your attack surface, minimize image size, and improve container security posture."
- Button: "Install Extension"
- Button action: Navigate to Extensions Catalog filtered by "type: ImageOptimizer"

#### Active State (Extension Installed):

To be defined in next iteration.

#### No Alternative Available State:

To be defined in next iteration.

---

## 5. Image Optimizer Provider API

### 5.1 New Extension Point for Image Optimization

**Description:**  
Create a new extension API that allows extensions to provide image optimization recommendations.

**Requirements:**
To be defined by Eng.

**Acceptance Criteria:**

- [ ] Extensions can register as image optimizer providers
- [ ] Provider registration emits update events
- [ ] Frontend can query registered providers
- [ ] Frontend can request optimization recommendations
- [ ] Proper cleanup on provider disposal

---

## 6. Extensions Catalog Entry

### 6.1 Hummingbird Extension in Catalog

**Description:**  
Add the Hummingbird extension to the extensions catalog so users can discover and install it.

**Requirements:**

- Add entry to `extensions-catalog.json`
- Extension ID: `hummingbird.hummingbird-optimizer`
- Display Name: "Hummingbird Optimizer"
- Publisher: "Red Hat"
- Categories: `["Security", "Images"]`
- Keywords: `["hummingbird", "security", "cve", "hardened", "distroless", "optimization"]`
- Short Description: Highlight zero-CVE and distroless alternatives
- Icon: Hummingbird/security themed

**Acceptance Criteria:**

- [ ] Extension appears in catalog when searching "Hummingbird"
- [ ] Extension appears in catalog when searching "type: ImageOptimizer"
- [ ] Extension details page shows correct information
- [ ] Install button initiates installation flow

---

## 7. Hummingbird Extension (Reference Implementation)

### 7.1 Extension Structure

**Description:**  
Create a placeholder Hummingbird extension that implements the Image Optimizer Provider API.

**Requirements:**

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

_Document generated for Hummingbird Awareness implementation in Podman Desktop_
