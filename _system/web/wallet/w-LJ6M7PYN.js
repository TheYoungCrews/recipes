import{a as c,b as m,c as h,d as jo,e as ko,f as zo}from"./w-X2FCK4N5.js";import{h as ht,i as st}from"./w-TPRNXSS2.js";import{A as he,K as y,L,M as Do,N as X,O as d,a as Ao,h as pe,i as pt,j as f,k as N,l as Ke,m as B,o as U,p as R,q as E,r as Gt,s as v,t as yt,u as x,x as Yt}from"./w-BT2PU7LL.js";import"./w-3OAAM3IP.js";import{b as g,e as l,f as mt,h as Ge,j as p}from"./w-3JU5T7LF.js";import"./w-3DR3ZYQO.js";import"./w-VYEQWWPW.js";import"./w-EOMWHFUM.js";import"./w-2QLCEWCC.js";import"./w-M2TYQQCD.js";import"./w-7JXXCUZA.js";import{d as W,g as Ar}from"./w-VC7IHUUR.js";var ni=W((ld,ri)=>{ri.exports=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}});var gt=W(It=>{var oo,Ur=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];It.getSymbolSize=function(t){if(!t)throw new Error('"version" cannot be null or undefined');if(t<1||t>40)throw new Error('"version" should be in range from 1 to 40');return t*4+17};It.getSymbolTotalCodewords=function(t){return Ur[t]};It.getBCHDigit=function(r){let t=0;for(;r!==0;)t++,r>>>=1;return t};It.setToSJISFunction=function(t){if(typeof t!="function")throw new Error('"toSJISFunc" is not a valid function.');oo=t};It.isKanjiModeEnabled=function(){return typeof oo<"u"};It.toSJIS=function(t){return oo(t)}});var Se=W(Y=>{Y.L={bit:1};Y.M={bit:0};Y.Q={bit:3};Y.H={bit:2};function Nr(r){if(typeof r!="string")throw new Error("Param is not a string");switch(r.toLowerCase()){case"l":case"low":return Y.L;case"m":case"medium":return Y.M;case"q":case"quartile":return Y.Q;case"h":case"high":return Y.H;default:throw new Error("Unknown EC Level: "+r)}}Y.isValid=function(t){return t&&typeof t.bit<"u"&&t.bit>=0&&t.bit<4};Y.from=function(t,e){if(Y.isValid(t))return t;try{return Nr(t)}catch{return e}}});var li=W((dd,ai)=>{function si(){this.buffer=[],this.length=0}si.prototype={get:function(r){let t=Math.floor(r/8);return(this.buffer[t]>>>7-r%8&1)===1},put:function(r,t){for(let e=0;e<t;e++)this.putBit((r>>>t-e-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(r){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),r&&(this.buffer[t]|=128>>>this.length%8),this.length++}};ai.exports=si});var ui=W((pd,ci)=>{function ee(r){if(!r||r<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=r,this.data=new Uint8Array(r*r),this.reservedBit=new Uint8Array(r*r)}ee.prototype.set=function(r,t,e,i){let n=r*this.size+t;this.data[n]=e,i&&(this.reservedBit[n]=!0)};ee.prototype.get=function(r,t){return this.data[r*this.size+t]};ee.prototype.xor=function(r,t,e){this.data[r*this.size+t]^=e};ee.prototype.isReserved=function(r,t){return this.reservedBit[r*this.size+t]};ci.exports=ee});var di=W(Te=>{var Mr=gt().getSymbolSize;Te.getRowColCoords=function(t){if(t===1)return[];let e=Math.floor(t/7)+2,i=Mr(t),n=i===145?26:Math.ceil((i-13)/(2*e-2))*2,o=[i-7];for(let s=1;s<e-1;s++)o[s]=o[s-1]-n;return o.push(6),o.reverse()};Te.getPositions=function(t){let e=[],i=Te.getRowColCoords(t),n=i.length;for(let o=0;o<n;o++)for(let s=0;s<n;s++)o===0&&s===0||o===0&&s===n-1||o===n-1&&s===0||e.push([i[o],i[s]]);return e}});var mi=W(hi=>{var qr=gt().getSymbolSize,pi=7;hi.getPositions=function(t){let e=qr(t);return[[0,0],[e-pi,0],[0,e-pi]]}});var fi=W(O=>{O.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var Wt={N1:3,N2:3,N3:40,N4:10};O.isValid=function(t){return t!=null&&t!==""&&!isNaN(t)&&t>=0&&t<=7};O.from=function(t){return O.isValid(t)?parseInt(t,10):void 0};O.getPenaltyN1=function(t){let e=t.size,i=0,n=0,o=0,s=null,a=null;for(let u=0;u<e;u++){n=o=0,s=a=null;for(let b=0;b<e;b++){let w=t.get(u,b);w===s?n++:(n>=5&&(i+=Wt.N1+(n-5)),s=w,n=1),w=t.get(b,u),w===a?o++:(o>=5&&(i+=Wt.N1+(o-5)),a=w,o=1)}n>=5&&(i+=Wt.N1+(n-5)),o>=5&&(i+=Wt.N1+(o-5))}return i};O.getPenaltyN2=function(t){let e=t.size,i=0;for(let n=0;n<e-1;n++)for(let o=0;o<e-1;o++){let s=t.get(n,o)+t.get(n,o+1)+t.get(n+1,o)+t.get(n+1,o+1);(s===4||s===0)&&i++}return i*Wt.N2};O.getPenaltyN3=function(t){let e=t.size,i=0,n=0,o=0;for(let s=0;s<e;s++){n=o=0;for(let a=0;a<e;a++)n=n<<1&2047|t.get(s,a),a>=10&&(n===1488||n===93)&&i++,o=o<<1&2047|t.get(a,s),a>=10&&(o===1488||o===93)&&i++}return i*Wt.N3};O.getPenaltyN4=function(t){let e=0,i=t.data.length;for(let o=0;o<i;o++)e+=t.data[o];return Math.abs(Math.ceil(e*100/i/5)-10)*Wt.N4};function Fr(r,t,e){switch(r){case O.Patterns.PATTERN000:return(t+e)%2===0;case O.Patterns.PATTERN001:return t%2===0;case O.Patterns.PATTERN010:return e%3===0;case O.Patterns.PATTERN011:return(t+e)%3===0;case O.Patterns.PATTERN100:return(Math.floor(t/2)+Math.floor(e/3))%2===0;case O.Patterns.PATTERN101:return t*e%2+t*e%3===0;case O.Patterns.PATTERN110:return(t*e%2+t*e%3)%2===0;case O.Patterns.PATTERN111:return(t*e%3+(t+e)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}O.applyMask=function(t,e){let i=e.size;for(let n=0;n<i;n++)for(let o=0;o<i;o++)e.isReserved(o,n)||e.xor(o,n,Fr(t,o,n))};O.getBestMask=function(t,e){let i=Object.keys(O.Patterns).length,n=0,o=1/0;for(let s=0;s<i;s++){e(s),O.applyMask(s,t);let a=O.getPenaltyN1(t)+O.getPenaltyN2(t)+O.getPenaltyN3(t)+O.getPenaltyN4(t);O.applyMask(s,t),a<o&&(o=a,n=s)}return n}});var ro=W(io=>{var wt=Se(),Le=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],Be=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];io.getBlocksCount=function(t,e){switch(e){case wt.L:return Le[(t-1)*4+0];case wt.M:return Le[(t-1)*4+1];case wt.Q:return Le[(t-1)*4+2];case wt.H:return Le[(t-1)*4+3];default:return}};io.getTotalCodewordsCount=function(t,e){switch(e){case wt.L:return Be[(t-1)*4+0];case wt.M:return Be[(t-1)*4+1];case wt.Q:return Be[(t-1)*4+2];case wt.H:return Be[(t-1)*4+3];default:return}}});var gi=W(Pe=>{var oe=new Uint8Array(512),Oe=new Uint8Array(256);(function(){let t=1;for(let e=0;e<255;e++)oe[e]=t,Oe[t]=e,t<<=1,t&256&&(t^=285);for(let e=255;e<512;e++)oe[e]=oe[e-255]})();Pe.log=function(t){if(t<1)throw new Error("log("+t+")");return Oe[t]};Pe.exp=function(t){return oe[t]};Pe.mul=function(t,e){return t===0||e===0?0:oe[Oe[t]+Oe[e]]}});var wi=W(ie=>{var no=gi();ie.mul=function(t,e){let i=new Uint8Array(t.length+e.length-1);for(let n=0;n<t.length;n++)for(let o=0;o<e.length;o++)i[n+o]^=no.mul(t[n],e[o]);return i};ie.mod=function(t,e){let i=new Uint8Array(t);for(;i.length-e.length>=0;){let n=i[0];for(let s=0;s<e.length;s++)i[s]^=no.mul(e[s],n);let o=0;for(;o<i.length&&i[o]===0;)o++;i=i.slice(o)}return i};ie.generateECPolynomial=function(t){let e=new Uint8Array([1]);for(let i=0;i<t;i++)e=ie.mul(e,new Uint8Array([1,no.exp(i)]));return e}});var xi=W((vd,vi)=>{var bi=wi();function so(r){this.genPoly=void 0,this.degree=r,this.degree&&this.initialize(this.degree)}so.prototype.initialize=function(t){this.degree=t,this.genPoly=bi.generateECPolynomial(this.degree)};so.prototype.encode=function(t){if(!this.genPoly)throw new Error("Encoder not initialized");let e=new Uint8Array(t.length+this.degree);e.set(t);let i=bi.mod(e,this.genPoly),n=this.degree-i.length;if(n>0){let o=new Uint8Array(this.degree);return o.set(i,n),o}return i};vi.exports=so});var ao=W(yi=>{yi.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40}});var lo=W(ct=>{var Ci="[0-9]+",Vr="[A-Z $%*+\\-./:]+",re="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";re=re.replace(/u/g,"\\u");var Hr="(?:(?![A-Z0-9 $%*+\\-./:]|"+re+`)(?:.|[\r
]))+`;ct.KANJI=new RegExp(re,"g");ct.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g");ct.BYTE=new RegExp(Hr,"g");ct.NUMERIC=new RegExp(Ci,"g");ct.ALPHANUMERIC=new RegExp(Vr,"g");var Kr=new RegExp("^"+re+"$"),Gr=new RegExp("^"+Ci+"$"),Yr=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");ct.testKanji=function(t){return Kr.test(t)};ct.testNumeric=function(t){return Gr.test(t)};ct.testAlphanumeric=function(t){return Yr.test(t)}});var bt=W(j=>{var Jr=ao(),co=lo();j.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]};j.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]};j.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]};j.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]};j.MIXED={bit:-1};j.getCharCountIndicator=function(t,e){if(!t.ccBits)throw new Error("Invalid mode: "+t);if(!Jr.isValid(e))throw new Error("Invalid version: "+e);return e>=1&&e<10?t.ccBits[0]:e<27?t.ccBits[1]:t.ccBits[2]};j.getBestModeForData=function(t){return co.testNumeric(t)?j.NUMERIC:co.testAlphanumeric(t)?j.ALPHANUMERIC:co.testKanji(t)?j.KANJI:j.BYTE};j.toString=function(t){if(t&&t.id)return t.id;throw new Error("Invalid mode")};j.isValid=function(t){return t&&t.bit&&t.ccBits};function Qr(r){if(typeof r!="string")throw new Error("Param is not a string");switch(r.toLowerCase()){case"numeric":return j.NUMERIC;case"alphanumeric":return j.ALPHANUMERIC;case"kanji":return j.KANJI;case"byte":return j.BYTE;default:throw new Error("Unknown mode: "+r)}}j.from=function(t,e){if(j.isValid(t))return t;try{return Qr(t)}catch{return e}}});var Ii=W(St=>{var Ae=gt(),Xr=ro(),Ei=Se(),vt=bt(),uo=ao(),$i=7973,Ri=Ae.getBCHDigit($i);function Zr(r,t,e){for(let i=1;i<=40;i++)if(t<=St.getCapacity(i,e,r))return i}function _i(r,t){return vt.getCharCountIndicator(r,t)+4}function tn(r,t){let e=0;return r.forEach(function(i){let n=_i(i.mode,t);e+=n+i.getBitsLength()}),e}function en(r,t){for(let e=1;e<=40;e++)if(tn(r,e)<=St.getCapacity(e,t,vt.MIXED))return e}St.from=function(t,e){return uo.isValid(t)?parseInt(t,10):e};St.getCapacity=function(t,e,i){if(!uo.isValid(t))throw new Error("Invalid QR Code version");typeof i>"u"&&(i=vt.BYTE);let n=Ae.getSymbolTotalCodewords(t),o=Xr.getTotalCodewordsCount(t,e),s=(n-o)*8;if(i===vt.MIXED)return s;let a=s-_i(i,t);switch(i){case vt.NUMERIC:return Math.floor(a/10*3);case vt.ALPHANUMERIC:return Math.floor(a/11*2);case vt.KANJI:return Math.floor(a/13);case vt.BYTE:default:return Math.floor(a/8)}};St.getBestVersionForData=function(t,e){let i,n=Ei.from(e,Ei.M);if(Array.isArray(t)){if(t.length>1)return en(t,n);if(t.length===0)return 1;i=t[0]}else i=t;return Zr(i.mode,i.getLength(),n)};St.getEncodedBits=function(t){if(!uo.isValid(t)||t<7)throw new Error("Invalid QR Code version");let e=t<<12;for(;Ae.getBCHDigit(e)-Ri>=0;)e^=$i<<Ae.getBCHDigit(e)-Ri;return t<<12|e}});var Li=W(Ti=>{var po=gt(),Si=1335,on=21522,Wi=po.getBCHDigit(Si);Ti.getEncodedBits=function(t,e){let i=t.bit<<3|e,n=i<<10;for(;po.getBCHDigit(n)-Wi>=0;)n^=Si<<po.getBCHDigit(n)-Wi;return(i<<10|n)^on}});var Oi=W(($d,Bi)=>{var rn=bt();function kt(r){this.mode=rn.NUMERIC,this.data=r.toString()}kt.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)};kt.prototype.getLength=function(){return this.data.length};kt.prototype.getBitsLength=function(){return kt.getBitsLength(this.data.length)};kt.prototype.write=function(t){let e,i,n;for(e=0;e+3<=this.data.length;e+=3)i=this.data.substr(e,3),n=parseInt(i,10),t.put(n,10);let o=this.data.length-e;o>0&&(i=this.data.substr(e),n=parseInt(i,10),t.put(n,o*3+1))};Bi.exports=kt});var Ai=W((_d,Pi)=>{var nn=bt(),ho=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function zt(r){this.mode=nn.ALPHANUMERIC,this.data=r}zt.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)};zt.prototype.getLength=function(){return this.data.length};zt.prototype.getBitsLength=function(){return zt.getBitsLength(this.data.length)};zt.prototype.write=function(t){let e;for(e=0;e+2<=this.data.length;e+=2){let i=ho.indexOf(this.data[e])*45;i+=ho.indexOf(this.data[e+1]),t.put(i,11)}this.data.length%2&&t.put(ho.indexOf(this.data[e]),6)};Pi.exports=zt});var ji=W((Id,Di)=>{"use strict";Di.exports=function(t){for(var e=[],i=t.length,n=0;n<i;n++){var o=t.charCodeAt(n);if(o>=55296&&o<=56319&&i>n+1){var s=t.charCodeAt(n+1);s>=56320&&s<=57343&&(o=(o-55296)*1024+s-56320+65536,n+=1)}if(o<128){e.push(o);continue}if(o<2048){e.push(o>>6|192),e.push(o&63|128);continue}if(o<55296||o>=57344&&o<65536){e.push(o>>12|224),e.push(o>>6&63|128),e.push(o&63|128);continue}if(o>=65536&&o<=1114111){e.push(o>>18|240),e.push(o>>12&63|128),e.push(o>>6&63|128),e.push(o&63|128);continue}e.push(239,191,189)}return new Uint8Array(e).buffer}});var zi=W((Wd,ki)=>{var sn=ji(),an=bt();function Ut(r){this.mode=an.BYTE,typeof r=="string"&&(r=sn(r)),this.data=new Uint8Array(r)}Ut.getBitsLength=function(t){return t*8};Ut.prototype.getLength=function(){return this.data.length};Ut.prototype.getBitsLength=function(){return Ut.getBitsLength(this.data.length)};Ut.prototype.write=function(r){for(let t=0,e=this.data.length;t<e;t++)r.put(this.data[t],8)};ki.exports=Ut});var Ni=W((Sd,Ui)=>{var ln=bt(),cn=gt();function Nt(r){this.mode=ln.KANJI,this.data=r}Nt.getBitsLength=function(t){return t*13};Nt.prototype.getLength=function(){return this.data.length};Nt.prototype.getBitsLength=function(){return Nt.getBitsLength(this.data.length)};Nt.prototype.write=function(r){let t;for(t=0;t<this.data.length;t++){let e=cn.toSJIS(this.data[t]);if(e>=33088&&e<=40956)e-=33088;else if(e>=57408&&e<=60351)e-=49472;else throw new Error("Invalid SJIS character: "+this.data[t]+`
Make sure your charset is UTF-8`);e=(e>>>8&255)*192+(e&255),r.put(e,13)}};Ui.exports=Nt});var Mi=W((Td,mo)=>{"use strict";var ne={single_source_shortest_paths:function(r,t,e){var i={},n={};n[t]=0;var o=ne.PriorityQueue.make();o.push(t,0);for(var s,a,u,b,w,C,$,F,M;!o.empty();){s=o.pop(),a=s.value,b=s.cost,w=r[a]||{};for(u in w)w.hasOwnProperty(u)&&(C=w[u],$=b+C,F=n[u],M=typeof n[u]>"u",(M||F>$)&&(n[u]=$,o.push(u,$),i[u]=a))}if(typeof e<"u"&&typeof n[e]>"u"){var S=["Could not find a path from ",t," to ",e,"."].join("");throw new Error(S)}return i},extract_shortest_path_from_predecessor_list:function(r,t){for(var e=[],i=t,n;i;)e.push(i),n=r[i],i=r[i];return e.reverse(),e},find_path:function(r,t,e){var i=ne.single_source_shortest_paths(r,t,e);return ne.extract_shortest_path_from_predecessor_list(i,e)},PriorityQueue:{make:function(r){var t=ne.PriorityQueue,e={},i;r=r||{};for(i in t)t.hasOwnProperty(i)&&(e[i]=t[i]);return e.queue=[],e.sorter=r.sorter||t.default_sorter,e},default_sorter:function(r,t){return r.cost-t.cost},push:function(r,t){var e={value:r,cost:t};this.queue.push(e),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};typeof mo<"u"&&(mo.exports=ne)});var Ji=W(Mt=>{var I=bt(),Vi=Oi(),Hi=Ai(),Ki=zi(),Gi=Ni(),se=lo(),De=gt(),un=Mi();function qi(r){return unescape(encodeURIComponent(r)).length}function ae(r,t,e){let i=[],n;for(;(n=r.exec(e))!==null;)i.push({data:n[0],index:n.index,mode:t,length:n[0].length});return i}function Yi(r){let t=ae(se.NUMERIC,I.NUMERIC,r),e=ae(se.ALPHANUMERIC,I.ALPHANUMERIC,r),i,n;return De.isKanjiModeEnabled()?(i=ae(se.BYTE,I.BYTE,r),n=ae(se.KANJI,I.KANJI,r)):(i=ae(se.BYTE_KANJI,I.BYTE,r),n=[]),t.concat(e,i,n).sort(function(s,a){return s.index-a.index}).map(function(s){return{data:s.data,mode:s.mode,length:s.length}})}function fo(r,t){switch(t){case I.NUMERIC:return Vi.getBitsLength(r);case I.ALPHANUMERIC:return Hi.getBitsLength(r);case I.KANJI:return Gi.getBitsLength(r);case I.BYTE:return Ki.getBitsLength(r)}}function dn(r){return r.reduce(function(t,e){let i=t.length-1>=0?t[t.length-1]:null;return i&&i.mode===e.mode?(t[t.length-1].data+=e.data,t):(t.push(e),t)},[])}function pn(r){let t=[];for(let e=0;e<r.length;e++){let i=r[e];switch(i.mode){case I.NUMERIC:t.push([i,{data:i.data,mode:I.ALPHANUMERIC,length:i.length},{data:i.data,mode:I.BYTE,length:i.length}]);break;case I.ALPHANUMERIC:t.push([i,{data:i.data,mode:I.BYTE,length:i.length}]);break;case I.KANJI:t.push([i,{data:i.data,mode:I.BYTE,length:qi(i.data)}]);break;case I.BYTE:t.push([{data:i.data,mode:I.BYTE,length:qi(i.data)}])}}return t}function hn(r,t){let e={},i={start:{}},n=["start"];for(let o=0;o<r.length;o++){let s=r[o],a=[];for(let u=0;u<s.length;u++){let b=s[u],w=""+o+u;a.push(w),e[w]={node:b,lastCount:0},i[w]={};for(let C=0;C<n.length;C++){let $=n[C];e[$]&&e[$].node.mode===b.mode?(i[$][w]=fo(e[$].lastCount+b.length,b.mode)-fo(e[$].lastCount,b.mode),e[$].lastCount+=b.length):(e[$]&&(e[$].lastCount=b.length),i[$][w]=fo(b.length,b.mode)+4+I.getCharCountIndicator(b.mode,t))}}n=a}for(let o=0;o<n.length;o++)i[n[o]].end=0;return{map:i,table:e}}function Fi(r,t){let e,i=I.getBestModeForData(r);if(e=I.from(t,i),e!==I.BYTE&&e.bit<i.bit)throw new Error('"'+r+'" cannot be encoded with mode '+I.toString(e)+`.
 Suggested mode is: `+I.toString(i));switch(e===I.KANJI&&!De.isKanjiModeEnabled()&&(e=I.BYTE),e){case I.NUMERIC:return new Vi(r);case I.ALPHANUMERIC:return new Hi(r);case I.KANJI:return new Gi(r);case I.BYTE:return new Ki(r)}}Mt.fromArray=function(t){return t.reduce(function(e,i){return typeof i=="string"?e.push(Fi(i,null)):i.data&&e.push(Fi(i.data,i.mode)),e},[])};Mt.fromString=function(t,e){let i=Yi(t,De.isKanjiModeEnabled()),n=pn(i),o=hn(n,e),s=un.find_path(o.map,"start","end"),a=[];for(let u=1;u<s.length-1;u++)a.push(o.table[s[u]].node);return Mt.fromArray(dn(a))};Mt.rawSplit=function(t){return Mt.fromArray(Yi(t,De.isKanjiModeEnabled()))}});var Xi=W(Qi=>{var ke=gt(),go=Se(),mn=li(),fn=ui(),gn=di(),wn=mi(),vo=fi(),xo=ro(),bn=xi(),je=Ii(),vn=Li(),xn=bt(),wo=Ji();function yn(r,t){let e=r.size,i=wn.getPositions(t);for(let n=0;n<i.length;n++){let o=i[n][0],s=i[n][1];for(let a=-1;a<=7;a++)if(!(o+a<=-1||e<=o+a))for(let u=-1;u<=7;u++)s+u<=-1||e<=s+u||(a>=0&&a<=6&&(u===0||u===6)||u>=0&&u<=6&&(a===0||a===6)||a>=2&&a<=4&&u>=2&&u<=4?r.set(o+a,s+u,!0,!0):r.set(o+a,s+u,!1,!0))}}function Cn(r){let t=r.size;for(let e=8;e<t-8;e++){let i=e%2===0;r.set(e,6,i,!0),r.set(6,e,i,!0)}}function En(r,t){let e=gn.getPositions(t);for(let i=0;i<e.length;i++){let n=e[i][0],o=e[i][1];for(let s=-2;s<=2;s++)for(let a=-2;a<=2;a++)s===-2||s===2||a===-2||a===2||s===0&&a===0?r.set(n+s,o+a,!0,!0):r.set(n+s,o+a,!1,!0)}}function Rn(r,t){let e=r.size,i=je.getEncodedBits(t),n,o,s;for(let a=0;a<18;a++)n=Math.floor(a/3),o=a%3+e-8-3,s=(i>>a&1)===1,r.set(n,o,s,!0),r.set(o,n,s,!0)}function bo(r,t,e){let i=r.size,n=vn.getEncodedBits(t,e),o,s;for(o=0;o<15;o++)s=(n>>o&1)===1,o<6?r.set(o,8,s,!0):o<8?r.set(o+1,8,s,!0):r.set(i-15+o,8,s,!0),o<8?r.set(8,i-o-1,s,!0):o<9?r.set(8,15-o-1+1,s,!0):r.set(8,15-o-1,s,!0);r.set(i-8,8,1,!0)}function $n(r,t){let e=r.size,i=-1,n=e-1,o=7,s=0;for(let a=e-1;a>0;a-=2)for(a===6&&a--;;){for(let u=0;u<2;u++)if(!r.isReserved(n,a-u)){let b=!1;s<t.length&&(b=(t[s]>>>o&1)===1),r.set(n,a-u,b),o--,o===-1&&(s++,o=7)}if(n+=i,n<0||e<=n){n-=i,i=-i;break}}}function _n(r,t,e){let i=new mn;e.forEach(function(u){i.put(u.mode.bit,4),i.put(u.getLength(),xn.getCharCountIndicator(u.mode,r)),u.write(i)});let n=ke.getSymbolTotalCodewords(r),o=xo.getTotalCodewordsCount(r,t),s=(n-o)*8;for(i.getLengthInBits()+4<=s&&i.put(0,4);i.getLengthInBits()%8!==0;)i.putBit(0);let a=(s-i.getLengthInBits())/8;for(let u=0;u<a;u++)i.put(u%2?17:236,8);return In(i,r,t)}function In(r,t,e){let i=ke.getSymbolTotalCodewords(t),n=xo.getTotalCodewordsCount(t,e),o=i-n,s=xo.getBlocksCount(t,e),a=i%s,u=s-a,b=Math.floor(i/s),w=Math.floor(o/s),C=w+1,$=b-w,F=new bn($),M=0,S=new Array(s),_=new Array(s),k=0,T=new Uint8Array(r.buffer);for(let Ot=0;Ot<s;Ot++){let He=Ot<u?w:C;S[Ot]=T.slice(M,M+He),_[Ot]=F.encode(S[Ot]),M+=He,k=Math.max(k,He)}let z=new Uint8Array(i),A=0,D,nt;for(D=0;D<k;D++)for(nt=0;nt<s;nt++)D<S[nt].length&&(z[A++]=S[nt][D]);for(D=0;D<$;D++)for(nt=0;nt<s;nt++)z[A++]=_[nt][D];return z}function Wn(r,t,e,i){let n;if(Array.isArray(r))n=wo.fromArray(r);else if(typeof r=="string"){let b=t;if(!b){let w=wo.rawSplit(r);b=je.getBestVersionForData(w,e)}n=wo.fromString(r,b||40)}else throw new Error("Invalid data");let o=je.getBestVersionForData(n,e);if(!o)throw new Error("The amount of data is too big to be stored in a QR Code");if(!t)t=o;else if(t<o)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+o+`.
`);let s=_n(t,e,n),a=ke.getSymbolSize(t),u=new fn(a);return yn(u,t),Cn(u),En(u,t),bo(u,e,0),t>=7&&Rn(u,t),$n(u,s),isNaN(i)&&(i=vo.getBestMask(u,bo.bind(null,u,e))),vo.applyMask(i,u),bo(u,e,i),{modules:u,version:t,errorCorrectionLevel:e,maskPattern:i,segments:n}}Qi.create=function(t,e){if(typeof t>"u"||t==="")throw new Error("No input text");let i=go.M,n,o;return typeof e<"u"&&(i=go.from(e.errorCorrectionLevel,go.M),n=je.from(e.version),o=vo.from(e.maskPattern),e.toSJISFunc&&ke.setToSJISFunction(e.toSJISFunc)),Wn(t,n,i,o)}});var yo=W(Tt=>{function Zi(r){if(typeof r=="number"&&(r=r.toString()),typeof r!="string")throw new Error("Color should be defined as hex string");let t=r.slice().replace("#","").split("");if(t.length<3||t.length===5||t.length>8)throw new Error("Invalid hex color: "+r);(t.length===3||t.length===4)&&(t=Array.prototype.concat.apply([],t.map(function(i){return[i,i]}))),t.length===6&&t.push("F","F");let e=parseInt(t.join(""),16);return{r:e>>24&255,g:e>>16&255,b:e>>8&255,a:e&255,hex:"#"+t.slice(0,6).join("")}}Tt.getOptions=function(t){t||(t={}),t.color||(t.color={});let e=typeof t.margin>"u"||t.margin===null||t.margin<0?4:t.margin,i=t.width&&t.width>=21?t.width:void 0,n=t.scale||4;return{width:i,scale:i?4:n,margin:e,color:{dark:Zi(t.color.dark||"#000000ff"),light:Zi(t.color.light||"#ffffffff")},type:t.type,rendererOpts:t.rendererOpts||{}}};Tt.getScale=function(t,e){return e.width&&e.width>=t+e.margin*2?e.width/(t+e.margin*2):e.scale};Tt.getImageWidth=function(t,e){let i=Tt.getScale(t,e);return Math.floor((t+e.margin*2)*i)};Tt.qrToImageData=function(t,e,i){let n=e.modules.size,o=e.modules.data,s=Tt.getScale(n,i),a=Math.floor((n+i.margin*2)*s),u=i.margin*s,b=[i.color.light,i.color.dark];for(let w=0;w<a;w++)for(let C=0;C<a;C++){let $=(w*a+C)*4,F=i.color.light;if(w>=u&&C>=u&&w<a-u&&C<a-u){let M=Math.floor((w-u)/s),S=Math.floor((C-u)/s);F=b[o[M*n+S]?1:0]}t[$++]=F.r,t[$++]=F.g,t[$++]=F.b,t[$]=F.a}}});var tr=W(ze=>{var Co=yo();function Sn(r,t,e){r.clearRect(0,0,t.width,t.height),t.style||(t.style={}),t.height=e,t.width=e,t.style.height=e+"px",t.style.width=e+"px"}function Tn(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}ze.render=function(t,e,i){let n=i,o=e;typeof n>"u"&&(!e||!e.getContext)&&(n=e,e=void 0),e||(o=Tn()),n=Co.getOptions(n);let s=Co.getImageWidth(t.modules.size,n),a=o.getContext("2d"),u=a.createImageData(s,s);return Co.qrToImageData(u.data,t,n),Sn(a,o,s),a.putImageData(u,0,0),o};ze.renderToDataURL=function(t,e,i){let n=i;typeof n>"u"&&(!e||!e.getContext)&&(n=e,e=void 0),n||(n={});let o=ze.render(t,e,n),s=n.type||"image/png",a=n.rendererOpts||{};return o.toDataURL(s,a.quality)}});var ir=W(or=>{var Ln=yo();function er(r,t){let e=r.a/255,i=t+'="'+r.hex+'"';return e<1?i+" "+t+'-opacity="'+e.toFixed(2).slice(1)+'"':i}function Eo(r,t,e){let i=r+t;return typeof e<"u"&&(i+=" "+e),i}function Bn(r,t,e){let i="",n=0,o=!1,s=0;for(let a=0;a<r.length;a++){let u=Math.floor(a%t),b=Math.floor(a/t);!u&&!o&&(o=!0),r[a]?(s++,a>0&&u>0&&r[a-1]||(i+=o?Eo("M",u+e,.5+b+e):Eo("m",n,0),n=0,o=!1),u+1<t&&r[a+1]||(i+=Eo("h",s),s=0)):n++}return i}or.render=function(t,e,i){let n=Ln.getOptions(e),o=t.modules.size,s=t.modules.data,a=o+n.margin*2,u=n.color.light.a?"<path "+er(n.color.light,"fill")+' d="M0 0h'+a+"v"+a+'H0z"/>':"",b="<path "+er(n.color.dark,"stroke")+' d="'+Bn(s,o,n.margin)+'"/>',w='viewBox="0 0 '+a+" "+a+'"',$='<svg xmlns="http://www.w3.org/2000/svg" '+(n.width?'width="'+n.width+'" height="'+n.width+'" ':"")+w+' shape-rendering="crispEdges">'+u+b+`</svg>
`;return typeof i=="function"&&i(null,$),$}});var nr=W(le=>{var On=ni(),Ro=Xi(),rr=tr(),Pn=ir();function $o(r,t,e,i,n){let o=[].slice.call(arguments,1),s=o.length,a=typeof o[s-1]=="function";if(!a&&!On())throw new Error("Callback required as last argument");if(a){if(s<2)throw new Error("Too few arguments provided");s===2?(n=e,e=t,t=i=void 0):s===3&&(t.getContext&&typeof n>"u"?(n=i,i=void 0):(n=i,i=e,e=t,t=void 0))}else{if(s<1)throw new Error("Too few arguments provided");return s===1?(e=t,t=i=void 0):s===2&&!t.getContext&&(i=e,e=t,t=void 0),new Promise(function(u,b){try{let w=Ro.create(e,i);u(r(w,t,i))}catch(w){b(w)}})}try{let u=Ro.create(e,i);n(null,r(u,t,i))}catch(u){n(u)}}le.create=Ro.create;le.toCanvas=$o.bind(null,rr.render);le.toDataURL=$o.bind(null,rr.renderToDataURL);le.toString=$o.bind(null,function(r,t,e){return Pn.render(r,e)})});var Uo=g`
  :host {
    position: relative;
    background-color: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-size);
    height: var(--local-size);
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host > wui-flex {
    overflow: hidden;
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host([name='Extension'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  :host([data-wallet-icon='allWallets']) {
    background-color: var(--wui-all-wallets-bg-100);
  }

  :host([data-wallet-icon='allWallets'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  wui-icon[data-parent-size='inherit'] {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  wui-icon[data-parent-size='sm'] {
    width: 18px;
    height: 18px;
  }

  wui-icon[data-parent-size='md'] {
    width: 24px;
    height: 24px;
  }

  wui-icon[data-parent-size='lg'] {
    width: 42px;
    height: 42px;
  }

  wui-icon[data-parent-size='full'] {
    width: 100%;
    height: 100%;
  }

  :host > wui-icon-box {
    position: absolute;
    overflow: hidden;
    right: -1px;
    bottom: -2px;
    z-index: 1;
    border: 2px solid var(--wui-color-bg-150, #1e1f1f);
    padding: 1px;
  }
`;var Ct=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},at=class extends p{constructor(){super(...arguments),this.size="md",this.name="",this.installed=!1,this.badgeSize="xs"}render(){let t="xxs";return this.size==="lg"?t="m":this.size==="md"?t="xs":t="xxs",this.style.cssText=`
       --local-border-radius: var(--wui-border-radius-${t});
       --local-size: var(--wui-wallet-image-size-${this.size});
   `,this.walletIcon&&(this.dataset.walletIcon=this.walletIcon),l`
      <wui-flex justifyContent="center" alignItems="center"> ${this.templateVisual()} </wui-flex>
    `}templateVisual(){return this.imageSrc?l`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:this.walletIcon?l`<wui-icon
        data-parent-size="md"
        size="md"
        color="inherit"
        name=${this.walletIcon}
      ></wui-icon>`:l`<wui-icon
      data-parent-size=${this.size}
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`}};at.styles=[L,y,Uo];Ct([c()],at.prototype,"size",void 0);Ct([c()],at.prototype,"name",void 0);Ct([c()],at.prototype,"imageSrc",void 0);Ct([c()],at.prototype,"walletIcon",void 0);Ct([c({type:Boolean})],at.prototype,"installed",void 0);Ct([c()],at.prototype,"badgeSize",void 0);at=Ct([d("wui-wallet-image")],at);var No=g`
  :host {
    position: relative;
    border-radius: var(--wui-border-radius-xxs);
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wui-spacing-4xs);
    padding: 3.75px !important;
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host > wui-wallet-image {
    width: 14px;
    height: 14px;
    border-radius: var(--wui-border-radius-5xs);
  }

  :host > wui-flex {
    padding: 2px;
    position: fixed;
    overflow: hidden;
    left: 34px;
    bottom: 8px;
    background: var(--dark-background-150, #1e1f1f);
    border-radius: 50%;
    z-index: 2;
    display: flex;
  }
`;var Mo=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Ye=4,me=class extends p{constructor(){super(...arguments),this.walletImages=[]}render(){let t=this.walletImages.length<Ye;return l`${this.walletImages.slice(0,Ye).map(({src:e,walletName:i})=>l`
            <wui-wallet-image
              size="inherit"
              imageSrc=${e}
              name=${h(i)}
            ></wui-wallet-image>
          `)}
      ${t?[...Array(Ye-this.walletImages.length)].map(()=>l` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`):null}
      <wui-flex>
        <wui-icon-box
          size="xxs"
          iconSize="xxs"
          iconcolor="success-100"
          backgroundcolor="success-100"
          icon="checkmark"
          background="opaque"
        ></wui-icon-box>
      </wui-flex>`}};me.styles=[y,No];Mo([c({type:Array})],me.prototype,"walletImages",void 0);me=Mo([d("wui-all-wallets-image")],me);var qo=g`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 7px var(--wui-spacing-l) 7px var(--wui-spacing-xs);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-100);
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled {
    background-color: var(--wui-color-gray-glass-015);
    color: var(--wui-color-gray-glass-015);
  }

  button:disabled > wui-tag {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-300);
  }

  wui-icon {
    color: var(--wui-color-fg-200) !important;
  }
`;var V=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},q=class extends p{constructor(){super(...arguments),this.walletImages=[],this.imageSrc="",this.name="",this.tabIdx=void 0,this.installed=!1,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100"}render(){return l`
      <button ?disabled=${this.disabled} tabindex=${h(this.tabIdx)}>
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-text variant="paragraph-500" color="inherit">${this.name}</wui-text>
        ${this.templateStatus()}
      </button>
    `}templateAllWallets(){return this.showAllWallets&&this.imageSrc?l` <wui-all-wallets-image .imageeSrc=${this.imageSrc}> </wui-all-wallets-image> `:this.showAllWallets&&this.walletIcon?l` <wui-wallet-image .walletIcon=${this.walletIcon} size="sm"> </wui-wallet-image> `:null}templateWalletImage(){return!this.showAllWallets&&this.imageSrc?l`<wui-wallet-image
        size="sm"
        imageSrc=${this.imageSrc}
        name=${this.name}
        .installed=${this.installed}
      ></wui-wallet-image>`:!this.showAllWallets&&!this.imageSrc?l`<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`:null}templateStatus(){return this.loading?l`<wui-loading-spinner
        size="lg"
        color=${this.loadingSpinnerColor}
      ></wui-loading-spinner>`:this.tagLabel&&this.tagVariant?l`<wui-tag variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`:this.icon?l`<wui-icon color="inherit" size="sm" name=${this.icon}></wui-icon>`:null}};q.styles=[y,L,qo];V([c({type:Array})],q.prototype,"walletImages",void 0);V([c()],q.prototype,"imageSrc",void 0);V([c()],q.prototype,"name",void 0);V([c()],q.prototype,"tagLabel",void 0);V([c()],q.prototype,"tagVariant",void 0);V([c()],q.prototype,"icon",void 0);V([c()],q.prototype,"walletIcon",void 0);V([c()],q.prototype,"tabIdx",void 0);V([c({type:Boolean})],q.prototype,"installed",void 0);V([c({type:Boolean})],q.prototype,"disabled",void 0);V([c({type:Boolean})],q.prototype,"showAllWallets",void 0);V([c({type:Boolean})],q.prototype,"loading",void 0);V([c({type:String})],q.prototype,"loadingSpinnerColor",void 0);q=V([d("wui-list-wallet")],q);var Pt=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Et=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.count=R.state.count,this.filteredCount=R.state.filteredWallets.length,this.isFetchingRecommendedWallets=R.state.isFetchingRecommendedWallets,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t),R.subscribeKey("count",t=>this.count=t),R.subscribeKey("filteredWallets",t=>this.filteredCount=t.length),R.subscribeKey("isFetchingRecommendedWallets",t=>this.isFetchingRecommendedWallets=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.find(u=>u.id==="walletConnect"),{allWallets:e}=N.state;if(!t||e==="HIDE"||e==="ONLY_MOBILE"&&!f.isMobile())return null;let i=R.state.featured.length,n=this.count+i,o=n<10?n:Math.floor(n/10)*10,s=this.filteredCount>0?this.filteredCount:o,a=`${s}`;return this.filteredCount>0?a=`${this.filteredCount}`:s<n&&(a=`${s}+`),l`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${a}
        tagVariant="shade"
        data-testid="all-wallets"
        tabIdx=${h(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        loadingSpinnerColor=${this.isFetchingRecommendedWallets?"fg-300":"accent-100"}
      ></wui-list-wallet>
    `}onAllWallets(){U.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),E.push("AllWallets")}};Pt([c()],Et.prototype,"tabIdx",void 0);Pt([m()],Et.prototype,"connectors",void 0);Pt([m()],Et.prototype,"count",void 0);Pt([m()],Et.prototype,"filteredCount",void 0);Pt([m()],Et.prototype,"isFetchingRecommendedWallets",void 0);Et=Pt([d("w3m-all-wallets-widget")],Et);var Je=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},fe=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.filter(e=>e.type==="ANNOUNCED");return t?.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${t.filter(st.showConnector).map(e=>l`
              <wui-list-wallet
                imageSrc=${h(B.getConnectorImage(e))}
                name=${e.name??"Unknown"}
                @click=${()=>this.onConnector(e)}
                tagVariant="success"
                tagLabel="installed"
                data-testid=${`wallet-selector-${e.id}`}
                .installed=${!0}
                tabIdx=${h(this.tabIdx)}
              >
              </wui-list-wallet>
            `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){t.id==="walletConnect"?f.isMobile()?E.push("AllWallets"):E.push("ConnectingWalletConnect"):E.push("ConnectingExternal",{connector:t})}};Je([c()],fe.prototype,"tabIdx",void 0);Je([m()],fe.prototype,"connectors",void 0);fe=Je([d("w3m-connect-announced-widget")],fe);var ge=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Jt=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.loading=!1,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t)),f.isTelegram()&&f.isIos()&&(this.loading=!x.state.wcUri,this.unsubscribe.push(x.subscribeKey("wcUri",t=>this.loading=!t)))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let{customWallets:t}=N.state;if(!t?.length)return this.style.cssText="display: none",null;let e=this.filterOutDuplicateWallets(t);return l`<wui-flex flexDirection="column" gap="xs">
      ${e.map(i=>l`
          <wui-list-wallet
            imageSrc=${h(B.getWalletImage(i))}
            name=${i.name??"Unknown"}
            @click=${()=>this.onConnectWallet(i)}
            data-testid=${`wallet-selector-${i.id}`}
            tabIdx=${h(this.tabIdx)}
            ?loading=${this.loading}
          >
          </wui-list-wallet>
        `)}
    </wui-flex>`}filterOutDuplicateWallets(t){let e=pt.getRecentWallets(),i=this.connectors.map(a=>a.info?.rdns).filter(Boolean),n=e.map(a=>a.rdns).filter(Boolean),o=i.concat(n);if(o.includes("io.metamask.mobile")&&f.isMobile()){let a=o.indexOf("io.metamask.mobile");o[a]="io.metamask"}return t.filter(a=>!o.includes(String(a?.rdns)))}onConnectWallet(t){this.loading||E.push("ConnectingWalletConnect",{wallet:t})}};ge([c()],Jt.prototype,"tabIdx",void 0);ge([m()],Jt.prototype,"connectors",void 0);ge([m()],Jt.prototype,"loading",void 0);Jt=ge([d("w3m-connect-custom-widget")],Jt);var Qe=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},we=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let i=this.connectors.filter(n=>n.type==="EXTERNAL").filter(st.showConnector).filter(n=>n.id!==Ao.CONNECTOR_ID.COINBASE_SDK);return i?.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${i.map(n=>l`
            <wui-list-wallet
              imageSrc=${h(B.getConnectorImage(n))}
              .installed=${!0}
              name=${n.name??"Unknown"}
              data-testid=${`wallet-selector-external-${n.id}`}
              @click=${()=>this.onConnector(n)}
              tabIdx=${h(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){E.push("ConnectingExternal",{connector:t})}};Qe([c()],we.prototype,"tabIdx",void 0);Qe([m()],we.prototype,"connectors",void 0);we=Qe([d("w3m-connect-external-widget")],we);var Xe=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},be=class extends p{constructor(){super(...arguments),this.tabIdx=void 0,this.wallets=[]}render(){return this.wallets.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${this.wallets.map(t=>l`
            <wui-list-wallet
              data-testid=${`wallet-selector-featured-${t.id}`}
              imageSrc=${h(B.getWalletImage(t))}
              name=${t.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tabIdx=${h(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){v.selectWalletConnector(t)}};Xe([c()],be.prototype,"tabIdx",void 0);Xe([c()],be.prototype,"wallets",void 0);be=Xe([d("w3m-connect-featured-widget")],be);var Ze=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},ve=class extends p{constructor(){super(...arguments),this.tabIdx=void 0,this.connectors=[]}render(){let t=this.connectors.filter(st.showConnector);return t.length===0?(this.style.cssText="display: none",null):l`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(e=>l`
            <wui-list-wallet
              imageSrc=${h(B.getConnectorImage(e))}
              .installed=${!0}
              name=${e.name??"Unknown"}
              tagVariant="success"
              tagLabel="installed"
              data-testid=${`wallet-selector-${e.id}`}
              @click=${()=>this.onConnector(e)}
              tabIdx=${h(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(t){v.setActiveConnector(t),E.push("ConnectingExternal",{connector:t})}};Ze([c()],ve.prototype,"tabIdx",void 0);Ze([c()],ve.prototype,"connectors",void 0);ve=Ze([d("w3m-connect-injected-widget")],ve);var to=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},xe=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.connectors.filter(e=>e.type==="MULTI_CHAIN"&&e.name!=="WalletConnect");return t?.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(e=>l`
            <wui-list-wallet
              imageSrc=${h(B.getConnectorImage(e))}
              .installed=${!0}
              name=${e.name??"Unknown"}
              tagVariant="shade"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${e.id}`}
              @click=${()=>this.onConnector(e)}
              tabIdx=${h(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){v.setActiveConnector(t),E.push("ConnectingMultiChain")}};to([c()],xe.prototype,"tabIdx",void 0);to([m()],xe.prototype,"connectors",void 0);xe=to([d("w3m-connect-multi-chain-widget")],xe);var ye=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Qt=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.loading=!1,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t)),f.isTelegram()&&f.isIos()&&(this.loading=!x.state.wcUri,this.unsubscribe.push(x.subscribeKey("wcUri",t=>this.loading=!t)))}render(){let e=pt.getRecentWallets().filter(i=>!ht.isExcluded(i)).filter(i=>!this.hasWalletConnector(i)).filter(i=>this.isWalletCompatibleWithCurrentChain(i));return e.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${e.map(i=>l`
            <wui-list-wallet
              imageSrc=${h(B.getWalletImage(i))}
              name=${i.name??"Unknown"}
              @click=${()=>this.onConnectWallet(i)}
              tagLabel="recent"
              tagVariant="shade"
              tabIdx=${h(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){this.loading||v.selectWalletConnector(t)}hasWalletConnector(t){return this.connectors.some(e=>e.id===t.id||e.name===t.name)}isWalletCompatibleWithCurrentChain(t){let e=Yt.state.activeChain;return e&&t.chains?t.chains.some(i=>{let n=i.split(":")[0];return e===n}):!0}};ye([c()],Qt.prototype,"tabIdx",void 0);ye([m()],Qt.prototype,"connectors",void 0);ye([m()],Qt.prototype,"loading",void 0);Qt=ye([d("w3m-connect-recent-widget")],Qt);var Ce=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Xt=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.wallets=[],this.loading=!1,f.isTelegram()&&f.isIos()&&(this.loading=!x.state.wcUri,this.unsubscribe.push(x.subscribeKey("wcUri",t=>this.loading=!t)))}render(){let{connectors:t}=v.state,{customWallets:e,featuredWalletIds:i}=N.state,n=pt.getRecentWallets(),o=t.find(C=>C.id==="walletConnect"),a=t.filter(C=>C.type==="INJECTED"||C.type==="ANNOUNCED"||C.type==="MULTI_CHAIN").filter(C=>C.name!=="Browser Wallet");if(!o)return null;if(i||e||!this.wallets.length)return this.style.cssText="display: none",null;let u=a.length+n.length,b=Math.max(0,2-u),w=ht.filterOutDuplicateWallets(this.wallets).slice(0,b);return w.length?l`
      <wui-flex flexDirection="column" gap="xs">
        ${w.map(C=>l`
            <wui-list-wallet
              imageSrc=${h(B.getWalletImage(C))}
              name=${C?.name??"Unknown"}
              @click=${()=>this.onConnectWallet(C)}
              tabIdx=${h(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){if(this.loading)return;let e=v.getConnector(t.id,t.rdns);e?E.push("ConnectingExternal",{connector:e}):E.push("ConnectingWalletConnect",{wallet:t})}};Ce([c()],Xt.prototype,"tabIdx",void 0);Ce([c()],Xt.prototype,"wallets",void 0);Ce([m()],Xt.prototype,"loading",void 0);Xt=Ce([d("w3m-connect-recommended-widget")],Xt);var Ee=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Zt=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.connectorImages=Ke.state.connectorImages,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t),Ke.subscribeKey("connectorImages",t=>this.connectorImages=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){if(f.isMobile())return this.style.cssText="display: none",null;let t=this.connectors.find(i=>i.id==="walletConnect");if(!t)return this.style.cssText="display: none",null;let e=t.imageUrl||this.connectorImages[t?.imageId??""];return l`
      <wui-list-wallet
        imageSrc=${h(e)}
        name=${t.name??"Unknown"}
        @click=${()=>this.onConnector(t)}
        tagLabel="qr code"
        tagVariant="main"
        tabIdx=${h(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
      >
      </wui-list-wallet>
    `}onConnector(t){v.setActiveConnector(t),E.push("ConnectingWalletConnect")}};Ee([c()],Zt.prototype,"tabIdx",void 0);Ee([m()],Zt.prototype,"connectors",void 0);Ee([m()],Zt.prototype,"connectorImages",void 0);Zt=Ee([d("w3m-connect-walletconnect-widget")],Zt);var Fo=g`
  :host {
    margin-top: var(--wui-spacing-3xs);
  }
  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-xs)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }
`;var te=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Rt=class extends p{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=v.state.connectors,this.recommended=R.state.recommended,this.featured=R.state.featured,this.unsubscribe.push(v.subscribeKey("connectors",t=>this.connectors=t),R.subscribeKey("recommended",t=>this.recommended=t),R.subscribeKey("featured",t=>this.featured=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return l`
      <wui-flex flexDirection="column" gap="xs"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){let{custom:t,recent:e,announced:i,injected:n,multiChain:o,recommended:s,featured:a,external:u}=st.getConnectorsByType(this.connectors,this.recommended,this.featured);return st.getConnectorTypeOrder({custom:t,recent:e,announced:i,injected:n,multiChain:o,recommended:s,featured:a,external:u}).map(w=>{switch(w){case"injected":return l`
            ${o.length?l`<w3m-connect-multi-chain-widget
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-multi-chain-widget>`:null}
            ${i.length?l`<w3m-connect-announced-widget
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-announced-widget>`:null}
            ${n.length?l`<w3m-connect-injected-widget
                  .connectors=${n}
                  tabIdx=${h(this.tabIdx)}
                ></w3m-connect-injected-widget>`:null}
          `;case"walletConnect":return l`<w3m-connect-walletconnect-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`;case"recent":return l`<w3m-connect-recent-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-recent-widget>`;case"featured":return l`<w3m-connect-featured-widget
            .wallets=${a}
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-featured-widget>`;case"custom":return l`<w3m-connect-custom-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-custom-widget>`;case"external":return l`<w3m-connect-external-widget
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-external-widget>`;case"recommended":return l`<w3m-connect-recommended-widget
            .wallets=${s}
            tabIdx=${h(this.tabIdx)}
          ></w3m-connect-recommended-widget>`;default:return console.warn(`Unknown connector type: ${w}`),null}})}};Rt.styles=Fo;te([c()],Rt.prototype,"tabIdx",void 0);te([m()],Rt.prototype,"connectors",void 0);te([m()],Rt.prototype,"recommended",void 0);te([m()],Rt.prototype,"featured",void 0);Rt=te([d("w3m-connector-list")],Rt);var Vo=g`
  :host {
    display: inline-flex;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-3xl);
    padding: var(--wui-spacing-3xs);
    position: relative;
    height: 36px;
    min-height: 36px;
    overflow: hidden;
  }

  :host::before {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 4px;
    left: 4px;
    display: block;
    width: var(--local-tab-width);
    height: 28px;
    border-radius: var(--wui-border-radius-3xl);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transform: translateX(calc(var(--local-tab) * var(--local-tab-width)));
    transition: transform var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color, opacity;
  }

  :host([data-type='flex'])::before {
    left: 3px;
    transform: translateX(calc((var(--local-tab) * 34px) + (var(--local-tab) * 4px)));
  }

  :host([data-type='flex']) {
    display: flex;
    padding: 0px 0px 0px 12px;
    gap: 4px;
  }

  :host([data-type='flex']) > button > wui-text {
    position: absolute;
    left: 18px;
    opacity: 0;
  }

  button[data-active='true'] > wui-icon,
  button[data-active='true'] > wui-text {
    color: var(--wui-color-fg-100);
  }

  button[data-active='false'] > wui-icon,
  button[data-active='false'] > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='true']:disabled,
  button[data-active='false']:disabled {
    background-color: transparent;
    opacity: 0.5;
    cursor: not-allowed;
  }

  button[data-active='true']:disabled > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='false']:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }

  button > wui-icon,
  button > wui-text {
    pointer-events: none;
    transition: color var(--wui-e ase-out-power-1) var(--wui-duration-md);
    will-change: color;
  }

  button {
    width: var(--local-tab-width);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
  }

  :host([data-type='flex']) > button {
    width: 34px;
    position: relative;
    display: flex;
    justify-content: flex-start;
  }

  button:hover:enabled,
  button:active:enabled {
    background-color: transparent !important;
  }

  button:hover:enabled > wui-icon,
  button:active:enabled > wui-icon {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button:hover:enabled > wui-text,
  button:active:enabled > wui-text {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button {
    border-radius: var(--wui-border-radius-3xl);
  }
`;var ft=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},et=class extends p{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.buttons=[],this.disabled=!1,this.localTabWidth="100px",this.activeTab=0,this.isDense=!1}render(){return this.isDense=this.tabs.length>3,this.style.cssText=`
      --local-tab: ${this.activeTab};
      --local-tab-width: ${this.localTabWidth};
    `,this.dataset.type=this.isDense?"flex":"block",this.tabs.map((t,e)=>{let i=e===this.activeTab;return l`
        <button
          ?disabled=${this.disabled}
          @click=${()=>this.onTabClick(e)}
          data-active=${i}
          data-testid="tab-${t.label?.toLowerCase()}"
        >
          ${this.iconTemplate(t)}
          <wui-text variant="small-600" color="inherit"> ${t.label} </wui-text>
        </button>
      `})}firstUpdated(){this.shadowRoot&&this.isDense&&(this.buttons=[...this.shadowRoot.querySelectorAll("button")],setTimeout(()=>{this.animateTabs(0,!0)},0))}iconTemplate(t){return t.icon?l`<wui-icon size="xs" color="inherit" name=${t.icon}></wui-icon>`:null}onTabClick(t){this.buttons&&this.animateTabs(t,!1),this.activeTab=t,this.onTabChange(t)}animateTabs(t,e){let i=this.buttons[this.activeTab],n=this.buttons[t],o=i?.querySelector("wui-text"),s=n?.querySelector("wui-text"),a=n?.getBoundingClientRect(),u=s?.getBoundingClientRect();i&&o&&!e&&t!==this.activeTab&&(o.animate([{opacity:0}],{duration:50,easing:"ease",fill:"forwards"}),i.animate([{width:"34px"}],{duration:500,easing:"ease",fill:"forwards"})),n&&a&&u&&s&&(t!==this.activeTab||e)&&(this.localTabWidth=`${Math.round(a.width+u.width)+6}px`,n.animate([{width:`${a.width+u.width}px`}],{duration:e?0:500,fill:"forwards",easing:"ease"}),s.animate([{opacity:1}],{duration:e?0:125,delay:e?0:200,fill:"forwards",easing:"ease"}))}};et.styles=[y,L,Vo];ft([c({type:Array})],et.prototype,"tabs",void 0);ft([c()],et.prototype,"onTabChange",void 0);ft([c({type:Array})],et.prototype,"buttons",void 0);ft([c({type:Boolean})],et.prototype,"disabled",void 0);ft([c()],et.prototype,"localTabWidth",void 0);ft([m()],et.prototype,"activeTab",void 0);ft([m()],et.prototype,"isDense",void 0);et=ft([d("wui-tabs")],et);var eo=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Re=class extends p{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(t=>t())}render(){let t=this.generateTabs();return l`
      <wui-flex justifyContent="center" .padding=${["0","0","l","0"]}>
        <wui-tabs .tabs=${t} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let t=this.platforms.map(e=>e==="browser"?{label:"Browser",icon:"extension",platform:"browser"}:e==="mobile"?{label:"Mobile",icon:"mobile",platform:"mobile"}:e==="qrcode"?{label:"Mobile",icon:"mobile",platform:"qrcode"}:e==="web"?{label:"Webapp",icon:"browser",platform:"web"}:e==="desktop"?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=t.map(({platform:e})=>e),t}onTabChange(t){let e=this.platformTabs[t];e&&this.onSelectPlatfrom?.(e)}};eo([c({type:Array})],Re.prototype,"platforms",void 0);eo([c()],Re.prototype,"onSelectPlatfrom",void 0);Re=eo([d("w3m-connecting-header")],Re);var Ho=g`
  :host {
    width: var(--local-width);
    position: relative;
  }

  button {
    border: none;
    border-radius: var(--local-border-radius);
    width: var(--local-width);
    white-space: nowrap;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='md'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-l);
    height: 36px;
  }

  button[data-size='md'][data-icon-left='true'][data-icon-right='false'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-s);
  }

  button[data-size='md'][data-icon-right='true'][data-icon-left='false'] {
    padding: 8.2px var(--wui-spacing-s) 9px var(--wui-spacing-l);
  }

  button[data-size='lg'] {
    padding: var(--wui-spacing-m) var(--wui-spacing-2l);
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='inverse'] {
    background-color: var(--wui-color-inverse-100);
    color: var(--wui-color-inverse-000);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='accent-error'] {
    background: var(--wui-color-error-glass-015);
    color: var(--wui-color-error-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-error-glass-010);
  }

  button[data-variant='accent-success'] {
    background: var(--wui-color-success-glass-015);
    color: var(--wui-color-success-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-success-glass-010);
  }

  button[data-variant='neutral'] {
    background: transparent;
    color: var(--wui-color-fg-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-variant='main']:focus-visible:enabled {
    background-color: var(--wui-color-accent-090);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='inverse']:focus-visible:enabled {
    background-color: var(--wui-color-inverse-100);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent']:focus-visible:enabled {
    background-color: var(--wui-color-accent-glass-010);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent-error']:focus-visible:enabled {
    background: var(--wui-color-error-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-error-100),
      0 0 0 4px var(--wui-color-error-glass-020);
  }
  button[data-variant='accent-success']:focus-visible:enabled {
    background: var(--wui-color-success-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-success-100),
      0 0 0 4px var(--wui-color-success-glass-020);
  }
  button[data-variant='neutral']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='accent-error']:hover:enabled {
      background: var(--wui-color-error-glass-020);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-error']:active:enabled {
      background: var(--wui-color-error-glass-030);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-success']:hover:enabled {
      background: var(--wui-color-success-glass-020);
      color: var(--wui-color-success-100);
    }

    button[data-variant='accent-success']:active:enabled {
      background: var(--wui-color-success-glass-030);
      color: var(--wui-color-success-100);
    }

    button[data-variant='neutral']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='neutral']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }

    button[data-size='lg'][data-icon-left='true'][data-icon-right='false'] {
      padding-left: var(--wui-spacing-m);
    }

    button[data-size='lg'][data-icon-right='true'][data-icon-left='false'] {
      padding-right: var(--wui-spacing-m);
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    color: var(--wui-color-gray-glass-020);
    cursor: not-allowed;
  }

  button > wui-text {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  ::slotted(*) {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  wui-loading-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: var(--local-opacity-000);
  }
`;var ot=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Ko={main:"inverse-100",inverse:"inverse-000",accent:"accent-100","accent-error":"error-100","accent-success":"success-100",neutral:"fg-100",disabled:"gray-glass-020"},Dr={lg:"paragraph-600",md:"small-600"},jr={lg:"md",md:"md"},G=class extends p{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="main",this.hasIconLeft=!1,this.hasIconRight=!1,this.borderRadius="m"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
    --local-opacity-100: ${this.loading?0:1};
    --local-opacity-000: ${this.loading?1:0};
    --local-border-radius: var(--wui-border-radius-${this.borderRadius});
    `;let t=this.textVariant??Dr[this.size];return l`
      <button
        data-variant=${this.variant}
        data-icon-left=${this.hasIconLeft}
        data-icon-right=${this.hasIconRight}
        data-size=${this.size}
        ?disabled=${this.disabled}
      >
        ${this.loadingTemplate()}
        <slot name="iconLeft" @slotchange=${()=>this.handleSlotLeftChange()}></slot>
        <wui-text variant=${t} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight" @slotchange=${()=>this.handleSlotRightChange()}></slot>
      </button>
    `}handleSlotLeftChange(){this.hasIconLeft=!0}handleSlotRightChange(){this.hasIconRight=!0}loadingTemplate(){if(this.loading){let t=jr[this.size],e=this.disabled?Ko.disabled:Ko[this.variant];return l`<wui-loading-spinner color=${e} size=${t}></wui-loading-spinner>`}return l``}};G.styles=[y,L,Ho];ot([c()],G.prototype,"size",void 0);ot([c({type:Boolean})],G.prototype,"disabled",void 0);ot([c({type:Boolean})],G.prototype,"fullWidth",void 0);ot([c({type:Boolean})],G.prototype,"loading",void 0);ot([c()],G.prototype,"variant",void 0);ot([c({type:Boolean})],G.prototype,"hasIconLeft",void 0);ot([c({type:Boolean})],G.prototype,"hasIconRight",void 0);ot([c()],G.prototype,"borderRadius",void 0);ot([c()],G.prototype,"textVariant",void 0);G=ot([d("wui-button")],G);var Go=g`
  button {
    padding: var(--wui-spacing-4xs) var(--wui-spacing-xxs);
    border-radius: var(--wui-border-radius-3xs);
    background-color: transparent;
    color: var(--wui-color-accent-100);
  }

  button:disabled {
    background-color: transparent;
    color: var(--wui-color-gray-glass-015);
  }

  button:hover {
    background-color: var(--wui-color-gray-glass-005);
  }
`;var $e=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},At=class extends p{constructor(){super(...arguments),this.tabIdx=void 0,this.disabled=!1,this.color="inherit"}render(){return l`
      <button ?disabled=${this.disabled} tabindex=${h(this.tabIdx)}>
        <slot name="iconLeft"></slot>
        <wui-text variant="small-600" color=${this.color}>
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}};At.styles=[y,L,Go];$e([c()],At.prototype,"tabIdx",void 0);$e([c({type:Boolean})],At.prototype,"disabled",void 0);$e([c()],At.prototype,"color",void 0);At=$e([d("wui-link")],At);var Yo=g`
  :host {
    display: block;
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  svg {
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  rect {
    fill: none;
    stroke: var(--wui-color-accent-100);
    stroke-width: 4px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var Jo=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},_e=class extends p{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let t=this.radius>50?50:this.radius,i=36-t,n=116+i,o=245+i,s=360+i*1.75;return l`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${t}
          stroke-dasharray="${n} ${o}"
          stroke-dashoffset=${s}
        />
      </svg>
    `}};_e.styles=[y,Yo];Jo([c({type:Number})],_e.prototype,"radius",void 0);_e=Jo([d("wui-loading-thumbnail")],_e);var Qo=g`
  button {
    border: none;
    border-radius: var(--wui-border-radius-3xl);
  }

  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='gray'] {
    background-color: transparent;
    color: var(--wui-color-fg-200);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='shade'] {
    background-color: transparent;
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-size='sm'] {
    height: 32px;
    padding: 0 var(--wui-spacing-s);
  }

  button[data-size='md'] {
    height: 40px;
    padding: 0 var(--wui-spacing-l);
  }

  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] > wui-icon {
    width: 14px;
    height: 14px;
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    overflow: hidden;
  }

  button.disabled > wui-icon,
  button.disabled > wui-image {
    filter: grayscale(1);
  }

  button[data-variant='main'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-accent-090);
  }

  button[data-variant='shade'] > wui-image,
  button[data-variant='gray'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:focus-visible {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='shade']:focus-visible,
    button[data-variant='gray']:focus-visible,
    button[data-variant='shade']:hover,
    button[data-variant='gray']:hover {
      background-color: var(--wui-color-gray-glass-002);
    }

    button[data-variant='gray']:active,
    button[data-variant='shade']:active {
      background-color: var(--wui-color-gray-glass-005);
    }
  }

  button.disabled {
    color: var(--wui-color-gray-glass-020);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    pointer-events: none;
  }
`;var $t=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},lt=class extends p{constructor(){super(...arguments),this.variant="accent",this.imageSrc="",this.disabled=!1,this.icon="externalLink",this.size="md",this.text=""}render(){let t=this.size==="sm"?"small-600":"paragraph-600";return l`
      <button
        class=${this.disabled?"disabled":""}
        data-variant=${this.variant}
        data-size=${this.size}
      >
        ${this.imageSrc?l`<wui-image src=${this.imageSrc}></wui-image>`:null}
        <wui-text variant=${t} color="inherit"> ${this.text} </wui-text>
        <wui-icon name=${this.icon} color="inherit" size="inherit"></wui-icon>
      </button>
    `}};lt.styles=[y,L,Qo];$t([c()],lt.prototype,"variant",void 0);$t([c()],lt.prototype,"imageSrc",void 0);$t([c({type:Boolean})],lt.prototype,"disabled",void 0);$t([c()],lt.prototype,"icon",void 0);$t([c()],lt.prototype,"size",void 0);$t([c()],lt.prototype,"text",void 0);lt=$t([d("wui-chip-button")],lt);var Xo=g`
  wui-flex {
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
  }
`;var Ie=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Dt=class extends p{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return l`
      <wui-flex
        justifyContent="space-between"
        alignItems="center"
        .padding=${["1xs","2l","1xs","2l"]}
      >
        <wui-text variant="paragraph-500" color="fg-200">${this.label}</wui-text>
        <wui-chip-button size="sm" variant="shade" text=${this.buttonLabel} icon="chevronRight">
        </wui-chip-button>
      </wui-flex>
    `}};Dt.styles=[y,L,Xo];Ie([c({type:Boolean})],Dt.prototype,"disabled",void 0);Ie([c()],Dt.prototype,"label",void 0);Ie([c()],Dt.prototype,"buttonLabel",void 0);Dt=Ie([d("wui-cta-button")],Dt);var Zo=g`
  :host {
    display: block;
    padding: 0 var(--wui-spacing-xl) var(--wui-spacing-xl);
  }
`;var ti=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},We=class extends p{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;let{name:t,app_store:e,play_store:i,chrome_store:n,homepage:o}=this.wallet,s=f.isMobile(),a=f.isIos(),u=f.isAndroid(),b=[e,i,o,n].filter(Boolean).length>1,w=X.getTruncateString({string:t,charsStart:12,charsEnd:0,truncate:"end"});return b&&!s?l`
        <wui-cta-button
          label=${`Don't have ${w}?`}
          buttonLabel="Get"
          @click=${()=>E.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!b&&o?l`
        <wui-cta-button
          label=${`Don't have ${w}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:e&&a?l`
        <wui-cta-button
          label=${`Don't have ${w}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:i&&u?l`
        <wui-cta-button
          label=${`Don't have ${w}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&f.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&f.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&f.openHref(this.wallet.homepage,"_blank")}};We.styles=[Zo];ti([c({type:Object})],We.prototype,"wallet",void 0);We=ti([d("w3m-mobile-download-links")],We);var ei=g`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--wui-spacing-3xs) * -1);
    bottom: calc(var(--wui-spacing-3xs) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-2);
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px var(--wui-spacing-l);
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }
`;var it=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},P=class extends p{constructor(){super(),this.wallet=E.state.data?.wallet,this.connector=E.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=B.getWalletImage(this.wallet)??B.getConnectorImage(this.connector),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=x.state.wcUri,this.error=x.state.wcError,this.ready=!1,this.showRetry=!1,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(x.subscribeKey("wcUri",t=>{this.uri=t,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),x.subscribeKey("wcError",t=>this.error=t)),(f.isTelegram()||f.isSafari())&&f.isIos()&&x.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),x.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let t=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel,e=`Continue in ${this.name}`;return this.error&&(e="Connection declined"),l`
      <wui-flex
        data-error=${h(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${h(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error?"error-100":"fg-100"}>
            ${e}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${t}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?l`
              <wui-button
                variant="accent"
                size="md"
                ?disabled=${this.isRetrying||this.isLoading}
                @click=${this.onTryAgain.bind(this)}
                data-testid="w3m-connecting-widget-secondary-button"
              >
                <wui-icon color="inherit" slot="iconLeft" name=${this.secondaryBtnIcon}></wui-icon>
                ${this.secondaryBtnLabel}
              </wui-button>
            `:null}
      </wui-flex>

      ${this.isWalletConnect?l`
            <wui-flex .padding=${["0","xl","xl","xl"]} justifyContent="center">
              <wui-link @click=${this.onCopyUri} color="fg-200" data-testid="wui-link-copy">
                <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
                Copy link
              </wui-link>
            </wui-flex>
          `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,this.shadowRoot?.querySelector("wui-button")?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"}))}onTryAgain(){x.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let t=Gt.state.themeVariables["--w3m-border-radius-master"],e=t?parseInt(t.replace("px",""),10):4;return l`<wui-loading-thumbnail radius=${e*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(f.copyToClopboard(this.uri),yt.showSuccess("Link copied"))}catch{yt.showError("Failed to copy")}}};P.styles=ei;it([m()],P.prototype,"isRetrying",void 0);it([m()],P.prototype,"uri",void 0);it([m()],P.prototype,"error",void 0);it([m()],P.prototype,"ready",void 0);it([m()],P.prototype,"showRetry",void 0);it([m()],P.prototype,"secondaryBtnLabel",void 0);it([m()],P.prototype,"secondaryLabel",void 0);it([m()],P.prototype,"isLoading",void 0);it([c({type:Boolean})],P.prototype,"isMobile",void 0);it([c()],P.prototype,"onRetry",void 0);var kr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},oi=class extends P{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}async onConnectProxy(){try{this.error=!1;let{connectors:t}=v.state,e=t.find(i=>i.type==="ANNOUNCED"&&i.info?.rdns===this.wallet?.rdns||i.type==="INJECTED"||i.name===this.wallet?.name);if(e)await x.connectExternal(e,e.chain);else throw new Error("w3m-connecting-wc-browser: No connector found");he.close(),U.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown"}})}catch(t){U.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:t?.message??"Unknown"}}),this.error=!0}}};oi=kr([d("w3m-connecting-wc-browser")],oi);var zr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},ii=class extends P{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop"}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:t,name:e}=this.wallet,{redirect:i,href:n}=f.formatNativeUrl(t,this.uri);x.setWcLinking({name:e,href:n}),x.setRecentWallet(this.wallet),f.openHref(i,"_blank")}catch{this.error=!0}}};ii=zr([d("w3m-connecting-wc-desktop")],ii);var jt=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},_t=class extends P{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=N.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;let{mobile_link:t,link_mode:e,name:i}=this.wallet,{redirect:n,redirectUniversalLink:o,href:s}=f.formatNativeUrl(t,this.uri,e);this.redirectDeeplink=n,this.redirectUniversalLink=o,this.target=f.isIframe()?"_top":"_self",x.setWcLinking({name:i,href:s}),x.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?f.openHref(this.redirectUniversalLink,this.target):f.openHref(this.redirectDeeplink,this.target)}catch(t){U.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:t instanceof Error?t.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=pe.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(x.subscribeKey("wcUri",()=>{this.onHandleURI()})),U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile"}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){x.setWcError(!1),this.onConnect?.()}};jt([m()],_t.prototype,"redirectDeeplink",void 0);jt([m()],_t.prototype,"redirectUniversalLink",void 0);jt([m()],_t.prototype,"target",void 0);jt([m()],_t.prototype,"preferUniversalLinks",void 0);jt([m()],_t.prototype,"isLoading",void 0);_t=jt([d("w3m-connecting-wc-mobile")],_t);var ar=Ar(nr(),1);var An=.1,sr=2.5,ut=7;function _o(r,t,e){return r===t?!1:(r-t<0?t-r:r-t)<=e+An}function Dn(r,t){let e=Array.prototype.slice.call(ar.default.create(r,{errorCorrectionLevel:t}).modules.data,0),i=Math.sqrt(e.length);return e.reduce((n,o,s)=>(s%i===0?n.push([o]):n[n.length-1].push(o))&&n,[])}var lr={generate({uri:r,size:t,logoSize:e,dotColor:i="#141414"}){let n="transparent",s=[],a=Dn(r,"Q"),u=t/a.length,b=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];b.forEach(({x:S,y:_})=>{let k=(a.length-ut)*u*S,T=(a.length-ut)*u*_,z=.45;for(let A=0;A<b.length;A+=1){let D=u*(ut-A*2);s.push(mt`
            <rect
              fill=${A===2?i:n}
              width=${A===0?D-5:D}
              rx= ${A===0?(D-5)*z:D*z}
              ry= ${A===0?(D-5)*z:D*z}
              stroke=${i}
              stroke-width=${A===0?5:0}
              height=${A===0?D-5:D}
              x= ${A===0?T+u*A+5/2:T+u*A}
              y= ${A===0?k+u*A+5/2:k+u*A}
            />
          `)}});let w=Math.floor((e+25)/u),C=a.length/2-w/2,$=a.length/2+w/2-1,F=[];a.forEach((S,_)=>{S.forEach((k,T)=>{if(a[_][T]&&!(_<ut&&T<ut||_>a.length-(ut+1)&&T<ut||_<ut&&T>a.length-(ut+1))&&!(_>C&&_<$&&T>C&&T<$)){let z=_*u+u/2,A=T*u+u/2;F.push([z,A])}})});let M={};return F.forEach(([S,_])=>{M[S]?M[S]?.push(_):M[S]=[_]}),Object.entries(M).map(([S,_])=>{let k=_.filter(T=>_.every(z=>!_o(T,z,u)));return[Number(S),k]}).forEach(([S,_])=>{_.forEach(k=>{s.push(mt`<circle cx=${S} cy=${k} fill=${i} r=${u/sr} />`)})}),Object.entries(M).filter(([S,_])=>_.length>1).map(([S,_])=>{let k=_.filter(T=>_.some(z=>_o(T,z,u)));return[Number(S),k]}).map(([S,_])=>{_.sort((T,z)=>T<z?-1:1);let k=[];for(let T of _){let z=k.find(A=>A.some(D=>_o(T,D,u)));z?z.push(T):k.push([T])}return[S,k.map(T=>[T[0],T[T.length-1]])]}).forEach(([S,_])=>{_.forEach(([k,T])=>{s.push(mt`
              <line
                x1=${S}
                x2=${S}
                y1=${k}
                y2=${T}
                stroke=${i}
                stroke-width=${u/(sr/2)}
                stroke-linecap="round"
              />
            `)})}),s}};var cr=g`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: var(--local-size);
  }

  :host([data-theme='dark']) {
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px);
    background-color: var(--wui-color-inverse-100);
    padding: var(--wui-spacing-l);
  }

  :host([data-theme='light']) {
    box-shadow: 0 0 0 1px var(--wui-color-bg-125);
    background-color: var(--wui-color-bg-125);
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: var(--wui-border-radius-xs);
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: var(--local-icon-color) !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }
`;var dt=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},jn="#3396ff",Z=class extends p{constructor(){super(...arguments),this.uri="",this.size=0,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),this.style.cssText=`
     --local-size: ${this.size}px;
     --local-icon-color: ${this.color??jn}
    `,l`${this.templateVisual()} ${this.templateSvg()}`}templateSvg(){let t=this.theme==="light"?this.size:this.size-32;return mt`
      <svg height=${t} width=${t}>
        ${lr.generate({uri:this.uri,size:t,logoSize:this.arenaClear?0:t/4,dotColor:this.color})}
      </svg>
    `}templateVisual(){return this.imageSrc?l`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?l`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:l`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};Z.styles=[y,cr];dt([c()],Z.prototype,"uri",void 0);dt([c({type:Number})],Z.prototype,"size",void 0);dt([c()],Z.prototype,"theme",void 0);dt([c()],Z.prototype,"imageSrc",void 0);dt([c()],Z.prototype,"alt",void 0);dt([c()],Z.prototype,"color",void 0);dt([c({type:Boolean})],Z.prototype,"arenaClear",void 0);dt([c({type:Boolean})],Z.prototype,"farcaster",void 0);Z=dt([d("wui-qr-code")],Z);var ur=g`
  :host {
    display: block;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-200) 5%,
      var(--wui-color-bg-200) 48%,
      var(--wui-color-bg-300) 55%,
      var(--wui-color-bg-300) 60%,
      var(--wui-color-bg-300) calc(60% + 10px),
      var(--wui-color-bg-200) calc(60% + 12px),
      var(--wui-color-bg-200) 100%
    );
    background-size: 250%;
    animation: shimmer 3s linear infinite reverse;
  }

  :host([variant='light']) {
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-150) 5%,
      var(--wui-color-bg-150) 48%,
      var(--wui-color-bg-200) 55%,
      var(--wui-color-bg-200) 60%,
      var(--wui-color-bg-200) calc(60% + 10px),
      var(--wui-color-bg-150) calc(60% + 12px),
      var(--wui-color-bg-150) 100%
    );
    background-size: 250%;
  }

  @keyframes shimmer {
    from {
      background-position: -250% 0;
    }
    to {
      background-position: 250% 0;
    }
  }
