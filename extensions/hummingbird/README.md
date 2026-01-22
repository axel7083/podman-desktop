# Hummingbird Extension for Podman Desktop

Provides hardened, lightweight container image alternatives from the Hummingbird project.

## Features

- **Image Optimizer Provider**: Automatically suggests Hummingbird alternatives for popular container images
- **Optimize Tab**: View and compare hardened alternatives in the Image Details view
- **Catalog Integration**: Includes mappings for popular language runtimes

## Supported Images

Phase 1 includes hardened alternatives for:

| Original Image | Hummingbird Alternative    |
| -------------- | -------------------------- |
| node / nodejs  | quay.io/hummingbird/nodejs |
| python         | quay.io/hummingbird/python |
| golang / go    | quay.io/hummingbird/go     |
| openjdk / java | quay.io/hummingbird/jdk    |
| ruby           | quay.io/hummingbird/ruby   |

## Configuration

- `hummingbird.registryPath`: Registry path for Hummingbird images (default: `quay.io/hummingbird`)
- `hummingbird.showOptimizeTab`: Show Optimize tab in Image Details (default: `true`)

## Benefits

Hummingbird images provide:

- **Smaller image sizes**: Up to 85% reduction in image size
- **Zero CVEs**: Hardened images with minimal attack surface
- **Signed images**: All images are cryptographically signed
- **Compatibility**: Drop-in replacements for popular base images

## Learn More

Visit [developers.redhat.com/hummingbird](https://developers.redhat.com/hummingbird) for more information.
