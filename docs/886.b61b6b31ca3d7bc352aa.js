(self.webpackChunkplanning_poker_free=self.webpackChunkplanning_poker_free||[]).push([[886],{6886:(t,e,n)=>{"use strict";n.r(e),n.d(e,{EnterNameModule:()=>b});var r=n(6304),o=n(3605),i=n(7368),a=n(1650),s=n(63),l=n(7017);let p=(()=>{class t{constructor(t,e,n){this.user=t,this.router=e,this.popup=n}saveName(t){var e=this;return(0,r.Z)(function*(){e.user.setName(t),e.popup.closeAll(),yield e.router.navigateByUrl(`/${o.y.TEAMS}/${o.y.WORKSPACES}`)})()}}return t.\u0275fac=function(e){return new(e||t)(i.LFG(a.K),i.LFG(s.F0),i.LFG(l.q))},t.\u0275prov=i.Yz7({token:t,factory:t.\u0275fac}),t})();var u=n(1462),c=n(7756);let m=(()=>{class t{constructor(){this.default=()=>({title:"\xa1Oh No!",text:"Ocurrio un error inesperado"}),this.requiredDataPopup=()=>({title:"\xa1Oh No!",text:"Al parecer tienes que registrar un nombre obligatoriamente"}),this.minLengthDataPopup=()=>({title:"\xa1Oh No!",text:"Al parecer tu nombre es demasiado corto"}),this.maxLengthDataPopup=()=>({title:"\xa1Oh No!",text:"Al parecer tu nombre es demasiado largo"}),this.patternDataPopup=()=>({title:"\xa1Oh No!",text:"Al parecer solo se aceptan letras"})}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275prov=i.Yz7({token:t,factory:t.\u0275fac}),t})(),d=(()=>{class t{constructor(){this.text=""}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=i.Xpm({type:t,selectors:[["ppf-liquid-button"]],inputs:{text:"text"},decls:12,vars:1,consts:[[1,"button"],[1,"button__blobs"],["xmlns","http://www.w3.org/2000/svg",2,"display","block","height","0","width","0"],["id","goo"],["in","SourceGraphic","stdDeviation","10","result","blur"],["in","blur","mode","matrix","values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7","result","goo"],["in","SourceGraphic","in2","goo"]],template:function(t,e){1&t&&(i.TgZ(0,"a",0),i._uU(1),i.TgZ(2,"div",1),i._UZ(3,"div"),i._UZ(4,"div"),i._UZ(5,"div"),i.qZA(),i.qZA(),i.O4$(),i.TgZ(6,"svg",2),i.TgZ(7,"defs"),i.TgZ(8,"filter",3),i._UZ(9,"feGaussianBlur",4),i._UZ(10,"feColorMatrix",5),i._UZ(11,"feBlend",6),i.qZA(),i.qZA(),i.qZA()),2&t&&(i.xp6(1),i.hij(" ",e.text," "))},styles:['.button[_ngcontent-%COMP%]{font-size:1em;font-family:Montserrat,"sans-serif";font-weight:600;text-decoration:none;padding:.7em 1.8em;cursor:pointer;display:inline-block;vertical-align:middle;color:#165d70;text-transform:uppercase;letter-spacing:2px;border:4px solid #165d70;border-radius:25px;position:relative;transition:color .7s ease;text-align:center}.button[_ngcontent-%COMP%]:hover{color:#fff}.button[_ngcontent-%COMP%]:hover   .button__blobs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{transform:scale(1.4) translateY(0) translateZ(0)}.button__blobs[_ngcontent-%COMP%]{height:100%;filter:url(#goo);overflow:hidden;position:absolute;top:0;left:0;bottom:-3px;right:-1px;z-index:-1;border-radius:18px}.button__blobs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{background-color:#165d70;width:34%;height:100%;border-radius:100%;position:absolute;transform:scale(1.4) translateY(125%) translateZ(0);transition:all .7s ease}.button__blobs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:first-child{left:-5%}.button__blobs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(2){left:30%;transition-delay:60ms}.button__blobs[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:nth-child(3){left:66%;transition-delay:25ms}']}),t})();const h=["input"];let f=(()=>{class t{constructor(t,e,n){this.fb=t,this.error=e,this.popup=n,this.name=new i.vpe,this.formGroup=this.fb.group({name:new u.NI("",[u.kI.required,u.kI.minLength(2),u.kI.maxLength(30),u.kI.pattern("[a-zA-Z ]*")])})}get nameField(){return this.formGroup.get("name")}get nameErrorMessage(){return this.nameField.hasError("required")?this.error.requiredDataPopup():this.nameField.hasError("minlength")?this.error.minLengthDataPopup():this.nameField.hasError("maxlength")?this.error.maxLengthDataPopup():this.nameField.hasError("pattern")?this.error.patternDataPopup():this.error.default()}ngAfterViewInit(){var t;null===(t=this.input)||void 0===t||t.nativeElement.focus()}submitName(){var t;if(this.formGroup.invalid)return this.popup.open(c.B,{data:this.nameErrorMessage,lifeTime:6e3}),null===(t=this.input)||void 0===t||t.nativeElement.select(),!1;this.name.emit(this.nameField.value)}}return t.\u0275fac=function(e){return new(e||t)(i.Y36(u.qu),i.Y36(m),i.Y36(l.q))},t.\u0275cmp=i.Xpm({type:t,selectors:[["ppf-enter-name-form"]],viewQuery:function(t,e){if(1&t&&i.Gf(h,5),2&t){let t;i.iGM(t=i.CRH())&&(e.input=t.first)}},outputs:{name:"name"},features:[i._Bn([m])],decls:4,vars:1,consts:[[1,"form",3,"formGroup","ngSubmit"],["id","name","type","text","formControlName","name",1,"form__input"],["input",""],["text","Elegir",1,"form__button",3,"click"]],template:function(t,e){1&t&&(i.TgZ(0,"form",0),i.NdJ("ngSubmit",function(){return e.submitName()}),i._UZ(1,"input",1,2),i.TgZ(3,"ppf-liquid-button",3),i.NdJ("click",function(){return e.submitName()}),i.qZA(),i.qZA()),2&t&&i.Q6J("formGroup",e.formGroup)},directives:[u._Y,u.JL,u.sg,u.Fj,u.JJ,u.u,d],styles:[".form[_ngcontent-%COMP%]{display:flex;justify-content:center;flex-direction:column}.form__input[_ngcontent-%COMP%]{font-family:Montserrat,sans-serif;font-weight:600;font-size:1.2rem;padding:1.5rem;border-radius:.5rem;border:2px solid #000;outline:none}.form__input[_ngcontent-%COMP%]:active, .form__input[_ngcontent-%COMP%]:focus{border:2px solid #0b5d70}.form__button[_ngcontent-%COMP%]{margin-top:15px}@media (max-width:575px){.form__button[_ngcontent-%COMP%]  a{width:calc(250px - 64.6px)}}@media (min-width:576px){.form__button[_ngcontent-%COMP%]  a{width:calc(300px - 64.6px)}}@media (min-width:768px){.form__button[_ngcontent-%COMP%]  a{width:calc(400px - 64.6px)}}@media (min-width:992px){.form__button[_ngcontent-%COMP%]  a{width:calc(600px - 64.6px)}}"]}),t})(),g=(()=>{class t{constructor(t){this.presenter=t}}return t.\u0275fac=function(e){return new(e||t)(i.Y36(p))},t.\u0275cmp=i.Xpm({type:t,selectors:[["ppf-enter-name"]],features:[i._Bn([p])],decls:7,vars:0,consts:[[1,"enter-name"],["src","./assets/svg/planning-poker.svg","alt","planning-poker",1,"enter-name__logo"],[1,"enter-name__title"],[1,"enter-name__paragraph"],[3,"name"]],template:function(t,e){1&t&&(i.TgZ(0,"section",0),i._UZ(1,"img",1),i.TgZ(2,"h1",2),i._uU(3,"Planning Poker"),i.qZA(),i.TgZ(4,"h3",3),i._uU(5,"Elija un nombre para mostrar"),i.qZA(),i.TgZ(6,"ppf-enter-name-form",4),i.NdJ("name",function(t){return e.presenter.saveName(t)}),i.qZA(),i.qZA())},directives:[f],styles:["[_nghost-%COMP%]{display:flex;height:90vh;align-items:center;justify-content:center}@media (max-width:575px){[_nghost-%COMP%]{margin-top:50px}}[_nghost-%COMP%]   .enter-name[_ngcontent-%COMP%]{display:flex;flex-direction:column;-webkit-user-select:none;user-select:none}@media (max-width:575px){[_nghost-%COMP%]   .enter-name[_ngcontent-%COMP%]{width:250px}}@media (min-width:576px){[_nghost-%COMP%]   .enter-name[_ngcontent-%COMP%]{width:300px}}@media (min-width:768px){[_nghost-%COMP%]   .enter-name[_ngcontent-%COMP%]{width:400px}}@media (min-width:992px){[_nghost-%COMP%]   .enter-name[_ngcontent-%COMP%]{width:600px}}[_nghost-%COMP%]   .enter-name__logo[_ngcontent-%COMP%]{height:120px}[_nghost-%COMP%]   .enter-name__title[_ngcontent-%COMP%]{font-family:Pattaya,sans-serif;font-size:30px;text-align:center;margin:10px 0}[_nghost-%COMP%]   .enter-name__paragraph[_ngcontent-%COMP%]{font-family:Montserrat,sans-serif;font-weight:400}"]}),t})();var _=n(1116);let x=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=i.oAB({type:t}),t.\u0275inj=i.cJS({}),t})(),b=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=i.oAB({type:t}),t.\u0275inj=i.cJS({imports:[[_.ez,x,u.UX,s.Bz.forChild([{path:"",component:g}])]]}),t})()}}]);