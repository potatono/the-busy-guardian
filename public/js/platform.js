(function() {
    var Schema = window.Schema || require("schema").Schema
    var Model = window.Model || require("model").Model
    var Collection = window.Collection || require("collection").Collection

    class Platform extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("name", String, { control: "select",
                values: [
                    { value: "playstation", label: "Playstation" },
                    { value: "xbox", label: "Xbox Live" },
                    { value: "steam", label: "Steam" },
                    { value: "stadia", label: "Stadia" }
                ]}
            )
            schema.add("username", String)
            schema.add("membershipId", String, { control: "none" })
            schema.setOption("form", { type: "inline" })
            return schema
        }    
    }

    class Platforms extends Collection {
        static defineClass() {
            return Platform
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Platform = Platform
        exports.Platforms = Platforms
    }
    else if (typeof(window) != "undefined") {
        window.Platform = Platform
        window.Platforms = Platforms
    }

})()