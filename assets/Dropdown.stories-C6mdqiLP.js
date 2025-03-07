import{p as D,i as h,t as l,f as v,s as i,a as p,b as g,n as x,c as I,h as C,j as B}from"./props-m84qvlQ3.js";import"./ErrorMessage-Bc2mpcqP.js";import"./Button-VmhKroyM.js";import{D as u}from"./Table-BnO6JxqY.js";import"./fa-layers-text.svelte_svelte_type_style_lang-o17LAEC1.js";import"./LinearProgress-tTCwHAqV.js";import"./Spinner-FEnDunQO.js";import"./EmptyScreen-DXSLnHOQ.js";import{d as y,c as A,s as S}from"./create-runtime-stories-JVzhExZ4.js";import{f as T}from"./index-BxauWL7I.js";import"./attributes-DP5P0HuC.js";import"./index-client-gi_8jJMN.js";import"./index-B5O8svG2.js";import"./StarIcon-DvE0L0y0.js";import"./_commonjsHelpers-CqkleIqs.js";import"./index-DtmeDzJ6.js";import"./index-CfOrKyLd.js";const j=(a,o,n=x)=>{let e=()=>C(o==null?void 0:o(),["_children"]);var t=F(),b=B(t);u(b,I(e,{children:(w,N)=>{var d=E(),r=v(d);r.value=(r.__value="a")==null?"":"a";var s=i(r,2);s.value=(s.__value="b")==null?"":"b";var m=i(s,2);m.value=(m.__value="c")==null?"":"c",p(w,d)},$$slots:{default:!0}})),p(a,t)},k=T().mockName("onchange"),{Story:c,meta:V}=y({component:u,title:"Dropdown",tags:["autodocs"],argTypes:{value:{control:"text",description:"Initial value shown in the dropdown",defaultValue:""},onchange:k,disabled:{control:"boolean",description:"Set the dropdown as being disabled",defaultValue:!1},options:{description:"Dropdown items"}},parameters:{docs:{description:{component:"These are the stories for the `Dropdown` component."}}}});var E=l("<option>Item A</option> <option>Item B</option> <option>Item C</option>",1),F=l('<div class="pb-24 flex flex-row"><!></div>'),M=l("<!> <!>",1);function _(a,o){D(o,!1),S(j),h();var n=M(),e=v(n);c(e,{name:"Basic",args:{value:"Initial value"},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}});var t=i(e,2);c(t,{name:"Disabled",args:{value:"Disabled dropdown",disabled:!0},parameters:{__svelteCsf:{rawCode:`<div class="pb-24 flex flex-row">
  <Dropdown {...args}>
    <option value="a">Item A</option>
    <option value="b">Item B</option>
    <option value="c">Item C</option>
  </Dropdown>
</div>`}}}),p(a,n),g()}_.__docgen={keywords:[],data:[],name:"Dropdown.stories.svelte"};const f=A(_,V),oo=["Basic","Disabled"],eo=f.Basic,to=f.Disabled;export{eo as Basic,to as Disabled,oo as __namedExportsOrder,V as default};
