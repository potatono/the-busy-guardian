
class User {
    static get isAuthenticated() {
        return (this.user && this.user.uid && true) || false
    }

    static get uid() {
        return this.user.uid
    }

    static setup() {
        this.ui = {}

        this.ui.config = {
            signInOptions: [
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: false
                }
            ],
            signInSuccessUrl: "#",
            tosUrl: "/tos",
            privacyPolicyUrl: "/privacy",
            callbacks: {
                signInSuccessWithAuthResult: function(authResult) {
                    User.signInSuccess(authResult)
                    return false;
                }
            }
        }

        this.ui.id = "firebaseui-auth-container"

        this.ui.container = document.createElement('div')
        this.ui.container.className = "modal"
        this.ui.container.innerHTML = '<div class="modal-dialog"><div id="' + this.ui.id + 
            '" class="modal-content" style="width: 360px"></div></div>'
        document.body.appendChild(this.ui.container)

        this.ui.manager = new firebaseui.auth.AuthUI(firebase.auth())

        if (this.ui.manager.isPendingRedirect())
            this.signIn()
    }

    static auth() {
        this.user = firebase.auth().currentUser || {}
        
        var authResolve
        var promise = new Promise((resolve, _) => authResolve = resolve)

        firebase.auth().onIdTokenChanged(function(user) {
            console.log("idToken Changed") 
            if (user) {
                console.log("User is", user)
                User.user = user
                authResolve(user)
            }
            else if (/auth_token=([\w\-\.]+)/.test(document.cookie)) {
                console.log(RegExp.$1)
                firebase.auth().signInWithCustomToken(RegExp.$1).then((user) => {
                    console.log("Signed in with custom token", user)
                })
            }
            else {
                console.log("Redirecting to /auth")
                //window.location.href = '/auth'
                //User.setup()
                //User.signIn().then(user => authResolve(user))
            }
        })

        return promise
    }

    static signIn() {
        var self = this;
        
        return new Promise((resolve, reject) => {
            self.ui.signInResolve = resolve
            self.ui.signInReject = reject

            $(this.ui.container).modal('show')        
            this.ui.manager.start('#' + this.ui.id, this.ui.config);
        })
    }

    static signInSuccess(authResult) {
        User.user = authResult.user
        $(this.ui.container).modal('hide')

        this.ui.signInResolve(User.user)
    }
}