`;var ce=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Lt=class extends p{constructor(){super(...arguments),this.width="",this.height="",this.borderRadius="m",this.variant="default"}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
      border-radius: ${`clamp(0px,var(--wui-border-radius-${this.borderRadius}), 40px)`};
    `,l`<slot></slot>`}};Lt.styles=[ur];ce([c()],Lt.prototype,"width",void 0);ce([c()],Lt.prototype,"height",void 0);ce([c()],Lt.prototype,"borderRadius",void 0);ce([c()],Lt.prototype,"variant",void 0);Lt=ce([d("wui-shimmer")],Lt);var dr="https://reown.com";var pr=g`
  .reown-logo {
    height: var(--wui-spacing-xxl);
  }

  a {
    text-decoration: none;
    cursor: pointer;
  }

  a:hover {
    opacity: 0.9;
  }
`;var kn=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Io=class extends p{render(){return l`
      <a
        data-testid="ux-branding-reown"
        href=${dr}
        rel="noreferrer"
        target="_blank"
        style="text-decoration: none;"
      >
        <wui-flex
          justifyContent="center"
          alignItems="center"
          gap="xs"
          .padding=${["0","0","l","0"]}
        >
          <wui-text variant="small-500" color="fg-100"> UX by </wui-text>
          <wui-icon name="reown" size="xxxl" class="reown-logo"></wui-icon>
        </wui-flex>
      </a>
    `}};Io.styles=[y,L,pr];Io=kn([d("wui-ux-by-reown")],Io);var hr=g`
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px) !important;
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: 200ms;
    animation-timing-function: ease;
    animation-name: fadein;
    animation-fill-mode: forwards;
  }
`;var zn=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Wo=class extends P{constructor(){super(),this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate),U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode"}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(t=>t()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),l`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","xl","xl","xl"]}
        gap="xl"
      >
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let t=this.getBoundingClientRect().width-40,e=this.wallet?this.wallet.name:void 0;return x.setWcLinking(void 0),x.setRecentWallet(this.wallet),l` <wui-qr-code
      size=${t}
      theme=${Gt.state.themeMode}
      uri=${this.uri}
      imageSrc=${h(B.getWalletImage(this.wallet))}
      color=${h(Gt.state.themeVariables["--w3m-qr-color"])}
      alt=${h(e)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let t=!this.uri||!this.ready;return l`<wui-link
      .disabled=${t}
      @click=${this.onCopyUri}
      color="fg-200"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
      Copy link
    </wui-link>`}};Wo.styles=hr;Wo=zn([d("w3m-connecting-wc-qrcode")],Wo);var Un=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},mr=class extends p{constructor(){if(super(),this.wallet=E.state.data?.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}render(){return l`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${h(B.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="paragraph-500" color="fg-100">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};mr=Un([d("w3m-connecting-wc-unsupported")],mr);var fr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},So=class extends P{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=pe.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(x.subscribeKey("wcUri",()=>{this.updateLoadingState()})),U.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web"}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:t,name:e}=this.wallet,{redirect:i,href:n}=f.formatUniversalUrl(t,this.uri);x.setWcLinking({name:e,href:n}),x.setRecentWallet(this.wallet),f.openHref(i,"_blank")}catch{this.error=!0}}};fr([m()],So.prototype,"isLoading",void 0);So=fr([d("w3m-connecting-wc-web")],So);var ue=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},qt=class extends p{constructor(){super(),this.wallet=E.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!N.state.siwx,this.remoteFeatures=N.state.remoteFeatures,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(N.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return l`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?l`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(t=!1){if(!(this.platform==="browser"||N.state.manualWCControl&&!t))try{let{wcPairingExpiry:e,status:i}=x.state;(t||N.state.enableEmbedded||f.isPairingExpired(e)||i==="connecting")&&(await x.connectWalletConnect(),this.isSiwxEnabled||he.close())}catch(e){U.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),x.setWcError(!0),yt.showError(e.message??"Connection error"),x.resetWcConnection(),E.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;let{mobile_link:t,desktop_link:e,webapp_link:i,injected:n,rdns:o}=this.wallet,s=n?.map(({injected_id:M})=>M).filter(Boolean),a=[...o?[o]:s??[]],u=N.state.isUniversalProvider?!1:a.length,b=t,w=i,C=x.checkInstalled(a),$=u&&C,F=e&&!f.isMobile();$&&!Yt.state.noAdapters&&this.platforms.push("browser"),b&&this.platforms.push(f.isMobile()?"mobile":"qrcode"),w&&this.platforms.push("web"),F&&this.platforms.push("desktop"),!$&&u&&!Yt.state.noAdapters&&this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return l`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return l`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return l`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return l`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return l`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`;default:return l`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?l`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(t){let e=this.shadowRoot?.querySelector("div");e&&(await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=t,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};ue([m()],qt.prototype,"platform",void 0);ue([m()],qt.prototype,"platforms",void 0);ue([m()],qt.prototype,"isSiwxEnabled",void 0);ue([m()],qt.prototype,"remoteFeatures",void 0);qt=ue([d("w3m-connecting-wc-view")],qt);var gr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},To=class extends p{constructor(){super(...arguments),this.isMobile=f.isMobile()}render(){if(this.isMobile){let{featured:t,recommended:e}=R.state,{customWallets:i}=N.state,n=pt.getRecentWallets(),o=t.length||e.length||i?.length||n.length;return l`<wui-flex
        flexDirection="column"
        gap="xs"
        .margin=${["3xs","s","s","s"]}
      >
        ${o?l`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return l`<wui-flex flexDirection="column" .padding=${["0","0","l","0"]}>
      <w3m-connecting-wc-view></w3m-connecting-wc-view>
      <wui-flex flexDirection="column" .padding=${["0","m","0","m"]}>
        <w3m-all-wallets-widget></w3m-all-wallets-widget> </wui-flex
    ></wui-flex>`}};gr([m()],To.prototype,"isMobile",void 0);To=gr([d("w3m-connecting-wc-basic-view")],To);var Ft=()=>new Bo,Bo=class{},Lo=new WeakMap,Vt=jo(class extends ko{render(r){return Ge}update(r,[t]){let e=t!==this.G;return e&&this.rt(void 0),(e||this.lt!==this.ct)&&(this.G=t,this.ht=r.options?.host,this.rt(this.ct=r.element)),Ge}rt(r){if(this.G!==void 0)if(this.isConnected||(r=void 0),typeof this.G=="function"){let t=this.ht??globalThis,e=Lo.get(t);e===void 0&&(e=new WeakMap,Lo.set(t,e)),e.get(this.G)!==void 0&&this.G.call(this.ht,void 0),e.set(this.G,r),r!==void 0&&this.G.call(this.ht,r)}else this.G.value=r}get lt(){return typeof this.G=="function"?Lo.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}});var wr=g`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 22px;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--wui-color-blue-100);
    border-width: 1px;
    border-style: solid;
    border-color: var(--wui-color-gray-glass-002);
    border-radius: 999px;
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color;
  }

  span:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
    background-color: var(--wui-color-inverse-100);
    transition: transform var(--wui-ease-inout-power-1) var(--wui-duration-lg);
    will-change: transform;
    border-radius: 50%;
  }

  input:checked + span {
    border-color: var(--wui-color-gray-glass-005);
    background-color: var(--wui-color-blue-100);
  }

  input:not(:checked) + span {
    background-color: var(--wui-color-gray-glass-010);
  }

  input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }
