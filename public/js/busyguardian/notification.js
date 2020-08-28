(function() {
    var config = require('../../../functions/.runtimeconfig.json')    
    var axios = require('axios')

    class Notification {
        constructor(game, profiles, msg) {
            this.game = game
            this.profiles = profiles
            this.msg = msg
        }

        formatDiscord(discordIds) {
            var game = this.game
            var platformEmoji = { 'steam': '<:steam:748550766431830046>', 'playstation': '<:playstation:748550766440218704>', 
                'xbox': '<:xbox:748550766112800840>', 'stadia': '<:stadia:748550766431567954>' }

            var mentions = discordIds.map(id => `<@${id}>`).join(' ')
            var fields = [
                { name: "Date:", value: game.pstDate, inline: true },
                { name: "Time:", value: game.pstStartTime, inline: true },
                { name: "Duration:", value: game.duration + " hours", inline: true },
                { name: "Platform:", value: `${platformEmoji[game.platform]} ${game.displayPlatform}`, inline: true },
                { name: "Players:", value: (
                    game.players.filter(player => !player.isAlternate)
                        .map(player => `${player.isConfirmed ? ':white_check_mark:' : ':hourglass:'} ${player.username} [${player.experience}]`)
                        .join(",\n")
                )},
                { name: "Alternates:", value: (
                    game.players.filter(player => player.isAlternate)
                        .map(player => `${player.isConfirmed ? ':white_check_mark:' : ':hourglass:'} ${player.username} [${player.experience}]`)
                        .join(",\n")
                )}
            ]

            var data = {
                content: `${mentions} ${this.msg}`,
                embeds: [ {
                    title: game.activityName,
                    url: "https://thebusyguardian.com/joined#" + game.id,
                    thumbnail: { url: `https://thebusyguardian.com/img/activity-${game.activityType}.png`},
                    fields: fields,
                    timestamp: game.isoStartTime,
                    footer: { text: "Your Time" }
                }]
            }

            return data
        }

        sendDiscord() {
            var discordIds = this.profiles
                .filter(profile => profile.discordId && profile.notifyVia == "discord")
                .map(profile => profile.discordId)
            
            if (discordIds.length == 0)
                return

            var data = this.formatDiscord(discordIds)

            return axios({
                method: 'post',
                url: config.discord.webhook.url,
                data: data
            })
        }

        formatEmail(recipients) {
            
            var header = "<h1>" + this.msg + "</h1>"

            var data = {
                sender: {name: 'The Busy Guardian', email: 'no-reply@thebusyguardian.com'},
                to: recipients,
                replyTo: {email: 'no-reply@thebusyguardian.com', name: 'The Busy Guardian'},
                attachment: [{
                    content: Buffer.from(this.game.toIcsCalendar(), 'utf-8').toString('base64'), 
                    name: `activity-${this.game.id}.ics`}],
                htmlContent: header + this.game.toHtmlString(),
                subject: this.msg        
            }
            
            return data
        }

        sendEmail() {
            var recipients = this.profiles
                .filter(profile => profile.email && profile.notifyVia == "email")
                .map(profile => ({ name: profile.username, email: profile.email }))

            if (recipients.length == 0)
                return

            var data = this.formatEmail(recipients)

            return axios({
                method: 'post',
                headers: { 'api-key': config.mailer.api.key },
                url: config.mailer.api.endpoint,
                data: data
            })
        }

        send() {
            return Promise.all([
                this.sendDiscord(),
                this.sendEmail()
            ])
        }
    }


    if (typeof(exports) != "undefined") {
        exports.Notification = Notification
    }

    if (typeof(window) != "undefined") {
        window.Notification = Notification
    }
})()