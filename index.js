'use strict';

import * as faceapi from 'face-api.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const button = document.getElementById('button');

const mask1 = new Image();
mask1.setAttribute('crossorigin', '');
mask1.src = 'mask1.png';

function drawImageRot(ctx, img, x, y, width, height, deg) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	// Store the current context state (i.e. rotation, translation etc..)
	ctx.save();

	//Convert degrees to radian
	var rad = (deg * Math.PI) / 180;

	//Set the origin to the center of the image
	ctx.translate(x + width / 2, y + height / 2);

	//Rotate the canvas around the origin
	ctx.rotate(rad);

	//draw the image
	ctx.drawImage(img, (width / 2) * -1, (height / 2) * -1, width, height);

	// Restore canvas state as saved from above
	ctx.restore();
}

video.addEventListener('play', () => {
    const ctx = canvas.getContext('2d');
    
    ctx.font = "30px Arial";
    ctx.fillText("starting face detection... please wait...", 10, 50);

	setInterval(async () => {
        const detection = await faceapi.detectSingleFace(video).withFaceLandmarks();
        if(detection && detection.landmarks) {
            const jawOutline = detection.landmarks.getJawOutline();

            const mask1Width = jawOutline[jawOutline.length - 1]._x - jawOutline[0]._x;
            const mask1Height = jawOutline[Math.round(jawOutline.length / 2)]._y - jawOutline[0]._y;
            const angleDeg =
                (Math.atan2(
                    jawOutline[jawOutline.length - 1]._y - jawOutline[0]._y,
                    jawOutline[jawOutline.length - 1]._x - jawOutline[0]._x
                ) *
                    180) /
                Math.PI;

            drawImageRot(ctx, mask1, jawOutline[0]._x, jawOutline[0]._y, mask1Width, mask1Height, angleDeg);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    }, 100);
});

async function startVideo() {
	await faceapi.nets.ssdMobilenetv1.loadFromUri('weights');
	await faceapi.nets.faceLandmark68Net.loadFromUri('weights');

	if (navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then(function (stream) {
				video.srcObject = stream;
			})
			.catch(function (err0r) {
				console.log('Something went wrong!');
			});
	}
}

button.addEventListener('click', function (event) {
	startVideo();
});