`;var br=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Ue=class extends p{constructor(){super(...arguments),this.inputElementRef=Ft(),this.checked=void 0}render(){return l`
      <label>
        <input
          ${Vt(this.inputElementRef)}
          type="checkbox"
          ?checked=${h(this.checked)}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};Ue.styles=[y,L,Do,wr];br([c({type:Boolean})],Ue.prototype,"checked",void 0);Ue=br([d("wui-switch")],Ue);var vr=g`
  :host {
    height: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--wui-spacing-1xs);
    padding: var(--wui-spacing-xs) var(--wui-spacing-s);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var xr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Ne=class extends p{constructor(){super(...arguments),this.checked=void 0}render(){return l`
      <button>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-switch ?checked=${h(this.checked)}></wui-switch>
      </button>
    `}};Ne.styles=[y,L,vr];xr([c({type:Boolean})],Ne.prototype,"checked",void 0);Ne=xr([d("wui-certified-switch")],Ne);var yr=g`
  button {
    background-color: var(--wui-color-fg-300);
    border-radius: var(--wui-border-radius-4xs);
    width: 16px;
    height: 16px;
  }

  button:disabled {
    background-color: var(--wui-color-bg-300);
  }

  wui-icon {
    color: var(--wui-color-bg-200) !important;
  }

  button:focus-visible {
    background-color: var(--wui-color-fg-250);
    border: 1px solid var(--wui-color-accent-100);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-color-fg-250);
    }

    button:active:enabled {
      background-color: var(--wui-color-fg-225);
    }
  }
