const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./src-PT63JZBF-Bwr_j4W9.js","./chunk-UHBPXUGN-Ds4T0FkE.js","./chunk-Q7BEUNXA-BOxUDfG-.js","./chunk-NO3DWTOG-CX8iQcBF.js","./index-D_VwuaYK.js","./index-ByqDTMS3.css"])))=>i.map(i=>d[i]);
import{Zt as e}from"./chunk-UHBPXUGN-Ds4T0FkE.js";import"./chunk-Q7BEUNXA-BOxUDfG-.js";import{Ir as t,zn as n}from"./chunk-NO3DWTOG-CX8iQcBF.js";import{c as r,i,r as a}from"./index-D_VwuaYK.js";e(),e(),e(),e();var o=class e{constructor(t,n,r,i,a=`div`){this.parent=t,this.object=n,this.property=r,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(a),this.domElement.classList.add(`controller`),this.domElement.classList.add(i),this.$name=document.createElement(`div`),this.$name.classList.add(`name`),e.nextNameID=e.nextNameID||0,this.$name.id=`lil-gui-name-${++e.nextNameID}`,this.$widget=document.createElement(`div`),this.$widget.classList.add(`widget`),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener(`keydown`,e=>e.stopPropagation()),this.domElement.addEventListener(`keyup`,e=>e.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(r)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled||(this._disabled=e,this.domElement.classList.toggle(`disabled`,e),this.$disable.toggleAttribute(`disabled`,e)),this}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}options(e){let t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);let e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}},s=class extends o{constructor(e,t,n){super(e,t,n,`boolean`,`label`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`checkbox`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener(`change`,()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}};function c(e){let t,n;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?n=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?n=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(n=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),n?`#`+n:!1}var l={isPrimitive:!0,match:e=>typeof e==`string`,fromHexString:c,toHexString:c},u={isPrimitive:!0,match:e=>typeof e==`number`,fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>`#`+e.toString(16).padStart(6,0)},d=[l,u,{isPrimitive:!1,match:e=>Array.isArray(e),fromHexString(e,t,n=1){let r=u.fromHexString(e);t[0]=(r>>16&255)/255*n,t[1]=(r>>8&255)/255*n,t[2]=(r&255)/255*n},toHexString([e,t,n],r=1){r=255/r;let i=e*r<<16^t*r<<8^(n*r|0);return u.toHexString(i)}},{isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,n=1){let r=u.fromHexString(e);t.r=(r>>16&255)/255*n,t.g=(r>>8&255)/255*n,t.b=(r&255)/255*n},toHexString({r:e,g:t,b:n},r=1){r=255/r;let i=e*r<<16^t*r<<8^(n*r|0);return u.toHexString(i)}}];function f(e){return d.find(t=>t.match(e))}var p=class extends o{constructor(e,t,n,r){super(e,t,n,`color`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`color`),this.$input.setAttribute(`tabindex`,-1),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$text=document.createElement(`input`),this.$text.setAttribute(`type`,`text`),this.$text.setAttribute(`spellcheck`,`false`),this.$text.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=f(this.initialValue),this._rgbScale=r,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener(`input`,()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$text.addEventListener(`input`,()=>{let e=c(this.$text.value);e&&this._setValueFromHexString(e)}),this.$text.addEventListener(`focus`,()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener(`blur`,()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){let t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}},m=class extends o{constructor(e,t,n){super(e,t,n,`function`),this.$button=document.createElement(`button`),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener(`click`,e=>{e.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$disable=this.$button}},h=class extends o{constructor(e,t,n,r,i,a){super(e,t,n,`number`),this._initInput(),this.min(r),this.max(i);let o=a!==void 0;this.step(o?a:this._getImplicitStep(),o),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){let e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+`%`}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),window.matchMedia(`(pointer: coarse)`).matches&&(this.$input.setAttribute(`type`,`number`),this.$input.setAttribute(`step`,`any`)),this.$widget.appendChild(this.$input),this.$disable=this.$input;let e=()=>{let e=parseFloat(this.$input.value);isNaN(e)||(this._stepExplicit&&(e=this._snap(e)),this.setValue(this._clamp(e)))},t=e=>{let t=parseFloat(this.$input.value);isNaN(t)||(this._snapClampSetValue(t+e),this.$input.value=this.getValue())},n=e=>{e.key===`Enter`&&this.$input.blur(),e.code===`ArrowUp`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e))),e.code===`ArrowDown`&&(e.preventDefault(),t(this._step*this._arrowKeyMultiplier(e)*-1))},r=e=>{this._inputFocused&&(e.preventDefault(),t(this._step*this._normalizeMouseWheel(e)))},i=!1,a,o,s,c,l,u=e=>{a=e.clientX,o=s=e.clientY,i=!0,c=this.getValue(),l=0,window.addEventListener(`mousemove`,d),window.addEventListener(`mouseup`,f)},d=e=>{if(i){let t=e.clientX-a,n=e.clientY-o;Math.abs(n)>5?(e.preventDefault(),this.$input.blur(),i=!1,this._setDraggingStyle(!0,`vertical`)):Math.abs(t)>5&&f()}if(!i){let t=e.clientY-s;l-=t*this._step*this._arrowKeyMultiplier(e),c+l>this._max?l=this._max-c:c+l<this._min&&(l=this._min-c),this._snapClampSetValue(c+l)}s=e.clientY},f=()=>{this._setDraggingStyle(!1,`vertical`),this._callOnFinishChange(),window.removeEventListener(`mousemove`,d),window.removeEventListener(`mouseup`,f)};this.$input.addEventListener(`input`,e),this.$input.addEventListener(`keydown`,n),this.$input.addEventListener(`wheel`,r,{passive:!1}),this.$input.addEventListener(`mousedown`,u),this.$input.addEventListener(`focus`,()=>{this._inputFocused=!0}),this.$input.addEventListener(`blur`,()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()})}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement(`div`),this.$slider.classList.add(`slider`),this.$fill=document.createElement(`div`),this.$fill.classList.add(`fill`),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add(`hasSlider`);let e=(e,t,n,r,i)=>(e-t)/(n-t)*(i-r)+r,t=t=>{let n=this.$slider.getBoundingClientRect(),r=e(t,n.left,n.right,this._min,this._max);this._snapClampSetValue(r)},n=e=>{this._setDraggingStyle(!0),t(e.clientX),window.addEventListener(`mousemove`,r),window.addEventListener(`mouseup`,i)},r=e=>{t(e.clientX)},i=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`mousemove`,r),window.removeEventListener(`mouseup`,i)},a=!1,o,s,c=e=>{e.preventDefault(),this._setDraggingStyle(!0),t(e.touches[0].clientX),a=!1},l=e=>{e.touches.length>1||(this._hasScrollBar?(o=e.touches[0].clientX,s=e.touches[0].clientY,a=!0):c(e),window.addEventListener(`touchmove`,u,{passive:!1}),window.addEventListener(`touchend`,d))},u=e=>{if(a){let t=e.touches[0].clientX-o,n=e.touches[0].clientY-s;Math.abs(t)>Math.abs(n)?c(e):(window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d))}else e.preventDefault(),t(e.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener(`touchmove`,u),window.removeEventListener(`touchend`,d)},f=this._callOnFinishChange.bind(this),p;this.$slider.addEventListener(`mousedown`,n),this.$slider.addEventListener(`touchstart`,l,{passive:!1}),this.$slider.addEventListener(`wheel`,e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&this._hasScrollBar)return;e.preventDefault();let t=this._normalizeMouseWheel(e)*this._step;this._snapClampSetValue(this.getValue()+t),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(f,400)},{passive:!1})}_setDraggingStyle(e,t=`horizontal`){this.$slider&&this.$slider.classList.toggle(`active`,e),document.body.classList.toggle(`lil-gui-dragging`,e),document.body.classList.toggle(`lil-gui-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=Math.round(e/this._step)*this._step;return parseFloat(t.toPrecision(15))}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){let e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}},g=class extends o{constructor(e,t,n,r){super(e,t,n,`option`),this.$select=document.createElement(`select`),this.$select.setAttribute(`aria-labelledby`,this.$name.id),this.$display=document.createElement(`div`),this.$display.classList.add(`display`),this.$select.addEventListener(`change`,()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener(`focus`,()=>{this.$display.classList.add(`focus`)}),this.$select.addEventListener(`blur`,()=>{this.$display.classList.remove(`focus`)}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(r)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(e=>{let t=document.createElement(`option`);t.textContent=e,this.$select.appendChild(t)}),this.updateDisplay(),this}updateDisplay(){let e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}},_=class extends o{constructor(e,t,n){super(e,t,n,`string`),this.$input=document.createElement(`input`),this.$input.setAttribute(`type`,`text`),this.$input.setAttribute(`spellcheck`,`false`),this.$input.setAttribute(`aria-labelledby`,this.$name.id),this.$input.addEventListener(`input`,()=>{this.setValue(this.$input.value)}),this.$input.addEventListener(`keydown`,e=>{e.code===`Enter`&&this.$input.blur()}),this.$input.addEventListener(`blur`,()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}},v=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: none;
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
  }
  .lil-gui button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function y(e){let t=document.createElement(`style`);t.innerHTML=e;let n=document.querySelector(`head link[rel=stylesheet], head style`);n?document.head.insertBefore(t,n):document.head.appendChild(t)}var b=!1,x=class e{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:r,title:i=`Controls`,closeFolders:a=!1,injectStyles:o=!0,touchStyles:s=!0}={}){this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement(`div`),this.domElement.classList.add(`lil-gui`),this.$title=document.createElement(`div`),this.$title.classList.add(`title`),this.$title.setAttribute(`role`,`button`),this.$title.setAttribute(`aria-expanded`,!0),this.$title.setAttribute(`tabindex`,0),this.$title.addEventListener(`click`,()=>this.openAnimated(this._closed)),this.$title.addEventListener(`keydown`,e=>{(e.code===`Enter`||e.code===`Space`)&&(e.preventDefault(),this.$title.click())}),this.$title.addEventListener(`touchstart`,()=>{},{passive:!0}),this.$children=document.createElement(`div`),this.$children.classList.add(`children`),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(i),this.parent?(this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement)):(this.domElement.classList.add(`root`),s&&this.domElement.classList.add(`allow-touch-styles`),!b&&o&&(y(v),b=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add(`autoPlace`),document.body.appendChild(this.domElement)),r&&this.domElement.style.setProperty(`--width`,r+`px`),this._closeFolders=a)}add(e,t,n,r,i){if(Object(n)===n)return new g(this,e,t,n);let a=e[t];switch(typeof a){case`number`:return new h(this,e,t,n,r,i);case`boolean`:return new s(this,e,t);case`string`:return new _(this,e,t);case`function`:return new m(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,a)}addColor(e,t,n=1){return new p(this,e,t,n)}addFolder(t){let n=new e({parent:this,title:t});return this.root._closeFolders&&n.close(),n}load(e,t=!0){return e.controllers&&this.controllers.forEach(t=>{t instanceof m||t._name in e.controllers&&t.load(e.controllers[t._name])}),t&&e.folders&&this.folders.forEach(t=>{t._title in e.folders&&t.load(e.folders[t._title])}),this}save(e=!0){let t={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof m)){if(e._name in t.controllers)throw Error(`Cannot save GUI with duplicate property "${e._name}"`);t.controllers[e._name]=e.save()}}),e&&this.folders.forEach(e=>{if(e._title in t.folders)throw Error(`Cannot save GUI with duplicate folder "${e._title}"`);t.folders[e._title]=e.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),this.domElement.classList.toggle(`closed`,this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?`none`:``,this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute(`aria-expanded`,!this._closed),requestAnimationFrame(()=>{let t=this.$children.clientHeight;this.$children.style.height=t+`px`,this.domElement.classList.add(`transition`);let n=e=>{e.target===this.$children&&(this.$children.style.height=``,this.domElement.classList.remove(`transition`),this.$children.removeEventListener(`transitionend`,n))};this.$children.addEventListener(`transitionend`,n);let r=e?this.$children.scrollHeight:0;this.domElement.classList.toggle(`closed`,!e),requestAnimationFrame(()=>{this.$children.style.height=r+`px`})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}};e(),e();var S=(()=>{let e=null;return function(t){if(!e){let t=document.createElement(`canvas`);t.width=1,t.height=1,e=t.getContext(`2d`)}return e.fillStyle=t,e.fillStyle}})();function C(e){let t;for(t of e)t()}var w=[`interactive`];function T(e,t,n){let r={id:t.id,__type:t.__type},i=n.addFolder(`${t.type}-${t.id}`);for(let n in t)n===`visible`&&i.add(t,n).onChange(t=>{e.updateState(r,{[n]:t})}),n===`color`||n===`hoverColor`?(t[n]=S(t[n]),i.addColor(t,n).onChange(t=>{e.updateState(r,{[n]:t})})):n===`height`?i.add(t,n,0,20,1).onChange(t=>{e.updateState(r,{[n]:t})}):n===`texture`&&t.texture?i.addFolder(`Texture - side`).add(t.texture,`url`).onChange(t=>{e.updateState(r,{texture:{url:t}})}):n===`topTexture`&&t.topTexture?i.addFolder(`Texture - top`).add(t.topTexture,`url`).onChange(t=>{e.updateState(r,{topTexture:{url:t}})}):n===`opacity`?i.add(t,n,0,1,.1).onChange(t=>{e.updateState(r,{[n]:t})}):n===`altitude`?i.add(t,n,0,100,1).onChange(t=>{e.updateState(r,{[n]:t})}):w.includes(n)&&i.add(t,n).onChange(t=>{e.updateState(r,{[n]:t})});return t.isInView&&(i.add(t,`isInView`).listen().disable(),i.add(t,`isInViewCheck`)),{cleanup(){i.destroy()}}}e(),e();function E(){let e=[];function t(e,t){let n=Object.values(e.getMapData())[0],r=t;if(r&&a.is(r)){let e=n.getByType(`enterprise-location`)?.find(e=>e.spaces.some(e=>e.id===r.id));e&&(r=e)}return r}async function n(e,t){return t instanceof r?e.Camera.focusOn(t.locations.flatMap(e=>e.spaces),D):t instanceof i?e.Camera.focusOn(t.spaces,D):e.Camera.focusOn(t,D)}function o(e,a,{focus:o=!1}={}){if(!window.enableHighlightCard)return()=>{};let s=t(e,a),c=document.createElement(`div`);if(c.style.cssText=`
				position: absolute;
				top: 20px;
				left: 20px;
				background-color: rgba(30, 30, 30, 0.95);
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
				border-radius: 12px;
				padding: 24px;
				max-width: 320px;
				z-index: 1000;
				font-family: 'Arial', sans-serif;
				transition: all 0.3s ease;
				color: #e0e0e0;
			`,`name`in s){let e=document.createElement(`h3`);e.textContent=s.name,e.style.cssText=`
				margin: 0 0 16px;
				font-size: 22px;
				font-weight: 600;
				color: #ffffff;
				letter-spacing: -0.5px;
			`,c.appendChild(e)}if(s instanceof i){if(s.description){let e=document.createElement(`p`);e.textContent=s.description,e.style.cssText=`
					margin: 0 0 16px;
					font-size: 14px;
					color: #b0b0b0;
					line-height: 1.5;
				`,c.appendChild(e)}if(s.tags&&s.tags.length>0){let e=document.createElement(`div`);e.style.cssText=`
					display: flex;
					flex-wrap: nowrap;
					gap: 8px;
					margin-bottom: 16px;
					overflow-x: hidden;
					max-height: 30px; /* Adjust this value based on your font size and padding */
				`,s.tags.forEach(t=>{let n=document.createElement(`span`);n.textContent=t,n.style.cssText=`
						background-color: #3a3a3a;
						color: #e0e0e0;
						padding: 6px 12px;
						border-radius: 16px;
						font-size: 12px;
						font-weight: 500;
						text-transform: uppercase;
						white-space: nowrap;
					`,e.appendChild(n)}),c.appendChild(e)}}let l;if(!(a instanceof r)){let t=new x({autoPlace:!1});t.domElement.style.cssText=`
					position: relative;
					overflow-y: auto;
					margin-top: 16px;
					border-top: 1px solid #444;
					padding-top: 16px;
				`;let n=e.getState(a);n&&(T(e,{id:a.id,...n},t),c.appendChild(t.domElement)),l=t}return document.body.appendChild(c),o&&n(e,s),()=>{c.style.opacity=`0`,c.style.transform=`translateY(-10px)`,setTimeout(()=>c.remove(),300),l?.destroy()}}return{highlightCard:o,highlight:(n,a,{focus:o=!0}={})=>{e.length>0&&e.forEach(e=>n.Markers.remove(e));let s=t(n,a);if(s instanceof i)o&&n.Camera.focusOn(s.spaces,D),e.push(...s.spaces.map(e=>n.Markers.add(e,`<div style="padding: 15px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 250px; position: relative;">
							<h3 style="margin: 0 0 10px; color: #333; font-size: 16px; font-weight: 600;">${s.name}</h3>
							${s.description?`<p style="margin: 0 0 10px; color: #666; font-size: 14px; font-weight: 400;">${s.description}</p>`:``}
							${s.tags?s.tags.map(e=>`<span style="display: inline-block; padding: 3px 8px; background-color: #e0f2f1; color: #00796b; border-radius: 12px; font-size: 12px;">${e}</span>`).join(` `):``}
							<div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #ffffff;"></div>
						</div>`,{rank:`always-visible`,placement:`top`})));else if(s instanceof r){o&&n.Camera.focusOn(s.locations.flatMap(e=>e.spaces),D);let t=new Map,r=new Set;s.locations.forEach(r=>{t.has(r.name)||(r.spaces.forEach(t=>{e.push(n.Markers.add(t,`<div style="padding: 12px; background-color: rgba(0, 153, 51, 0.95); border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transform: translateY(-4px); transition: all 0.3s ease;">
									<span style="font-weight: 600; color: #FFFFFF; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">${r.name}</span>
								</div>`,{rank:`always-visible`}))}),t.set(r.name,!0))}),s.locations.forEach(i=>{i.coordinates.forEach(a=>{let o=`${a.latitude},${a.longitude}`;if(!r.has(o)&&!t.has(i.name)){let t=n.Markers.add(a,`<div style="padding: 10px; background-color: rgba(51, 102, 204, 0.9); border-radius: 6px; box-shadow: 0 3px 6px rgba(0,0,0,0.2);">
								<span style="font-weight: 500; color: #FFFFFF; font-size: 16px;">${i.name}</span>
								<br>
								<span style="color: #FFFFFF; font-size: 12px; font-weight: 400;">Node</span>
							</div>`,{rank:`always-visible`});r.add(o),e.push(t)}})})}return()=>{e.forEach(e=>n.Markers.remove(e))}}}}var D={duration:300,easing:`ease-in-out`},O=E();e();var k={search:``,results:void 0,options:{places:{fields:{name:!0,description:!0,link:!0,category:!0},limit:5},locations:{fields:{name:!0,tag:!0,description:!0},limit:5},categories:{fields:{name:!0},limit:5}}};function A(e){e.add(k.options.places.fields,`name`).name(`Places: Name`),e.add(k.options.places.fields,`description`).name(`Places: Description`),e.add(k.options.places.fields,`link`).name(`Places: Link`),e.add(k.options.places.fields,`category`).name(`Places: Category`),e.add(k.options.places,`limit`),e.add(k.options.locations.fields,`name`).name(`Locations: Name`),e.add(k.options.locations.fields,`tag`).name(`Locations: Tag`),e.add(k.options.locations.fields,`description`).name(`Locations: Description`),e.add(k.options.places,`limit`),e.add(k.options.categories.fields,`name`).name(`Categories: Name`)}function ee(e,t,r){let i=new n,a=r.addFolder(`Search`);a.open();let o=a.add(k,`search`).onChange(async e=>{let n=await t.Search.query(e,k.options);n&&(k.results=n,c(n,i))}),s=document.createElement(`div`);s.style.marginLeft=`10px`,o.domElement.parentElement?.appendChild(s);let{renderSearch:c,close:l}=j(e,t,s,o.$input),u=a.addFolder(`Advanced`);return u.close(),A(u),document.addEventListener(`keydown`,e=>{(e.metaKey||e.ctrlKey)&&e.key===`k`?(e.preventDefault(),a._closed&&a.open(),o.$input.focus()):e.key===`Escape`&&(l(),i.publish(`highlight`,void 0))}),{pubsub:i}}function j(e,t,n,r){let i,a;r.addEventListener(`input`,async e=>{e instanceof InputEvent&&(e.inputType===`insertText`||e.inputType===`insertCompositionText`)&&(clearTimeout(i),i=setTimeout(async()=>{let e=await t.Search.suggest(r.value);e&&e.length>0&&o(e[0]?.suggestion)},100))});function o(e){if(!e){r.placeholder=``;return}let t=r.value;r.value=e,r.setSelectionRange(t.length,e.length)}return{renderSearch(t,r){t.places.length===0&&t.enterpriseCategories?.length===0&&t.enterpriseLocations?.length===0?n.textContent=`No results found.`:a=M(n,t,e,r)},close(){a.destroy()}}}function M(e,t,n,r){e.innerHTML=``;let i=document.createElement(`div`);Object.assign(i.style,N.dropdownContainer);let a=document.createElement(`ul`);a.className=`options-list`,Object.assign(a.style,N.optionsList),a.style.display=`block`;let o=[],s=(e,t)=>{if(t&&t.length>0){let n=document.createElement(`li`);n.textContent=e,Object.assign(n.style,N.sectionHeader),a.appendChild(n),t.forEach((t,n)=>{let r=document.createElement(`li`);r.textContent=`${`name`in t.item?t.item.name:``} (${t.type})`,Object.assign(r.style,N.option),r.tabIndex=0,r.addEventListener(`focus`,()=>{l(o.indexOf(r))}),r.addEventListener(`mouseover`,()=>{r.style.backgroundColor=`#f0f0f0`}),r.addEventListener(`mouseout`,()=>{r.style.backgroundColor=``}),r.addEventListener(`click`,()=>{}),r.setAttribute(`data-type`,e),r.setAttribute(`data-index`,n.toString()),a.appendChild(r),o.push(r)})}};s(`enterpriseLocations`,t.enterpriseLocations),s(`enterpriseCategories`,t.enterpriseCategories),s(`Places`,t.places),i.appendChild(a),e.appendChild(i);let c=[],l=e=>{c.forEach(e=>e()),c=[],o.forEach((t,n)=>{n===e?t.style.backgroundColor=`#e0e0e0`:t.style.backgroundColor=``});let n=o[e],i=n.getAttribute(`data-type`),a=parseInt(n.getAttribute(`data-index`)||`0`,10);if(!i)return;let{item:s}=t[i.toLowerCase()][a];r.publish(`highlight`,s)},u=t=>{!i.contains(t.target)&&t.target!==e&&d()};document.addEventListener(`click`,u);let d=()=>{e.innerHTML=``,document.removeEventListener(`click`,u)};return{destroy(){e.innerHTML=``,r.publish(`highlight`,void 0)}}}var N={dropdownContainer:{position:`absolute`,color:`#202020`},optionsList:{display:`block`,zIndex:`1002`,position:`relative`,maxHeight:`200px`,overflowY:`auto`,border:`1px solid #ccc`,backgroundColor:`#fff`,listStyleType:`none`,margin:`0`,padding:`0`},sectionHeader:{fontWeight:`bold`,padding:`5px`,backgroundColor:`#f0f0f0`},option:{padding:`5px`,cursor:`pointer`}};function P(e,t,n){n.domElement.id=`interactionPanel`;let r=[],{pubsub:o}=ee(e,t,n);o.on(`highlight`,t=>{if(t){r.forEach(e=>e()),r=[];let n=t instanceof i?t.spaces[0]:t;if(e.Camera.focusOn(t),n&&!a.is(n))return;r.push(O.highlightCard(e,n,{focus:!0}))}else r.forEach(e=>e()),r=[]});let{sub:s}=F(e,n.addFolder(`Click 👇`).close());s.on(`click`,t=>{r.forEach(e=>e()),r=[],t.spaces?.[0]&&(r=[O.highlightCard(e,t.spaces[0])])});let{sub:c}=I(e,n.addFolder(`Hover 🚁`).close()),l;c.on(`hover`,t=>{t.spaces?.[0]?(l?.(),r.length===0&&(l=O.highlightCard(e,t.spaces[0]))):(l?.(),l=void 0)})}function F(e,t){let r=new n,i={position:``,hoverColor:S(e.getHoverColor())},a=t.add(i,`position`).disable(),o=[];function s(){o.forEach(e=>e()),o.length=0}let c=0;return e.on(`click`,n=>{let{labels:i,coordinate:l}=n;s(),r.publish(`click`,n),clearInterval(c),a.load(JSON.stringify([l.longitude,l.latitude]));let u=i?.[0];if(u!=null){let n=V(e,u,t);if(!n)return;o.push(n.destroy),n.labelItemFolder.openAnimated()}let d=n.spaces?.[0]??n.objects?.[0];if(d){let n={...d,...e.getState(d),isInView:!1,isInViewCheck:L(e,d.id)},{cleanup:r}=T(e,n,t);c=setInterval(()=>{n.isInView=e.isInView(u||d)},500),o.push(r)}}),{sub:r}}function I(e,t){let r=new n;e.setHoverColor(`#1f3a7a`);let i={position:``,hoverColor:S(e.getHoverColor()),intersected:``,type:``,id:``},a=t.add(i,`position`).disable();t.add(i,`id`).disable().listen(),t.add(i,`type`).disable().listen(),t.addColor(i,`hoverColor`).onChange(t=>{e.setHoverColor(t)});let o=[];function s(){o.forEach(e=>e()),o.length=0}return e.on(`hover`,t=>{let{coordinate:n,spaces:o,objects:c,markers:l,labels:u}=t;s(),r.publish(`hover`,t),a.load(JSON.stringify([n.longitude,n.latitude]));let d=o?.[0]??c?.[0]??l?.[0]??u?.[0];if(!d)return;let f=e.getState(d);f&&(i.type=f.type,i.id=d.id)}),{sub:r}}function L(e,t){return function(){console.log(`isInView`,e.isInView(t))}}function R(e,t,n){let r={labels:{},all(){n.Labels.__EXPERIMENTAL__all().forEach(e=>{this.labels[e.id]=e}),c()},removeAllLabels(){n.Labels.removeAll().forEach(e=>{delete this.labels[e.id]}),c()}},{addLabel:i,destroy:a}=H(e,n);e.add(r,`all`),e.add(r,`removeAllLabels`);let o=e.addFolder(`Label List`);e.close();let s=new Map,{rerender:c}=l();function l(){function t(e){delete r.labels[e.id],s.get(e.id)?.destroy()}function i(e){let r=V(n,e,o,{onRemove:e=>{t(e)}});if(!r)return;let{labelItemFolder:i}=r;s.set(e.id,i)}function a(){o.destroy(),o=e.addFolder(`Label`);for(let e in r.labels){let t=r.labels[e];i(t)}}return{rerender:a,add:i,remove:t}}e.domElement.classList.add(`list-items`);let u;n.on(`click`,({labels:t,coordinate:n})=>{if(!e._closed){if(t?.[0]){u?.close();let n=s.get(t[0].id);if(e.open(),!n)return;n?.open(),n?.domElement.scrollIntoView({block:`start`}),n?.domElement.focus(),u=n}else i(n)}});function d(e){for(let t of e)r.labels[t.id]=t;c()}return{populatelabels:d,destroy(){a()}}}function z(e,t,n,r,i){let{interactive:a,enabled:o,rank:s,anchor:c,dynamicResize:l,zIndex:u,contentHTML:d,lowPriorityPin:f}=r;if(a==null||o==null)throw Error(`incomplete marker state`);let p={interactive:a,enabled:o,rank:s||`medium`,anchor:Array.isArray(c)?c.join(`, `):c||`center`,dynamicResize:l||!1,zIndex:u||0,contentHTML:d||``,lowPriorityPin:{enabled:f?.enabled??!0,size:f?.size??8,color:S(f?.color??`#666`)},remove(){e.Markers.remove(t),i?.(t),n.destroy()},isInView:L(e,t.id)};n.onChange(n=>{let r={interactive:p.interactive,enabled:p.enabled,rank:p.rank,dynamicResize:p.dynamicResize,contentHTML:p.contentHTML,lowPriorityPin:{enabled:p.lowPriorityPin.enabled,size:p.lowPriorityPin.size,color:p.lowPriorityPin.color}};p.rank===`always-visible`&&(r.zIndex=p.zIndex),e.updateState(t,r)}),n.add(p,`interactive`),n.add(p,`enabled`),n.add(p,`rank`,[`medium`,`high`,`always-visible`,`initial`]).name(`rank`),n.add(p,`anchor`).name(`anchor (read-only)`).disable(),n.add(p,`dynamicResize`).name(`dynamic resize`),p.rank===`always-visible`&&n.add(p,`zIndex`,0,1e3,1).name(`z-index`),n.add(p,`contentHTML`).name(`content HTML`);let m=n.addFolder(`Low Priority Pin`);m.add(p.lowPriorityPin,`enabled`),m.add(p.lowPriorityPin,`size`,1,20,1),m.addColor(p.lowPriorityPin,`color`),m.close(),n.add(p,`isInView`),n.add(p,`remove`)}function B(e,t,n,r,i){let{appearance:a,interactive:o}=r;if(!a||a.margin==null||o==null)throw Error(`incomplte label state`);let s={text:t.text,interactive:o,appearance:{...a,margin:a.margin||0,pinColor:a.pinColor?S(a.pinColor):`black`,textColor:a.textColor?S(a.textColor):`black`},remove(){e.Labels.remove(t),i?.(t),n.destroy()},isInView:L(e,t.id)};n.onChange(n=>{e.updateState(t,{appearance:s.appearance,interactive:s.interactive})}),n.add(s.appearance,`margin`,0,20).name(`margin`),n.add(s,`text`),n.add(s,`interactive`),n.addColor(s.appearance,`pinColor`).name(`pin color`),n.addColor(s.appearance,`pinOutlineColor`).name(`pin outline color`),n.addColor(s.appearance,`textColor`).name(`text color`),n.addColor(s.appearance,`textOutlineColor`).name(`text outline color`),n.add(s,`isInView`),n.add(s,`remove`)}function V(e,t,n,{onRemove:r}={}){let i=e.getState(t);if(!i)throw Error(`error getting state for entity: ${t.id}`);let a=i.type===`label`?t.text?.substring(0,12)||`Label`:`Marker ${t.id.toString().substring(0,8)}`,o=n.addFolder(a);if(o.close(),i.type===`label`)B(e,t,o,i,r);else if(i.type===`marker`)z(e,t,o,i,r);else throw Error(`unsupported entity type: ${i.type}`);return{labelItemFolder:o,destroy(){o.destroy()}}}function H(e,t){let n=e.addFolder(`Add`),r={onClick:!1,margin:6,text:`New Label!`,interactive:!0,marginForegroundColor:S(`skyblue`),marginBackgroundColor:S(`coral`),textForegroundColor:S(`slategray`),textBackgroundColor:S(`white`)};return n.add(r,`onClick`),n.add(r,`margin`),n.add(r,`interactive`),n.add(r,`text`),{destroy(){n.destroy()},addLabel(e){return n._closed||!r.onClick?void 0:t.Labels.add(e,r.text,{appearance:{margin:r.margin,pinColor:r.marginForegroundColor,pinOutlineColor:r.marginBackgroundColor,textColor:r.textForegroundColor,textOutlineColor:r.textBackgroundColor},interactive:r.interactive})}}}var U={};e();function W(e,t,n){let r=e.addFolder(`Camera 📷`),i=t.Camera.center.toJSON(),a=document.createElement(`div`);Object.assign(a.style,{display:`none`,position:`absolute`,left:`0px`,zIndex:999,top:`0px`,bottom:`0px`,right:`0px`,backgroundColor:`aqua`,pointerEvents:`none`,opacity:.5}),t.container.appendChild(a);let o=()=>t.getDimensions(),[s,c,l,u]=n?.padding??[t.Camera.screenOffsets.top,t.Camera.screenOffsets.right,t.Camera.screenOffsets.bottom,t.Camera.screenOffsets.left],d={center_lat:i.latitude,center_lon:i.longitude,zoomLevel:t.Camera.zoomLevel,pitch:t.Camera.pitch,bearing:t.Camera.bearing,minZoomLevel:t.Camera.minZoomLevel,maxZoomLevel:t.Camera.maxZoomLevel,inset_type:n?.padding?`pixel`:t.Camera.screenOffsets.type,inset_top:s,inset_left:u,inset_right:c,inset_bottom:l,animateOnLoad:!0,visualizeInset:!!(s||c||l||u),"Focus on click":n?.focusOnClick??!1,"Focus on current floor":()=>{t.Camera.focusOn([t.currentFloor],{screenOffsets:{top:20,left:20,right:20,bottom:20}})}};function f(){d.inset_type=t.Camera.screenOffsets.type,d.inset_left=t.Camera.screenOffsets.left,d.inset_top=t.Camera.screenOffsets.top,d.inset_right=t.Camera.screenOffsets.right,d.inset_bottom=t.Camera.screenOffsets.bottom;let{width:e,height:n}=o();d.inset_type===`portion`?Object.assign(a.style,{left:d.inset_left*e+`px`,top:d.inset_top*n+`px`,bottom:d.inset_bottom*n+`px`,right:d.inset_right*e+`px`}):Object.assign(a.style,{left:d.inset_left+`px`,top:d.inset_top+`px`,bottom:d.inset_bottom+`px`,right:d.inset_right+`px`})}r.add(d,`center_lat`).listen().disable(),r.add(d,`center_lon`).listen().disable(),r.add(d,`zoomLevel`,16,22,.5).listen().disable(),r.add(d,`pitch`).listen().disable(),r.add(d,`bearing`).listen().disable(),r.add(d,`minZoomLevel`,5,22,.5).onChange(e=>{t.Camera.setMinZoomLevel(e)}),r.add(d,`maxZoomLevel`,10,22,.5).onChange(e=>{t.Camera.setMaxZoomLevel(e)}),r.add(d,`animateOnLoad`),r.add(d,`visualizeInset`).onChange(S),S(d.visualizeInset);let p,m,h,g;function _(){let{width:e,height:n}=o(),i=t.Camera.screenOffsets.type,a=d.inset_type;i!==a&&(a===`portion`&&i===`pixel`?(d.inset_top=e>0?Math.min(d.inset_top/n,1):0,d.inset_bottom=e>0?Math.min(d.inset_bottom/n,1):0,d.inset_left=n>0?Math.min(d.inset_left/e,1):0,d.inset_right=n>0?Math.min(d.inset_right/e,1):0):a===`pixel`&&i===`portion`&&(d.inset_top=Math.round(d.inset_top*n),d.inset_bottom=Math.round(d.inset_bottom*n),d.inset_left=Math.round(d.inset_left*e),d.inset_right=Math.round(d.inset_right*e))),p&&p.destroy(),m&&m.destroy(),h&&h.destroy(),g&&g.destroy(),d.inset_type===`portion`?(p=r.add(d,`inset_top`,0,1,.01).onChange(x),m=r.add(d,`inset_bottom`,0,1,.01).onChange(x),h=r.add(d,`inset_left`,0,1,.01).onChange(x),g=r.add(d,`inset_right`,0,1,.01).onChange(x)):(p=r.add(d,`inset_top`,0,n,1).onChange(x),m=r.add(d,`inset_bottom`,0,n,1).onChange(x),h=r.add(d,`inset_left`,0,e,1).onChange(x),g=r.add(d,`inset_right`,0,e,1).onChange(x))}r.add(d,`inset_type`,[`pixel`,`portion`]).onChange(()=>{_(),x()}),_();let v=G(t);r.add(d,`Focus on click`).onChange(e=>{e?t.on(`click`,v):t.off(`click`,v)}),d[`Focus on click`]&&t.on(`click`,v),r.add(d,`Focus on current floor`);let y=e=>{r._closed||(d.center_lat=e.center.latitude,d.center_lon=e.center.longitude,d.zoomLevel=e.zoomLevel,d.bearing=e.bearing,d.pitch=e.pitch)};t.on(`camera-change`,y);let b=[()=>{t.off(`camera-change`,y)}];function x(){t.Camera.setScreenOffsets({top:d.inset_top,left:d.inset_left,right:d.inset_right,bottom:d.inset_bottom,type:d.inset_type}),f()}(d.inset_top||d.inset_right||d.inset_bottom||d.inset_left)&&x();function S(e){f(),e?a.style.display=`block`:a.style.display=`none`}return()=>({destroy(){r.destroy(),C(b)}})}function G(e){return function(t){let{spaces:n,objects:r}=t,i=n?.[0]??r?.[0];i&&e.Camera.focusOn(i)}}e();function K(e,t,n){let r={markers:{},removeAllMarkers(){n.Markers.removeAll().forEach(e=>{delete this.markers[e.id]}),c()}},{addMarker:i,destroy:a}=q(e,n);e.add(r,`removeAllMarkers`);let o=e.addFolder(`Marker List`);e.close();let s=new Map,{rerender:c}=l();function l(){function t(e){delete r.markers[e.id],s.get(e.id)?.destroy()}function i(e){let r=V(n,e,o,{onRemove:e=>{t(e)}});if(!r)return;let{labelItemFolder:i}=r;s.set(e.id,i)}function a(){o.destroy(),o=e.addFolder(`marker`);for(let e in r.markers){let t=r.markers[e];i(t)}}return{rerender:a,add:i,remove:t}}e.domElement.classList.add(`list-items`);let u;n.on(`click`,({markers:t,coordinate:n})=>{if(!e._closed){if(t?.[0]){u?.close();let n=s.get(t[0].id);if(e.open(),!n)return;n?.open(),n?.domElement.scrollIntoView({block:`start`}),n?.domElement.focus(),u=n}else i(n)}});function d(e){for(let t of e)r.markers[t.id]=t;c()}return{populateMarkers:d,destroy(){a()}}}function q(e,t){let n=e.addFolder(`Add`),r={onClick:!1,interactive:!0,rank:`medium`,anchor:`center`,dynamicResize:!1,enabled:!0,zIndex:0,lowPriorityPin:{enabled:!0,size:8,color:`#666`},contentHTML:`<div style="padding: 8px; background: white; border: 2px solid #333; border-radius: 4px;">New Marker</div>`};n.add(r,`onClick`),n.add(r,`interactive`),n.add(r,`enabled`),n.add(r,`rank`,[`medium`,`high`,`always-visible`,`initial`]).name(`rank`),n.add(r,`anchor`,[`center`,`top`,`bottom`,`left`,`right`,`top-left`,`top-right`,`bottom-left`,`bottom-right`]).name(`anchor`),n.add(r,`dynamicResize`).name(`dynamic resize`),n.add(r,`zIndex`,0,1e3,1).name(`z-index (always-visible only)`),n.add(r,`contentHTML`).name(`content HTML`);let i=n.addFolder(`Low Priority Pin`);return i.add(r.lowPriorityPin,`enabled`),i.add(r.lowPriorityPin,`size`,1,20,1),i.addColor(r.lowPriorityPin,`color`),i.close(),{destroy(){n.destroy()},addMarker(e){if(n._closed||!r.onClick)return;let i={interactive:r.interactive,enabled:r.enabled,rank:r.rank,anchor:r.anchor,dynamicResize:r.dynamicResize,lowPriorityPin:{enabled:r.lowPriorityPin.enabled,size:r.lowPriorityPin.size,color:r.lowPriorityPin.color}};return r.rank===`always-visible`&&(i.zIndex=r.zIndex),t.Markers.add(e,r.contentHTML,i)}}}e();function J(e,t){let n=e.addFolder(`Walls`).close(),r={visible:!0,topColor:`#b1fa87`,color:`#e8e8e8`,texture:{url:``},topTexture:{url:``}};n.add(r,`visible`).onChange(e=>{t.updateState(`exterior-walls`,{visible:e})}),n.addColor(r,`topColor`).onChange(e=>{t.updateState(`exterior-walls`,{topColor:e})}),n.addColor(r,`color`).onChange(e=>{t.updateState(`exterior-walls`,{color:e})}),n.addFolder(`Texture - side`).add(r.texture,`url`).onFinishChange(e=>{t.updateState(`exterior-walls`,{texture:{url:e}})}),n.addFolder(`Texture - top`).add(r.topTexture,`url`).onFinishChange(e=>{t.updateState(`exterior-walls`,{topTexture:{url:e}})}),t.updateState(`exterior-walls`,{topColor:r.topColor}),t.updateState(`exterior-walls`,{color:r.color})}e();function Y(e,t,n){e.close();let r={language:n.currentLanguage?.code??`en`},i=n.getByType(`enterprise-venue`);e.add(r,`language`,i?.languages.map(e=>e.code)).onChange(e=>{n.changeLanguage(e)})}e();function X(e,t,n){let r=e.addFolder(`Debug`);r.close();let i=t.Debug.state,a={showPolygonLabelTextAreaMesh:i.showPolygonLabelTextAreaMesh,showCollisionBoxes:i.showCollisionBoxes,showEnvMap:i.showEnvMap};r.add(a,`showPolygonLabelTextAreaMesh`).onChange(e=>{t.Debug.update({showPolygonLabelTextAreaMesh:e})}).name(`Show Flat Label Text Area Mesh`),r.add(a,`showCollisionBoxes`).onChange(e=>{t.Debug.update({showCollisionBoxes:e})}).name(`Show Collision Boxes`),r.add(a,`showEnvMap`).onChange(e=>{t.Debug.update({showEnvMap:e})}).name(`Show Environment Map`),t.Debug.update(a)}e();function Z(e,t,n){let r=e.addFolder(`Text3D`).close(),i={all:()=>{t.Text3D.labelAll()},removeAll:()=>{t.Text3D.removeAll()}};r.add(i,`all`).name(`Show All`),r.add(i,`removeAll`).name(`Remove All`)}e();function Q(e,t,n){let r=e.addFolder(`Directions 🗺️`);r.close();let i=localStorage.getItem(`directionsMethod`),a=localStorage.getItem(`directionsRadius`),o=localStorage.getItem(`directionsIncludeDoorBufferNodes`)===`true`,s={enabled:!1,method:i||`dp-optimal`,radius:a?parseFloat(a):.75,includeDoorBufferNodes:o,startCoordinate:``,endCoordinate:``,pathInfo:``},c,l,u;r.add(s,`enabled`).name(`Enable Click-to-Route`).onChange(e=>{e||(c=void 0,l=void 0,s.startCoordinate=``,s.endCoordinate=``,s.pathInfo=``,u&&=(t.Paths.remove(u),void 0))}),r.add(s,`startCoordinate`).name(`Start`).disable().listen(),r.add(s,`endCoordinate`).name(`End`).disable().listen(),r.add(s,`method`,{"Greedy LOS":`greedy-los`,RDP:`rdp`,"DP Optimal":`dp-optimal`}).name(`Smoothing Method`).onChange(e=>{localStorage.setItem(`directionsMethod`,e),c&&l&&s.enabled&&f(c,l)}),r.add(s,`radius`,.1,5,.1).name(`Smoothing Radius`).onChange(e=>{localStorage.setItem(`directionsRadius`,String(e)),c&&l&&s.enabled&&f(c,l)}),r.add(s,`includeDoorBufferNodes`).name(`Door Buffers`).onChange(e=>{localStorage.setItem(`directionsIncludeDoorBufferNodes`,String(e)),c&&l&&s.enabled&&f(c,l)}),r.add(s,`pathInfo`).name(`Path Info`).disable().listen(),r.add({clear:()=>d()},`clear`).name(`Clear Path`);function d(){c=void 0,l=void 0,s.startCoordinate=``,s.endCoordinate=``,s.pathInfo=``,u&&=(t.Paths.remove(u),void 0)}async function f(e,n){u&&=(t.Paths.remove(u),void 0);try{let r=await t.getDirections(e,n,{smoothing:{enabled:!0,method:s.method,radius:s.radius,includeDoorBufferNodes:s.includeDoorBufferNodes}});if(r){u=t.Paths.add(r.coordinates,{interactive:!0,color:`green`,width:1});let e=r.distance?.toFixed(2)||`N/A`;s.pathInfo=`${r.coordinates.length} pts, ${e}m`}else s.pathInfo=`No path found`}catch(e){s.pathInfo=`Error: ${e instanceof Error?e.message:`Unknown`}`}}let p=async e=>{if(s.enabled){if(c){let t=e.coordinate;l=t,s.endCoordinate=`${t.latitude.toFixed(6)}, ${t.longitude.toFixed(6)}`,s.pathInfo=`Calculating...`,await f(c,l),c=void 0,l=void 0}else{let t=e.coordinate;c=t,s.startCoordinate=`${t.latitude.toFixed(6)}, ${t.longitude.toFixed(6)}`,s.pathInfo=`Click to set end...`}}};return t.on(`click`,p),{destroy(){t.off(`click`,p),r.destroy()}}}e();function te(e,t){let n=e.addFolder(`Spaces Open To Below Visual Effect`).close(),r=t.getGlobalState().multiFloorView,i={enabled:r.spacesOpenToBelowVisualEffectEnabled,darkenAmount:r.spacesOpenToBelowVisualEffectDarkenAmount,darkenUseDepth:r.spacesOpenToBelowVisualEffectDarkenUseDepth,desaturateAmount:r.spacesOpenToBelowVisualEffectDesaturateAmount,desaturateUseDepth:r.spacesOpenToBelowVisualEffectDesaturateUseDepth,washOutAmount:r.spacesOpenToBelowVisualEffectWashOutAmount,washOutUseDepth:r.spacesOpenToBelowVisualEffectWashOutUseDepth};function a(){t.updateGlobalState({multiFloorView:{spacesOpenToBelowVisualEffectEnabled:i.enabled,spacesOpenToBelowVisualEffectDarkenAmount:i.darkenAmount,spacesOpenToBelowVisualEffectDarkenUseDepth:i.darkenUseDepth,spacesOpenToBelowVisualEffectDesaturateAmount:i.desaturateAmount,spacesOpenToBelowVisualEffectDesaturateUseDepth:i.desaturateUseDepth,spacesOpenToBelowVisualEffectWashOutAmount:i.washOutAmount,spacesOpenToBelowVisualEffectWashOutUseDepth:i.washOutUseDepth}})}n.add(i,`enabled`).name(`Enabled`).onChange(()=>a());let o=n.addFolder(`Darken`);o.add(i,`darkenAmount`,0,1,.01).name(`Amount`).onChange(()=>a()),o.add(i,`darkenUseDepth`).name(`Use Depth`).onChange(()=>a());let s=n.addFolder(`Desaturate`);s.add(i,`desaturateAmount`,0,1,.01).name(`Amount`).onChange(()=>a()),s.add(i,`desaturateUseDepth`).name(`Use Depth`).onChange(()=>a());let c=n.addFolder(`Wash Out`);c.add(i,`washOutAmount`,0,1,.01).name(`Amount`).onChange(()=>a()),c.add(i,`washOutUseDepth`).name(`Use Depth`).onChange(()=>a())}function ne(e,t,n){re();let r=new x({title:`SDK Controls`});r.domElement.classList.add(`mappedin-js-inspector`),P(t,e,r),W(r,t,n?.camera);let i=r.addFolder(`Levels`).close(),a=r.addFolder(`Scene Controls`);a.close();let o=r.addFolder(`Labels`);Z(r,t,e);let s=r.addFolder(`Markers`);J(r,t);let c=r.addFolder(`misc`);X(r,t,e),te(r,t),Q(r,t,e),Y(c,t,e);let l={level:t.currentFloor.id},{populatelabels:u}=R(o,e,t),{populateMarkers:d}=K(s,e,t),f=e.getByType(`floor`).reduce((e,t)=>(e[t.name]=t.id,e),{}),p=i.add(l,`level`,f).onChange(e=>{t.setFloor(e),l.level=t.currentFloor.id,p.updateDisplay()});return t.on(`floor-change-start`,e=>{i.controllers[0].setValue(e.floor.id)}),e.getByType(`space`).forEach(e=>{t.updateState(e,{interactive:!0})}),e.getByType(`object`).forEach(e=>{t.updateState(e,{interactive:!0})}),e.getByType(`object`).forEach(e=>{t.updateState(e,{interactive:!0})}),t.setHoverColor(`#a2b7e6`),t.Camera.setMaxZoomLevel(20),{populatelabels:u,sceneFolder:a,populateMarkers:d}}var $=`mappedin-sdk-debug-css`;function re(){if(document.getElementById($))return;let e=document.createElement(`style`);e.id=$,e.textContent=U,document.head.appendChild(e)}var ie=class{_enabled=!1;mv;api;mapData;storeStateToLocalStorageEnabled=!1;constructor(e,t){this.mv=e,this.api=t,this.mapData=this.api.getMapData()}setMapData(e){this.mapData=e}async enable(e={}){if(this._enabled)return;if(this._enabled=!0,!this.mapData)throw Error(`Please set mapData before enable debug.`);let{sceneFolder:n}=ne(this.mapData,this.mv,e),r=!1;n.onOpenClose(async e=>{if(!(e!==n||e._closed||r)){r=!0,[...n.children].forEach(e=>e.destroy());try{let{mountSceneGraphVisualizer:e}=await t(async()=>{let{mountSceneGraphVisualizer:e}=await import(`./src-PT63JZBF-Bwr_j4W9.js`);return{mountSceneGraphVisualizer:e}},__vite__mapDeps([0,1,2,3,4,5]),import.meta.url);e(this.api.core,n)}catch{}finally{n.open(),r=!1}}}),this.api.getMapDataInternal()?.spaces.forEach(e=>{this.mv.updateState(e,{interactive:!0})})}get enabled(){return this._enabled}};export{ie as Inspector};