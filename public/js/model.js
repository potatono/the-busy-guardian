
(function() {
    var Schema = window.Schema || require("schema").Schema
    var Progress = window.Progress || require("progress").Progress
    var firebase = window.firebase || require("firebase-admin")
    var moment = window.moment || require("moment-timezone")
    

    // Sets are used for groups of checkboxes, we extend them with
    // some utilities to make the integration easier.
    Set.prototype.toggle = function toggle(key, val) {
        if (val && !this.has(key)) {
            this.add(key)
            if (this.listener)
                this.listener()
        }
        else if (!val && this.has(key)) {
            this.delete(key)
            if (this.listener)
                this.listener()
        }
    }

    Set.prototype.addListener = function addListener(listener) {
        this.listener = listener
    }

    Set.prototype.asObject = function asObject() {
        var result = {}
        this.forEach(function(k) { result[k] = true })
        return result
    }

    Set.prototype.importObject = function importObject(obj) {
        var changed = false

        var self = this
        this.forEach(function(k) { 
            if (!(k in obj)) {
                self.delete(k)
                changed = true
            }
        })

        Object.keys(obj).forEach(function(k) {
            if (!self.has(k)) {
                self.add(k)
                changed = true
            }
        })

        if (changed && this.listener) {
            this.listener()
        }
    }
    
    class Model {
        /**
         * The model class represents a Firestore document.
         * 
         * @param {*} path The collection path that this document will live under
         * @param {*} id Document id (optional, will auto-generate)
         * @param {*} data Initialization data
         */
        constructor(path, id, data) {
            this.path = path || null
            this.isNew = !id
            this.id = id || this.constructor.generateId()
            this.data = {}
            this.isLoaded = false
            this.listeners = {}
            this.autoCommit = typeof(Model.autoCommit) != "undefined" ? Model.autoCommit : true
            this.defineProperties()

            if (data) {
                this.setFromDoc({ exists: true, id: this.id, data: (_ => data) })
            }
        }

        /**
         * Override in subclasses to define the schema for the model
         */
        static defineSchema() {
            var schema = new Schema()

            return schema
        }

        /**
         * Returns the schema associated with this model.
         */
        static getSchema() {
            this.schema = this.schema || this.defineSchema()
            return this.schema
        }

        /**
         * Generates and returns an id.  If the schema has the useGlobalId option set then a
         * globally unique id will be returned.
         */
        static generateId() {
            if (this.getSchema().options.useGlobalId) {
                var time = Math.floor(((new Date()).getTime() - Date.parse("2020-01-01")) / 100)
                var user = firebase.auth().currentUser
                var uid = (user && user.uid) || ("A" + Math.floor(Math.random()*900000+100000).toString(36))
                var rand = Math.floor(Math.random()*900000+100000)

                var uuid = [ time.toString(36), uid, rand.toString(36) ].join('-')

                return uuid
            }
            else {
                var time = Math.floor(((new Date()).getTime() - Date.parse("2020-01-01")) / 100)
                var rand = Math.floor(Math.random()*900000+100000)

                return [ time.toString(36), rand.toString(36) ].join('-')
            }
        }

        /**
         * Return schema
         */
        get schema() {
            return this.constructor.getSchema()
        }

        /**
         * Also returns schema
         */
        getSchema() {
            return this.constructor.getSchema()
        }

        /**
         * Called when a property of a model is set
         * @param {*} field The schema field being set
         * @param {*} value The value being set
         * @param {*} changed True if the value is a change
         */
        handleChange(field, value, changed) {
            if (field.name in this.listeners) {
                this.listeners[field.name](value, this)
            }

            if (changed && this.autoCommit && !this.isLoading)
                this.save()
        }

        /**
         * Defines a property on the model object based on the schema field
         * @param {*} field 
         */
        defineScalarProperty(field) {
            Object.defineProperty(this, field.name, {
                get() { 
                    return this.data[field.name]
                },
                set(value) { 
                    // Why did this need to check isLoaded?
                    var changed = this.data[field.name] != value && !this.isLoading

                    this.data[field.name] = value

                    this.handleChange(field, value, changed)
                }
            })
        }

        /**
         * Defines a property on the model which is a collection.  Set is not implemented.
         * @param {*} field 
         */
        defineCollectionProperty(field) {
            var path = this.subpath(field.name)            
            this.data[field.name] = new field.cls(path)

            Object.defineProperty(this, field.name, {
                get() {
                    return this.data[field.name]
                }
            })
        }

        /**
         * Defines a property on the model which is a Set.
         * @param {*} field 
         */
        defineSetProperty(field) {
            var set = new Set()

            if (this.data[field.name]) {
                for (var k in this.data[field.name]) {
                    set.add(k)
                }
            }

            this.data[field.name] = set

            var self = this
            set.addListener(function() { self.handleChange(field, this, true) })

            Object.defineProperty(this, field.name, {
                get() {
                    return this.data[field.name]
                },

                set(value) {
                    this.data[field.name].importObject(value)
                }
            })
        }

        /**
         * Defines properties on a instance of the model based on the schema
         */
        defineProperties() {
            var schema = this.getSchema()

            for (let field of schema.fields) {
                if (field.name in this)
                    continue
                    
                if (field.isCollection)
                    this.defineCollectionProperty(field)
                else if (field.cls === Set)
                    this.defineSetProperty(field)
                else
                    this.defineScalarProperty(field)

                if (typeof(field.options.default) != "undefined") {
                    this.data[field.name] = field.options.default
                }
            }
        }

        /**
         * Adds a listener for changes to one of the model's fields
         * @param {*} name 
         * @param {*} cb 
         */
        addListener(name, cb) {
            this.listeners[name] = cb
        }

        /**
         * Returns the Firestore collection this model is contained within
         */
        col() {
            if (!this.path)
                throw new Error("No path set")

            return firebase.firestore().collection(this.path)
        }

        /**
         * Returns the Firestore document associated with this model
         */
        doc() {
            if (!this.id)
                throw new Error("No path or id set")        

            return this.col(this.path).doc(this.id)
        }

        /**
         * Returns the absolute path of this document within Firestore
         */
        get absolutePath() {
            return [ this.path, this.id ].join('/')
        }

        /**
         * Serializes the value of this field for storage in Firestore
         * @param {*} field 
         */
        serialize(field) {
            var value = this.data[field.name]

            if (field.cls === Set)
                return value.asObject()
            else if (field.cls === moment) 
                return value.format(field.options.format)
            else 
                return value
        }

        /**
         * Creates an document object from this model to be stored in Firestore
         */
        makeDoc() {
            var doc = {}
            var schema = this.getSchema()

            for (let field of schema.fields) {
                if (!field.isCollection && typeof(this.data[field.name]) != "undefined")
                    doc[field.name] = this.serialize(field)
            }

            doc['updatedOn'] = firebase.firestore.FieldValue.serverTimestamp()

            if (this.isNew)
                doc['createdOn'] = firebase.firestore.FieldValue.serverTimestamp()
            
            return doc
        }

        /**
         * Saves any models nested in collections within this model, one level deep
         */
        saveCollections() {
            var schema = this.getSchema()
            var promises = []

            for (let field of schema.fields) {
                if (field.isCollection && this.data[field.name]) {
                    this.data[field.name].forEach(model => promises.push(model.save()))
                }
            }

            return Promise.all(promises)
        }

        /**
         * Saves this model
         */
        save() {
            //console.debug("Save", this.path, "isNew", this.isNew)
            if (!this.path)
                throw new Error("No path set")

            let doc = this.makeDoc()
            var promise

            // If we're setting our own id and the doc doesn't exist we won't know
            // and update will fail.
            if (this.isNew || !this.isLoaded) {
                promise = this.doc().set(doc)
            }
            else {
                promise = this.doc().update(doc)
            }

            if (!this.autoCommit) {
                promise = Promise.all([ promise, this.saveCollections() ])
            }

            this.isNew = false
            this.isLoaded = true

            return promise.then(_ => this)
        }

        /**
         * Deserializes data from Firestore back into our model
         * @param {*} field 
         * @param {*} data 
         */
        deserialize(field, data) {
            var value = data[field.name]

            if (field.cls == moment) {
                var timezone = field.options.timezone || (field.options.timezoneField && data[field.options.timezoneField])
                var format = field.options.format

                if (timezone && format)
                    return moment.tz(value, format, false, timezone)
                else if (timezone)
                    return moment.tz(value, timezone)
                else
                    return moment(value)
            }
            else {
                return value
            }
        }

        /**
         * Sets properties within this model from the document returned by Firestore
         * @param {*} doc 
         */
        setFromDoc(doc) {
            if (doc.exists) {
                var data = doc.data()
                
                this.isLoading = true

                for (let field of this.schema.fields) {
                    if (!field.isCollection)
                        this[field.name] = this.deserialize(field, data)
                }
                
                if (data.createdOn) {
                    this.createdOn = data.createdOn
                }

                if (data.updatedOn) {
                    this.updatedOn = data.updatedOn
                }

                delete this.isLoading

                this.isLoaded = true

                // if ('*' in this.listeners)
                //     this.listeners['*'](this, this)
            }
        }

        /**
         * Loads collections nested within this model, one level deep
         */
        loadCollections() {
            var schema = this.getSchema()
            var promises = []

            for (let field of schema.fields) {
                if (field.isCollection && this.data[field.name]) {
                    promises.push(this.data[field.name].load())
                }   
            }

            return Promise.all(promises)
        }

        /**
         * Loads this model from Firestore
         */
        load() {
            if (this.isNew) 
                console.log("Trying to load isNew model, will always fail")
            
            this.isLoaded = false
            var self = this
        
            const promise = this.doc().get()
                
            promise.then(function(doc) {
                    Progress.report()
                    self.setFromDoc(doc) 
                })
                .catch(function(err) { console.log("Error getting document:", err) })
            
            var collectionPromise = this.loadCollections()

            return Promise.all([ promise, collectionPromise ])
        }

        /**
         * Listens to collections nested within this model, one level deep
         */
        listenCollections() {
            var schema = this.getSchema()
            for (let field of schema.fields) {
                if (field.isCollection && this.data[field.name]) {
                    this.data[field.name].listen()
                }   
            }
        }

        /**
         * Listens for changes this model in Firestore
         */
        listen() {
            if (this.isNew)
                console.log("Trying to listen to isNew model, will always fail")

            this.isLoaded = false
            var self = this
            
            this.doc().onSnapshot(function(doc) { 
                self.setFromDoc(doc)
            })

            this.listenCollections()
        }

        /**
         * Returns a subpath of this path
         */
        subpath(path) {
            var parts = [ this.path, this.id ]

            if (path) 
                parts.push(path)

            return parts.join('/')
        }

        /** Deletes models nested in collections within this model */
        deleteCollections() {
            var schema = this.getSchema()
            var promises = []

            for (let field of schema.fields) {
                if (field.isCollection && this.data[field.name]) {
                    this.data[field.name].forEach(model => promises.push(model.delete()))
                }   
            }

            return Promise.all(promises)
        }

        /**
         * Deletes this model in Firestore
         */
        delete() {
            if (this.autoCommit) {
                console.log("Deleting", this.absolutePath)
                return Promise.all([ this.deleteCollections(), this.doc().delete() ])
            }
        }

        /**
         * Returns this model as an object
         */
        asObject() {
            var result = {}
            for (let field of this.schema.fields) {
                if (!field.isCollection) {
                    result[field.name] = this.data[field.name]
                }
            }
            for (let field of this.schema.fields) {
                if (field.isCollection) {
                    result[field.name] = this.data[field.name] && this.data[field.name].asArray()
                }
            }

            return result
        }

        /**
         * Logs this model to the console
         */
        log() {
            console.log(this.asObject())
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Model = Model
    }
    else if (typeof(window) != "undefined") {
        window.Model = Model
    }
})()