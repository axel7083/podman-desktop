"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[66521],{57258:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>t,default:()=>g,frontMatter:()=>o,metadata:()=>a,toc:()=>l});var s=i(24246),r=i(71670);const o={sidebar_position:20,title:"Building an image",description:"Building an image on your container engine.",keywords:["podman desktop","podman","containers","images"],tags:["images"]},t="Building an image on your container engine",a={id:"containers/images/building-an-image",title:"Building an image",description:"Building an image on your container engine.",source:"@site/docs/containers/images/building-an-image.md",sourceDirName:"containers/images",slug:"/containers/images/building-an-image",permalink:"/docs/containers/images/building-an-image",draft:!1,unlisted:!1,editUrl:"https://github.com/containers/podman-desktop/tree/main/website/docs/containers/images/building-an-image.md",tags:[{inline:!0,label:"images",permalink:"/docs/tags/images"}],version:"current",sidebarPosition:20,frontMatter:{sidebar_position:20,title:"Building an image",description:"Building an image on your container engine.",keywords:["podman desktop","podman","containers","images"],tags:["images"]},sidebar:"mySidebar",previous:{title:"Images",permalink:"/docs/containers/images/"},next:{title:"Pushing an image to a registry",permalink:"/docs/containers/images/pushing-an-image-to-a-registry"}},c={},l=[{value:"Prerequisites",id:"prerequisites",level:4},{value:"Procedure",id:"procedure",level:4},{value:"Verification",id:"verification",level:4}];function d(e){const n={code:"code",h1:"h1",h4:"h4",header:"header",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,r.a)(),...e.components},{Icon:i}=n;return i||function(e,n){throw new Error("Expected "+(n?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Icon",!0),(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"building-an-image-on-your-container-engine",children:"Building an image on your container engine"})}),"\n",(0,s.jsx)(n.p,{children:"With Podman Desktop, you can build an image from a Containerfile on your container engine."}),"\n",(0,s.jsx)(n.h4,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["Your Containerfile: ",(0,s.jsx)(n.code,{children:"Containerfile"})," or ",(0,s.jsx)(n.code,{children:"Dockerfile"}),"."]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"procedure",children:"Procedure"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["Go to ",(0,s.jsxs)(n.strong,{children:[(0,s.jsx)(i,{icon:"fa-solid fa-cloud",size:"lg"})," Images"]}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["Click ",(0,s.jsxs)(n.strong,{children:[(0,s.jsx)(i,{icon:"fa-solid fa-cube",size:"lg"})," Build an image"]}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["On the ",(0,s.jsx)(n.strong,{children:"Build Image from Containerfile"})," screen","\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Containerfile path"}),": select the ",(0,s.jsx)(n.code,{children:"Containerfile"})," or ",(0,s.jsx)(n.code,{children:"Dockerfile"})," to build."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:"Image Name"}),": enter your image name, such as ",(0,s.jsx)(n.code,{children:"my-image"}),". If you want to push the image to a registry, use the fully qualified image name that your registry requires, such as ",(0,s.jsx)(n.code,{children:"quay.io/my-repository/my-image"}),", ",(0,s.jsx)(n.code,{children:"ghcr.io/my-repository/my-image"}),", or ",(0,s.jsx)(n.code,{children:"docker.io/my-repository/my-image"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["Click ",(0,s.jsxs)(n.strong,{children:[(0,s.jsx)(i,{icon:"fa-solid fa-cubes",size:"lg"})," Build"]}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["Click ",(0,s.jsx)(n.strong,{children:"Done"}),"."]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"verification",children:"Verification"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["Go to ",(0,s.jsxs)(n.strong,{children:[(0,s.jsx)(i,{icon:"fa-solid fa-cloud",size:"lg"})," Images"]}),"."]}),"\n",(0,s.jsxs)(n.li,{children:[(0,s.jsx)(n.strong,{children:(0,s.jsx)(i,{icon:"fa-solid fa-search",size:"lg"})}),": Enter your image name, such as ",(0,s.jsx)(n.code,{children:"quay.io/my-repository/my-image"}),", ",(0,s.jsx)(n.code,{children:"ghcr.io/my-repository/my-image"}),", or ",(0,s.jsx)(n.code,{children:"docker.io/my-repository/my-image"}),"."]}),"\n",(0,s.jsx)(n.li,{children:"Click the line with your image name."}),"\n",(0,s.jsxs)(n.li,{children:["Go to ",(0,s.jsx)(n.strong,{children:"History"}),".","\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"Click the content area to activate it."}),"\n",(0,s.jsxs)(n.li,{children:["Enter ",(0,s.jsx)("kbd",{children:"Ctrl"})," + ",(0,s.jsx)("kbd",{children:"F"})," on Windows and Linux, or ",(0,s.jsx)("kbd",{children:"\u2318"})," + ",(0,s.jsx)("kbd",{children:"F"})," on macOS to start searching in the content."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["Go to ",(0,s.jsx)(n.strong,{children:"Inspect"}),".","\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsx)(n.li,{children:"Click the content area to activate it."}),"\n",(0,s.jsxs)(n.li,{children:["Enter ",(0,s.jsx)("kbd",{children:"Ctrl"})," + ",(0,s.jsx)("kbd",{children:"F"})," on Windows and Linux, or ",(0,s.jsx)("kbd",{children:"\u2318"})," + ",(0,s.jsx)("kbd",{children:"F"})," on macOS to start searching in the content."]}),"\n"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["Click ",(0,s.jsx)(n.strong,{children:(0,s.jsx)(i,{icon:"fa-solid fa-play",size:"lg"})}),"..","\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["You see the ",(0,s.jsx)(n.strong,{children:"Create a container"})," screen."]}),"\n"]}),"\n"]}),"\n"]})]})}function g(e={}){const{wrapper:n}={...(0,r.a)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(d,{...e})}):d(e)}},71670:(e,n,i)=>{i.d(n,{Z:()=>a,a:()=>t});var s=i(27378);const r={},o=s.createContext(r);function t(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:t(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);