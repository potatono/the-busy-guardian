(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['createGame.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"game\">\n    <div class=\"container-md\">\n        <div class=\"alert alert-secondary\">\n            You can create a game yourself if you don't want to wait for us to match you to one automatically.\n            Use the form below to set your platform, play window and activity.  Everything auto-saves.\n        </div>\n        <div id=\"game-form\"></div>\n        <div>\n            <button class=\"btn btn-danger\" onclick=\"controller.publishGame(this)\">Publish</button>\n            <button class=\"btn btn-danger\" onclick=\"controller.deleteDraft(this)\">Delete</button>\n        </div>\n    </div>\n</div>\n";
},"useData":true});
templates['draftGame.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<a name=\"game-"
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":1,"column":14},"end":{"line":1,"column":20}}}) : helper)))
    + "\"></a>\n<div class=\"game card mb-3\">\n    <div class=\"row no-gutters\">\n        <div class=\"col-md-2\"  style=\"max-width: 100px; margin: auto 0 auto\">\n            <img src=\"/img/activity-"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":5,"column":36},"end":{"line":5,"column":52}}}) : helper)))
    + ".png\" class=\"card-img\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":5,"column":80},"end":{"line":5,"column":96}}}) : helper)))
    + "\" width=\"100\">\n        </div>\n        <div class=\"col-md-10\">\n            <div class=\"card-body\">\n                <h5 class=\"card-title text-danger\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityName") || (depth0 != null ? lookupProperty(depth0,"activityName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityName","hash":{},"data":data,"loc":{"start":{"line":9,"column":51},"end":{"line":9,"column":67}}}) : helper)))
    + "<div class=\"float-right\">Draft</div></h5>\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Platform</div>\n                    <div class=\"col-md-10\">\n                        <img src=\"/img/platform-"
    + alias4(((helper = (helper = lookupProperty(helpers,"platform") || (depth0 != null ? lookupProperty(depth0,"platform") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"platform","hash":{},"data":data,"loc":{"start":{"line":14,"column":48},"end":{"line":14,"column":60}}}) : helper)))
    + "@32.png\">\n                    </div>\n                </div>\n                \n                <div class=\"row\">\n                    <div class=\"col-md-2\">Date</div>\n                    <div class=\"col-md-10\">\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayDate") || (depth0 != null ? lookupProperty(depth0,"displayDate") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayDate","hash":{},"data":data,"loc":{"start":{"line":21,"column":24},"end":{"line":21,"column":39}}}) : helper)))
    + " @ "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayStartTime") || (depth0 != null ? lookupProperty(depth0,"displayStartTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayStartTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":42},"end":{"line":21,"column":62}}}) : helper)))
    + " - "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayEndTime") || (depth0 != null ? lookupProperty(depth0,"displayEndTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayEndTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":65},"end":{"line":21,"column":83}}}) : helper)))
    + "\n                    </div>\n                </div>\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Description</div>\n                    <div class=\"col-md-10\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":27,"column":43},"end":{"line":27,"column":58}}}) : helper)))
    + "</div>\n                </div>\n\n                <div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px\">\n                    <div class=\"col-md-2\"></div>\n                    <div class=\"col-md-10\">\n                        <button class=\"btn btn-danger\" onclick=\"controller.publishGame('"
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":33,"column":88},"end":{"line":33,"column":94}}}) : helper)))
    + "', this)\">Publish</button>\n                        <button class=\"btn btn-danger\" onclick=\"controller.editGame('"
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":34,"column":85},"end":{"line":34,"column":91}}}) : helper)))
    + "', this)\">Edit</button>\n                    </div>\n                </div>\n\n                <p class=\"card-text\"><small class=\"text-muted\">Last updated "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayUpdatedOn") || (depth0 != null ? lookupProperty(depth0,"displayUpdatedOn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayUpdatedOn","hash":{},"data":data,"loc":{"start":{"line":38,"column":76},"end":{"line":38,"column":96}}}) : helper)))
    + "</small></p>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
