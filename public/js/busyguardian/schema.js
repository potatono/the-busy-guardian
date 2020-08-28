(function() {
    class Schema {
        /**
         * The schema class defines one or more fields within a document.  
         * 
         * A field defines a name, type (javascript Class), and set of options.  
         * The options can be used to control default values, views or other behaviors.
         */
        constructor() {
            this.fields = []
            this.lookup = {}
            this.options = {}
        }

        add(name, cls, options) {
            var field = new Field(name, cls, options)
            this.fields.push(field)
            this.lookup[name] = field

            Object.defineProperty(this, name, { get() { return this.lookup[name] }})
        }

        get(name) {
            return this.lookup[name]
        }

        setOption(name, value) {
            this.options[name] = value
        }
    }

    class Field {
        /**
         * A field defines a name, type (javascript Class), and set of options. 
         */

        constructor(name, cls, options) {
            this.name = name
            this.cls = cls
            this.options = options || {}
        }

        get isCollection() {
            return this.cls.__proto__.name == "Collection"
        }

        // // Used by TemplateViewControl
        // static model(options) {
        //     return new Field('*', Model, options)
        // }
    }

    if (typeof(exports) != "undefined") {
        exports.Schema = Schema
        exports.Field = Field
    }
    if (typeof(window) != "undefined") {
        window.Schema = Schema
        window.Field = Field
    }
})()
