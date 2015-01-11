var context;
var source = new Array();
var sounds = new Array();
var timeWorker = null; //handle intervals in metronomeworker file
var scheduleAheadTime = 0.1;
var nextNoteTime = 0.0;
var playing = false;

var current16thNote = 0; 
var bar = 0;
var phrase = 0;

var swingAmonut = Number(document.getElementById('swing').value);
var swingTime = 0;
var gainNode = null;

var bpm = Number(document.getElementById('bpm').value);
document.getElementById('bpm-display').innerHTML = '<strong>' + bpm + '</strong> bpm';

var volume = Number(document.getElementById('volume').value);
document.getElementById('vol-display').innerHTML = '<strong>' + volume + '</strong> %';


// important - when adding sounds, remember to change sampleAmount(samples per drumset)
if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){ // mp3 or wav drumset, depends on browser
	sounds = ['sounds/mp3/kick1.mp3', 'sounds/mp3/kick1.mp3','sounds/mp3/snare1.mp3','sounds/mp3/snare2.mp3','sounds/mp3/hihat1.mp3', 'sounds/mp3/hihat2.mp3', 'sounds/mp3/hihat3.mp3', 'sounds/mp3/hihat4.mp3', 'sounds/mp3/tom1.mp3', 'sounds/mp3/tom2.mp3', 'sounds/mp3/crash.mp3'];
	/*sounds.push('sounds/mp3/2.mp3', 'sounds/mp3/1.mp3','sounds/mp3/2.mp3'); // another sets, push is here just for better view i future
	sounds.push('sounds/mp3/1.mp3', 'sounds/mp3/2.mp3','sounds/mp3/hihat.mp3');*/
}else{
	sounds = ['sounds/wav/kick1.wav', 'sounds/wav/kick1.wav','sounds/wav/snare1.wav','sounds/wav/snare2.wav','sounds/wav/hihat1.wav', 'sounds/wav/hihat2.wav', 'sounds/wav/hihat3.wav', 'sounds/wav/hihat4.wav', 'sounds/wav/tom1.wav', 'sounds/wav/tom2.wav', 'sounds/wav/crash.wav'];
	//sounds.push('sounds/wav/hihat.wav', 'sounds/wav/hihat.wav','sounds/wav/hihat.wav');
	//sounds.push('sounds/wav/2.wav', 'sounds/wav/2.wav','sounds/wav/2.wav');
}
var drumset = 0; // active drumset
var sampleAmount = 11; // samples per drumset
var bufferList = new Array();

window.addEventListener('load', init, false);
function init(){
	try{
		if(!context){
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			context = new AudioContext();
		}
	}
	catch(e){
		loaderFadeOut();	
		alertSlideDown();
	}

	if(!context.createGain)
		context.createGain = context.createGainNode;
	gainNode = context.createGain();
	gainNode.connect(context.destination);


	bufferLoader = new BufferLoader(context, sounds, window.finishedLoading);
	bufferLoader.load();
}

function finishedLoading(){
	bufferList = bufferLoader.bufferList.slice(drumset*sampleAmount, sampleAmount);
	//console.log('Sounds loaded');
	loaderFadeOut();


	var blobURL = window.URL.createObjectURL( new Blob([ '(',

				function(){
				    var timerID = null;
					var interval = 25;
				
					self.onmessage = function(e){
					if(e.data == 'start'){
						timerID = setInterval(function(){
							this.postMessage('tick');
				
						},interval);
					}else if(e.data == 'stop'){
						clearInterval(timerID);
						timerID = null;
					}
				}
				}.toString(),

	')()' ], { type: 'application/javascript' } ) ); //end blob url

	timeWorker = new Worker(blobURL);

	timeWorker.onmessage = function(e){
		if(e.data == 'tick'){
			scheduler();	
		}	
	}
}
function scheduler(){
	while(nextNoteTime < context.currentTime + scheduleAheadTime){
		scheduleNote(current16thNote, nextNoteTime, swingTime);
		nextNote();
	}
}
function nextNote(){
	var secondsPerBeat = 60/bpm;

	current16thNote++;

	if(current16thNote == 16){
		current16thNote = 0;
		bar++;
		if(bar == 16){
			bar = 0;
			phrase++;
		}
	}
	nextNoteTime += 0.25 * secondsPerBeat;
	if(current16thNote%2){
		swingTime = swingAmonut*(0.25*secondsPerBeat);		
	}else{
		swingTime = 0;
	}

}
function scheduleNote(beatNumber, time, swing){
	var sample = new Array();

	switch(drumset){
		case 0:

			/*regular bar*/
			//kick
			if(!(beatNumber%8)) playSound(sample[0], bufferList[0], time, swing);	
			//hihat on one	
			if(!beatNumber && !(bar%2)) playSound(sample[6], bufferList[6], time, swing);
			//hihat on 2,3,4
			if(beatNumber && !(beatNumber%4)) playSound(sample[5], bufferList[5], time, swing);
			//hihat	regular
			if(!(beatNumber%2)) playSound(sample[4], bufferList[4], time, swing);	 		
			//snare
			if(beatNumber == 4 || beatNumber == 12)	playSound(sample[2], bufferList[2], time, swing);

			/* kick variations */
			//kick
			if(beatNumber == 14 && bar%4 == 1) playSound(sample[0], bufferList[0], time, swing);
			if(beatNumber == 2 && bar%8 == 7) playSound(sample[0], bufferList[0], time, swing);

			/*crash*/
			if(phrase != 0){
				if(beatNumber == 0 && bar == 0) playSound(sample[10], bufferList[10], time, swing);
			}

			/*3 and 7 bar variations*/
			//snare2
			if(beatNumber == 9 && bar%8 == 3)	playSound(sample[3], bufferList[3], time, swing);
			//open hihat
			if(beatNumber == 14 && bar%8 == 3) playSound(sample[7], bufferList[7], time, swing);

			/*8 bar variations */
			//snare2
			if(bar == 7){
				//snare2
				if(beatNumber == 9)	playSound(sample[3], bufferList[3], time, swing);
				//toms
				if(beatNumber == 10) playSound(sample[8], bufferList[8], time, swing);
				if(beatNumber == 11 || beatNumber == 15) playSound(sample[9], bufferList[9], time, swing);
			}

			/*16 bar variations*/
			if(bar == 15){
				//snare2
				if(beatNumber == 9)	playSound(sample[3], bufferList[3], time, swing);
				//snare
				if(beatNumber == 7) playSound(sample[2], bufferList[2], time, swing);
				//toms
				if(beatNumber == 14) playSound(sample[8], bufferList[8], time, swing);
				if(beatNumber == 15) playSound(sample[9], bufferList[9], time, swing);
			}

			break;
		case 1:

			if(beatNumber%4 == 0){		
				playSound(sample[0], bufferList[0], time, swing);		
			}
			if(beatNumber == 4 || beatNumber == 12){
				playSound(sample[1], bufferList[1], time, swing);	
			}
			if(beatNumber%2 == 0){
				playSound(sample[2], bufferList[2], time, swing);	
			}
	
			break;
		case 2:
			if(beatNumber%4 == 0){		
				playSound(sample[0], bufferList[0], time, swing);		
			}
			if(beatNumber == 4 || beatNumber == 12){
				playSound(sample[1], bufferList[1], time, swing);	
			}
			if(beatNumber%2 == 0){
				playSound(sample[2], bufferList[2], time, swing);	
			}

		break;
		default:
		alert('Something gone wrong. Please refresh Your browser.');
	}


}
 
