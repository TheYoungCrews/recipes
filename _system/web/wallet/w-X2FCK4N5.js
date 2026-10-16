import{K as u,L as Z,M as E,N as v,O as d}from"./w-BT2PU7LL.js";import{b as m,c as F,d as Y,e as l,g as z,h as X,i as K,j as h}from"./w-3JU5T7LF.js";var ut={attribute:!0,type:String,converter:F,reflect:!1,hasChanged:Y},dt=(e=ut,t,i)=>{let{kind:o,metadata:s}=i,r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),o==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),o==="accessor"){let{name:n}=i;return{set(a){let g=t.get.call(this);t.set.call(this,a),this.requestUpdate(n,g,e,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,e,a),a}}}if(o==="setter"){let{name:n}=i;return function(a){let g=this[n];t.call(this,a),this.requestUpdate(n,g,e,!0,a)}}throw Error("Unsupported decorator location: "+o)};function c(e){return(t,i)=>typeof i=="object"?dt(e,t,i):((o,s,r)=>{let n=s.hasOwnProperty(r);return s.constructor.createProperty(r,o),n?Object.getOwnPropertyDescriptor(s,r):void 0})(e,t,i)}function $t(e){return c({...e,state:!0,attribute:!1})}var Q=m`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var f=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},p=class extends h{render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&v.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&v.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&v.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&v.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&v.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&v.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&v.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&v.getSpacingStyles(this.margin,3)};
    `,l`<slot></slot>`}};p.styles=[u,Q];f([c()],p.prototype,"flexDirection",void 0);f([c()],p.prototype,"flexWrap",void 0);f([c()],p.prototype,"flexBasis",void 0);f([c()],p.prototype,"flexGrow",void 0);f([c()],p.prototype,"flexShrink",void 0);f([c()],p.prototype,"alignItems",void 0);f([c()],p.prototype,"justifyContent",void 0);f([c()],p.prototype,"columnGap",void 0);f([c()],p.prototype,"rowGap",void 0);f([c()],p.prototype,"gap",void 0);f([c()],p.prototype,"padding",void 0);f([c()],p.prototype,"margin",void 0);p=f([d("wui-flex")],p);var ae=e=>e??X;var B={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},A=e=>(...t)=>({_$litDirective$:e,values:t}),$=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,i,o){this._$Ct=t,this._$AM=i,this._$Ci=o}_$AS(t,i){return this.update(t,i)}update(t,i){return this.render(...i)}};var J=A(class extends ${constructor(e){if(super(e),e.type!==B.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(let o in t)t[o]&&!this.nt?.has(o)&&this.st.add(o);return this.render(t)}let i=e.element.classList;for(let o of this.st)o in t||(i.remove(o),this.st.delete(o));for(let o in t){let s=!!t[o];s===this.st.has(o)||this.nt?.has(o)||(s?(i.add(o),this.st.add(o)):(i.remove(o),this.st.delete(o)))}return z}});var tt=m`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var P=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},x=class extends h{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){let t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,l`<slot class=${J(t)}></slot>`}};x.styles=[u,tt];P([c()],x.prototype,"variant",void 0);P([c()],x.prototype,"color",void 0);P([c()],x.prototype,"align",void 0);P([c()],x.prototype,"lineClamp",void 0);x=P([d("wui-text")],x);var{I:ke}=K;var et=e=>e===null||typeof e!="object"&&typeof e!="function";var it=e=>e.strings===void 0;var R=(e,t)=>{let i=e._$AN;if(i===void 0)return!1;for(let o of i)o._$AO?.(t,!1),R(o,t);return!0},D=e=>{let t,i;do{if((t=e._$AM)===void 0)break;i=t._$AN,i.delete(e),e=t}while(i?.size===0)},ot=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(i===void 0)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),wt(t)}};function ft(e){this._$AN!==void 0?(D(this),this._$AM=e,ot(this)):this._$AM=e}function gt(e,t=!1,i=0){let o=this._$AH,s=this._$AN;if(s!==void 0&&s.size!==0)if(t)if(Array.isArray(o))for(let r=i;r<o.length;r++)R(o[r],!1),D(o[r]);else o!=null&&(R(o,!1),D(o));else R(this,e)}var wt=e=>{e.type==B.CHILD&&(e._$AP??(e._$AP=gt),e._$AQ??(e._$AQ=ft))},L=class extends ${constructor(){super(...arguments),this._$AN=void 0}_$AT(t,i,o){super._$AT(t,i,o),ot(this),this.isConnected=t._$AU}_$AO(t,i=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),i&&(R(this,t),D(this))}setValue(t){if(it(this._$Ct))this._$Ct._$AI(t,this);else{let i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}};var I=class{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}},M=class{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(t=>this.Z=t))}resume(){this.Z?.(),this.Y=this.Z=void 0}};var rt=e=>!et(e)&&typeof e.then=="function",st=1073741823,G=class extends L{constructor(){super(...arguments),this._$Cwt=st,this._$Cbt=[],this._$CK=new I(this),this._$CX=new M}render(...t){return t.find(i=>!rt(i))??z}update(t,i){let o=this._$Cbt,s=o.length;this._$Cbt=i;let r=this._$CK,n=this._$CX;this.isConnected||this.disconnected();for(let a=0;a<i.length&&!(a>this._$Cwt);a++){let g=i[a];if(!rt(g))return this._$Cwt=a,g;a<s&&g===o[a]||(this._$Cwt=st,s=0,Promise.resolve(g).then(async _=>{for(;n.get();)await n.get();let C=r.deref();if(C!==void 0){let q=C._$Cbt.indexOf(g);q>-1&&q<C._$Cwt&&(C._$Cwt=q,C.setValue(_))}}))}return z}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}},at=A(G);var N=class{constructor(){this.cache=new Map}set(t,i){this.cache.set(t,i)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}},H=new N;var nt=m`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var k=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},ct={add:async()=>(await import("./w-SNYAOZNF.js")).addSvg,allWallets:async()=>(await import("./w-B4OK7UGJ.js")).allWalletsSvg,arrowBottomCircle:async()=>(await import("./w-LOH5AOO6.js")).arrowBottomCircleSvg,appStore:async()=>(await import("./w-FOUPKVWO.js")).appStoreSvg,apple:async()=>(await import("./w-TAZORNMD.js")).appleSvg,arrowBottom:async()=>(await import("./w-I5JR5X3Y.js")).arrowBottomSvg,arrowLeft:async()=>(await import("./w-XYNQI2J5.js")).arrowLeftSvg,arrowRight:async()=>(await import("./w-BP4UK2CM.js")).arrowRightSvg,arrowTop:async()=>(await import("./w-524CR4GI.js")).arrowTopSvg,bank:async()=>(await import("./w-JOAPRVQ7.js")).bankSvg,browser:async()=>(await import("./w-XLF5NZPM.js")).browserSvg,card:async()=>(await import("./w-4MLCUXXP.js")).cardSvg,checkmark:async()=>(await import("./w-5YDAITGY.js")).checkmarkSvg,checkmarkBold:async()=>(await import("./w-HOXWWVOH.js")).checkmarkBoldSvg,chevronBottom:async()=>(await import("./w-XZQJDRFS.js")).chevronBottomSvg,chevronLeft:async()=>(await import("./w-CTRXAQYR.js")).chevronLeftSvg,chevronRight:async()=>(await import("./w-BRYBGXLX.js")).chevronRightSvg,chevronTop:async()=>(await import("./w-POFYXDXP.js")).chevronTopSvg,chromeStore:async()=>(await import("./w-HYAF3IMM.js")).chromeStoreSvg,clock:async()=>(await import("./w-YHMUZSMU.js")).clockSvg,close:async()=>(await import("./w-D6MNKRGC.js")).closeSvg,compass:async()=>(await import("./w-ODOZF237.js")).compassSvg,coinPlaceholder:async()=>(await import("./w-ZYOX2SCX.js")).coinPlaceholderSvg,copy:async()=>(await import("./w-MHZXN7JX.js")).copySvg,cursor:async()=>(await import("./w-SKXIPFY5.js")).cursorSvg,cursorTransparent:async()=>(await import("./w-ZM2QFFBK.js")).cursorTransparentSvg,desktop:async()=>(await import("./w-LCMFXUL7.js")).desktopSvg,disconnect:async()=>(await import("./w-OKV33EFP.js")).disconnectSvg,discord:async()=>(await import("./w-3MPQELIJ.js")).discordSvg,etherscan:async()=>(await import("./w-NSRRUAL2.js")).etherscanSvg,extension:async()=>(await import("./w-AX2FUMBN.js")).extensionSvg,externalLink:async()=>(await import("./w-P35U4GCH.js")).externalLinkSvg,facebook:async()=>(await import("./w-S6VMHGWB.js")).facebookSvg,farcaster:async()=>(await import("./w-LBJAFZTF.js")).farcasterSvg,filters:async()=>(await import("./w-DYRWECWU.js")).filtersSvg,github:async()=>(await import("./w-N7FIFEB2.js")).githubSvg,google:async()=>(await import("./w-OQXLM3VV.js")).googleSvg,helpCircle:async()=>(await import("./w-5UFBKJDS.js")).helpCircleSvg,image:async()=>(await import("./w-NZXNASJW.js")).imageSvg,id:async()=>(await import("./w-IX2HJCFI.js")).idSvg,infoCircle:async()=>(await import("./w-LKXBLFS2.js")).infoCircleSvg,lightbulb:async()=>(await import("./w-NAAP6WHX.js")).lightbulbSvg,mail:async()=>(await import("./w-VP6X4HVM.js")).mailSvg,mobile:async()=>(await import("./w-GBNFIUEA.js")).mobileSvg,more:async()=>(await import("./w-2TZULD6C.js")).moreSvg,networkPlaceholder:async()=>(await import("./w-JH4EY66S.js")).networkPlaceholderSvg,nftPlaceholder:async()=>(await import("./w-ATVPNEUY.js")).nftPlaceholderSvg,off:async()=>(await import("./w-SGU7W4XV.js")).offSvg,playStore:async()=>(await import("./w-LUZY2NGC.js")).playStoreSvg,plus:async()=>(await import("./w-L2BMZFKH.js")).plusSvg,qrCode:async()=>(await import("./w-ORLF6GT5.js")).qrCodeIcon,recycleHorizontal:async()=>(await import("./w-EYZTSGEA.js")).recycleHorizontalSvg,refresh:async()=>(await import("./w-ZM3N3R77.js")).refreshSvg,search:async()=>(await import("./w-J7GYEBIO.js")).searchSvg,send:async()=>(await import("./w-G6KP2I43.js")).sendSvg,swapHorizontal:async()=>(await import("./w-WFKG2FX7.js")).swapHorizontalSvg,swapHorizontalMedium:async()=>(await import("./w-F36N6O6Z.js")).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await import("./w-ET6ATBT4.js")).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await import("./w-CJAP64NN.js")).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await import("./w-HI75V773.js")).swapVerticalSvg,telegram:async()=>(await import("./w-BRPDW2KF.js")).telegramSvg,threeDots:async()=>(await import("./w-M2OZAEQO.js")).threeDotsSvg,twitch:async()=>(await import("./w-XMARDVQG.js")).twitchSvg,twitter:async()=>(await import("./w-E5K2R7FW.js")).xSvg,twitterIcon:async()=>(await import("./w-UA2OHYAM.js")).twitterIconSvg,verify:async()=>(await import("./w-GVIBAI5E.js")).verifySvg,verifyFilled:async()=>(await import("./w-43EAM354.js")).verifyFilledSvg,wallet:async()=>(await import("./w-NI4HVE63.js")).walletSvg,walletConnect:async()=>(await import("./w-FRJEWKZ2.js")).walletConnectSvg,walletConnectLightBrown:async()=>(await import("./w-FRJEWKZ2.js")).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await import("./w-FRJEWKZ2.js")).walletConnectBrownSvg,walletPlaceholder:async()=>(await import("./w-RYEMYDN5.js")).walletPlaceholderSvg,warningCircle:async()=>(await import("./w-QHNQRAYU.js")).warningCircleSvg,x:async()=>(await import("./w-E5K2R7FW.js")).xSvg,info:async()=>(await import("./w-AQYQNTF4.js")).infoSvg,exclamationTriangle:async()=>(await import("./w-K5ZBU6RR.js")).exclamationTriangleSvg,reown:async()=>(await import("./w-NGFT6RTW.js")).reownSvg};async function vt(e){if(H.has(e))return H.get(e);let i=(ct[e]??ct.copy)();return H.set(e,i),i}var b=class extends h{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,l`${at(vt(this.name),l`<div class="fallback"></div>`)}`}};b.styles=[u,E,nt];k([c()],b.prototype,"size",void 0);k([c()],b.prototype,"name",void 0);k([c()],b.prototype,"color",void 0);k([c()],b.prototype,"aspectRatio",void 0);b=k([d("wui-icon")],b);var lt=m`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var y=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},w=class extends h{constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){let t=this.iconSize||this.size,i=this.size==="lg",o=this.size==="xl",s=i?"12%":"16%",r=i?"xxs":o?"s":"3xl",n=this.background==="gray",a=this.background==="opaque",g=this.backgroundColor==="accent-100"&&a||this.backgroundColor==="success-100"&&a||this.backgroundColor==="error-100"&&a||this.backgroundColor==="inverse-100"&&a,_=`var(--wui-color-${this.backgroundColor})`;return g?_=`var(--wui-icon-box-bg-${this.backgroundColor})`:n&&(_=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`
       --local-bg-value: ${_};
       --local-bg-mix: ${g||n?"100%":s};
       --local-border-radius: var(--wui-border-radius-${r});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: ${this.borderColor==="wui-color-bg-125"?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}
   `,l` <wui-icon color=${this.iconColor} size=${t} name=${this.icon}></wui-icon> `}};w.styles=[u,Z,lt];y([c()],w.prototype,"size",void 0);y([c()],w.prototype,"backgroundColor",void 0);y([c()],w.prototype,"iconColor",void 0);y([c()],w.prototype,"iconSize",void 0);y([c()],w.prototype,"background",void 0);y([c({type:Boolean})],w.prototype,"border",void 0);y([c()],w.prototype,"borderColor",void 0);y([c()],w.prototype,"icon",void 0);w=y([d("wui-icon-box")],w);var pt=m`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var W=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},S=class extends h{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,l`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};S.styles=[u,E,pt];W([c()],S.prototype,"src",void 0);W([c()],S.prototype,"alt",void 0);W([c()],S.prototype,"size",void 0);S=W([d("wui-image")],S);var mt=m`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var U=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},T=class extends h{constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;let t=this.size==="md"?"mini-700":"micro-700";return l`
      <wui-text data-variant=${this.variant} variant=${t} color="inherit">
        <slot></slot>
      </wui-text>
    `}};T.styles=[u,mt];U([c()],T.prototype,"variant",void 0);U([c()],T.prototype,"size",void 0);T=U([d("wui-tag")],T);var ht=m`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var V=function(e,t,i,o){var s=arguments.length,r=s<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(r=(s<3?n(r):s>3?n(t,i,r):n(t,i))||r);return s>3&&r&&Object.defineProperty(t,i,r),r},j=class extends h{constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText=`--local-color: ${this.color==="inherit"?"inherit":`var(--wui-color-${this.color})`}`,this.dataset.size=this.size,l`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};j.styles=[u,ht];V([c()],j.prototype,"color",void 0);V([c()],j.prototype,"size",void 0);j=V([d("wui-loading-spinner")],j);export{c as a,$t as b,ae as c,A as d,L as e,J as f};
/*! Bundled license information:

@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/async-directive.js:
lit-html/directives/until.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
lit-html/directives/private-async-helpers.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/if-defined.js:
lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
