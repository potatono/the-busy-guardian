(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['game.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                                "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"username") || (depth0 != null ? lookupProperty(depth0,"username") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"username","hash":{},"data":data,"loc":{"start":{"line":11,"column":32},"end":{"line":11,"column":44}}}) : helper)))
    + "\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div id=\"game\" class=\"game card mb-3\">\n            <div class=\"row no-gutters\">\n                <div class=\"col-md-2\"  style=\"max-width: 100px; margin: auto 0 auto\">\n                    <img src=\"/img/activity-"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":4,"column":44},"end":{"line":4,"column":60}}}) : helper)))
    + ".png\" class=\"card-img\" alt=\"Raid\" width=\"100\">\n                </div>\n                <div class=\"col-md-10\">\n                    <div class=\"card-body\">\n                        <h5 class=\"card-title text-danger\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityName") || (depth0 != null ? lookupProperty(depth0,"activityName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityName","hash":{},"data":data,"loc":{"start":{"line":8,"column":59},"end":{"line":8,"column":75}}}) : helper)))
    + "</h5>\n                        <p class=\"card-text\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"players") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":28},"end":{"line":12,"column":37}}})) != null ? stack1 : "")
    + "\n                        </p>\n                        <p class=\"card-text\"><small class=\"text-muted\">Last updated 3 mins ago</small></p>\n                    </div>\n                </div>\n            </div>\n        </div>";
},"useData":true});
})();