/*var soundChanger = document.getElementById('change-drumset');
soundChanger.addEventListener('click', changeSounds, false);*/

function changeSounds(event){

	drumset = Number(event.target.dataset.set);
	bufferList = bufferLoader.bufferList.slice(drumset*sampleAmount, drumset*sampleAmount + sampleAmount);

};

document.getElementById('container').addEventListener('input', function(e){
	if(e.target.id == 'bpm') changeTempo(e.target);
	else if(e.target.id == 'swing') changeSwing(e.target);
	else if(e.target.id == 'volume') changeVolume(e.target);
},false);

function changeTempo(element){
	bpm = element.value;
	document.getElementById('bpm-display').innerHTML = '<strong>' + bpm + '</strong> bpm';
}
function changeSwing(element){

	swingAmonut = Number(element.value) / 100;
}
function changeVolume(element){
	volume = Math.pow(Number(element.value) / 100, 2);
	gainNode.gain.value = volume;
	document.getElementById('vol-display').innerHTML = '<strong>' + element.value + '</strong> %';
}

function togglePlay(){
	playing = !playing;

	if(playing){
		current16thNote = 0;
		bar = 0;
		phrase = 0;
		nextNoteTime = context.currentTime;
		timeWorker.postMessage('start');
		return 'Stop';
	}else{
		timeWorker.postMessage('stop');
		return 'Play';
	}

}

function playSound(node, buffer, time, swing){
	node = context.createBufferSource();
	node.buffer = buffer;
	node.connect(gainNode);
	
	node.start(time + swing);
}

function loaderFadeOut(){
	var loader = document.getElementById('load');
	loader.style.opacity = 1;
	var interval = window.setInterval(function(){
		if(loader.style.opacity <= 0){			
			window.clearInterval(interval);
			loader.style.display = 'none';
			loader.style.removeProperty('opacity');
		}
		loader.style.opacity = parseFloat(loader.style.opacity) - 0.05;
	}, 20);
}

function alertSlideDown(){
	var container = document.getElementById('container');
	container.style.display = 'none';
	
	var alert = document.createElement('div');
	alert.setAttribute('id', 'alert');
	alert.innerHTML = 'Your browser doesn\'t support <strong>Web Audio API</strong>.<br> Please install one of the following:<br> <a href="https://www.google.pl/chrome/browser" target="_blank">Google Chrome</a> <br> <a href="https://www.mozilla.org/pl/firefox/new/" target="_blank">Mozilla Firefox</a> <br> <a href="http://www.opera.com/" target="_blank">Opera</a>';
	var height = alert.style.height = 0;

	var parent = document.createElement('div');
	parent.style.height = '183px';
	parent.appendChild(alert);	
	
	var container = document.getElementById('container');	
	var container = document.getElementById('container');

	document.body.insertBefore(parent, container);

	var interval = window.setInterval(function(){
		if(height >= 183){
			window.clearInterval(interval);
		}
		height += 15;
		alert.style.height = height + 'px';
	},20)

}

/*buffer loader class*/
function BufferLoader(context, urlList, callback){
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = new Array();
	this.loadCount = 0
}
BufferLoader.prototype.loadBuffer = function(url, index){
	//load buffer
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	var loader = this;

	request.onload = function(){
		
			loader.context.decodeAudioData(request.response, function(buffer){
				if(!buffer){
					alert('error decoding file data: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if(++loader.loadCount == loader.urlList.length){
					loader.onload(loader.bufferList);
				}
			}, function(error){
				console.error('decodeAudioData error', error);
			});
		
	}
	request.onerror = function(){
		alert('BufferLoader: XHR error');
	}
	request.send();
}

BufferLoader.prototype.load = function(){
	
	for(var i = 0; i < this.urlList.length; ++i){
		this.loadBuffer(this.urlList[i], i);
			
	}

}
