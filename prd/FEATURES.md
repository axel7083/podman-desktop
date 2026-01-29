# Hummingbird Awareness Features - Requirements Document

This document describes the features implemented for the "Awareness" phase of the Hummingbird Extension integration in Podman Desktop. These features are designed to promote image security and optimization to users before they install the full Hummingbird extension.

---

## 1. Learning Center Integration

### 1.1 Hummingbird Guide Entry

**Description:**  
Add a new guide entry in the Learning Center to educate users about distroless and hardened container images.

**Requirements:**

- Add a new guide entry in the Learning Center guides list
- Position: 3rd in the list order (or ideally having a rotation upstream issue https://github.com/podman-desktop/podman-desktop/issues/15741)
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

| Entry       | Content                                                                         |
| ----------- | ------------------------------------------------------------------------------- |
| ID          | `optimize-images-security`                                                      |
| Title       | "Optimize Images for Security"                                                  |
| Description | Highlight Hummingbird hardened images with zero CVEs and reduced attack surface |
| Button      | "Explore Images" linking to `/images`                                           |
| Learn       | More: Link to Hummingbird extension documentation                               |
| Image       | Placeholder SVG showing a container with a lock/security concept                |

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

- Investigate how the CORE (aka Podman Desktop) can promote image optimizations extensions in `Images > Pull image`.

idea: display message: "Discover and adopt hardened, Zero-CVE container images."
Clickable link text: "Install Image Optimizer extensions."
Clicking redirects to Extensions Catalog filtered by "Hummingbird"

- Investigate what value can an image optimization can bring to the pull image page

idea: Include security shield icon in the pull image dropdown

**Acceptance Criteria:**

- [ ] Image optimization extension can be promoted in `Images > Pull Image`
  - [ ] Promotion for hummingbird should redirect to HummingBird catalog details page
- [ ] Telemetry tracks user action on promoted content

---

## 4. Image Details - Image Optimizations Tab

### 4.1 New Tab in Image Details View

**Description:**  
Add a new "Image Optimizations" tab in the Image Details view that shows optimization recommendations or prompts extension installation.

Similar to Kubernetes empty page, the `Image Optimizations` tab should display the list of extensions with the keyword image optimizations, and allow the user to quickly install one of them.

**Requirements:**

#### Tab Configuration:

- Tab Name: "Image Optimizations"

The tab should be visible (even when no optimizer extension is installed), and list optimizations extensions available in the catalog.

We should reuse existing styling and design page for listing specific extensions, here we should have a consistent design with the `KubernetesEmptyPage`.

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

- Investigate the requirement on the optimization tab in image details
  - Do we want a custom webview? Or do we want the UI content to be managed by Podman Desktop (similar to the layer explorer)

- Investigate how an extension can notify the CORE when pulling image that some of them are "secure" compare to others
  - In the `Images > Pull Image`, if we want some special icons next to the image, we need to find a way to let the core ask extensions for details.

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
- Extension ID: `redhat.hummingbird-optimizer`
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

- Investigate on which GitHub organiation the repository should be hosted

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

- [ ] A dedicated Amplitude dashboard, grouping all events and chart has been created

---

_Document generated for Hummingbird Awareness implementation in Podman Desktop_
