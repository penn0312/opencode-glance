"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const l=require("solid-js/web"),h=require("@opencode/plugin/gui"),r=require("solid-js"),P={input:0,output:0,reasoning:0,cache:{read:0,write:0}};function Y(t,e){return e?{input:t.input+e.input,output:t.output+e.output,reasoning:t.reasoning+e.reasoning,cache:{read:t.cache.read+e.cache.read,write:t.cache.write+e.cache.write}}:t}function b(t){return t.input+t.output+t.reasoning+t.cache.read+t.cache.write}function Q(t){return t.reduce((e,n)=>e+(n.type==="user"?1:0),0)}function X(t,e="assistant"){return e==="tool"?t.reduce((n,o)=>o.type!=="assistant"?n:n+o.content.reduce((c,s)=>c+(s.type==="tool"?1:0),0),0):t.reduce((n,o)=>n+(o.type==="assistant"?1:0),0)}function ee(t){let e=0,n=0;for(const o of t){if(o.type!=="assistant"||!o.tokens||typeof o.time.streamed!="number")continue;const c=o.tokens.output+o.tokens.reasoning;if(c<=0)continue;const s=(o.time.streamed-o.time.created)/1e3;s<=0||(e+=c,n+=s)}return n>0?Math.round(e/n):void 0}function te(t){for(let e=t.length-1;e>=0;e--){const n=t[e];if(!n||n.type!=="assistant"||!n.tokens||typeof n.time.streamed!="number")continue;const o=n.tokens.output+n.tokens.reasoning;if(o<=0)continue;const c=(n.time.streamed-n.time.created)/1e3;if(!(c<=0))return Math.round(o/c)}}function ne(t){return t.findLast(e=>e.type==="assistant"&&e.time.completed===void 0)}const ae=/[\u2e80-\u2eff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/;function oe(t){let e=0,n=0;for(const o of t)/\s/.test(o)||(ae.test(o)?e++:n++);return Math.ceil(e+n/4)}function re(t){let e=0;for(const n of t.content){if(n.type==="text"||n.type==="reasoning"){e+=oe(n.text);continue}if(n.type!=="tool")continue;const o=n.state.status==="streaming"?n.state.input:JSON.stringify(n.state.input);e+=Math.ceil((o?.length??0)/4)}return e}function ce(t){return t.content.findLast(e=>e.type==="tool"&&e.state.status==="running")}function se(t,e,n){if(!t)return;const o=Math.max(0,(n-t.time.created)/1e3),c=ce(t);if(c){const s=c.time.ran??c.time.created;return{kind:"tool",name:c.name,elapsed:Math.max(0,(n-s)/1e3)}}return e>0?{kind:"streaming",elapsed:o,estimatedTokens:e,rate:o>=2?Math.round(e/o):void 0}:{kind:"waiting",elapsed:o}}function w(t){const e=Math.max(0,Math.floor(t));if(e<60)return`${e}s`;const n=Math.floor(e/60);if(n<60){const s=e%60;return s?`${n}m ${s}s`:`${n}m`}const o=Math.floor(n/60),c=n%60;return c?`${o}h ${c}m`:`${o}h`}function le(t){const e=t.input+t.cache.read+t.cache.write;if(!(e<=0))return Math.max(0,Math.min(100,Math.round(t.cache.read/e*100)))}function ie(t,e){const n=e?t.findIndex(s=>s.id===e):-1;if(e&&n===-1)return;const o=n===-1?t.length:n,c=t.findLastIndex((s,g)=>s.type==="compaction"&&s.status==="completed"&&g<o);return t.findLast((s,g)=>s.type==="assistant"&&s.tokens!==void 0&&g>c&&g<o)}function ge(t,e,n){const o=ie(t,n);if(!o)return;const c=b(o.tokens);if(c<=0)return;const s=e?.find(g=>g.providerID===o.model.providerID&&g.id===o.model.id);return{tokens:c,percent:s?.limit.context?Math.round(c/s.limit.context*100):void 0}}function ue(t){const e=[[1e9,"B"],[1e6,"M"],[1e3,"K"]];for(const[n,o]of e)if(t>=n)return`${Number((t/n).toFixed(1))}${o}`;return String(t)}var pe=l.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><circle cx=8 cy=8 r=6></circle><path d="M8 4.5V8l2.4 1.5">'),de=l.template('<svg width=14 height=14 viewBox="0 0 16 16"fill=none stroke=currentColor stroke-width=1.4 stroke-linecap=round stroke-linejoin=round aria-hidden=true><ellipse cx=8 cy=4.3 rx=5 ry=2.1></ellipse><path d="M3 4.3v7.4c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1V4.3"></path><path d="M3 8c0 1.2 2.2 2.1 5 2.1s5-.9 5-2.1">'),me=l.template("<span class=glance-ring aria-hidden=true>"),fe=l.template('<div class=glance-root><div class=glance-bar role=status><span class=glance-group><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group center"><span class=glance-icon></span><span class=glance-label></span></span><span class="glance-group end"><span class=glance-label>');function he(t,e=18){return t.length>e?`${t.slice(0,e-1)}…`:t}function ve(){return pe()}function ke(){return de()}function xe(t){const e=()=>Math.max(0,Math.min(100,t.percent??0))*3.6;return(()=>{var n=me();return l.effect(o=>l.setStyleProperty(n,"background",`conic-gradient(currentColor ${e()}deg, var(--v2-background-bg-layer-04) 0)`)),n})()}function we(t){const e=t.ctx,n=()=>e.sessions.current(),o=r.createMemo(()=>{const a=n();return a?.id?a.server.data.session.message.list(a.id):[]}),c=r.createMemo(()=>{const a=n();return a?.id?a.server.data.session.get(a.id):void 0}),s=r.createMemo(()=>{const a=n();if(!a?.id)return[];const i=a.server.data.session.family(a.id);return i.length?i:[a.id]}),g=r.createMemo(()=>{const a=n();return a?s().reduce((i,u)=>Y(i,a.server.data.session.get(u)?.tokens),P):P}),J=r.createMemo(()=>{const a=n();return a?a.server.data.location.model.list(a.location):void 0}),v=r.createMemo(()=>ge(o(),J(),c()?.revert?.messageID)),K=r.createMemo(()=>Q(o())),O=e.options.steps==="tool"?"tool":"assistant",R=r.createMemo(()=>X(o(),O)),p=r.createMemo(()=>ee(o())),k=r.createMemo(()=>te(o())),U=r.createMemo(()=>le(g())),f=e.options.rate==="average"||e.options.rate==="last"?e.options.rate:"auto",x=r.createMemo(()=>{const a=n();return a?.id?a.server.data.session.status(a.id)==="running":!1}),[V,M]=r.createSignal(Date.now()),[y,$]=r.createSignal(),S=r.createMemo(()=>ne(o())),Z=r.createMemo(()=>{const a=S();return a?re(a):0}),G=r.createMemo(()=>se(S(),Z(),V()));r.createEffect(()=>{if(!x())return;M(Date.now());const a=setInterval(()=>M(Date.now()),1e3);r.onCleanup(()=>clearInterval(a))}),r.createEffect(()=>{const a=G();if(!x()||!a||a.kind!=="streaming"||a.rate===void 0){$(void 0);return}const i=a.rate;$(u=>u===void 0?i:Math.round(u*.65+i*.35))});const F=r.createMemo(()=>f==="average"?p():k()??p()),C=r.createMemo(()=>`${e.plural("glance.turn",K())} ${e.plural("glance.step",R())}`),T=r.createMemo(()=>e.t("glance.tokens",{tokens:ue(b(g()))})),_=r.createMemo(()=>{const a=U();return a===void 0?void 0:e.t("glance.cache",{percent:a})}),E=r.createMemo(()=>{const a=v()?.percent;return a===void 0?"—":e.t("glance.context",{percent:a})}),I=r.createMemo(()=>{const a=G();if(!x()){const d=F();return d===void 0?void 0:e.t("glance.rate",{rate:d})}if(!a)return e.t("glance.preparing");if(a.kind==="tool")return e.t("glance.tool",{name:he(a.name),elapsed:w(a.elapsed)});if(a.kind==="waiting")return e.t("glance.waiting",{elapsed:w(a.elapsed)});const i=w(a.elapsed);if(f==="auto"&&y()!==void 0)return e.t("glance.live",{rate:y(),elapsed:i});const u=f==="average"?p():k()??p();return u===void 0?e.t("glance.streaming",{elapsed:i}):e.t("glance.rateElapsed",{rate:u,elapsed:i})}),j=r.createMemo(()=>I()?`${C()} · ${I()}`:C()),D=r.createMemo(()=>_()?`${T()} · ${_()}`:T());return l.createComponent(r.Show,{get when(){return n()},get children(){var a=fe(),i=a.firstChild,u=i.firstChild,d=u.firstChild,H=d.nextSibling,z=u.nextSibling,L=z.firstChild,W=L.nextSibling,N=z.nextSibling,A=N.firstChild;return l.insert(d,l.createComponent(ve,{})),l.insert(H,j),l.insert(L,l.createComponent(ke,{})),l.insert(W,D),l.insert(N,l.createComponent(xe,{get percent(){return v()?.percent}}),A),l.insert(A,E),l.effect(m=>{var q=`${j()} · ${D()} · ${E()}`,B=`${b(g()).toLocaleString()} tokens · ${(v()?.tokens??0).toLocaleString()} in context`;return q!==m.e&&l.setAttribute(i,"aria-label",m.e=q),B!==m.t&&l.setAttribute(i,"title",m.t=B),m},{e:void 0,t:void 0}),a}})}const be=`
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
`,Me={"glance.turn.one":"{{count}} turn","glance.turn.other":"{{count}} turns","glance.step.one":"{{count}} step","glance.step.other":"{{count}} steps","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"cache hit {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"waiting {{elapsed}}","glance.streaming":"generating {{elapsed}}","glance.preparing":"preparing","glance.command.toggle":"Glance: toggle status bar","glance.command.group":"Glance"},ye={"glance.turn.one":"{{count}} 轮","glance.turn.other":"{{count}} 轮","glance.step.one":"{{count}} 步","glance.step.other":"{{count}} 步","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"缓存命中 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"等待响应 {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"准备中","glance.command.toggle":"Glance：显示/隐藏状态条","glance.command.group":"Glance"},$e={"glance.turn.one":"{{count}} 輪","glance.turn.other":"{{count}} 輪","glance.step.one":"{{count}} 步","glance.step.other":"{{count}} 步","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"快取命中 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"等待回應 {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"準備中","glance.command.toggle":"Glance：顯示/隱藏狀態列","glance.command.group":"Glance"},Se={"glance.turn.one":"{{count}} ターン","glance.turn.other":"{{count}} ターン","glance.step.one":"{{count}} ステップ","glance.step.other":"{{count}} ステップ","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"キャッシュヒット {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"応答待ち {{elapsed}}","glance.streaming":"生成中 {{elapsed}}","glance.preparing":"準備中","glance.command.toggle":"Glance：ステータスバーを表示/非表示","glance.command.group":"Glance"},Ge={"glance.turn.one":"{{count}}턴","glance.turn.other":"{{count}}턴","glance.step.one":"{{count}}단계","glance.step.other":"{{count}}단계","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"캐시 적중 {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"응답 대기 {{elapsed}}","glance.streaming":"생성 중 {{elapsed}}","glance.preparing":"준비 중","glance.command.toggle":"Glance: 상태 표시줄 표시/숨기기","glance.command.group":"Glance"},Ce={"glance.turn.one":"{{count}} Zug","glance.turn.other":"{{count}} Züge","glance.step.one":"{{count}} Schritt","glance.step.other":"{{count}} Schritte","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"Cache-Treffer {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"warte auf Antwort {{elapsed}}","glance.streaming":"generiert {{elapsed}}","glance.preparing":"bereit","glance.command.toggle":"Glance: Statusleiste ein-/ausblenden","glance.command.group":"Glance"},Te={"glance.turn.one":"{{count}} tour","glance.turn.other":"{{count}} tours","glance.step.one":"{{count}} étape","glance.step.other":"{{count}} étapes","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"en attente de réponse {{elapsed}}","glance.streaming":"génération {{elapsed}}","glance.preparing":"préparation","glance.command.toggle":"Glance : afficher/masquer la barre d’état","glance.command.group":"Glance"},_e={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turnos","glance.step.one":"{{count}} paso","glance.step.other":"{{count}} pasos","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"aciertos de caché {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"esperando respuesta {{elapsed}}","glance.streaming":"generando {{elapsed}}","glance.preparing":"preparando","glance.command.toggle":"Glance: mostrar/ocultar la barra de estado","glance.command.group":"Glance"},Ee={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turnos","glance.step.one":"{{count}} passo","glance.step.other":"{{count}} passos","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"acertos de cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"aguardando resposta {{elapsed}}","glance.streaming":"gerando {{elapsed}}","glance.preparing":"preparando","glance.command.toggle":"Glance: mostrar/ocultar a barra de status","glance.command.group":"Glance"},Ie={"glance.turn.one":"{{count}} turno","glance.turn.other":"{{count}} turni","glance.step.one":"{{count}} passo","glance.step.other":"{{count}} passi","glance.rate":"{{rate}} tok/s","glance.rateElapsed":"{{rate}} tok/s · {{elapsed}}","glance.live":"~{{rate}} tok/s · {{elapsed}}","glance.tokens":"{{tokens}} tok","glance.cache":"hit cache {{percent}}%","glance.context":"{{percent}}%","glance.tool":"{{name}} {{elapsed}}","glance.waiting":"in attesa di risposta {{elapsed}}","glance.streaming":"generazione {{elapsed}}","glance.preparing":"preparazione","glance.command.toggle":"Glance: mostra/nascondi la barra di stato","glance.command.group":"Glance"},je={en:Me,zh:ye,zht:$e,ja:Se,ko:Ge,de:Ce,fr:Te,es:_e,pt:Ee,it:Ie},De=h.Plugin.define({i18n:je,setup(t){const[e,n]=r.createSignal(t.options.show!==!1),o={at:"window.bottom",order:0,render:()=>l.createComponent(we,{ctx:t})};t.add(h.Style,be),t.add(h.Slot,()=>e()?o:void 0),t.add(h.Command,()=>({id:"toggle",title:t.t("glance.command.toggle"),group:t.t("glance.command.group"),run:()=>{n(c=>!c)}}))}});exports.default=De;
