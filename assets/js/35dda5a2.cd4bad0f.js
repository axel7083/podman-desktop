"use strict";
(self["webpackChunkdocs"] = self["webpackChunkdocs"] || []).push([[3724],{

/***/ 69283:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_ai_lab_start_inference_server_md_35d_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-ai-lab-start-inference-server-md-35d.json
const site_docs_ai_lab_start_inference_server_md_35d_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"ai-lab/start-inference-server","title":"Starting an inference server","description":"Starting an inference server for a model.","source":"@site/docs/ai-lab/start-inference-server.md","sourceDirName":"ai-lab","slug":"/ai-lab/start-inference-server","permalink":"/docs/ai-lab/start-inference-server","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/ai-lab/start-inference-server.md","tags":[{"inline":true,"label":"ai","permalink":"/docs/tags/ai"},{"inline":true,"label":"llm","permalink":"/docs/tags/llm"},{"inline":true,"label":"generative ai","permalink":"/docs/tags/generative-ai"}],"version":"current","sidebarPosition":4,"frontMatter":{"sidebar_position":4,"title":"Starting an inference server","description":"Starting an inference server for a model.","keywords":["podman desktop","podman","ai","llm","generative ai"],"tags":["ai","llm","generative ai"]},"sidebar":"mySidebar","previous":{"title":"Downloading a model","permalink":"/docs/ai-lab/download-model"},"next":{"title":"Creating a playground","permalink":"/docs/ai-lab/create-playground"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./docs/ai-lab/start-inference-server.md


const frontMatter = {
	sidebar_position: 4,
	title: 'Starting an inference server',
	description: 'Starting an inference server for a model.',
	keywords: [
		'podman desktop',
		'podman',
		'ai',
		'llm',
		'generative ai'
	],
	tags: [
		'ai',
		'llm',
		'generative ai'
	]
};
const contentTitle = 'Starting an inference server for a model';

const assets = {

};



const toc = [{
  "value": "Prerequisites",
  "id": "prerequisites",
  "level": 4
}, {
  "value": "Procedure",
  "id": "procedure",
  "level": 4
}, {
  "value": "Verification",
  "id": "verification",
  "level": 4
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    h1: "h1",
    h4: "h4",
    header: "header",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "starting-an-inference-server-for-a-model",
        children: "Starting an inference server for a model"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Once a model is downloaded, a model service can be started. A model service is an inference server that is running in a container and exposing the model through the well-known chat API common to many providers."
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "prerequisites",
      children: "Prerequisites"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ul, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/ai-lab/installing",
          children: "Podman AI Lab installed"
        }), "."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: [(0,jsx_runtime.jsx)(_components.a, {
          href: "/docs/ai-lab/download-model",
          children: "Model downloaded"
        }), "."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "procedure",
      children: "Procedure"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsx)(_components.li, {
        children: "Click the Podman AI Lab icon in the navigation bar"
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["In the Podman AI Lab navigation bar, click ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Models > Services"
        }), " menu item."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Click the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "New Model Service"
        }), " button on the top right."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Select the model you want to start an inference server for in the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Model"
        }), " list and click the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Create Service"
        }), " button."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["The inference server for the model is being started and after a while, click on the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Open service details"
        }), " button."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "verification",
      children: "Verification"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Once the inference server is started, the details for the inference server allows you to generate code snippets in various languages to access the model through the inference server.\n", (0,jsx_runtime.jsx)(_components.img, {
          alt: "inference server",
          src: (__webpack_require__(56925)/* ["default"] */ .A) + "",
          width: "1060",
          height: "711"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["You can change the target language, here for Java and Quarkus.\n", (0,jsx_runtime.jsx)(_components.img, {
          alt: "inference server",
          src: (__webpack_require__(13217)/* ["default"] */ .A) + "",
          width: "1060",
          height: "711"
        })]
      }), "\n"]
    })]
  });
}
function MDXContent(props = {}) {
  const {wrapper: MDXLayout} = {
    ...(0,lib/* useMDXComponents */.R)(),
    ...props.components
  };
  return MDXLayout ? (0,jsx_runtime.jsx)(MDXLayout, {
    ...props,
    children: (0,jsx_runtime.jsx)(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}



/***/ }),

/***/ 56925:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/inference-server-curl-edff4cc6c909f2c28f7cf29550e7a41d.png");

/***/ }),

/***/ 13217:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/inference-server-quarkus-808ad6018ca2a7a7e10bb39a1286e98d.png");

/***/ }),

/***/ 43023:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ useMDXComponents),
/* harmony export */   x: () => (/* binding */ MDXProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(63696);
/**
 * @import {MDXComponents} from 'mdx/types.js'
 * @import {Component, ReactElement, ReactNode} from 'react'
 */

/**
 * @callback MergeComponents
 *   Custom merge function.
 * @param {Readonly<MDXComponents>} currentComponents
 *   Current components from the context.
 * @returns {MDXComponents}
 *   Additional components.
 *
 * @typedef Props
 *   Configuration for `MDXProvider`.
 * @property {ReactNode | null | undefined} [children]
 *   Children (optional).
 * @property {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @property {boolean | null | undefined} [disableParentContext=false]
 *   Turn off outer component context (default: `false`).
 */



/** @type {Readonly<MDXComponents>} */
const emptyComponents = {}

const MDXContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(emptyComponents)

/**
 * Get current components from the MDX Context.
 *
 * @param {Readonly<MDXComponents> | MergeComponents | null | undefined} [components]
 *   Additional components to use or a function that creates them (optional).
 * @returns {MDXComponents}
 *   Current components.
 */
function useMDXComponents(components) {
  const contextComponents = react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext)

  // Memoize to avoid unnecessary top-level context changes
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(
    function () {
      // Custom merge via a function prop
      if (typeof components === 'function') {
        return components(contextComponents)
      }

      return {...contextComponents, ...components}
    },
    [contextComponents, components]
  )
}

/**
 * Provider for MDX context.
 *
 * @param {Readonly<Props>} properties
 *   Properties.
 * @returns {ReactElement}
 *   Element.
 * @satisfies {Component}
 */
function MDXProvider(properties) {
  /** @type {Readonly<MDXComponents>} */
  let allComponents

  if (properties.disableParentContext) {
    allComponents =
      typeof properties.components === 'function'
        ? properties.components(emptyComponents)
        : properties.components || emptyComponents
  } else {
    allComponents = useMDXComponents(properties.components)
  }

  return react__WEBPACK_IMPORTED_MODULE_0__.createElement(
    MDXContext.Provider,
    {value: allComponents},
    properties.children
  )
}


/***/ })

}]);