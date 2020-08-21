(function() {
    var Schema = window.Schema || require("schema").Schema
    var Model = window.Model || require("model").Model
    var Collection = window.Collection || require("collection").Collection

    class Activity extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("activity", String, { 
                control: "compoundSelect",
                depth: 2,
                colSizes: [ 4 ],
                placeholders: [ "(Category)", "(Activity)" ],
                values: [
                    { value: "raid", label: "Raid", values: [
                        { value: "any", label: "Any" },
                        { value: "leviathan", label: "Leviathan" },
                        { value: "eaterOfWorlds", label: "Eater of Worlds" },
                        { value: "spireOfStars", label: "Spire of Stars" },
                        { value: "lastWish", label: "Last Wish" },
                        { value: "scourgeOfThePast", label: "Scourge of the Past" },
                        { value: "crownOfSorrow", label: "Crown Of Sorrow" },
                        { value: "gardenOfSalvation", label: "Garden of Salvation" }
                    ]},
                    { value: "dungeon", label: "Dungeon", values: [
                        { value: "any", label: "Any" },
                        { value: "theShatteredThrone", label: "The Shattered Throne" },
                        { value: "pitOfHeresy", label: "Pit of Heresy" },
                        { value: "prophecy", label: "Prophecy" }
                    ]},
                    { value: "crucible", label: "Crucible", values: [
                        { value: "any", label: "Any" },
                        { value: "competitive", label: "Competitive" },
                        { value: "ironBanner", label: "Iron Banner" },
                        { value: "trialsOfOsiris", label: "Trials of Osiris" },

                    ]},
                    { value: "strike", label: "Strike", values: [
                        { value: "any", label: "Any" },
                        { value: "nightfall", label: "Nightfall" }
                    ]},
                    { value: "mission", label: "Mission", values: [
                        { value: "theWhisper", label: "The Whisper" },
                        { value: "zeroHour", label: "Zero Hour" }
                    ]}
                ]}
            )

            schema.add("experience", String, {
                control: "select",
                colSize: 4,
                values: [
                    { value: "newbie", label: "Newbie" },
                    { value: "researched", label: "Researched" },
                    { value: "played", label: "Played" },
                    { value: "completed", label: "Completed" },
                    { value: "veteran", label: "Veteran" },
                    { value: "sherpa", label: "Sherpa" }
                ]
            })
            schema.setOption("form", { type: "inline" })

            return schema
        }

        expandActivity() {
            if (!this.activity)
                return []

            if (this.activity.endsWith(":any")) {
                var parts = this.activity.split(":")
                for (var group of this.schema.activity.options.values) {
                    if (group.value == parts[0]) {
                        return group.values.map(v => { 
                            return { 
                                activity: [ group.value, v.value ].join(':'),
                                experience: this.experience 
                            } 
                        })
                        .filter(v => !v.activity.endsWith(":any"))
                    }
                }
            }

            return [ this ]
        }
    }

    class Activities extends Collection {
        static defineClass() {
            return Activity
        }
    }

    if (typeof(exports) != "undefined") {
        exports.Activity = Activity
        exports.Activities = Activities
    }
    else if (typeof(window) != "undefined") {
        window.Activity = Activity
        window.Activities = Activities
    }
})()