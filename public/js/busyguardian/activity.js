(function() {
    var Schema = require("./schema").Schema
    var Model = require("./model").Model
    var Collection = require("./collection").Collection

    class Activity extends Model {
        static defineSchema() {
            var schema = new Schema()

            schema.add("activity", String, { 
                control: "compoundSelect",
                depth: 2,
                colSizes: [ 4 ],
                placeholders: [ "(Category)", "(Activity)" ],
                values: [
                    { value: "raid", label: "Raid", teamSize: 6, values: [
                        { value: "any", label: "Any" },
                        { value: "leviathan", label: "Leviathan" },
                        { value: "eaterOfWorlds", label: "Eater of Worlds" },
                        { value: "spireOfStars", label: "Spire of Stars" },
                        { value: "lastWish", label: "Last Wish" },
                        { value: "scourgeOfThePast", label: "Scourge of the Past" },
                        { value: "crownOfSorrow", label: "Crown Of Sorrow" },
                        { value: "gardenOfSalvation", label: "Garden of Salvation" }
                    ]},
                    { value: "dungeon", label: "Dungeon", teamSize: 3, values: [
                        { value: "any", label: "Any" },
                        { value: "theShatteredThrone", label: "The Shattered Throne" },
                        { value: "pitOfHeresy", label: "Pit of Heresy" },
                        { value: "prophecy", label: "Prophecy" }
                    ]},
                    { value: "crucible", label: "Crucible", teamSize: 6, values: [
                        { value: "any", label: "Any" },
                        { value: "competitive", label: "Competitive" },
                        { value: "ironBanner", label: "Iron Banner" },
                        { value: "trialsOfOsiris", label: "Trials of Osiris" },

                    ]},
                    { value: "strike", label: "Strike", teamSize: 3, values: [
                        { value: "nightfall", label: "Nightfall" }
                    ]},
                    { value: "story", label: "Story", teamSize: 3, values: [
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
    if (typeof(window) != "undefined") {
        window.Activity = Activity
        window.Activities = Activities
    }
})()