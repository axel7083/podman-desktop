import{r as c}from"./index-DH5ua8nC.js";import{useMDXComponents as _}from"./index-COxJNofV.js";import"./_commonjsHelpers-Cpj98o6Y.js";var l={exports:{}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var x=c,a=Symbol.for("react.element"),d=Symbol.for("react.fragment"),y=Object.prototype.hasOwnProperty,v=x.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,j={key:!0,ref:!0,__self:!0,__source:!0};function m(r,e,f){var t,o={},s=null,i=null;f!==void 0&&(s=""+f),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(i=e.ref);for(t in e)y.call(e,t)&&!j.hasOwnProperty(t)&&(o[t]=e[t]);if(r&&r.defaultProps)for(t in e=r.defaultProps,e)o[t]===void 0&&(o[t]=e[t]);return{$$typeof:a,type:r,key:s,ref:i,props:o,_owner:v.current}}n.Fragment=d;n.jsx=m;n.jsxs=m;l.exports=n;var p=l.exports;function u(r){const e={p:"p",..._(),...r.components};return p.jsx(e.p,{children:"Hello world"})}function w(r={}){const{wrapper:e}={..._(),...r.components};return e?p.jsx(e,{...r,children:p.jsx(u,{...r})}):u(r)}export{w as default};
