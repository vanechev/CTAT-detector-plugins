//detector template

//add output variable name below
var variableName = "critical_struggle"

//initializations (do not touch)
var detector_output = {name: variableName,
						category: "Dashboard", 
						value: "0, none",
						history: "",
						skill_names: "",
						step_id: "",
						transaction_id: "",
						time: ""
						};
var mailer;

//declare any custom global variables that will be initialized 
//based on "remembered" values across problem boundaries, here
// (initialize these at the bottom of this file, inside of self.onmessage)
var attemptWindow;
var skillLevelsAttempts;

//declare and/or initialize any other custom global variables for this detector here...
var stepCounter = {};
var help_model_output;
var help_variables = {"lastAction": "null",
					  "lastActionTime": "",
					  "seenAllHints": {},
					  "lastHintLength": "",
					  "lastSenseOfWhatToDo": false
					 };
var timerId; var timerId2; var timerId3; var timerId4; var timerId5;
//
//[optional] single out TUNABLE PARAMETERS below
var windowSize = 7;
var threshold = 1;
var wheelSpinningAttemptThreshold = 10; //following Beck and Gong's wheel-spinning work
var errorThreshold = 2; //currently arbitrary
var newStepThreshold = 1; //currently arbitrary
var familiarityThreshold = 0.4;
var senseOfWhatToDoThreshold = 0.6;
var hintIsHelpfulPlaceholder = true; //currently a dummy value (assumption that hint is always helpful...)


//
//###############################
//#####     Help model     ######
//###############################
//###############################
//

//non-controversial
function lastActionIsHint(e){
	if (help_variables.lastAction == "hint"){return true;}
	else{return false;}
}
function lastActionIsError(e){
	if (help_variables.lastAction == "error"){return true;}
	else{return false;}
}
function seenAllHintLevels(e){
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		if (e.data.tutor_data.selection in help_variables.seenAllHints){
			return help_variables.seenAllHints[e.data.tutor_data.selection];
		}
		else{return false;}
	}
	else{
		if (e.data.tool_data.selection in help_variables.seenAllHints){
			return help_variables.seenAllHints[e.data.tool_data.selection];
		}
		else{return false;}
	}
}
function isCorrect(e){
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "correct"){return true;}
	else{return false;}
}

function secondsSinceLastAction(e){
	var currTime = new Date();
	diff = currTime.getTime() - help_variables.lastActionTime.getTime();
	console.log("time elapsed: ", diff/1000)
	return (diff / 1000);
}

//less controversial
function isDeliberate(e){
	var hintThreshold = (help_variables.lastHintLength/600)*60;

	if (lastActionIsError(e)){
		return (secondsSinceLastAction(e) > errorThreshold);
	}
	else if (lastActionIsHint(e)){
		return (secondsSinceLastAction(e) > hintThreshold);
	}
	else{
		return (secondsSinceLastAction(e) > newStepThreshold);
	}
}

//more controversial...
function isFamiliar(e){
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)<=familiarityThreshold){
	        	return false;
	        }
	    }
	}
	return true;
}

function isLowSkillStep_All(e){
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)>=familiarityThreshold){
	        	return false;
	        }
	    }
	}
	return true;
}

function isLowSkillStep_Some(e){
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)<=familiarityThreshold){
	        	return true;
	        }
	    }
	}
	return false;
}

function hintIsHelpful(e){
	return hintIsHelpfulPlaceholder;
}
function lastActionUnclearFix(e){
	if (help_variables.lastSenseOfWhatToDo == false){return true;}
	else{return false;}
}
function senseOfWhatToDo(e){
	var sel = e.data.tutor_data.selection;
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)<=senseOfWhatToDoThreshold){
	        	return false;
	        }
	    }
	}
	return true;
}

