(function() {
    var firebase = window.firebase || require("firebase-admin")
    var Progress = window.Progress || require("progress").Progress

    /**
     * Represents a collection of models
     */
    class Collection {
        /**
         * Creates a collection
         * @param {*} path Path to this collection on Firestore
         */
        constructor(path) {
            // TODO Collections currently use an array of ids and an object to ensure
            // the order of the result set.  Update to use a Set which does this natively.

            this.cls = this.constructor.getClass()
            this.path = path || null
            this.ids = []
            this.data = {}
            this.listeners = []
            this.isLoaded = false
        }

        /** 
         * Returns the Model class this is a collection of
         */
        static getClass() {
            this.cls = this.cls || this.defineClass()
            return this.cls
        }
        
        /**
         * Overwrite to define the model this is a collection of
         */
        static defineClass() {
            return Model
        }

        get absolutePath() {
            return this.path
        }

        get last() {
            return this.data[this.ids[this.ids.length - 1]]
        }

        get size() {
            return this.ids.length
        }

        get length() {
            return this.ids.length
        }

        slice(start, end) {
            return this.ids.slice(start, end).map(id => this.data[id])
        }

        get(idx) {
            return this.data[this.ids[idx]]
        }

        getById(id) {
            return this.data[id]
        }

        forEach(callback) {
            for (let id of this.ids) {
                callback(this.data[id])
            }
        }

        map(callback) {
            return this.ids.map(id => callback(this.data[id]))
        }

        filter(callback) {
            return this.ids.filter(id => callback(this.data[id])).map(id => this.data[id])
        }

        *[Symbol.iterator]() {
            for (let id of this.ids)
                yield this.data[id]
        }

        get schema() {
            return this.cls.getSchema()
        }

        getSchema() {
            return this.cls.getSchema()
        }
        
        addListener(cb) {
            this.listeners.push(cb)
        }

        instantiate(id, data) {
            var obj = new this.cls(this.path, id, data)
            return obj
        }

        /**
         * Handles a change to the collection (added, removed, modified)
         * @param {*} change Object returned by Firestore contaning the change (type, doc)
         */
        handleChange(change) {        
            var model
            if (change.type == "removed") {
                model = this.data[change.doc.id]
                delete this.data[change.doc.id]

                var idx = this.ids.indexOf(change.doc.id)
                if (idx != -1)
                    this.ids.splice(idx, 1) 
            }
            else if (change.type == "added") {
                Progress.report()
                model = this.instantiate(change.doc.id, change.doc.data())
                this.data[change.doc.id] = model
                this.ids.push(change.doc.id)
            }
            else {
                model = this.data[change.doc.id]
                this.data[change.doc.id].setFromDoc(change.doc)
            }

            this.listeners.forEach(listener => listener(change.type, model))

            return model
        }

        col() {
            return firebase.firestore().collection(this.path)
        }

        colByIds(ids) {
            return this.col().where(firebase.firestore.FieldPath.documentId(), 'in', ids)
        }

        /**
         * Loads the collection from Firestore
         * @param {*} col Override collection reference so we can filter by where
         */
        load(col) {
            var self = this
            col = col || this.col()
            const promise = col.get()

            promise.then(function(snap) {
                self.ids = []
                self.data = {}
                snap.forEach(function(doc) {
                    self.handleChange({
                        "type": "added",
                        "doc": doc
                    })
                })
                self.isLoaded = true

                return self
            })
            .catch(function(error) { console.log(error)} )

            return promise
        }

        loadAll(col) {
            return this.load(col).then(() => { 
                var promises = this.map(model => model.loadCollections()) 
        
                return Promise.all(promises).then(() => this)
            })            
        }

        deleteAll(col) {
            return this.loadAll(col).then(() => {
                return Promise.all(this.map((model) => model.delete()))
            })
        }

        /**
         * Listens to the collection on Firestore
         */
        listen(col) {
            
            var self = this
            col = col || this.col()
            col.onSnapshot(function(snap) {
                snap.docChanges().forEach(function(change) {
                    self.handleChange(change)
                })
                self.isLoaded = true
            })
        }

        /**
         * Adds a new model to the collection.  Instantiates one if not supplied.
         * @param {*} newitem Model to add
         * @param {*} options Use force option to add multiple unsaved models
         */
        add(newitem, options) {
            options = options || {}
            if (this.last && this.last.isNew && !options.force) {
                console.log("Will not add another item until current new item is saved.")
                return
            }

            newitem = newitem || this.instantiate()

            this.data[newitem.id] = newitem
            this.ids.push(newitem.id)
            this.isLoaded = true

            this.listeners.forEach(listener => listener("added", newitem))

            return newitem
        }

        remove(id) {
            if (id in this.data) {
                this.data[id].delete()

                if (!this.data[id].autoCommit) {
                    this.handleChange({ type: "removed", doc: { id: id }})
                }
            }
        }

        subpath(path) {
            var parts = [ this.path ]

            if (path) 
                parts.push(path)

            return parts.join('/')
        }

        asArray() {
            return this.ids.map(id => this.data[id].asObject())
        }

    }

    if (typeof(exports) != "undefined") {
        exports.Collection = Collection
    }
    else if (typeof(window) != "undefined") {
        window.Collection = Collection
    }
})()