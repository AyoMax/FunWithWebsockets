module.exports = class Santa {
  constructor({latitude, longitude}) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  getPosition(){
  	return pointAtDistance({latitude:this.latitude,longitude:this.longitude},Math.random()*1000000);
  }
}



const EARTH_RADIUS = 6371000; /* meters  */ 
const DEG_TO_RAD =  Math.PI / 180.0; 
const THREE_PI = Math.PI*3; 
const TWO_PI = Math.PI*2;  

function isFloat(n) {   
	return !isNaN(parseFloat(n)) && isFinite(n); 
} 

function recursiveConvert(input, callback){
	if (input instanceof Array) { 		
		return input.map((el) => recursiveConvert(el, callback)); 	
	} 	
	if  (input instanceof Object) { 		
		input = JSON.parse(JSON.stringify(input)); 		
		for (let key in input) { 			
			if( input.hasOwnProperty(key) ) { 				
				input[key] = recursiveConvert(input[key], callback);
			} 		
		} 		
		return input; 	
	} 	
	if (isFloat(input)) { 
		return callback(input); 
	} 
} 

function toRadians(input){ 	
	return recursiveConvert(input, (val) => val * DEG_TO_RAD); 
} 

function toDegrees(input){ 	
	return recursiveConvert(input, (val) => val / DEG_TO_RAD); 
}  

/* 
	coords is an object: {latitude: y, longitude: x} 
	toRadians() and toDegrees() convert all values of the object 
*/
function pointAtDistance(inputCoords, distance) {
    const result = {};
    const coords = toRadians(inputCoords);
    const sinLat =  Math.sin(coords.latitude);
    const cosLat =  Math.cos(coords.latitude);

    /* go a fixed distance in a random direction*/
    const bearing = Math.random() * TWO_PI;
    const theta = distance/EARTH_RADIUS;
    const sinBearing = Math.sin(bearing);
    const cosBearing =  Math.cos(bearing);
    const sinTheta = Math.sin(theta);
    const cosTheta =    Math.cos(theta);

    result.latitude = Math.asin(sinLat*cosTheta+cosLat*sinTheta*cosBearing);
    result.longitude = coords.longitude + Math.atan2( sinBearing*sinTheta*cosLat, cosTheta-sinLat*Math.sin(result.latitude ) );
    /* normalize -PI -> +PI radians (-180 - 180 deg)*/
    result.longitude = ((result.longitude+THREE_PI)%TWO_PI)-Math.PI;

    return toDegrees(result);
}

function pointInCircle(coord, distance) {
    const rnd =  Math.random();
    /*use square root of random number to avoid high density at the center*/
    const randomDist = Math.sqrt(rnd) * distance;
    return pointAtDistance(coord, randomDist);
}

/* haversine*/
function distanceBetween (start, end) {
	const startPoint = toRadians(start);
	const endPoint = toRadians(end);

	const delta = {
		latitude:  Math.sin((endPoint.latitude -startPoint.latitude)/2),
		longitude: Math.sin((endPoint.longitude -startPoint.longitude)/2)
	}

	const A = delta.latitude * delta.latitude  +  delta.longitude *  delta.longitude * Math.cos(startPoint.latitude) * Math.cos(endPoint.latitude);
 
	return EARTH_RADIUS*2 * Math.atan2(Math.sqrt(A), Math.sqrt(1-A));
 
}