//evaluation of each step
function evaluateAction(e){
	var sel = e.data.tutor_data.selection;
	var outcome = e.data.tutor_data.action_evaluation.toLowerCase();

	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		console.log("isHint")
		if (isDeliberate(e)){
			console.log("isDeliberate")
			if (!seenAllHintLevels(e) &&
				(!isFamiliar(e) 
				|| (lastActionIsError(e) && lastActionUnclearFix(e)) 
				|| (lastActionIsHint(e) && !hintIsHelpful(e))) ){
				return "preferred/ask hint";
			}
			else if ( (isFamiliar(e) && !senseOfWhatToDo(e) ) 
					|| (lastActionIsHint(e)) ){
				return "acceptable/ask hint";
			}
			else{
				return "not acceptable/hint abuse";
			}
			
		}
		else{
		console.log("not deliberate")
			return "not acceptable/hint abuse";
		}

	}
	else{
		if (isDeliberate(e)){
			if ( (isFamiliar(e) && (!(lastActionIsError(e) && lastActionUnclearFix(e))) )
				|| (lastActionIsHint(e) && hintIsHelpful(e))
				 ){
				return "preferred/try step";
			}
			else if (seenAllHintLevels(e) && 
				     (!(lastActionIsError(e) && lastActionUnclearFix(e))) ){
				return "preferred/try step";
			}
			else if (isCorrect(e)){
				return "acceptable/try step";
			}
			else if (seenAllHintLevels(e)){
				if (lastActionIsError(e) && lastActionUnclearFix(e)){
					return "ask teacher for help/try step";
				}
			}
			else{
				return "not acceptable/hint avoidance";
			}
		}
		else{
			return "not acceptable/not deliberate";
		}
	}

}

function updateHistory(e){
	help_variables.lastActionTime = new Date();
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		help_variables.lastAction = "hint";
		help_variables.lastHintLength = e.data.tutor_data.tutor_advice.split(' ').length;
		if (help_variables.seenAllHints[e.data.tutor_data.selection] != true){
			help_variables.seenAllHints[e.data.tutor_data.selection] = (e.data.tutor_data.current_hint_number == e.data.tutor_data.total_hints_available);
		}
	}
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "incorrect"){
		help_variables.lastAction = "error";
	}
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "correct"){
		help_variables.lastAction = "correct";
	}

	help_variables.lastSenseOfWhatToDo = senseOfWhatToDo(e);

}


//
//###############################
//###############################
//###############################
//###############################
//

function updateSkillLevelsAttempts(e, rawSkills, currStepCount){
	for (var skill in rawSkills) {

		if( rawSkills[skill].name in skillLevelsAttempts ){
			if(currStepCount==1){
				skillLevelsAttempts[rawSkills[skill].name][0] += 1;
			}
			skillLevelsAttempts[rawSkills[skill].name][1] = parseFloat(rawSkills[skill].pKnown);
		}
		else{
			skillLevelsAttempts[rawSkills[skill].name] = [1, parseFloat(rawSkills[skill].pKnown)];
		}
	}
}

function detect_wheel_spinning(e, rawSkills, currStepCount){
	
	updateSkillLevelsAttempts(e, rawSkills, currStepCount);

	for (var skill in skillLevelsAttempts) {
		if ((skillLevelsAttempts[skill][0] >= 10) && (skillLevelsAttempts[skill][1] < 0.95)){
			return true;
		}
	}
	return false;

}


//
//###############################
//###############################
//###############################
//###############################
//



