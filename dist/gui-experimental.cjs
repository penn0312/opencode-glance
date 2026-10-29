"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const c=require("solid-js/web"),h=require("@opencode/plugin/gui"),o=require("solid-js"),q={input:0,output:0,reasoning:0,cache:{read:0,write:0}};function Q(t,e){return e?{input:t.input+e.input,output:t.output+e.output,reasoning:t.reasoning+e.reasoning,cache:{read:t.cache.read+e.cache.read,write:t.cache.write+e.cache.write}}:t}function k(t){return t.input+t.output+t.reasoning+t.cache.read+t.cache.write}function X(t){return t.reduce((e,n)=>e+(n.type==="user"?1:0),0)}function Z(t,e="assistant"){return e==="tool"?t.reduce((n,a)=>a.type!=="assistant"?n:n+a.content.reduce((i,s)=>i+(s.type==="tool"?1:0),0),0):t.reduce((n,a)=>n+(a.type==="assistant"?1:0),0)}function ee(t){let e=0,n=0;for(const a of t){if(a.type!=="assistant"||!a.tokens||typeof a.time.streamed!="number")continue;const i=a.tokens.output+a.tokens.reasoning;if(i<=0)continue;const s=(a.time.streamed-a.time.created)/1e3;s<=0||(e+=i,n+=s)}return n>0?Math.round(e/n):void 0}function te(t){for(let e=t.length-1;e>=0;e--){const n=t[e];if(!n||n.type!=="assistant"||!n.tokens||typeof n.time.streamed!="number")continue;const a=n.tokens.output+n.tokens.reasoning;if(a<=0)continue;const i=(n.time.streamed-n.time.created)/1e3;if(!(i<=0))return Math.round(a/i)}}function ne(t){return t.findLast(e=>e.type==="assistant"&&e.time.completed===void 0)}const re=/[\u2e80-\u2eff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;function ae(t){let e=0,n=0;for(const a of t)/\s/.test(a)||(re.test(a)?e++:n++);return Math.ceil(e+n/4)}function oe(t){let e=0;for(const n of t.content){if(n.type==="text"||n.type==="reasoning"){e+=ae(n.text);continue}if(n.type!=="tool")continue;const a=n.state.status==="streaming"?n.state.input:JSON.stringify(n.state.input);e+=Math.ceil((a?.length??0)/4)}return e}function ie(t){return t.content.findLast(e=>e.type==="tool"&&e.state.status==="running")}function se(t,e,n){if(!t)return;const a=Math.max(0,(n-t.time.created)/1e3),i=ie(t);if(i){const s=i.time.ran??i.time.created;return{kind:"tool",name:i.name,elapsed:Math.max(0,(n-s)/1e3)}}return e>0?{kind:"streaming",elapsed:a,estimatedTokens:e,rate:a>=2?Math.round(e/a):void 0}:{kind:"waiting",elapsed:a}}function b(t){const e=Math.max(0,Math.floor(t));if(e<60)return`${e}s`;const n=Math.floor(e/60);if(n<60){const s=e%60;return s?`${n}m ${s}s`:`${n}m`}const a=Math.floor(n/60),i=n%60;return i?`${a}h ${i}m`:`${a}h`}function ce(t){const e=t.input+t.cache.read+t.cache.write;if(!(e<=0))return Math.max(0,Math.min(100,Math.round(t.cache.read/e*100)))}function le(t,e){const n=e?t.findIndex(s=>s.id===e):-1;if(e&&n===-1)return;const a=n===-1?t.length:n,i=t.findLastIndex((s,u)=>s.type==="compaction"&&s.status==="completed"&&u<a);return t.findLast((s,u)=>s.type==="assistant"&&s.tokens!==void 0&&u>i&&u<a)}function ue(t,e,n){const a=le(t,n);if(!a)return;const i=k(a.tokens);if(i<=0)return;const s=e?.find(u=>u.providerID===a.model.providerID&&u.id===a.model.id);return{tokens:i,percent:s?.limit.context?Math.round(i/s.limit.context*100):void 0}}function de(t){const e=[[1e9,"B"],[1e6,"M"],[1e3,"K"]];for(const[n,a]of e)if(t>=n)return`${Number((t/n).toFixed(1))}${a}`;return String(t)}var pe=c.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><circle cx=8 cy=8 r=6></circle><path d="M8 4.5V8l2.4 1.5">'),ge=c.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><ellipse cx=8 cy=4.3 rx=5 ry=2.1></ellipse><path d="M3 4.3v7.4c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1V4.3"></path><path d="M3 8c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1">'),fe=c.template("<span class=glance-ring aria-hidden=true>"),me=c.template('<div class=glance-root><div class=glance-bar role=status><span class=glance-group><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group center"><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group end"><span class=glance-label>');function he(t,e=18){return t.length>e?`${t.slice(0,e-1)}…`:t}function ve(){return pe()}function xe(){return ge()}function Me(t){const e=()=>Math.max(0,Math.min(100,t.percent??0))*3.6;return(()=>{var n=fe();return c.effect(a=>c.setStyleProperty(n,"background",`conic-gradient(currentColor ${e()}deg, var(--v2-background-bg-layer-04) 0)`)),n})()}function be(t){const e=t.ctx,n=()=>e.sessions.current(),a=o.createMemo(()=>{const r=n();return r?.id?r.server.data.session.message.list(r.id):[]}),i=o.createMemo(()=>{const r=n();return r?.id?r.server.data.session.get(r.id):void 0}),s=o.createMemo(()=>{const r=n();if(!r?.id)return[];const l=r.server.data.session.family(r.id);return l.length?l:[r.id]}),u=o.createMemo(()=>{const r=n();return r?s().reduce((l,d)=>Q(l,r.server.data.session.get(d)?.tokens),q):q}),J=o.createMemo(()=>{const r=n();return r?r.server.data.location.model.list(r.location):void 0}),v=o.createMemo(()=>ue(a(),J(),i()?.revert?.messageID)),K=o.createMemo(()=>X(a())),O=e.options.steps==="tool"?"tool":"assistant",R=o.createMemo(()=>Z(a(),O)),p=o.createMemo(()=>ee(a())),x=o.createMemo(()=>te(a())),U=o.createMemo(()=>ce(u())),m=e.options.rate==="average"||e.options.rate==="last"?e.options.rate:"auto",M=o.createMemo(()=>{const r=n();return r?.id?r.server.data.session.status(r.id)==="running":!1}),[V,w]=o.createSignal(Date.now()),[y,$]=o.createSignal(),S=o.createMemo(()=>ne(a())),F=o.createMemo(()=>{const r=S();return r?oe(r):0}),C=o.createMemo(()=>se(S(),F(),V()));o.createEffect(()=>{if(!M())return;w(Date.now());const r=setInterval(()=>w(Date.now()),1e3);o.onCleanup(()=>clearInterval(r))}),o.createEffect(()=>{const r=C();if(!M()||!r||r.kind!=="streaming"||r.rate===void 0){$(void 0);return}const l=r.rate;$(d=>d===void 0?l:Math.round(d*.65+l*.35))});const H=o.createMemo(()=>m==="average"?p():x()??p()),_=o.createMemo(()=>e.t("glance.turns",{turns:K(),steps:R()})),T=o.createMemo(()=>e.t("glance.tokens",{tokens:de(k(u()))})),I=o.createMemo(()=>{const r=U();return r===void 0?void 0:e.t("glance.cache",{percent:r})}),j=o.createMemo(()=>{const r=v()?.percent;return r===void 0?"—":e.t("glance.context",{percent:r})}),D=o.createMemo(()=>{const r=C();if(!M()){const g=H();return g===void 0?void 0:e.t("glance.rate",{rate:g})}if(!r)return e.t("glance.preparing");if(r.kind==="tool")return e.t("glance.tool",{name:he(r.name),elapsed:b(r.elapsed)});if(r.kind==="waiting")return e.t("glance.waiting",{elapsed:b(r.elapsed)});const l=b(r.elapsed);if(m==="auto"&&y()!==void 0)return e.t("glance.live",{rate:y(),elapsed:l});const d=m==="average"?p():x()??p();return d===void 0?e.t("glance.streaming",{elapsed:l}):e.t("glance.rateElapsed",{rate:d,elapsed:l})}),E=o.createMemo(()=>D()?`${_()} · ${D()}`:_()),L=o.createMemo(()=>I()?`${T()} · ${I()}`:T());return c.createComponent(o.Show,{get when(){return n()},get children(){var r=me(),l=r.firstChild,d=l.firstChild,g=d.firstChild,W=g.nextSibling,N=d.nextSibling,G=N.firstChild,Y=G.nextSibling,z=N.nextSibling,A=z.firstChild;return c.insert(g,c.createComponent(ve,{})),c.insert(W,E),c.insert(G,c.createComponent(xe,{})),c.insert(Y,L),c.insert(z,c.createComponent(Me,{get percent(){return v()?.percent}}),A),c.insert(A,j),c.effect(f=>{var B=`${E()} · ${L()} · ${j()}`,P=`${k(u()).toLocaleString()} tokens · ${(v()?.tokens??0).toLocaleString()} in context`;return B!==f.e&&c.setAttribute(l,"aria-label",f.e=B),P!==f.t&&c.setAttribute(l,"title",f.t=P),f},{e:void 0,t:void 0}),r}})}const ke=`
.glance-root {
  display: flex;
  justify-content: center;
  padding: 4px 12px 8px;
  pointer-events: none;
}

