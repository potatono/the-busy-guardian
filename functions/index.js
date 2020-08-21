const debug = require('debug')
const crypto = require('crypto')

const functions = require('firebase-functions')
const admin = require('firebase-admin');

const axios = require('axios')
const querystring = require('querystring');
const { firebaseConfig } = require('firebase-functions');

admin.initializeApp();

function createState(req) {
    // Between cloudflare and google we get bounced around so much that x-forwarded-for
    // doesn't actually contain the client ip and it changes with every request.
    var ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress;
    var agent = req.headers['user-agent'];
    var key = functions.config().bungie.api.key;

    var data = key + ip + agent
    var hash =  crypto.createHash('sha256').update(data).digest('hex')

    if (/localhost/.test(req.headers['host'])) {
        hash = 'L' + hash
    }

    functions.logger.debug(`ip=${ip} agent=${agent} key=${key} hash=${hash}`)

    return hash
}

function requestBungieToken(req) {
    var data = querystring.stringify({
        code: req.query.code,
        grant_type: "authorization_code",
        client_id: functions.config().bungie.client.id,
        client_secret: functions.config().bungie.client.secret
    })

    return axios({
        method: 'post',
        url: 'https://www.bungie.net/platform/app/oauth/token/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: data
    })
}

function refreshBungieToken(refresh_token) {
    var data = querystring.stringify({
        refresh_token: refresh_token,
        grant_type: "refresh_token",
        client_id: functions.config().bungie.client.id,
        client_secret: functions.config().bungie.client.secret
    })

    return axios({
        method: 'post',
        url: 'https://www.bungie.net/platform/app/oauth/token/',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: data
    })
}

function saveTokens(data) {
    let uid = `bungie:${data.membership_id}`
    let copy = {}
    Object.assign(copy, data)
    copy['createdOn'] = admin.firestore.FieldValue.serverTimestamp()

    return admin.firestore().collection('tokens').doc(uid).set(copy)
}

function createFirebaseToken(data) {
    let uid = `bungie:${data.membership_id}`

    return admin.auth().createCustomToken(uid)
}

function isExpired(createdOn, expires) {
    var expireTime = createdOn.toDate().getTime() + expires * 1000
    var currentTime = (new Date()).getTime()

    return currentTime >= expireTime
}

function getTokens(uid) {
    return admin.firestore().collection('tokens').doc(uid).get().then((doc) => {
        let tokens = doc.data()
        if (isExpired(tokens.createdOn, tokens.refresh_expires_in)) {
            functions.logger.info("Refresh token is expired, need to log in again..")
            return null
        }
        else if (isExpired(tokens.createdOn, tokens.expires_in)) {
            functions.logger.info("Access token is expired, refreshing..")
            return refreshBungieToken(tokens.refresh_token).then((response) => {
                return saveTokens(response.data).then(() => {
                    return response.data
                })
            })
        }
        else {
            functions.logger.info("Access token is fine, returning..")
            return tokens
        }
    })
}

function bungieApiCall(uid, endpoint) {
    return getTokens(uid).then((tokens) => {
        // TODO Handle null case (refresh token expired)
        return axios({
            url: 'https://www.bungie.net/Platform' + endpoint,
            headers: {
                'X-API-Key': functions.config().bungie.api.key,
                'Authorization': `Bearer ${tokens.access_token}`
            }
        })
    })
}

exports.auth = functions.https.onRequest((req, res) => {
    var state = createState(req)

    if (!req.query.code || !req.query.state) {
        res.redirect('https://www.bungie.net/en/oauth/authorize?client_id=' +
            functions.config().bungie.client.id +
            '&response_type=code&state=' +
            state)
        return
    }

    if (!/localhost/.test(req.headers['host']) && /^L/.test(req.query.state)) {
        res.redirect(`http://localhost:5000/auth?code=${req.query.code}&state=${req.query.state}`)
        return
    }

    if (req.query.state != state) {
        functions.logger.error(`request state = ${req.query.state} != calc state = ${state}`)
        res.status(401).send("Uh oh: Invalid state")
        return
    }

    requestBungieToken(req).then((response) => {
        saveTokens(response.data).then(() => {
            createFirebaseToken(response.data).then((token) => {
                functions.logger.error(token)
                res.cookie("auth_token", token).redirect("/profile")
            })
            .catch((error) => {
                functions.logger.error(error, {structuredData: true})
                res.send("Firebase error:" + error)
            })
        })
    })
    .catch((error) => {
        functions.logger.error(error, {structuredData: true})
        var message = "Bungie servers responded with: " + error.response.data.error_description
        res.send(message)
    })    
});

exports.bungieApi = functions.https.onCall((data, context) => {
    let uid = context.auth.uid
    let endpoint = data.endpoint

    return bungieApiCall(uid, endpoint).then((response) => {
        if (response.status != 200) {
            functions.logger.error(`Backend returned ${response.status}: ${response.data}`)
            throw new functions.https.HttpsError('unknown', `Backend returned ${response.status}: ${response.data}`)
        }
        var data = response.data

        if (data.ErrorStatus != "Success") {
            functions.logger.error(`API returned ${data.ErrorStatus}: ${data.Message}`)
            throw new functions.https.HttpsError('unknown', `API returned ${data.ErrorStatus}: ${data.Message}`)
        }

        return data.Response
    })
    .catch((error) => {
        let data = error.response && error.response.data
        let status = data && data.ErrorStatus
        let message = data && data.Message

        if (status && message) {
            functions.logger.error(`API responded with error: ${status} - ${message}`)
            throw new functions.https.HttpsError('unknown',`API responded with error: ${status} - ${message}`)
        }
        else {
            functions.logger.error(error)
            throw new functions.https.HttpsError('unknown', `API caught ${error}`)
        }
    })
})