`;var Cr=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Me=class extends p{constructor(){super(...arguments),this.icon="copy"}render(){return l`
      <button>
        <wui-icon color="inherit" size="xxs" name=${this.icon}></wui-icon>
      </button>
    `}};Me.styles=[y,L,yr];Cr([c()],Me.prototype,"icon",void 0);Me=Cr([d("wui-input-element")],Me);var Er=g`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
    color: var(--wui-color-fg-275);
  }

  input {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    background: var(--wui-color-gray-glass-002);
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
    color: var(--wui-color-fg-100);
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      box-shadow var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color, box-shadow;
    caret-color: var(--wui-color-accent-100);
  }

  input:disabled {
    cursor: not-allowed;
    border: 1px solid var(--wui-color-gray-glass-010);
  }

  input:disabled::placeholder,
  input:disabled + wui-icon {
    color: var(--wui-color-fg-300);
  }

  input::placeholder {
    color: var(--wui-color-fg-275);
  }

  input:focus:enabled {
    background-color: var(--wui-color-gray-glass-005);
    -webkit-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  input:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px var(--wui-spacing-s);
  }

  wui-icon + .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px 36px;
  }

  wui-icon[data-input='sm'] {
    left: var(--wui-spacing-s);
  }

  .wui-size-md {
    padding: 15px var(--wui-spacing-m) var(--wui-spacing-l) var(--wui-spacing-m);
  }

  wui-icon + .wui-size-md,
  wui-loading-spinner + .wui-size-md {
    padding: 10.5px var(--wui-spacing-3xl) 10.5px var(--wui-spacing-3xl);
  }

  wui-icon[data-input='md'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-lg {
    padding: var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-l);
    letter-spacing: var(--wui-letter-spacing-medium-title);
    font-size: var(--wui-font-size-medium-title);
    font-weight: var(--wui-font-weight-light);
    line-height: 130%;
    color: var(--wui-color-fg-100);
    height: 64px;
  }

  .wui-padding-right-xs {
    padding-right: var(--wui-spacing-xs);
  }

  .wui-padding-right-s {
    padding-right: var(--wui-spacing-s);
  }

  .wui-padding-right-m {
    padding-right: var(--wui-spacing-m);
  }

  .wui-padding-right-l {
    padding-right: var(--wui-spacing-l);
  }

  .wui-padding-right-xl {
    padding-right: var(--wui-spacing-xl);
  }

  .wui-padding-right-2xl {
    padding-right: var(--wui-spacing-2xl);
  }

  .wui-padding-right-3xl {
    padding-right: var(--wui-spacing-3xl);
  }

  .wui-padding-right-4xl {
    padding-right: var(--wui-spacing-4xl);
  }

  .wui-padding-right-5xl {
    padding-right: var(--wui-spacing-5xl);
  }

  wui-icon + .wui-size-lg,
  wui-loading-spinner + .wui-size-lg {
    padding-left: 50px;
  }

  wui-icon[data-input='lg'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-m) 17.25px var(--wui-spacing-m);
  }
  wui-icon + .wui-size-mdl,
  wui-loading-spinner + .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-3xl) 17.25px 40px;
  }
  wui-icon[data-input='mdl'] {
    left: var(--wui-spacing-m);
  }

  input:placeholder-shown ~ ::slotted(wui-input-element),
  input:placeholder-shown ~ ::slotted(wui-icon) {
    opacity: 0;
    pointer-events: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  ::slotted(wui-input-element),
  ::slotted(wui-icon) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  ::slotted(wui-input-element) {
    right: var(--wui-spacing-m);
  }

  ::slotted(wui-icon) {
    right: 0px;
  }
`;var rt=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},J=class extends p{constructor(){super(...arguments),this.inputElementRef=Ft(),this.size="md",this.disabled=!1,this.placeholder="",this.type="text",this.value=""}render(){let t=`wui-padding-right-${this.inputRightPadding}`,i={[`wui-size-${this.size}`]:!0,[t]:!!this.inputRightPadding};return l`${this.templateIcon()}
      <input
        data-testid="wui-input-text"
        ${Vt(this.inputElementRef)}
        class=${zo(i)}
        type=${this.type}
        enterkeyhint=${h(this.enterKeyHint)}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        @input=${this.dispatchInputChangeEvent.bind(this)}
        .value=${this.value||""}
        tabindex=${h(this.tabIdx)}
      />
      <slot></slot>`}templateIcon(){return this.icon?l`<wui-icon
        data-input=${this.size}
        size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};J.styles=[y,L,Er];rt([c()],J.prototype,"size",void 0);rt([c()],J.prototype,"icon",void 0);rt([c({type:Boolean})],J.prototype,"disabled",void 0);rt([c()],J.prototype,"placeholder",void 0);rt([c()],J.prototype,"type",void 0);rt([c()],J.prototype,"keyHint",void 0);rt([c()],J.prototype,"value",void 0);rt([c()],J.prototype,"inputRightPadding",void 0);rt([c()],J.prototype,"tabIdx",void 0);J=rt([d("wui-input-text")],J);var Rr=g`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`;var Nn=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Oo=class extends p{constructor(){super(...arguments),this.inputComponentRef=Ft()}render(){return l`
      <wui-input-text
        ${Vt(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
      >
        <wui-input-element @click=${this.clearValue} icon="close"></wui-input-element>
      </wui-input-text>
    `}clearValue(){let e=this.inputComponentRef.value?.inputElementRef.value;e&&(e.value="",e.focus(),e.dispatchEvent(new Event("input")))}};Oo.styles=[y,Rr];Oo=Nn([d("wui-search-bar")],Oo);var $r=mt`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`;var _r=g`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-xs) 10px;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--wui-path-network);
    clip-path: var(--wui-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-color-gray-glass-010);
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var Ir=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},qe=class extends p{constructor(){super(...arguments),this.type="wallet"}render(){return l`
      ${this.shimmerTemplate()}
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `}shimmerTemplate(){return this.type==="network"?l` <wui-shimmer
          data-type=${this.type}
          width="48px"
          height="54px"
          borderRadius="xs"
        ></wui-shimmer>
        ${$r}`:l`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}};qe.styles=[y,L,_r];Ir([c()],qe.prototype,"type",void 0);qe=Ir([d("wui-card-select-loader")],qe);var Wr=g`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var Q=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},H=class extends p{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&X.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&X.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&X.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&X.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&X.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&X.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&X.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&X.getSpacingStyles(this.margin,3)};
    `,l`<slot></slot>`}};H.styles=[y,Wr];Q([c()],H.prototype,"gridTemplateRows",void 0);Q([c()],H.prototype,"gridTemplateColumns",void 0);Q([c()],H.prototype,"justifyItems",void 0);Q([c()],H.prototype,"alignItems",void 0);Q([c()],H.prototype,"justifyContent",void 0);Q([c()],H.prototype,"alignContent",void 0);Q([c()],H.prototype,"columnGap",void 0);Q([c()],H.prototype,"rowGap",void 0);Q([c()],H.prototype,"gap",void 0);Q([c()],H.prototype,"padding",void 0);Q([c()],H.prototype,"margin",void 0);H=Q([d("wui-grid")],H);var Sr=g`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-s) var(--wui-spacing-0);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    transition:
      color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: var(--wui-color-fg-100);
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  button:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  button:disabled > wui-flex > wui-text {
    color: var(--wui-color-gray-glass-015);
  }

  [data-selected='true'] {
    background-color: var(--wui-color-accent-glass-020);
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }
  }

  [data-selected='true']:active:enabled {
    background-color: var(--wui-color-accent-glass-010);
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var de=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Bt=class extends p{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.wallet=void 0,this.observer=new IntersectionObserver(t=>{t.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let t=this.wallet?.badge_type==="certified";return l`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="3xs">
          <wui-text
            variant="tiny-500"
            color="inherit"
            class=${h(t?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${t?l`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():l`
      <wui-wallet-image
        size="md"
        imageSrc=${h(this.imageSrc)}
        name=${this.wallet?.name}
        .installed=${this.wallet?.installed}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return l`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=B.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await B.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}};Bt.styles=Sr;de([m()],Bt.prototype,"visible",void 0);de([m()],Bt.prototype,"imageSrc",void 0);de([m()],Bt.prototype,"imageLoading",void 0);de([c()],Bt.prototype,"wallet",void 0);Bt=de([d("w3m-all-wallets-list-item")],Bt);var Tr=g`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    padding-top: var(--wui-spacing-l);
    padding-bottom: var(--wui-spacing-l);
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var Ht=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Lr="local-paginator",xt=class extends p{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!R.state.wallets.length,this.wallets=R.state.wallets,this.recommended=R.state.recommended,this.featured=R.state.featured,this.filteredWallets=R.state.filteredWallets,this.unsubscribe.push(R.subscribeKey("wallets",t=>this.wallets=t),R.subscribeKey("recommended",t=>this.recommended=t),R.subscribeKey("featured",t=>this.featured=t),R.subscribeKey("filteredWallets",t=>this.filteredWallets=t))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.paginationObserver?.disconnect()}render(){return l`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","s","s","s"]}
        columnGap="xxs"
        rowGap="l"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let t=this.shadowRoot?.querySelector("wui-grid");t&&(await R.fetchWalletsByPage({page:1}),await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(t,e){return[...Array(t)].map(()=>l`
        <wui-card-select-loader type="wallet" id=${h(e)}></wui-card-select-loader>
      `)}walletsTemplate(){let t=this.filteredWallets?.length>0?f.uniqueBy([...this.featured,...this.recommended,...this.filteredWallets],"id"):f.uniqueBy([...this.featured,...this.recommended,...this.wallets],"id");return ht.markWalletsAsInstalled(t).map(i=>l`
        <w3m-all-wallets-list-item
          @click=${()=>this.onConnectWallet(i)}
          .wallet=${i}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:t,recommended:e,featured:i,count:n}=R.state,o=window.innerWidth<352?3:4,s=t.length+e.length,u=Math.ceil(s/o)*o-s+o;return u-=t.length?i.length%o:0,n===0&&i.length>0?null:n===0||[...i,...t,...e].length<n?this.shimmerTemplate(u,Lr):null}createPaginationObserver(){let t=this.shadowRoot?.querySelector(`#${Lr}`);t&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:i,count:n,wallets:o}=R.state;o.length<n&&R.fetchWalletsByPage({page:i+1})}}),this.paginationObserver.observe(t))}onConnectWallet(t){v.selectWalletConnector(t)}};xt.styles=Tr;Ht([m()],xt.prototype,"loading",void 0);Ht([m()],xt.prototype,"wallets",void 0);Ht([m()],xt.prototype,"recommended",void 0);Ht([m()],xt.prototype,"featured",void 0);Ht([m()],xt.prototype,"filteredWallets",void 0);xt=Ht([d("w3m-all-wallets-list")],xt);var Br=g`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var Fe=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Kt=class extends p{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.query=""}render(){return this.onSearch(),this.loading?l`<wui-loading-spinner color="accent-100"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await R.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:t}=R.state,e=ht.markWalletsAsInstalled(t);return t.length?l`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","s","s","s"]}
        rowGap="l"
        columnGap="xs"
        justifyContent="space-between"
      >
        ${e.map(i=>l`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(i)}
              .wallet=${i}
              data-testid="wallet-search-item-${i.id}"
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:l`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="s"
          flexDirection="column"
        >
          <wui-icon-box
            size="lg"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="wallet"
            background="transparent"
          ></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="fg-200" variant="paragraph-500">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(t){v.selectWalletConnector(t)}};Kt.styles=Br;Fe([m()],Kt.prototype,"loading",void 0);Fe([c()],Kt.prototype,"query",void 0);Fe([c()],Kt.prototype,"badge",void 0);Kt=Fe([d("w3m-all-wallets-search")],Kt);var Po=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Ve=class extends p{constructor(){super(...arguments),this.search="",this.onDebouncedSearch=f.debounce(t=>{this.search=t})}render(){let t=this.search.length>=2;return l`
      <wui-flex .padding=${["0","s","s","s"]} gap="xs">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge}
          @click=${this.onClick.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${t||this.badge?l`<w3m-all-wallets-search
            query=${this.search}
            badge=${h(this.badge)}
          ></w3m-all-wallets-search>`:l`<w3m-all-wallets-list badge=${h(this.badge)}></w3m-all-wallets-list>`}
    `}onInputChange(t){this.onDebouncedSearch(t.detail)}onClick(){if(this.badge==="certified"){this.badge=void 0;return}this.badge="certified",yt.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})}qrButtonTemplate(){return f.isMobile()?l`
        <wui-icon-box
          size="lg"
          iconSize="xl"
          iconColor="accent-100"
          backgroundColor="accent-100"
          icon="qrCode"
          background="transparent"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){E.push("ConnectingWalletConnect")}};Po([m()],Ve.prototype,"search",void 0);Po([m()],Ve.prototype,"badge",void 0);Ve=Po([d("w3m-all-wallets-view")],Ve);var Or=g`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 11px 18px 11px var(--wui-spacing-s);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
    transition:
      color var(--wui-ease-out-power-1) var(--wui-duration-md),
      background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: color, background-color;
  }

  button[data-iconvariant='square'],
  button[data-iconvariant='square-blue'] {
    padding: 6px 18px 6px 9px;
  }

  button > wui-flex {
    flex: 1;
  }

  button > wui-image {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
    border-radius: var(--wui-border-radius-3xl);
  }

  button > wui-icon {
    width: 36px;
    height: 36px;
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  button > wui-icon-box[data-variant='blue'] {
    box-shadow: 0 0 0 2px var(--wui-color-accent-glass-005);
  }

  button > wui-icon-box[data-variant='overlay'] {
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: var(--wui-border-radius-3xs);
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }

  button > wui-icon-box[data-variant='square-blue']::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-accent-glass-010);
    pointer-events: none;
  }

  button > wui-icon:last-child {
    width: 14px;
    height: 14px;
  }

  button:disabled {
    color: var(--wui-color-gray-glass-020);
  }

  button[data-loading='true'] > wui-icon {
    opacity: 0;
  }

  wui-loading-spinner {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
  }
`;var tt=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},K=class extends p{constructor(){super(...arguments),this.tabIdx=void 0,this.variant="icon",this.disabled=!1,this.imageSrc=void 0,this.alt=void 0,this.chevron=!1,this.loading=!1}render(){return l`
      <button
        ?disabled=${this.loading?!0:!!this.disabled}
        data-loading=${this.loading}
        data-iconvariant=${h(this.iconVariant)}
        tabindex=${h(this.tabIdx)}
      >
        ${this.loadingTemplate()} ${this.visualTemplate()}
        <wui-flex gap="3xs">
          <slot></slot>
        </wui-flex>
        ${this.chevronTemplate()}
      </button>
    `}visualTemplate(){if(this.variant==="image"&&this.imageSrc)return l`<wui-image src=${this.imageSrc} alt=${this.alt??"list item"}></wui-image>`;if(this.iconVariant==="square"&&this.icon&&this.variant==="icon")return l`<wui-icon name=${this.icon}></wui-icon>`;if(this.variant==="icon"&&this.icon&&this.iconVariant){let t=["blue","square-blue"].includes(this.iconVariant)?"accent-100":"fg-200",e=this.iconVariant==="square-blue"?"mdl":"md",i=this.iconSize?this.iconSize:e;return l`
        <wui-icon-box
          data-variant=${this.iconVariant}
          icon=${this.icon}
          iconSize=${i}
          background="transparent"
          iconColor=${t}
          backgroundColor=${t}
          size=${e}
        ></wui-icon-box>
      `}return null}loadingTemplate(){return this.loading?l`<wui-loading-spinner
        data-testid="wui-list-item-loading-spinner"
        color="fg-300"
      ></wui-loading-spinner>`:l``}chevronTemplate(){return this.chevron?l`<wui-icon size="inherit" color="fg-200" name="chevronRight"></wui-icon>`:null}};K.styles=[y,L,Or];tt([c()],K.prototype,"icon",void 0);tt([c()],K.prototype,"iconSize",void 0);tt([c()],K.prototype,"tabIdx",void 0);tt([c()],K.prototype,"variant",void 0);tt([c()],K.prototype,"iconVariant",void 0);tt([c({type:Boolean})],K.prototype,"disabled",void 0);tt([c()],K.prototype,"imageSrc",void 0);tt([c()],K.prototype,"alt",void 0);tt([c({type:Boolean})],K.prototype,"chevron",void 0);tt([c({type:Boolean})],K.prototype,"loading",void 0);K=tt([d("wui-list-item")],K);var Mn=function(r,t,e,i){var n=arguments.length,o=n<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,e):i,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,t,e,i);else for(var a=r.length-1;a>=0;a--)(s=r[a])&&(o=(n<3?s(o):n>3?s(t,e,o):s(t,e))||o);return n>3&&o&&Object.defineProperty(t,e,o),o},Pr=class extends p{constructor(){super(...arguments),this.wallet=E.state.data?.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return l`
      <wui-flex gap="xs" flexDirection="column" .padding=${["s","s","l","s"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?l`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?l`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?l`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?l`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="paragraph-500" color="fg-100">Website</wui-text>
      </wui-list-item>
    `:null}onChromeStore(){this.wallet?.chrome_store&&f.openHref(this.wallet.chrome_store,"_blank")}onAppStore(){this.wallet?.app_store&&f.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&f.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&f.openHref(this.wallet.homepage,"_blank")}};Pr=Mn([d("w3m-downloads-view")],Pr);export{Ve as W3mAllWalletsView,To as W3mConnectingWcBasicView,Pr as W3mDownloadsView};
/*! Bundled license information:

lit-html/directives/ref.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