.glance-bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: 1240px;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 0.5px solid var(--v2-border-border-muted);
  background: var(--v2-background-bg-base);
  box-shadow: var(--v2-elevation-raised);
  color: var(--v2-text-text-base);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.04px;
  white-space: nowrap;
  overflow: hidden;
}

.glance-group {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.glance-group.center {
  flex: 1;
  justify-content: center;
}

.glance-group.end {
  justify-content: flex-end;
}

.glance-icon {
  display: inline-flex;
  flex: none;
  color: var(--v2-text-text-muted);
}

.glance-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.glance-muted {
  color: var(--v2-text-text-muted);
}

.glance-ring {
  position: relative;
  display: inline-block;
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--v2-icon-icon-base, var(--v2-text-text-muted));
}

.glance-ring::after {
  content: "";
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--v2-background-bg-base);
}

@media (max-width: 760px) {
  .glance-group.center {
    display: none;
  }
}

@media (max-width: 480px) {
  .glance-root {
    padding: 2px 8px 6px;
  }

  .glance-bar {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }
}
`,we={"glance.turns":"{{turns}} turns {{steps}} steps","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"waiting {{elapsed}}","glance.streaming":"generating {{elapsed}}","glance.preparing":"preparing","glance.tokens":"{{tokens}} tok","glance.cache":"cache hit {{percent}}%","glance.context":"{{percent}}%","glance.command.toggle":"Glance: toggle status bar","glance.command.group":"Glance"},ye={"glance.turns":"{{turns}} 轮 {{steps}} 步","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"等待响应 {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"准备中","glance.tokens":"{{tokens}} tok","glance.cache":"缓存命中 {{percent}}%","glance.context":"{{percent}}%","glance.command.toggle":"Glance：显示/隐藏状态条","glance.command.group":"Glance"},$e=h.Plugin.define({i18n:{en:we,zh:ye},setup(t){const[e,n]=o.createSignal(t.options.show!==!1),a={at:"window.bottom",order:0,render:()=>c.createComponent(be,{ctx:t})};t.add(h.Style,ke),t.add(h.Slot,()=>e()?a:void 0),t.add(h.Command,()=>({id:"toggle",title:t.t("glance.command.toggle"),group:t.t("glance.command.group"),run:()=>{n(i=>!i)}}))}});exports.default=$e;
