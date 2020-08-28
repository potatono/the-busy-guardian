
class User {
    static get isAuthenticated() {
        return (this.user && this.user.uid && true) || false
    }

    static get uid() {
        return this.user.uid
    }

    static auth() {
        this.user = firebase.auth().currentUser || {}
        
        var authResolve
        var promise = new Promise((resolve, _) => authResolve = resolve)

        firebase.auth().onIdTokenChanged(function(user) {
            if (user) {
                User.user = user
                authResolve(user)
            }
            else if (/auth_token=([\w\-\.]+)/.test(document.cookie)) {
                firebase.auth().signInWithCustomToken(RegExp.$1).then((user) => {
                    console.log("Signed in with custom token", user)
                })
            }
            else {
                console.log("Redirecting to /auth")
            }
        })

        return promise
    }
}