function receive_transaction( e ){
	//e is the data of the transaction from mailer from transaction assembler

	//set conditions under which transaction should be processed 
	//(i.e., to update internal state and history, without 
	//necessarily updating external state and history)
	if(e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable"){
		//do not touch
		rawSkills = e.data.tutor_data.skills
		var currSkills = []
		for (var property in rawSkills) {
		    if (rawSkills.hasOwnProperty(property)) {
		        currSkills.push(rawSkills[property].name + "/" + rawSkills[property].category)
		    }
		}
		detector_output.skill_names = currSkills;
		detector_output.step_id = e.data.tutor_data.step_id;

		//custom processing (insert code here)

		if (help_variables.lastAction!="null"){
			help_model_output = evaluateAction(e);
		}
		else{
			help_model_output = "preferred"; //first action in whole tutor is set to "preferred" by default
		}

		//keep track of num attempts on each step
		currStep = e.data.tool_data.selection;
		if(currStep in stepCounter){
			stepCounter[currStep] += 1;
		}
		else{
			stepCounter[currStep] = 1;
		}


		var isWheelSpinning = detect_wheel_spinning(e, rawSkills, stepCounter[currStep]);

		attemptWindow.shift();
		attemptWindow.push( (help_model_output == "ask teacher for help/try step" || isWheelSpinning) ? 1 : 0 );
		var sumAskTeacherForHelp = attemptWindow.reduce(function(pv, cv) { return pv + cv; }, 0);
		console.log(attemptWindow);
		console.log(help_model_output);
		console.log(isWheelSpinning);
		console.log(skillLevelsAttempts);

		updateHistory(e);

	}

	//set conditions under which detector should update
	//external state and history
	if(e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable"){
		detector_output.time = new Date();
		detector_output.transaction_id = e.data.transaction_id;

		//custom processing (insert code here)
		if (detector_output.value=="0, > 0 s" && (sumAskTeacherForHelp >= threshold)){
			detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
			detector_output.value = "1, > 25 s"
			detector_output.time = new Date();

			timerId = setTimeout(function() { 
		      detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
		      detector_output.value = "1, > 45 s"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      20000)
		    timerId2 = setTimeout(function() { 
		      detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
		      detector_output.value = "1, > 1 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      35000)
		    timerId3 = setTimeout(function() { 
		      detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
		      detector_output.value = "1, > 2 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      95000)
		    timerId4 = setTimeout(function() { 
		      detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
		      detector_output.value = "1, > 5 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      275000)

		}
		else if (detector_output.value!="0, > 0 s" && (sumAskTeacherForHelp >= threshold)){
			detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
			detector_output.time = new Date();
		}
		else{
			detector_output.value = "0, > 0 s";
			detector_output.history = JSON.stringify([attemptWindow, skillLevelsAttempts]);
			detector_output.time = new Date();

			clearTimeout(timerId);
			clearTimeout(timerId2);
			clearTimeout(timerId3);
			clearTimeout(timerId4);
		}


		mailer.postMessage(detector_output);
		postMessage(detector_output);
		console.log("output_data = ", detector_output);
	}
}


self.onmessage = function ( e ) {
    console.log(variableName, " self.onmessage:", e, e.data, (e.data?e.data.commmand:null), (e.data?e.data.transaction:null), e.ports);
    switch( e.data.command )
    {
    case "connectMailer":
		mailer = e.ports[0];
		mailer.onmessage = receive_transaction;
	break;
	case "initialize":
		for (initItem in e.data.initializer){
			if (e.data.initializer[initItem].name == variableName){
				detector_output.history = e.data.initializer[initItem].history;
				detector_output.value = e.data.initializer[initItem].value;
			}
		}

		//optional: In "detectorForget", specify conditions under which a detector
		//should NOT remember their most recent value and history (using the variable "detectorForget"). 
		//(e.g., setting the condition to "true" will mean that the detector 
		// will always be reset between problems... and setting the condition to "false"
		// means that the detector will never be reset between problems)
		//
		detectorForget = false;
		//
		//

		if (detectorForget){
			detector_output.history = "";
			detector_output.value = 0;
		}


		//optional: If any global variables are based on remembered values across problem boundaries,
		// these initializations should be written here
		//
		//
		if (detector_output.history == "" || detector_output.history == null){
			//in the event that the detector history is empty,
			//initialize variables to your desired 'default' values
			//
			attemptWindow = Array.apply(null, Array(windowSize)).map(Number.prototype.valueOf,0);
			skillLevelsAttempts = {};
		}
		else{
			//if the detector history is not empty, you can access it via:
			//     JSON.parse(detector_output.history);
			//...and initialize your variables to your desired values, based on 
			//this history
			//
			var all_history = JSON.parse(detector_output.history);
			attemptWindow = all_history[0];
			skillLevelsAttempts = all_history[1];
		}
		
	break;
    default:
	break;

    }

}