(function() {
    // TODO Change this to take a constructor param
    var axios = require('axios')
    var emoji = {
        'confirmed': '<:confirmed:751095762275926029>',
        'unconfirmed': '<:unconfirmed:751095762775048200>',
        'steam': '<:steam:748550766431830046>',
        'playstation': '<:playstation:748550766440218704>',
        'xbox': '<:xbox:748550766112800840>',
        'stadia': '<:stadia:748550766431567954>',
        'Beta Tester': '<:BetaTester:751083617391739001>',
        'Founder': '<:Founder:751083804491513978>',
        'Coder': '<:Coder:751083563713167440>',
        'Hacker': '<:Hacker:751097800745418943>',
        'Streamer': '<:Streamer:751083573867446343>',
        'newbie': '<:newbie:751083436252463124>',
        'researched': '<:researched:751083478162079784>',
        'played': '<:played:751083499179737120>',
        'completed': '<:completed:751083540397031424>',
        'veteran': '<:veteran:751083552002539640>',
        'sherpa': '<:sherpa:751083524504813589>'
    }

    class Notification {
        constructor(config, game, profiles, msg) {
            this.config = config
            this.game = game
            this.profiles = profiles
            this.msg = msg
        }

        formatPlayerDiscord(player) {
            var result = (player.isConfirmed ? emoji.confirmed : emoji.unconfirmed) + " " +
                player.username + " " +
                emoji[player.experience]

            if (player.awards)
                player.awards.forEach(award => { if (emoji[award]) result += ` ${emoji[award]}` })
            
            return result

        }
        formatDiscord(discordIds) {
            var game = this.game

            var mentions = discordIds.map(id => `<@${id}>`).join(' ')
            var fields = [
                { name: "Date:", value: game.pstDate, inline: true },
                { name: "Time:", value: game.pstStartTime, inline: true },
                { name: "Duration:", value: game.duration + " hours", inline: true },
                { name: "Platform:", value: `${emoji[game.platform]} ${game.displayPlatform}`, inline: true },
                { name: "Players:", value: (
                    game.players.filter(player => !player.isAlternate)
                        .map(player => this.formatPlayerDiscord(player))
                        .join("\n")
                )},
                { name: "Alternates:", value: (
                    game.players.filter(player => player.isAlternate)
                        .map(player => this.formatPlayerDiscord(player))
                        .join("\n")
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
                .filter(profile => profile.discordId && profile.notifyVia instanceof Set && profile.notifyVia.has("discord"))
                .map(profile => profile.discordId)
            
            if (discordIds.length == 0)
                return

            var data = this.formatDiscord(discordIds)

            return axios({
                method: 'post',
                url: this.config.discord.webhook.url,
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
                .filter(profile => profile.email && profile.notifyVia instanceof Set && profile.notifyVia.has("email"))
                .map(profile => ({ name: profile.username, email: profile.email }))

            if (recipients.length == 0)
                return

            var data = this.formatEmail(recipients)

            return axios({
                method: 'post',
                headers: { 'api-key': this.config.mailer.api.key },
                url: this.config.mailer.api.endpoint,
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