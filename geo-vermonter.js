let randomPointMarker

var mymap = L.map('mapid', { zoomControl: false }).setView([43.839, -72.625], 8);

mymap.dragging.disable();
mymap.touchZoom.disable();
mymap.doubleClickZoom.disable();
mymap.scrollWheelZoom.disable();
mymap.boxZoom.disable();
mymap.keyboard.disable();

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
Esri_WorldImagery.addTo(mymap)

let vermontBorder = L.geoJSON(border_data);
vermontBorder.addTo(mymap)

vermontBorder.setStyle({ color: '#22e614' });

function makeNewRandomPointInVermont() {
    let VermontBoundingBox = {
        maxLon: -73.3654, minLon: -71.5489, maxLat: 45.0065, minLat: 42.7395
    };
    let latMultiplier = VermontBoundingBox.maxLat - VermontBoundingBox.minLat;
    let lonMultiplier = VermontBoundingBox.maxLon - VermontBoundingBox.minLon;
    let randomLat = Math.random() * latMultiplier + VermontBoundingBox.minLat;
    let randomLon = Math.random() * lonMultiplier + VermontBoundingBox.minLon;
    let layer = L.geoJson(border_data);
    let results = leafletPip.pointInLayer([randomLon, randomLat], layer);
    if (results.length > 0) {
        return new PointInVermont(randomLat, randomLon)
    } else {
        console.log('not in vermont')
        return makeNewRandomPointInVermont()
    }
}

class PointInVermont {
    constructor(lat, lon) {
        this.latitude = lat
        this.longitude = lon
        let thisPlaceholderVariableBecauseFetchesSuck = this
        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + this.latitude + '&lon=' + this.longitude)
        .then(function (result) {
            return result.json()
        })
        .then(function(randomJson) {  
            console.log(randomJson.address.county) 
            thisPlaceholderVariableBecauseFetchesSuck.county = randomJson.address.county
        })
    }
}

function selectStartingPoint() {
    startingPoint = makeNewRandomPointInVermont()
    console.log(startingPoint.latitude)
    if (randomPointMarker !== undefined) {
        mymap.removeLayer(randomPointMarker)
    }
    randomPointMarker = L.marker([startingPoint.latitude, startingPoint.longitude]);
    randomPointMarker.addTo(mymap)
    mymap.setView([startingPoint.latitude, startingPoint.longitude], 17);
    currentLat = startingPoint.latitude;
    currentLon = startingPoint.longitude;
    console.log(startingPoint)
}

function enterHomeScreen() {
    enableStartButton();
    disableGuessButton();
    disableQuitButton();
    disableNavigation();
    hideLatLon();
    resetScore();
}

function enterPlaying() {
    disableStartButton();
    enableGuessButton();
    enableQuitButton();
    enableNavigation();
    hideLatLon();
    resetScore();
    selectStartingPoint();
    hideBanner();
}

function enterEndScreen() {
    enableStartButton();
    disableGuessButton();
    disableQuitButton();
    disableNavigation();
    displayLatLon();;
    resetMap();
}

$('#start').click(enterPlaying);
$('#confirmGuess').click(processUserGuess)
$('#quit').click(giveUp);
$('#navUp').click(panUp)
$('#navLeft').click(panLeft)
$('#navRight').click(panRight)
$('#navDown').click(panDown)
$('#navHome').click(navHome)
$('#highScoresButton').click(displayHighScores)

