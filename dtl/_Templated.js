dojo.provide("dojox.dtl._Templated");
dojo.require("dijit._Templated");
dojo.require("dojox.dtl._base");

dojo.declare("dojox.dtl._Templated", dijit._Templated, {
	_dijitTemplateCompat: false,
	buildRendering: function(){
		var node;

		if(this.domNode && !this._template){
			return;
		}

		if(!this._template){
			var t = this.getCachedTemplate(
				this.templatePath,
				this.templateString,
				this._skipNodeCache
			);
			if(t instanceof dojox.dtl.Template) {
				this._template = t;
			}else{
				node = t;
			}
		}
		if(!node){
			node = dijit._Templated._createNodesFromText(
				this._template.render(new dojox.dtl._Context(this))
			)[0];
		}

		this._attachTemplateNodes(node);

		var source = this.srcNodeRef;
		if(source && source.parentNode){
			source.parentNode.replaceChild(node, source);
		}

		if(this.widgetsInTemplate){
			var childWidgets = dojo.parser.parse(node);
			this._attachTemplateNodes(childWidgets, function(n,p){
				return n[p];
			});
		}

		if(this.domNode){
			dojo.place(node, this.domNode, "before");
			this.destroyDescendants();
			dojo._destroyElement(this.domNode);
		}
		this.domNode = node;

		this._fillContent(source);
	},
	_templateCache: {},
	getCachedTemplate: function(templatePath, templateString, alwaysUseString){
		// summary:
		//		Layer for dijit._Templated.getCachedTemplate
		var tmplts = this._templateCache;
		var key = templateString || templatePath;
		if(tmplts[key]){
			return tmplts[key];
		}

		templateString = dojo.string.trim(templateString || dijit._Templated._sanitizeTemplateString(dojo._getText(templatePath)));

		if(	this._dijitTemplateCompat && 
			(alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g))
		){
			templateString = this._stringRepl(templateString);
		}

		// If we always use a string, or find no variables, just store it as a node
		if(alwaysUseString || !templateString.match(/\{[{%]([^\}]+)[%}]\}/g)){
			return (tmplts[key] = dijit._Templated._createNodesFromText(templateString)[0]);
		}else{
			return (tmplts[key] = new dojox.dtl.Template(templateString));
		}
	},
	render: function(){
		this.buildRendering();
	}
});
