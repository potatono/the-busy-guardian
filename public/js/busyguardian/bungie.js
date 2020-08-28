
class Bungie {
    static importProfile() {
        this.setup()

        return Promise.all([
            this.importMemberships(),
            this.importActivities()
        ])
    }

    static setup() {
        if (/localhost/.test(window.location.href)) {
            firebase.functions().useFunctionsEmulator('http://localhost:5001')
        }
        this.api = firebase.functions().httpsCallable('bungieApi')
    }

    static importMemberships() {
        const platforms = { 1: 'xbox', 2: 'playstation', 3: 'steam', 5: 'stadia'}

        return this.loadMemberships().then(() => {
            Progress.report()
            let memberships = this.memberships
            let destinyMemberships = memberships.destinyMemberships
            let username = memberships.bungieNetUser.displayname

            if (username)
                profile.username = profile.username || username
            
            profile.bungiePrimaryMembershipId = memberships.primaryMembershipId
            profile.bungiePrimaryMembershipType = memberships.primaryMembershipType

            for (let membership of destinyMemberships) {
                let platform = platforms[membership.membershipType]
                let username = membership.displayName
                let membershipId = membership.membershipId

                if (!profile.getPlatform(platform)) {
                    let row = profile.platforms.add()
                    row.autoCommit = false
                    row.name = platform
                    row.username = username
                    row.membershipId = membershipId
                    row.save()
                }
            }
        })
        .catch(error => console.error(error))
    }

    static importActivities() {
        function completionExperience(n) {
            if (n >= 25)
                return "sherpa"
            else if (n >= 10)
                return "veteran"
            else if (n >= 1)
                return "completed"
            else
                return "newbie"
        }

        return this.loadActivityHistory().then(() => {
            Progress.report()
            let activities = this.activityHistory
            for (var activity in activities) {
                if (!profile.getActivity(activity)) {
                    // We use instantiate because the compound select init stuff is hacky
                    let row = profile.activities.instantiate()
                    row.autoCommit = false
                    row.activity = activity
                    row.experience = completionExperience(activities[activity])
                    profile.activities.add(row)
                    row.save()
                }
            }
        })
    }

    static loadMemberships() {
        if (this.memberships)
            return new Promise((resolve) => resolve(this))

        return this.api({ endpoint: '/User/GetMembershipsForCurrentUser/' }).then((result) => {
            Progress.report()
            this.memberships = result.data

            for (let membership of this.memberships.destinyMemberships) {
                if (membership.membershipId == this.memberships.primaryMembershipId)
                    this.memberships.primaryMembershipType = membership.membershipType
            }

            return this
        })
    }

    static loadCharacters() {
        if (this.characters)
            return new Promise((resolve) => resolve(this))

        return this.loadMemberships().then(() => {
            Progress.report()
            var endpoint = '/Destiny2/' + 
                this.memberships.primaryMembershipType +
                '/Profile/' +
                this.memberships.primaryMembershipId + 
                '?components=200'

            return this.api({ endpoint: endpoint }).then((result) => {
                Progress.report()
                var characters = result.data.characters.data
                this.characters = Object.keys(characters).map(key => characters[key])

                return this
            })
        })
    }

    static appendActivityHistory(activity) {
        function camelCase(name) {
            var result = name.toLowerCase().split(/\s+/).map(s => s[0].toUpperCase() + s.slice(1)).join('')
            return result[0].toLowerCase() + result.slice(1)
        }
        const types = { 4: 'raid', 82: 'dungeon' }

        var def = this.activityDefinitions[activity.activityHash]

        if (!def) 
            return

        var type = def.directActivityModeType || (def.activityTypeHash == 2043403989 && 4)
        var type_enum = types[type]
        var name = def.originalDisplayProperties.name
        var completions = activity.values.activityCompletions.basic.value

        if (type_enum) {
            var key = type_enum + ':' + camelCase(name)
            this.activityHistory[key] = this.activityHistory[key] || 0
            this.activityHistory[key] += completions
        }
    }

    static loadActivityHistory() {
        if (this.activityHistory) {
            return new Promise((resolve) => resolve(this))
        }

        this.activityHistory = {}

        return Promise.all([ this.loadCharacters(), this.loadActivityDefinitions() ]).then(() => {
            Progress.report()
            var promises = []
            
            for (let character of this.characters) {
                var endpoint = '/Destiny2/' + 
                    this.memberships.primaryMembershipType +
                    '/Account/' +
                    this.memberships.primaryMembershipId + 
                    '/Character/' +
                    character.characterId +
                    '/Stats/AggregateActivityStats'

                promises.push(
                    this.api({ endpoint: endpoint }).then((result) => { 
                        Progress.report()
                        for (let activity of result.data.activities) {
                            this.appendActivityHistory(activity)
                        }                        
                    })
                )
            }

            return Promise.all(promises).then(() => this)
        })
    }

    static loadManifest() {
        if (this.manifest) {
            return new Promise((resolve) => resolve(this))
        }

        return this.api({ endpoint: '/Destiny2/Manifest' }).then((result) => {
            Progress.report()
            this.manifest = result.data

            return this
        })
    }

    static loadActivityDefinitions() {
        if (this.activityDefinitions) {
            return new Promise((resolve) => resolve(this))
        }

        return this.loadManifest().then(() => {
            Progress.report()
            let url = 'https://www.bungie.net/' + 
                this.manifest.jsonWorldComponentContentPaths.en.DestinyActivityDefinition

            return axios({ url: url }).then((response) => {
                this.activityDefinitions = response.data

                return this
            })
        })
    }

   
}