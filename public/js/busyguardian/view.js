(function() {
    var Schema = require("./schema").Schema
    var Model = require("./model").Model
    var Collection = require("./collection").Collection

    String.prototype.splitCamelCase = function() {
        var str = this.replace(/([a-z])([A-Z])/g, '$1 $2')
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    /**
     * Base class for controls representing a field within a model.
     */
    class ViewControl {
        constructor(field, view) {
            this.field = field
            this.view = view
            this.data = view.data
            this.element = null
        }

        get value() {
            return this.view.data && this.view.data[this.field.name]
        }

        buildElement() {
            throw new Error("Override buildElement in your ViewControl")
        }

        build() {
            this.element = this.buildElement()
            this.setAttributes()
            this.bind()
            return this.element
        }

        buildId(name, suffix) {
            var result = this.data ? this.data.subpath(name) : name

            if (suffix)
                result = result + "/" + suffix
            
            return result
        }

        getValue(value) {
            if (typeof(value) === "string")
                return { label: value.splitCamelCase(), value: value }
            else if (!value.label)
                value.label = value.value.splitCamelCase()
            
            return value
        }

        setAttributes() {
            this.element.id = this.buildId(this.field.name)
            this.element.className = "form-control"
            this.element.placeholder = this.field.label || this.field.name.splitCamelCase()

            if (this.field.options.attributes) {
                for (var attr in this.field.options.attributes) {
                    this.element.setAttribute(attr, this.field.options.attributes[attr])
                }
            }
        }

        bind() {            
            if (this.data && this.data instanceof Model) {
                var binding = new ModelBinding(this.data, this.field.name, this.element)
                Bindings.add(binding)

                // Move to model when properties are initially set
                // was causing issues overwriting.
                // if (!this.data[this.field.name] && this.field.options.default) {
                //     this.element.value = this.field.options.default
                //     binding.updateModel(this.element.value)
                // }
            }
        }
    }

    /**
     * ViewControl implementing an input element
     */
    class InputViewControl extends ViewControl {
        buildElement() {
            let field = this.field
            var input = document.createElement("input")
            input.type = field.options.control || "text"

            if (field.options.control == "time" && !supportsTime) {
                input.title = field.label || field.name.splitCamelCase()
                new TimePolyfill(input)
            }
            return input
        }   
    }

    /**
     * ViewControl implementing a textarea
     */
    class TextAreaViewControl extends ViewControl {
        buildElement() {
            var textarea = document.createElement("textarea")
            return textarea
        }
    }

    /**
     * ViewControl implementing a select.  If the field doesn't have a value or default then a placeholder
     * option is included that prompts the user.
     */
    class SelectViewControl extends ViewControl {
        buildElement() {
            let field = this.field
            var select = document.createElement("select")
            var values = field.options.values
            var hasData = (this.data && this.data[field.name])
            var usePlaceholder = !hasData && !field.options.default

            if (usePlaceholder) {
                var placeholder = "(" + (field.label || field.name.splitCamelCase()) + ")"
                select.options.add(new Option(placeholder, "_placeholder_"))
            }

            for (var value of values) {
                value = this.getValue(value)
                var label = value.label || value.value.splitCamelCase()
                select.options.add(new Option(label, value.value))
            }

            if (usePlaceholder) {
                select.addEventListener("change", function() {
                    if (select.options[0] && select.options[0].value == "_placeholder_")
                        select.options.remove(0)
                
                })
            }

            if (hasData)
                select.value = hasData

            return select
        }
    }

    /**
     * Implements mulitple select controls that represents a group select and item select.  This currently
     * only supports one level of nesting.
     */
    class CompoundSelectViewControl extends ViewControl {

        getColClassName(idx) {
            let size = this.field.options.colSizes && this.field.options.colSizes[idx]
            
            return size ? "col-" + size : "col"
        }

        buildOptions(select, values, prefix, placeholder) {
            select.innerHTML = ""

            if (placeholder && !(this.view.data && this.view.data[this.field.name])) {
                select.options.add(new Option(placeholder, "_placeholder_"))
            }

            for (let value of values) {
                var val = prefix ? [prefix, value.value].join(':') : value.value
                select.options.add(new Option(value.label, val))
            }
        }

        buildSelect(idx, values, prefix) {
            var self = this
            var select = document.createElement("select")

            select.className = "form-control"
            var placeholder = this.field.options.placeholders && this.field.options.placeholders[idx]
            this.buildOptions(select, values, prefix, placeholder)

            select.addEventListener("change", function() {
                if (select.options[0] && select.options[0].value == "_placeholder_")
                    select.options.remove(0)
            })
            
            if (idx < this.field.options.depth - 1) {
                let n = idx+1
                let val = values
                let ph = this.field.options.placeholders && this.field.options.placeholders[n]

                select.addEventListener("change", function() { 
                    self.buildOptions(self.selects[n], val[this.selectedIndex].values, val[this.selectedIndex].value, ph)
                })
            }
            else { 
                Bindings.add(new ModelBinding(this.view.data, this.field.name, select))
            }

            return select
        }

        build() {
            this.element = document.createElement('div')
            this.element.className = "form-row"

            this.selects = []
            var values = this.field.options.values
            var prefix
            var currentValueParts = []
        
            for (var i=0; i<this.field.options.depth; i++) {
                var div = document.createElement("div")
                div.className = this.getColClassName(i)    

                var select = this.buildSelect(i, values, prefix)

                if (this.value) {
                    currentValueParts.push(this.value.split(':')[i])
                    select.value = currentValueParts.join(':')
                }

                this.selects.push(select)
                div.appendChild(select)
                this.element.appendChild(div)

                prefix = values[select.selectedIndex].value
                values = values[select.selectedIndex].values
            }
            
            return this.element
        }
    }

    /**
     * Implements a set of checkboxes that maps to a Set within a model.
     */
    class CheckboxViewControl extends ViewControl {
        build() {
            var field = this.field
            var container = document.createElement("div")

            for (var value of field.options.values) {
                value = this.getValue(value)

                var id = this.buildId(field.name, value.value)
                var div = document.createElement("div")
                div.className = "form-check form-check-inline"
                
                var input = document.createElement("input")
                input.type = "checkbox"
                input.value = value.value
                input.id = id
                input.className = "form-check-input"
                input.checked = this.data && this.data[field.name] && this.data[field.name].has(value.value)
                div.appendChild(input)

                var label = document.createElement("label")
                label.innerText = value.label
                label.setAttribute("for", id)
                label.className = "form-check-label"
                div.appendChild(label)

                container.appendChild(div)
            }

            Bindings.add(new SetBinding(this.data, field.name, container))

            this.element = container
            return container
        }
    }

    /**
     * Implements a collection ViewControl as a nested View.  Each nested view will include a Delete button.  An Add
     * button will be included at the bottom of the control.
     */
    class CollectionViewControl extends ViewControl {
        build() {
            this.subelements = {}
            this.collection = this.data[this.field.name]

            var element = this.element = document.createElement("div")
            element.id = this.buildId(this.field.name)

            if (this.data) {
                var binding = new CollectionBinding(this.collection, element, this)
                Bindings.add(binding)
            }
            
            this.rowsElement = document.createElement('div')
            this.element.appendChild(this.rowsElement)

            var self = this
            this.element.appendChild(this.buildTextButton("Add", "primary", function(e) { self.collection.add(); }))
            
            return element
        }

        buildIconButton(icon, clickHandler) {
            var tmp = document.createElement("template")
            tmp.innerHTML = feather.icons[icon].toSvg({ 'class': 'icon clickable '})
            var button = tmp.content.firstChild
            button.addEventListener("click", clickHandler)
            return button
        }

        buildTextButton(text, type, clickHandler) {
            var button = document.createElement("button")
            button.innerText = text
            button.className = "btn btn-sm btn-" + type
            button.addEventListener("click", function(e) { e.preventDefault(); clickHandler(); })
            return button
        }

        buildDeleteButton(clickHandler, useIcon) {
            var div = document.createElement("div")
            div.className = "form-group"

            if (useIcon) {
                div.appendChild(this.buildIconButton("x-circle", clickHandler))
            }
            else {
                div.appendChild(this.buildTextButton("Delete", "danger", clickHandler))
            }

            return div
        }

        removeElement(id) {
            var element = this.subelements[id]

            if (element) {
                element.parentNode.removeChild(element)
                delete this.subelements[id]
            }
        }

        addRow(model) {
            if (model.id in this.subelements) {
                console.log("Form row was already added.")
                return;
            }

            //var view = new FormView(model)
            var view = new this.view.constructor(model)
            var subelement = view.build("div")

            var self = this
            var deleteButton = this.buildDeleteButton(function() { self.collection.remove(model.id) }, view.options.type == "inline")
            subelement.appendChild(deleteButton)
            this.rowsElement.appendChild(subelement)
            this.subelements[model.id] = subelement
        }

        removeRow(model) {
            this.removeElement(model.id)
        }

    }

    /**
     * A View representing a model as a form.
     */
    class FormView {
        constructor(obj, options) {
            if (obj instanceof Model) {
                this.schema = obj.constructor.getSchema()
                this.data = obj
            }
            else if (obj instanceof Collection) {
                this.schema = obj.cls.getSchema()
                this.data = obj
            }
            else if (obj instanceof Schema) {
                this.schema = obj
                this.data = null
            }
            else {
                throw new Error("Invalid type passed to FormView", obj)
            }

            this.options = this.schema.options.form || {}
            if (options) 
                Object.assign(this.options, options)
        }

        buildId(name, suffix) {
            var result = this.data ? this.data.subpath(name) : name

            if (suffix)
                result = result + "/" + suffix
            
            return result
        }

        build(elementType) {
            elementType = elementType || "form"

            let container = document.createElement(elementType)

            if (this.options.type == "inline") {
                container.className = "form-row"
            }

            for (var field of this.schema.fields) {
                if (field.options.control == "none")
                    continue
                    
                container.appendChild(this.buildField(field))
            }

            container.id = this.buildId()
            return container
        }

        getColClassName(field) {
            let size = field.options.colSize
            
            return size ? "col-" + size : "col"
        }

        buildHelpIcon(help) {
            var element = document.createElement("a")
            element.href="#"
            var icon = "help-circle"
            element.innerHTML = feather.icons[icon].toSvg({ 'class': 'help'})

            $(element).popover({
                trigger: 'click focus',
                content: help,
                placement: 'auto',
                html: true
            })
            return element
        }

        buildField(field) {
            let div = document.createElement("div")
            if (this.options.type == "inline") {
                div.className = this.getColClassName(field)
            }
            else {
                div.className = "form-group"

                let label = document.createElement("label")
                label.for = field.name
                label.innerText = field.options.label || field.name.splitCamelCase()
                div.appendChild(label)
            }

            if (field.options.help) {
                let help = this.buildHelpIcon(field.options.help)
                div.appendChild(help)
            }

            var element;
            
            if (field.isCollection) 
                element = (new CollectionViewControl(field, this)).build()
            else if (field.cls === Set)
                element = (new CheckboxViewControl(field, this)).build()
            else if (field.cls === String && field.options.control === "compoundSelect") 
                element = (new CompoundSelectViewControl(field, this)).build()
            else if (field.cls === String && field.options.control === "select") 
                element = (new SelectViewControl(field, this)).build()
            else if (field.cls === String && field.options.control === "text") 
                element = (new TextAreaViewControl(field, this)).build()
            else if (field.cls === String) 
                element = (new InputViewControl(field, this)).build()
            else {
                console.log("No match for", field)
                return div
            }

            div.appendChild(element)

            return div
        }
    }

    class TemplateView {
        constructor(obj, options) {

            if (!(obj instanceof Collection))
                throw new Error("TemplateView only supports Collections")

            this.schema = obj.cls.getSchema()
            this.collection = obj

            this.options = this.schema.options.template || {}
            if (options) 
                Object.assign(this.options, options)

            this.template = this.options.template && Handlebars.templates[this.options.template]
            if (!this.template)
                throw new Error("Invalid template supplied to TemplateView")
        }

        build() {
            this.container = document.createElement("div")

            this.collection.addListener((changeType, model) => {
                switch(changeType) {
                    case "added":
                        this.add(model)
                        break
                    case "removed":
                        this.remove(model)
                        break
                    case "modified":
                        this.update(model)
                        break
                }
            })

            this.collection.forEach((model) => this.add(model))

            return this.container
        }

        add(model) {
            var div = document.createElement("div")
            div.id = model.id
            div.innerHTML= this.template(model, { allowProtoPropertiesByDefault: true })
            this.container.appendChild(div)
        }

        remove(model) {
            var div = document.getElementById(model.id)
            this.container.removeChild(div)
        }

        update(model) {
            var div = document.getElementById(model.id)
            div.innerHTML = this.template(model, { allowProtoPropertiesByDefault: true })
        }
    }

    /**
     * A place to register element bindings.
     */
    class Bindings {
        static add(binding) {
            this.bindings = this.bindings || {}
            var id = binding.id

            this.bindings[id] = binding        
        }
    }

    /**
     * Binds an element to a model and field.  When the element changes it updates the model and vice-versa.
     */
    class ModelBinding {
        constructor(model, name, element) {
            this.model = model
            this.name = name
            this.element = element

            if (model.isLoaded)
                this.updateElement(model[name])

            var self = this;
            this.model.addListener(name, function(v, m) { self.updateElement(v) })
            this.element.addEventListener("change", function() { self.updateModel(this.value) })    
        }

        get id() {
            return this.model.absolutePath + "/" + this.name
        }

        updateElement(value) {
            if (typeof(value) != "undefined" && value != this.element.value) {
                this.element.value = value
            }
        }

        updateModel(value) {
            if (this.model[this.name] != value) {
                this.model[this.name] = value
            }
        }
    }

    /**
     * Binds a set of checkboxes to a Set within a model.
     */
    class SetBinding {
        constructor(model, name, element) {
            this.model = model
            this.name = name
            this.element = element
            this.checkboxes = element.getElementsByTagName("input")

            var self = this;
            for (let checkbox of this.checkboxes) {
                checkbox.addEventListener("change", function() { self.updateModel(this.value, this.checked) })
            }
            this.model.addListener(name, function(v, m) { self.updateElement(v) })
        }

        get id() {
            return this.model.absolutePath + "/" + this.name
        }

        updateModel(value, checked) {
            var set = this.model[this.name]
            set.toggle(value, checked)
        }

        updateElement(value) {
            for (let checkbox of this.checkboxes) {
                checkbox.checked = value.has(checkbox.value)
            }
        }
    }

    /**
     * Binds a Collection to a CollectionViewControl
     */
    class CollectionBinding {
        constructor(collection, element, viewControl) {
            this.collection = collection
            this.element = element
            this.viewControl = viewControl
            this.subelements = {}

            var self = this;
            this.collection.addListener(function (changeType, model) { self.updateElement(changeType, model) })
        }

        get id() {
            return this.collection.absolutePath
        }

        updateElement(changeType, model) {
            var self = this

            if (changeType == "added") {
                this.viewControl.addRow(model)
            }
            else if (changeType == "removed") {
                this.viewControl.removeRow(model)
            }
        }
    }

    if (typeof(exports) != "undefined") {
        exports.FormView = FormView
        exports.TemplateView = TemplateView
    }
    if (typeof(window) != "undefined") {
        window.FormView = FormView
        window.TemplateView = TemplateView
    }

})()