function disableStartButton() {
    document.getElementById('start').disabled = true
}
function enableStartButton() {
    document.getElementById('start').disabled = false
}
function disableGuessButton() {
    document.getElementById('guess').disabled = true
}
function enableGuessButton() {
    document.getElementById('guess').disabled = false
}
function disableQuitButton() {
    document.getElementById('quit').disabled = true
}
function enableQuitButton() {
    document.getElementById('quit').disabled = false
}
function disableNavigation() {
    $('#navUp').off('click').css('background-color', 'grey')
    $('#navLeft').off('click').css('background-color', 'grey')
    $('#navRight').off('click').css('background-color', 'grey')
    $('#navDown').off('click').css('background-color', 'grey')
    $('#navHome').off('click').css('background-color', 'grey')
    $('#panButtons').css('background-color', 'grey')
}
function enableNavigation() {
    $('#navUp').click(panUp).css('background-color', '#b9c6ef')
    $('#navLeft').click(panLeft).css('background-color', '#b9c6ef')
    $('#navRight').click(panRight).css('background-color', '#b9c6ef')
    $('#navDown').click(panDown).css('background-color', '#b9c6ef')
    $('#navHome').click(navHome).css('background-color', '#b9c6ef')
    $('#panButtons').css('background-color', '#b9c6ef')
}
function displayLatLon() {
    $('#lat').text('Latitude: ' + startingPoint.latitude.toPrecision(6).toString())
    $('#long').text('Longitude: ' + startingPoint.longitude.toPrecision(6).toString())
    $('#county').text('County: ' + startingPoint.county.split(' ')[0].toString())
}
function hideLatLon() {
    $('#lat').text('Latitude: ???')
    $('#long').text('Longitude: ???')
    $('#county').text('County: ???')
}
function resetMap() {
    mymap.setView([43.839, -72.625], 8)
}
function panUp() {
    currentLat = currentLat + 0.00225;
    mymap.setView([currentLat, currentLon], 17);
    scoreDown()
}
function panDown() {
    currentLat = currentLat - 0.00225;
    mymap.setView([currentLat, currentLon], 17);
    scoreDown()
}
function panLeft() {
    currentLon = currentLon - 0.00275;
    mymap.setView([currentLat, currentLon], 17);
    scoreDown()
}
function panRight() {
    currentLon = currentLon + 0.00275;
    mymap.setView([currentLat, currentLon], 17);
    scoreDown()
}
function navHome() {
    currentLat = startingPoint.latitude;
    currentLon = startingPoint.longitude;
    mymap.setView([currentLat, currentLon], 17)
    scoreDown()
}
function resetScore() {
    score = 100
    $('#score').text('Score: ' + score + '')
}
function scoreDown() {
    score--
    $('#score').text('Score: ' + score + '')
}
function processUserGuess(guessCounty) {
    console.log(guessCounty)
    if (guessCounty == startingPoint.county){
        processCorrect()
    } else {
        processIncorrect()
    }
}
let winMessage = 'You Win! Enter your name to save your score to the High Scores <br><div class="disappearingRow row"><input class="form-control col-sm-10" id="nameInput" type="text" placeholder="Your Name"><button class="col-sm-2 btn btn-primary" id="submitScore">Submit</button></div>'

function giveUp() {
    processIncorrect()
}
function processCorrect() {
    $('#guessModal').modal('hide')
    $('#endBanner').css('display', 'flex').css('background', 'green')
    $('#endBanner > h2').html(winMessage)
    $('#submitScore').click(addScore)
    enterEndScreen()
}
function isProfane(name) {
    let filter = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"]
    for (word of filter) {
        console.log(name.includes(word))
        if (name.includes(word)) {
            return true
        }
    }
}
function addScore() {
    let name = $('#nameInput').val()
    if(isProfane(name)) {
        $('#endBanner > h2').html('Please enter a different name. >:( <br><div class="disappearingRow row"><input class="form-control col-sm-10" id="nameInput" type="text" placeholder="Your Name"><button class="col-sm-2 btn btn-primary" id="submitScore">Submit</button></div>')
        $('#submitScore').click(addScore);
    } else {
    if (localStorage.getItem('highScores')) {
        let highScoreArray = JSON.parse(localStorage.getItem('highScores'))
        highScoreArray.push({"name": name, "score": score})
        localStorage.setItem('highScores', JSON.stringify(highScoreArray))
    } else {
        let highScoreArray = []
        highScoreArray.push({"name": name, "score": score})
        localStorage.setItem('highScores', JSON.stringify(highScoreArray))  
    }
    $('#endBanner > h2').html("You Win! High score saved! Play again?")
    displayHighScores()
}}
function processIncorrect() {
    $('#guessModal').modal('hide')
    $('#endBanner').css('display', 'flex').css('background', 'red')
    $('#endBanner > h2').text('You Lose. Try again?')
    $('#score').text('Score: 0')
    enterEndScreen()
}

function hideBanner() {
    $('#endBanner').css('display', 'none')
}

function displayHighScores() {
    $('#highScoresList').html('')
    function compareNumbers(a, b) {
        return b.score - a.score;
    }
    let highScoreArray = JSON.parse(localStorage.getItem('highScores'))
    let sortedScores = highScoreArray.sort(compareNumbers)
    for (entry of sortedScores) { 
        $('#highScoresList').append("<li class='list-group-item'>" +entry.name+ ":  "  + entry.score.toString() + "</li>")      
    }
    
    $('#highScoresModal').modal('show')
}

enterHomeScreen()