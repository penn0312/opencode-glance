"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const l=require("solid-js/web"),G=require("@opencode/plugin/gui"),s=require("solid-js"),z={input:0,output:0,reasoning:0,cache:{read:0,write:0}};function A(t,e){return e?{input:t.input+e.input,output:t.output+e.output,reasoning:t.reasoning+e.reasoning,cache:{read:t.cache.read+e.cache.read,write:t.cache.write+e.cache.write}}:t}function _(t){return t.input+t.output+t.reasoning+t.cache.read+t.cache.write}function q(t){return t.reduce((e,n)=>e+(n.type==="user"?1:0),0)}function B(t,e="assistant"){return e==="tool"?t.reduce((n,r)=>r.type!=="assistant"?n:n+r.content.reduce((a,o)=>a+(o.type==="tool"?1:0),0),0):t.reduce((n,r)=>n+(r.type==="assistant"?1:0),0)}function K(t){let e=0,n=0;for(const r of t){if(r.type!=="assistant"||!r.tokens||typeof r.time.streamed!="number")continue;const a=r.tokens.output+r.tokens.reasoning;if(a<=0)continue;const o=(r.time.streamed-r.time.created)/1e3;o<=0||(e+=a,n+=o)}return n>0?Math.round(e/n):void 0}function P(t){for(let e=t.length-1;e>=0;e--){const n=t[e];if(!n||n.type!=="assistant"||!n.tokens||typeof n.time.streamed!="number")continue;const r=n.tokens.output+n.tokens.reasoning;if(r<=0)continue;const a=(n.time.streamed-n.time.created)/1e3;if(!(a<=0))return Math.round(r/a)}}function R(t){return t.findLast(e=>e.type==="assistant"&&e.time.completed===void 0)}const F=/[\u2e80-\u2eff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;function J(t){let e=0,n=0;for(const r of t)/\s/.test(r)||(F.test(r)?e++:n++);return Math.ceil(e+n/4)}function O(t){let e=0;for(const n of t.content){if(n.type==="text"||n.type==="reasoning"){e+=J(n.text);continue}if(n.type!=="tool")continue;const r=n.state.status==="streaming"?n.state.input:JSON.stringify(n.state.input);e+=Math.ceil((r?.length??0)/4)}return e}function U(t){return t.content.findLast(e=>e.type==="tool"&&e.state.status==="running")}function V(t,e,n){if(!t)return;const r=Math.max(0,(n-t.time.created)/1e3),a=U(t);if(a){const o=a.time.ran??a.time.created;return{kind:"tool",name:a.name,elapsed:Math.max(0,(n-o)/1e3)}}return e>0?{kind:"streaming",elapsed:r,estimatedTokens:e,rate:r>=2?Math.round(e/r):void 0}:{kind:"waiting",elapsed:r}}function C(t){const e=Math.max(0,Math.floor(t));if(e<60)return`${e}s`;const n=Math.floor(e/60);if(n<60){const o=e%60;return o?`${n}m ${o}s`:`${n}m`}const r=Math.floor(n/60),a=n%60;return a?`${r}h ${a}m`:`${r}h`}function H(t){const e=t.input+t.cache.read+t.cache.write;if(!(e<=0))return Math.max(0,Math.min(100,Math.round(t.cache.read/e*100)))}function Z(t,e){const n=e?t.findIndex(o=>o.id===e):-1;if(e&&n===-1)return;const r=n===-1?t.length:n,a=t.findLastIndex((o,i)=>o.type==="compaction"&&o.status==="completed"&&i<r);return t.findLast((o,i)=>o.type==="assistant"&&o.tokens!==void 0&&i>a&&i<r)}function W(t,e,n){const r=Z(t,n);if(!r)return;const a=_(r.tokens);if(a<=0)return;const o=e?.find(i=>i.providerID===r.model.providerID&&i.id===r.model.id);return{tokens:a,percent:o?.limit.context?Math.max(0,Math.min(100,Math.round(a/o.limit.context*100))):void 0}}function Y(t){if(!Number.isFinite(t)||t<0)return String(t);const e=[[1e3,"K"],[1e6,"M"],[1e9,"B"],[1e12,"T"]];let n=-1;for(let a=0;a<e.length;a++)t>=e[a][0]&&(n=a);if(n===-1)return String(t);let r=Number((t/e[n][0]).toFixed(1));return r>=1e3&&n+1<e.length&&(n++,r=Number((t/e[n][0]).toFixed(1))),`${r}${e[n][1]}`}function Q(t){return t==="average"||t==="last"||t==="auto"?t:"auto"}function X(t){return t==="tool"?"tool":"assistant"}function ee(t,e=18){return t.length>e?`${t.slice(0,e-1)}…`:t}function te(t){const e=t[t.length-1];return e?e.type==="assistant"?[t.length,e.id,"a",e.time.completed??0,e.time.streamed??0,e.tokens?.input??0,e.tokens?.output??0,e.tokens?.cache.read??0,e.tokens?.cache.write??0].join("|"):e.type==="compaction"?`${t.length}|${e.id}|c|${e.status}`:`${t.length}|${e.id}|${e.type}`:"0"}const ne=t=>t!==void 0;function ae(t,e){const n=te(e);return t&&t.key===n?t:{key:n,messages:e}}function re(t,e){const[n,r]=s.createSignal(Date.now()),[a,o]=s.createSignal();s.createEffect(()=>{if(!t.running())return;r(Date.now());const c=setInterval(()=>r(Date.now()),1e3);s.onCleanup(()=>clearInterval(c))});const i=s.createMemo(c=>ae(c,t.messages())),$=s.createMemo(()=>t.family()),h=s.createMemo(()=>$().reduce((c,u)=>A(c,t.sessionTokens(u)),z)),k=s.createMemo(()=>W(i().messages,t.models(),t.session()?.revert?.messageID)),m=s.createMemo(()=>q(i().messages)),x=s.createMemo(()=>B(i().messages,e.steps)),d=s.createMemo(()=>K(i().messages)),v=s.createMemo(()=>P(i().messages)),g=s.createMemo(()=>H(h())),p=s.createMemo(()=>t.running()),f=s.createMemo(()=>{const c=R(t.messages());return V(c,c?O(c):0,n())});s.createEffect(()=>{const c=f();if(!p()||!c||c.kind!=="streaming"||c.rate===void 0){o(void 0);return}const u=c.rate;o(M=>M===void 0?u:Math.round(M*.65+u*.35))});const E=s.createMemo(()=>e.rate==="average"?d():v()??d()),w=s.createMemo(()=>`${e.plural("glance.turn",m())} ${e.plural("glance.step",x())}`),b=s.createMemo(()=>e.t("glance.tokens",{tokens:Y(_(h()))})),T=s.createMemo(()=>{const c=g();return c===void 0?void 0:e.t("glance.cache",{percent:c})}),S=s.createMemo(()=>{const c=k()?.percent;return c===void 0?"—":e.t("glance.context",{percent:c})}),y=s.createMemo(()=>{const c=f();if(!p()){const I=E();return I===void 0?void 0:e.t("glance.rate",{rate:I})}if(!c)return e.t("glance.preparing");if(c.kind==="tool")return e.t("glance.tool",{name:ee(c.name),elapsed:C(c.elapsed)});if(c.kind==="waiting")return e.t("glance.waiting",{elapsed:C(c.elapsed)});const u=C(c.elapsed);if(e.rate==="auto"&&a()!==void 0)return e.t("glance.live",{rate:a(),elapsed:u});const M=e.rate==="average"?d():v()??d();return M===void 0?e.t("glance.streaming",{elapsed:u}):e.t("glance.rateElapsed",{rate:M,elapsed:u})}),j=s.createMemo(()=>y()?`${w()} · ${y()}`:w()),D=s.createMemo(()=>T()?`${b()} · ${T()}`:b()),N=s.createMemo(()=>`${m()}/${x()} · ${S()}`),L=s.createMemo(()=>(p()?[w(),y(),b(),S()]:[w(),y(),b(),T(),S()]).filter(ne).join(" · "));return{totals:h,hit:g,usage:k,turns:m,steps:x,running:p,speed:E,activity:f,turnText:w,tokensText:b,cacheText:T,contextText:S,activityText:y,progressText:j,usageText:D,compactText:N,mediumText:L}}var oe=l.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><circle cx=8 cy=8 r=6></circle><path d="M8 4.5V8l2.4 1.5">'),ce=l.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><ellipse cx=8 cy=4.3 rx=5 ry=2.1></ellipse><path d="M3 4.3v7.4c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1V4.3"></path><path d="M3 8c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1">'),se=l.template("<span class=glance-ring aria-hidden=true>"),le=l.template('<div class=glance-root><div class=glance-bar role=status><span class=glance-group><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group center"><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group end"><span class=glance-label>');function ie(){return oe()}function ge(){return ce()}function ue(t){const e=()=>Math.max(0,Math.min(100,t.percent??0))*3.6;return(()=>{var n=se();return l.effect(r=>l.setStyleProperty(n,"background",`conic-gradient(currentColor ${e()}deg, var(--v2-background-bg-layer-04) 0)`)),n})()}function de(t){const e=t.ctx,n=()=>e.sessions.current(),r=re({messages:()=>{const a=n();return a?.id?a.server.data.session.message.list(a.id):[]},session:()=>{const a=n();return a?.id?a.server.data.session.get(a.id):void 0},family:()=>{const a=n();if(!a?.id)return[];const o=a.server.data.session.family(a.id);return o.length?o:[a.id]},sessionTokens:a=>n()?.server.data.session.get(a)?.tokens,models:()=>{const a=n();return a?a.server.data.location.model.list(a.location):void 0},running:()=>{const a=n();return a?.id?a.server.data.session.status(a.id)==="running":!1}},{steps:X(e.options.steps),rate:Q(e.options.rate),t:(a,o)=>e.t(a,o),plural:(a,o)=>e.plural(a,o)});return l.createComponent(s.Show,{get when(){return n()},get children(){var a=le(),o=a.firstChild,i=o.firstChild,$=i.firstChild,h=$.nextSibling,k=i.nextSibling,m=k.firstChild,x=m.nextSibling,d=k.nextSibling,v=d.firstChild;return l.insert($,l.createComponent(ie,{})),l.insert(h,()=>r.progressText()),l.insert(m,l.createComponent(ge,{})),l.insert(x,()=>r.usageText()),l.insert(d,l.createComponent(ue,{get percent(){return r.usage()?.percent}}),v),l.insert(v,()=>r.contextText()),l.effect(g=>{var p=`${r.progressText()} · ${r.usageText()} · ${r.contextText()}`,f=`${_(r.totals()).toLocaleString()} tokens · ${(r.usage()?.tokens??0).toLocaleString()} in context`;return p!==g.e&&l.setAttribute(o,"aria-label",g.e=p),f!==g.t&&l.setAttribute(o,"title",g.t=f),g},{e:void 0,t:void 0}),a}})}const pe=`
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
`,me={"glance.turn.one":"{{count}} turn","glance.turn.other":"{{count}} turns","glance.step.one":"{{count}} step","glance.step.other":"{{count}} steps","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"cache hit {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"waiting {{elapsed}}","glance.streaming":"generating {{elapsed}}","glance.preparing":"preparing","glance.command.toggle":"Glance: toggle status bar","glance.command.group":"Glance"},fe={"glance.turn.one":"{{count}} 轮","glance.turn.other":"{{count}} 轮","glance.step.one":"{{count}} 步","glance.step.other":"{{count}} 步","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"缓存命中 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"等待响应 {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"准备中","glance.command.toggle":"Glance：显示/隐藏状态条","glance.command.group":"Glance"},he={"glance.turn.one":"{{count}} 輪","glance.turn.other":"{{count}} 輪","glance.step.one":"{{count}} 步","glance.step.other":"{{count}} 步","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"快取命中 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"等待回應 {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"準備中","glance.command.toggle":"Glance：顯示/隱藏狀態列","glance.command.group":"Glance"},ke={"glance.turn.one":"{{count}} ターン","glance.turn.other":"{{count}} ターン","glance.step.one":"{{count}} ステップ","glance.step.other":"{{count}} ステップ","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"キャッシュヒット {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"応答待ち {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"準備中","glance.command.toggle":"Glance：ステータスバーを表示/非表示","glance.command.group":"Glance"},xe={"glance.turn.one":"{{count}}턴","glance.turn.other":"{{count}}턴","glance.step.one":"{{count}}단계","glance.step.other":"{{count}}단계","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"캐시 적중 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"응답 대기 {{elapsed}}","glance.streaming":"생성 중 {{elapsed}}","glance.preparing":"준비 중","glance.command.toggle":"Glance: 상태 표시줄 표시/숨기기","glance.command.group":"Glance"},ve={"glance.turn.one":"{{count}} Zug","glance.turn.other":"{{count}} Züge","glance.step.one":"{{count}} Schritt","glance.step.other":"{{count}} Schritte","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"Cache-Treffer {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"warte auf Antwort {{elapsed}}","glance.streaming":"generiert {{elapsed}}","glance.preparing":"bereit","glance.command.toggle":"Glance: Statusleiste ein-/ausblenden","glance.command.group":"Glance"},we={"glance.turn.one":"{{count}} tour","glance.turn.other":"{{count}} tours","glance.step.one":"{{count}} étape","glance.step.other":"{{count}} étapes","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"en attente de réponse {{elapsed}}","glance.streaming":"génération {{elapsed}}","glance.preparing":"préparation","glance.command.toggle":"Glance : afficher/masquer la barre d’état","glance.command.group":"Glance"},be={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turnos","glance.step.one":"{{count}} paso","glance.step.other":"{{count}} pasos","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"aciertos de caché {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"esperando respuesta {{elapsed}}","glance.streaming":"generando {{elapsed}}","glance.preparing":"preparando","glance.command.toggle":"Glance: mostrar/ocultar la barra de estado","glance.command.group":"Glance"},ye={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turnos","glance.step.one":"{{count}} passo","glance.step.other":"{{count}} passos","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"acertos de cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"aguardando resposta {{elapsed}}","glance.streaming":"gerando {{elapsed}}","glance.preparing":"preparando","glance.command.toggle":"Glance: mostrar/ocultar a barra de status","glance.command.group":"Glance"},Me={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turni","glance.step.one":"{{count}} passo","glance.step.other":"{{count}} passi","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"hit cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"in attesa di risposta {{elapsed}}","glance.streaming":"generazione {{elapsed}}","glance.preparing":"preparazione","glance.command.toggle":"Glance: mostra/nascondi la barra di stato","glance.command.group":"Glance"},$e={en:me,zh:fe,zht:he,ja:ke,ko:xe,de:ve,fr:we,es:be,pt:ye,it:Me},Te=G.Plugin.define({i18n:$e,setup(t){const[e,n]=s.createSignal(t.options.show!==!1),r={at:"window.bottom",order:0,render:()=>l.createComponent(de,{ctx:t})};t.add(G.Style,pe),t.add(G.Slot,()=>e()?r:void 0),t.add(G.Command,()=>({id:"toggle",title:t.t("glance.command.toggle"),group:t.t("glance.command.group"),run:()=>{n(a=>!a)}}))}});exports.default=Te;