templates['game.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAlternate") : depth0),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":45},"end":{"line":38,"column":39}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n                                <div class=\"col-md-6\">\n                                <img src=\"/img/badges/"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isConfirmed") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":54},"end":{"line":32,"column":90}}})) != null ? stack1 : "")
    + "confirmed.svg\" width=\"24\" class=\"award\" title=\""
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isConfirmed") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":32,"column":137},"end":{"line":32,"column":173}}})) != null ? stack1 : "")
    + "confirmed\" />\n                                "
    + alias4(((helper = (helper = lookupProperty(helpers,"username") || (depth0 != null ? lookupProperty(depth0,"username") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"username","hash":{},"data":data,"loc":{"start":{"line":33,"column":32},"end":{"line":33,"column":44}}}) : helper)))
    + "\n                                <img src=\"/img/badges/"
    + alias4(((helper = (helper = lookupProperty(helpers,"experience") || (depth0 != null ? lookupProperty(depth0,"experience") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"experience","hash":{},"data":data,"loc":{"start":{"line":34,"column":54},"end":{"line":34,"column":68}}}) : helper)))
    + ".svg\" width=\"24\" class=\"award\" title=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"displayExperience") || (depth0 != null ? lookupProperty(depth0,"displayExperience") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayExperience","hash":{},"data":data,"loc":{"start":{"line":34,"column":106},"end":{"line":34,"column":127}}}) : helper)))
    + "\" />\n                                "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"awards") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":32},"end":{"line":36,"column":41}}})) != null ? stack1 : "")
    + "                                </div>\n                            ";
},"3":function(container,depth0,helpers,partials,data) {
    return "un";
},"5":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<img src=\"/img/badges/"
    + alias2(alias1(depth0, depth0))
    + ".svg\" width=\"24\" class=\"award\" title=\""
    + alias2(alias1(depth0, depth0))
    + "\" />\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"row\">\n                    <div class=\"col-md-2\">Alternates</div>\n                    <div class=\"col-md-10\">\n                        <div class=\"row\">\n                            "
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"players") : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":28},"end":{"line":56,"column":44}}})) != null ? stack1 : "")
    + "\n                        </div>\n                    </div>\n                </div>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAlternate") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":45},"end":{"line":56,"column":35}}})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    return "                    <button class=\"btn btn-success\" disabled>Confirmed</button>\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isFull") : depth0),{"name":"unless","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":74,"column":20},"end":{"line":78,"column":31}}})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <button class=\"btn btn-outline-success\" onclick=\"controller.joinGame('"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"id","hash":{},"data":data,"loc":{"start":{"line":75,"column":90},"end":{"line":75,"column":96}}}) : helper)))
    + "', this)\">\n                        Join\n                    </button>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<a name=\"game-"
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":1,"column":14},"end":{"line":1,"column":20}}}) : helper)))
    + "\"></a>\n<div class=\"game card mb-3\">\n    <div class=\"row no-gutters\">\n        <div class=\"col-md-2\"  style=\"max-width: 100px; margin: auto 0 auto\">\n            <img src=\"/img/activity-"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":5,"column":36},"end":{"line":5,"column":52}}}) : helper)))
    + ".png\" class=\"card-img\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":5,"column":80},"end":{"line":5,"column":96}}}) : helper)))
    + "\" width=\"100\">\n        </div>\n        <div class=\"col-md-10\">\n            <div class=\"card-body\">\n                <h5 class=\"card-title text-danger\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityName") || (depth0 != null ? lookupProperty(depth0,"activityName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityName","hash":{},"data":data,"loc":{"start":{"line":9,"column":51},"end":{"line":9,"column":67}}}) : helper)))
    + "</h5>\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Platform</div>\n                    <div class=\"col-md-10\">\n                        <img src=\"/img/platform-"
    + alias4(((helper = (helper = lookupProperty(helpers,"platform") || (depth0 != null ? lookupProperty(depth0,"platform") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"platform","hash":{},"data":data,"loc":{"start":{"line":14,"column":48},"end":{"line":14,"column":60}}}) : helper)))
    + "@32.png\">\n                    </div>\n                </div>\n                \n                <div class=\"row\">\n                    <div class=\"col-md-2\">Date</div>\n                    <div class=\"col-md-10\">\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayDate") || (depth0 != null ? lookupProperty(depth0,"displayDate") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayDate","hash":{},"data":data,"loc":{"start":{"line":21,"column":24},"end":{"line":21,"column":39}}}) : helper)))
    + " @ "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayStartTime") || (depth0 != null ? lookupProperty(depth0,"displayStartTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayStartTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":42},"end":{"line":21,"column":62}}}) : helper)))
    + " - "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayEndTime") || (depth0 != null ? lookupProperty(depth0,"displayEndTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayEndTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":65},"end":{"line":21,"column":83}}}) : helper)))
    + "\n                    </div>\n                </div>\n\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Players</div>\n                    <div class=\"col-md-10\">\n                        <div class=\"row\">\n                            "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"players") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":28},"end":{"line":38,"column":48}}})) != null ? stack1 : "")
    + "\n                        </div>\n                    </div>\n                </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasAlternates") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":16},"end":{"line":60,"column":23}}})) != null ? stack1 : "")
    + "\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Description</div>\n                    <div class=\"col-md-10\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":64,"column":43},"end":{"line":64,"column":58}}}) : helper)))
    + "</div>\n                </div>\n\n                <div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px\">\n                    <div class=\"col-md-2\"></div>\n                    <div class=\"col-md-10\">\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"hasJoined") : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.program(12, data, 0),"data":data,"loc":{"start":{"line":71,"column":20},"end":{"line":79,"column":27}}})) != null ? stack1 : "")
    + "                    </div>\n                </div>\n\n\n                <p class=\"card-text\"><small class=\"text-muted\">Last updated "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayUpdatedOn") || (depth0 != null ? lookupProperty(depth0,"displayUpdatedOn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayUpdatedOn","hash":{},"data":data,"loc":{"start":{"line":84,"column":76},"end":{"line":84,"column":96}}}) : helper)))
    + "</small></p>\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
