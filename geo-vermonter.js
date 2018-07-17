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
        
        function addScore() {
            let name = $('#nameInput').val()
            if (localStorage.getItem('highScores')) {
                let highScoreArray = JSON.parse(localStorage.getItem('highScores'))
                highScoreArray.push({"name": name, "score": score})
                localStorage.setItem('highScores', JSON.stringify(highScoreArray))
            } else {
                localStorage.setItem('highScores', '[{"name": ' + name + ', "score": '+score+'}]')
                
            }
            $('#endBanner > h2').html("You Win! High score saved! Play again?")
            displayHighScores()
        }
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