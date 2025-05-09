"use strict";
(self["webpackChunkdocs"] = self["webpackChunkdocs"] || []).push([[93520],{

/***/ 5109:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  assets: () => (/* binding */ assets),
  contentTitle: () => (/* binding */ contentTitle),
  "default": () => (/* binding */ MDXContent),
  frontMatter: () => (/* binding */ frontMatter),
  metadata: () => (/* reexport */ site_docs_ai_lab_start_recipe_md_c36_namespaceObject),
  toc: () => (/* binding */ toc)
});

;// ./.docusaurus/docusaurus-plugin-content-docs/default/site-docs-ai-lab-start-recipe-md-c36.json
const site_docs_ai_lab_start_recipe_md_c36_namespaceObject = /*#__PURE__*/JSON.parse('{"id":"ai-lab/start-recipe","title":"Starting a recipe","description":"Created a recipe also known as an inference server for interaction with a model.","source":"@site/docs/ai-lab/start-recipe.md","sourceDirName":"ai-lab","slug":"/ai-lab/start-recipe","permalink":"/docs/ai-lab/start-recipe","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/ai-lab/start-recipe.md","tags":[{"inline":true,"label":"ai","permalink":"/docs/tags/ai"},{"inline":true,"label":"llm","permalink":"/docs/tags/llm"},{"inline":true,"label":"generative ai","permalink":"/docs/tags/generative-ai"}],"version":"current","sidebarPosition":6,"frontMatter":{"sidebar_position":6,"title":"Starting a recipe","description":"Created a recipe also known as an inference server for interaction with a model.","keywords":["podman desktop","podman","ai","llm","generative ai"],"tags":["ai","llm","generative ai"]},"sidebar":"mySidebar","previous":{"title":"Creating a playground","permalink":"/docs/ai-lab/create-playground"},"next":{"title":"Kind","permalink":"/docs/kind/"}}');
// EXTERNAL MODULE: ../node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(62540);
// EXTERNAL MODULE: ../node_modules/@mdx-js/react/lib/index.js
var lib = __webpack_require__(43023);
;// ./docs/ai-lab/start-recipe.md


const frontMatter = {
	sidebar_position: 6,
	title: 'Starting a recipe',
	description: 'Created a recipe also known as an inference server for interaction with a model.',
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
const contentTitle = 'Starting a recipe (inference server) for a model';

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
  }, {Icon} = _components;
  if (!Icon) _missingMdxReference("Icon", true);
  return (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, {
    children: [(0,jsx_runtime.jsx)(_components.header, {
      children: (0,jsx_runtime.jsx)(_components.h1, {
        id: "starting-a-recipe-inference-server-for-a-model",
        children: "Starting a recipe (inference server) for a model"
      })
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Once an AI model is available through a well known endpoint, it's easy to imagine a new world of applications that will connect and use the AI model. Podman AI Lab support AI applications as a set of containers that are connected together."
    }), "\n", (0,jsx_runtime.jsx)(_components.p, {
      children: "Podman AI Lab ships with a so-called Recipes Catalog that helps you navigate a number of core AI use cases and problem domains such as Chat Bots, Code Generators and Text Summarizers. Each recipe comes with detailed explanations and sample applications that can be run with various large language models (LLMs). Experimenting with multiple models allows finding the optimal one for your use case."
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
          children: "AI Apps > Recipes Catalog"
        }), " menu item."]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["The list of available recipes is displayed. Click on the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Chatbot"
        }), " recipe card.\n", (0,jsx_runtime.jsx)(_components.img, {
          alt: "chatbot recipe",
          src: (__webpack_require__(95675)/* ["default"] */ .A) + "",
          width: "1060",
          height: "711"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Click the ", (0,jsx_runtime.jsx)(_components.strong, {
          children: "Start AI App"
        }), " button to start the containers for this recipe."]
      }), "\n"]
    }), "\n", (0,jsx_runtime.jsx)(_components.h4, {
      id: "verification",
      children: "Verification"
    }), "\n", (0,jsx_runtime.jsxs)(_components.ol, {
      children: ["\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["Once the AI app is started, the details for the recipe are updated and the recipe is switched to RUNNING mode.\n", (0,jsx_runtime.jsx)(_components.img, {
          alt: "chatbot recipe",
          src: (__webpack_require__(70823)/* ["default"] */ .A) + "",
          width: "1060",
          height: "711"
        })]
      }), "\n", (0,jsx_runtime.jsxs)(_components.li, {
        children: ["To test the application, click on the ", (0,jsx_runtime.jsx)(Icon, {
          icon: "fa-solid fa-arrow-up-right-from-square",
          size: "lg"
        }), " icon and your browser will be connected to the client application."]
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
function _missingMdxReference(id, component) {
  throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}



/***/ }),

/***/ 70823:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/chatbot-recipe-started-ef56aa643e115a13eb268dd3084fb2c1.png");

/***/ }),

/***/ 95675:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "assets/images/chatbot-recipe-1ecd53bb1aca968eeedde618d64dde0c.png");

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