templates['games.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"games\" class=\"container-md\"></div>\n";
},"useData":true});
templates['joinedGame.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAlternate") : depth0),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":41},"end":{"line":37,"column":35}}})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n                            <div class=\"col-md-6\">\n                            <img src=\"/img/badges/"
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isConfirmed") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":50},"end":{"line":31,"column":86}}})) != null ? stack1 : "")
    + "confirmed.svg\" width=\"24\" class=\"award\" title=\""
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(depth0 != null ? lookupProperty(depth0,"isConfirmed") : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":133},"end":{"line":31,"column":169}}})) != null ? stack1 : "")
    + "confirmed\" />\n                            "
    + alias4(((helper = (helper = lookupProperty(helpers,"username") || (depth0 != null ? lookupProperty(depth0,"username") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"username","hash":{},"data":data,"loc":{"start":{"line":32,"column":28},"end":{"line":32,"column":40}}}) : helper)))
    + "\n                            <img src=\"/img/badges/"
    + alias4(((helper = (helper = lookupProperty(helpers,"experience") || (depth0 != null ? lookupProperty(depth0,"experience") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"experience","hash":{},"data":data,"loc":{"start":{"line":33,"column":50},"end":{"line":33,"column":64}}}) : helper)))
    + ".svg\" width=\"24\" class=\"award\" title=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"displayExperience") || (depth0 != null ? lookupProperty(depth0,"displayExperience") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayExperience","hash":{},"data":data,"loc":{"start":{"line":33,"column":102},"end":{"line":33,"column":123}}}) : helper)))
    + "\" />\n                            "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"awards") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":34,"column":28},"end":{"line":35,"column":37}}})) != null ? stack1 : "")
    + "                            </div>\n                        ";
},"3":function(container,depth0,helpers,partials,data) {
    return "un";
},"5":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "<img src=\"/img/badges/"
    + alias2(alias1(depth0, depth0))
    + ".svg\" width=\"24\" class=\"award\" title=\""
    + alias2(alias1(depth0, depth0))
    + "\" />\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAlternate") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":41},"end":{"line":54,"column":31}}})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <button class=\"btn btn-danger\" onclick=\"controller.deleteGame('"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"id","hash":{},"data":data,"loc":{"start":{"line":69,"column":87},"end":{"line":69,"column":93}}}) : helper)))
    + "', this)\">Delete</button>\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isConfirmed") : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(14, data, 0),"data":data,"loc":{"start":{"line":71,"column":24},"end":{"line":75,"column":31}}})) != null ? stack1 : "")
    + "                        <button class=\"btn btn-outline-danger\" onclick=\"controller.leaveGame('"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":76,"column":94},"end":{"line":76,"column":100}}}) : helper)))
    + "', this)\">Leave</button>\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "                        <button class=\"btn btn-success\" disabled>Confirmed</button>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <button class=\"btn btn-outline-success\" onclick=\"controller.confirmGame('"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"id","hash":{},"data":data,"loc":{"start":{"line":74,"column":97},"end":{"line":74,"column":103}}}) : helper)))
    + "', this)\">Confirm</button>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"game card mb-3\">\n    <div class=\"row no-gutters\">\n        <div class=\"col-md-2\"  style=\"max-width: 100px; margin: auto 0 auto\">\n            <img src=\"/img/activity-"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":4,"column":36},"end":{"line":4,"column":52}}}) : helper)))
    + ".png\" class=\"card-img\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"activityType") || (depth0 != null ? lookupProperty(depth0,"activityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityType","hash":{},"data":data,"loc":{"start":{"line":4,"column":80},"end":{"line":4,"column":96}}}) : helper)))
    + "\" width=\"100\">\n        </div>\n        <div class=\"col-md-10\">\n            <div class=\"card-body\">\n                <h5 class=\"card-title text-danger\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"activityName") || (depth0 != null ? lookupProperty(depth0,"activityName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"activityName","hash":{},"data":data,"loc":{"start":{"line":8,"column":51},"end":{"line":8,"column":67}}}) : helper)))
    + "</h5>\n\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Platform</div>\n                    <div class=\"col-md-10\">\n                        <img src=\"/img/platform-"
    + alias4(((helper = (helper = lookupProperty(helpers,"platform") || (depth0 != null ? lookupProperty(depth0,"platform") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"platform","hash":{},"data":data,"loc":{"start":{"line":14,"column":48},"end":{"line":14,"column":60}}}) : helper)))
    + "@32.png\">\n                    </div>\n                </div>\n                \n                <div class=\"row\">\n                    <div class=\"col-md-2\">Date</div>\n                    <div class=\"col-md-10\">\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayDate") || (depth0 != null ? lookupProperty(depth0,"displayDate") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayDate","hash":{},"data":data,"loc":{"start":{"line":21,"column":24},"end":{"line":21,"column":39}}}) : helper)))
    + " @ "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayStartTime") || (depth0 != null ? lookupProperty(depth0,"displayStartTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayStartTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":42},"end":{"line":21,"column":62}}}) : helper)))
    + " - "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayEndTime") || (depth0 != null ? lookupProperty(depth0,"displayEndTime") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayEndTime","hash":{},"data":data,"loc":{"start":{"line":21,"column":65},"end":{"line":21,"column":83}}}) : helper)))
    + "\n                    </div>\n                </div>\n\n                <div class=\"row\">\n                <div class=\"col-md-2\">Players</div>\n                <div class=\"col-md-10\">\n                    <div class=\"row\">\n                        "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"players") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":24},"end":{"line":37,"column":44}}})) != null ? stack1 : "")
    + "\n                    </div>\n                </div>\n                </div>\n\n                <div class=\"row\">\n                <div class=\"col-md-2\">Alternates</div>\n                <div class=\"col-md-10\">\n                    <div class=\"row\">\n                        "
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"players") : depth0),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":24},"end":{"line":54,"column":40}}})) != null ? stack1 : "")
    + "\n                    </div>\n                </div>\n                </div>\n\n                <div class=\"row\">\n                    <div class=\"col-md-2\">Description</div>\n                    <div class=\"col-md-10\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":61,"column":43},"end":{"line":61,"column":58}}}) : helper)))
    + "</div>\n                </div>\n\n\n                <div class=\"row\" style=\"margin-top: 20px; margin-bottom: 20px\">\n                <div class=\"col-md-2\"></div>\n                <div class=\"col-md-10\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isOwner") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data,"loc":{"start":{"line":68,"column":20},"end":{"line":77,"column":27}}})) != null ? stack1 : "")
    + "\n\n                    <div class=\"btn-group\">\n                    <button type=\"button\" class=\"btn btn-outline-primary dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                        Add to Calendar\n                    </button>\n                    <div class=\"dropdown-menu\">\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"googleCalendarUrl") || (depth0 != null ? lookupProperty(depth0,"googleCalendarUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"googleCalendarUrl","hash":{},"data":data,"loc":{"start":{"line":85,"column":33},"end":{"line":85,"column":54}}}) : helper)))
    + "\" class=\"dropdown-item\" target=\"_blank\">Google</a>\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"outlookCalendarUrl") || (depth0 != null ? lookupProperty(depth0,"outlookCalendarUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"outlookCalendarUrl","hash":{},"data":data,"loc":{"start":{"line":86,"column":33},"end":{"line":86,"column":55}}}) : helper)))
    + "\" class=\"dropdown-item\" target=\"_blank\">Outlook</a>\n                        <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"icsCalendarUrl") || (depth0 != null ? lookupProperty(depth0,"icsCalendarUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icsCalendarUrl","hash":{},"data":data,"loc":{"start":{"line":87,"column":33},"end":{"line":87,"column":51}}}) : helper)))
    + "\" class=\"dropdown-item\" target=\"_blank\" download=\"TbG-"
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":87,"column":105},"end":{"line":87,"column":111}}}) : helper)))
    + ".ics\">iCal</a>\n                    </div>\n                    </div>\n\n                    \n                </div>\n                </div>\n\n                <p class=\"card-text\"><small class=\"text-muted\">Last updated "
    + alias4(((helper = (helper = lookupProperty(helpers,"displayUpdatedOn") || (depth0 != null ? lookupProperty(depth0,"displayUpdatedOn") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayUpdatedOn","hash":{},"data":data,"loc":{"start":{"line":95,"column":76},"end":{"line":95,"column":96}}}) : helper)))
    + "</small></p>\n\n            </div>\n        </div>\n    </div>\n</div>";
},"useData":true});
templates['joinedGames.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"drafts\" class=\"container-md\"></div>\n<div id=\"games\" class=\"container-md\"></div>\n<div id=\"nogames\" class=\"container-md d-none\">\n    <div class=\"alert alert-secondary\">\n    You haven't joined any games yet.  Look for open <a href=\"/games\">games</a> to join, or update your profile to \n    try to get more matches.  Check the <a href=\"/faq\">FAQ</a> for more information.\n    </div>\n</div>\n";
},"useData":true});
templates['profile.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"profile\">\n  <div class=\"container-md\">\n    <div class=\"alert alert-secondary\">\n      Use the form below to set at least one platform, play window and activity.  Everything auto-saves.\n    </div>\n    <div id=\"profile-form\"></div>\n  </div>\n</div>";
},"useData":true});
templates['progress.hbs'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div id=\"loading\" class=\"modal\" tabindex=\"-1\">\n    <div class=\"modal-dialog\">\n      <div class=\"modal-content\">\n        <div class=\"modal-header\">\n          <h5 class=\"modal-title\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"title","hash":{},"data":data,"loc":{"start":{"line":5,"column":34},"end":{"line":5,"column":43}}}) : helper)))
    + "</h5>\n        </div>\n        <div class=\"modal-body\">\n          <div class=\"progress\">\n            <div id=\"progress\" class=\"progress-bar bg-danger progress-bar-striped progress-bar-animated\" role=\"progressbar\" style=\"width: 0%\" aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>";
},"useData":true});
})();