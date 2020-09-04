(function() {
    var User = require('./user').User
    var Profile = require('./profile').Profile

    class Controller {
        constructor(templates) {
            this.templates = templates || []
        }

        setup() {
            this.templates.forEach(t => {
                $('#app').append(Handlebars.templates[t.name](t.data))
            })
        }

        start() {}
    }

    class ProfileController extends Controller {
        constructor() { 
            super([
                { name: "profile.hbs", data: {} },
                { name: "progress.hbs", data: { title: "Importing data..." }}
            ])
        }

        start() {
            var profile = User.profile
            var view = new FormView(profile)
            document.getElementById('profile-form').appendChild(view.build())
            profile.loadCollections().then(_ => {
              if (/discord_id=(\d+)/.test(window.location.href)) {
                profile.discordId = RegExp.$1
              }

              if (!profile.bungieImportComplete)
                this.startImport()
            })
            
            window.profile = profile
  
            // profile.addListener("bungieImportComplete", complete => { if (!complete) this.startImport() })
            Progress.addListener(n => $('#progress').css('width', n + '%').attr('aria-valuenow', n))
        }
    
        startImport() {
            Progress.reset()
            $('#loading').modal('show')
    
            Bungie.importProfile().then(() => {
              Progress.report(100)
              profile.bungieImportComplete = true
              window.setTimeout(() => $('#loading').modal('hide'), 250)

              // Update nav with loaded info
              App.updateNav()
            })
        }
    }

    class GamesController extends Controller {
        constructor() {
            super([
                { name: 'games.hbs' },
                { name: 'progress.hbs', data: { title: 'Loading games...' }}
            ])
        }

        start() {
            var games = this.games = new Games()
            var view = this.view = new TemplateView(this.games, { template: 'game.hbs' })
            
            Progress.addListener(value => $('#progress').css('width', value+'%').attr('aria-valuenow',value))
            $('#loading').modal('show')

            games.loadAll().then(() => {
                Progress.report(100)
                document.getElementById('games').appendChild(view.build())
                window.setTimeout(()=>$('#loading').modal('hide'), 250)
            })

            if (/localhost/.test(window.location.href)) {
                firebase.functions().useFunctionsEmulator('http://localhost:5001')
            }

            this.joinGameCallable = firebase.functions().httpsCallable('joinGame')
        }
  
        joinGame(gid, element) {
            var view = this.view
            var games = this.games

            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Joining...'
            this.joinGameCallable({ gid: gid })
            .then(() => {
                var game = games.getById(gid)

                game.players.load().then(() => {
                    view.update(game)
                })
            })
            .catch(err => {
                console.error(err)
                $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                element.innerHTML = 'Join'
            })
        }
    }

    class JoinedGamesController extends Controller {
        constructor() {
            super([
                { name: 'joinedGames.hbs' },
                { name: 'progress.hbs', data: { title: 'Loading games...' }}
            ])
        }

        setup() {
            super.setup()

            if (/localhost/.test(window.location.href)) {
                firebase.functions().useFunctionsEmulator('http://localhost:5001')
            }
        
            this.confirmGameCallable = firebase.functions().httpsCallable('confirmGame')
            this.leaveGameCallable = firebase.functions().httpsCallable('leaveGame')
            this.publishGameCallable = firebase.functions().httpsCallable('publishGame')
            this.deleteGameCallable = firebase.functions().httpsCallable('deleteGame')
        }

        start() {
            var games = this.games = new Games()            
            var profile = this.profile = new Profile(User.uid)
            var drafts = this.drafts = new Games(`drafts/${User.uid}/games`)
            var promises = []

            // Setup progress meter
            Progress.addListener(value => $('#progress').css('width', value+'%').attr('aria-valuenow',value))
            $('#loading').modal('show')
        
            // Load joined games
            profile.load().then(() => {
                var gameIds = profile.games || []
        
                if (gameIds.length > 0) {
                    Progress.step = 45 / gameIds.length
                
                    var promise = games.loadByIds(gameIds).then(() => {
                        var view = this.view = new TemplateView(games, { template: 'joinedGame.hbs' })
                        document.getElementById('games').appendChild(view.build())
                    })
                    promises.push(promise)
                }
            })

            // Load drafts
            var promise = drafts.load().then(() => {
                var draftView = this.draftView = new TemplateView(drafts, { template: 'draftGame.hbs' })
                document.getElementById('drafts').appendChild(draftView.build())
            })
            promises.push(promise)

            // Hide progress, highlight anchored, show message on no games
            Promise.all(promises).then(() => {      
                Progress.report(100)

                window.setTimeout(()=> {
                    if (window.location.hash)
                        $(window.location.hash + ' .card').addClass('border-danger')
                    
                    $('#loading').modal('hide')
                }, 250)

                if (games.length == 0 && drafts.length == 0) {
                    $('#nogames').removeClass('d-none')
                }
            })
        }
        
        confirmGame(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Confirming...'
        
            this.confirmGameCallable({ gid: gid })
                .then(() => {
                    element.className = "btn btn-success"
                    element.innerHTML = "Confirmed"
                    element.disabled = true
                })
                .catch(err => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Confirm'
                })        
          }
        
        leaveGame(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Leaving...'
            
            this.leaveGameCallable({ gid: gid })
                .then(() => {
                    window.setTimeout(() => $('#'+gid).fadeOut(), 250)
                })
                .catch((err) => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Leave'
                })
        }

        publishGame(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...'

            this.publishGameCallable({ gid: gid })
                .then(result => {
                    var newgid = result.data
                    console.log(newgid)
                    var newGame = new Game(newgid)
                    newGame.load().then(() => {
                        $(`#${gid}`).fadeOut()
                        $(this.view.add(newGame)).addClass('border-danger')
                        window.location.hash = newGame.id
                    })
                })
                .catch(err => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Publish' 
                })
        }

        deleteGame(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...'

            this.deleteGameCallable({ gid: gid })
                .then(_ => $(`#${gid}`).fadeOut())
                .catch(err => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Delete' 
                })
        }

        editGame(gid, element) {
            window.location.href = `/games/edit#${gid}`
        }
    }

    class CreateGameController extends Controller {
        constructor() {
            super([
                { name: 'createGame.hbs' }
            ])
        }

        setup() {
            super.setup()

            if (/localhost/.test(window.location.href)) {
                firebase.functions().useFunctionsEmulator('http://localhost:5001')
            }
        
            this.publishGameCallable = firebase.functions().httpsCallable('publishGame')
            this.deleteDraftCallable = firebase.functions().httpsCallable('deleteDraft')
        }

        start() {
            var id = window.location.hash && window.location.hash.replace(/^#/, '')
            var game = this.game = new Game(id, { path: `drafts/${User.uid}/games` })
            var view = this.view = new FormView(game)

            document.getElementById('game-form').appendChild(view.build())

            if (window.location.hash) { 
                game.load() 
            }
            else {
                game.owner = User.uid
            }
        }

        publishGame(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Publishing...'

            this.publishGameCallable({ gid: gid })
                .then(result => {
                    var newgid = result.data
                    var newGame = new Game(newgid)
                    newGame.load().then(() => {
                        window.location.href = `/games/joined#${gid}`
                    })
                })
                .catch(err => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Publish' 
                })
        }

        deleteDraft(gid, element) {
            element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...'

            this.deleteDraftCallable({ gid: gid })
                .then(_ => $(`#${gid}`).fadeOut())
                .catch(err => {
                    console.error(err)
                    $(element).popover({ content: err.message, position: 'auto' }).popover('show')
                    element.innerHTML = 'Delete' 
                })
        }
    }

    class App {
        static start() {
            var cls = ({
                '/profile': ProfileController,
                '/games': GamesController,
                '/games/joined': JoinedGamesController,
                '/games/edit': CreateGameController  
            })[window.location.pathname]

            if (!cls) 
                window.location.href = `/404${window.location.pathname}`
            
            User.auth().then(() => {
                App.updateNav()
                window.controller = new cls()
                window.controller.setup()
                window.controller.start()
            })
            .catch(err => console.error(err))
        }

        static updateNav() {
            $(`#navbarNav .nav-item[data-path='${window.location.pathname}']`).addClass('active')

            if (User.isAuthenticated) {
                if (User.profile.awards) {
                    $('#awards').html('')
                    User.profile.awards.forEach(award => {
                        $('#awards').append(`<img src="/img/badges/${award}.svg" width="24" class="award" title="${award}" />`)
                    })
                }
                $('#username').text(User.profile.username)
            }
        }
    }

    if (typeof(exports) != "undefined") {
        exports.App = App
    }
    if (typeof(window) != "undefined") {
        window.App = App
    }
})()