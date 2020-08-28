
(function() {
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
            var profile = new Profile(User.uid)
            var view = new FormView(profile)
            document.getElementById('profile-form').appendChild(view.build())
            profile.load().then(_ => {
              if (/discord_id=(\d+)/.test(window.location.href)) {
                profile.discordId = RegExp.$1
              }
            })
            window.profile = profile
  
            profile.addListener("bungieImportComplete", complete => { if (!complete) startImport() })
            Progress.addListener(n => $('#progress').css('width', n + '%').attr('aria-valuenow', n))
        }
    
        startImport() {
            Progress.reset()
            $('#loading').modal('show')
    
            Bungie.importProfile().then(() => {
              Progress.report(100)
              profile.bungieImportComplete = true
              window.setTimeout(() => $('#loading').modal('hide'), 250)
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

        start() {
            var games = this.games = new Games()            
            var profile = this.profile = new Profile(User.uid)

            Progress.addListener(value => $('#progress').css('width', value+'%').attr('aria-valuenow',value))
            $('#loading').modal('show')
        
            profile.load().then(() => {
                var gameIds = profile.games || []
        
                if (gameIds.length > 0) {
                    Progress.step = 45 / gameIds.length
                
                    games.loadByIds(gameIds).then(() => {
                        Progress.report(100)
                
                        var view = this.view = new TemplateView(games, { template: 'joinedGame.hbs' })
                        document.getElementById('games').appendChild(view.build())
            
                        window.setTimeout(()=> {
                            if (window.location.hash)
                                $(window.location.hash + ' .card').addClass('border-danger')
                            
                            $('#loading').modal('hide')
                        }, 250)
                    })
                }
                else {
                    $('#nogames').removeClass('d-none')
                    Progress.report(100)
                    window.setTimeout(()=>$('#loading').modal('hide'), 250)
                }
            })
            
            if (/localhost/.test(window.location.href)) {
                firebase.functions().useFunctionsEmulator('http://localhost:5001')
            }
        
            this.confirmGameCallable = firebase.functions().httpsCallable('confirmGame')
            this.leaveGameCallable = firebase.functions().httpsCallable('leaveGame')
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
    }

    class CreateGameController extends Controller {
        constructor() {
            super([
                { name: 'createGame.hbs' }
            ])
        }

        start() {
            var game = this.game = new Game()
            var view = this.view = new FormView(game)
            document.getElementById('game-form').appendChild(view.build())
            window.game = game
        }
    }

    class App {
        static start() {
            var cls = ({
                '/profile': ProfileController,
                '/games': GamesController,
                '/games/joined': JoinedGamesController,
                '/games/new': CreateGameController 
            })[window.location.pathname]

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
        }
    }

    if (typeof(exports) != "undefined") {
        exports.App = App
    }
    if (typeof(window) != "undefined") {
        window.App = App
    }
})()