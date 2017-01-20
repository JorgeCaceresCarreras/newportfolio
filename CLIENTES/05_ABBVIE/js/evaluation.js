var evaluation = {

    scoreEvaluation:    0,
    scoreToPass:        0,

    saveEvaluation: function(){
        scoreToPass  = scorm.API != null ? scorm.LMSGetValue("cmi.student_data.mastery_score") : parseInt(courseConfig.masteryScore); 
        this.setInteraction("choice");
        this.saveScoreStatus(scoreEvaluation);
    },

    interactionExists: function(param) {
        var b = scorm.LMSGetValue("cmi.interactions._children").toLowerCase().split(",");
        for (var i = 0; i < b.length; i++) {
            if (b[i] == param.toLowerCase()) {
                return (true)
            }
        }
        return (false)
    },

    setInteraction: function(typeInteraction){
        var supportedInteractions = new Array();
        var arrayInteraction = new Array();
        var arrayRespuestas = new Array();
        var jsonData;
        var intento;
        var idInteraction;
        var result;
        var correct_responses;
        var student_response;
        var numInteraction;
        var correctAnswer;

        if(courseConfig.saveInteraction == "true"){
            //Comprobamos si las interacciones que vamos a usar están soportadas
            if(this.interactionExists("id")){
               supportedInteractions.push("id");
            }
            if(this.interactionExists("type")){
                supportedInteractions.push("type");
            }
            if(this.interactionExists("correct_responses")){
                supportedInteractions.push("correct_responses");
            }
            if(this.interactionExists("student_response")){
                supportedInteractions.push("student_response");
            }
            if(this.interactionExists("result")){
                supportedInteractions.push("result");
            }
            numInteraction = scorm.LMSGetValue("cmi.interactions._count");
        }
        

        jsonData = scorm.getSuspendData();
        intento = jsonData.i;
        //Obtenemos las respuestas de la evaluación
        arrayRespuestas = jsonData.q;
        correctAnswer = 0;
       
        intento++;
        for(i=0; i<arrayRespuestas.length; i++){
            correct_responses= arrayRespuestas[i].c.toString();
            student_response= arrayRespuestas[i].a.toString();
            if (arrayRespuestas[i].a == arrayRespuestas[i].c){
                result="correct";
                correctAnswer++;
            }else{
                result="wrong";
            }

            if(courseConfig.saveInteraction == "true"){
                idInteraction ="p_"+arrayRespuestas[i].id+"_intento_"+intento;
                if (supportedInteractions.indexOf("id")!=-1){
                    arrayInteraction.push({"parameter": "cmi.interactions." + numInteraction + ".id", "value": idInteraction});
                }
                if (supportedInteractions.indexOf("type")!=-1){
                    arrayInteraction.push({"parameter":"cmi.interactions." + numInteraction + ".type", "value": typeInteraction});
                }
                if (supportedInteractions.indexOf("correct_responses")!=-1){
                    arrayInteraction.push({"parameter":"cmi.interactions." + numInteraction + ".correct_responses.0.pattern", "value" : correct_responses});
                }
                if (supportedInteractions.indexOf("student_response") && (student_response != "")){ 
                    arrayInteraction.push({"parameter": "cmi.interactions." + numInteraction + ".student_response", "value": student_response});
                }
                if (supportedInteractions.indexOf("result")){ 
                    arrayInteraction.push({"parameter": "cmi.interactions." + numInteraction + ".result", "value": result});
                }
                numInteraction++;
            }
        }

        //Obtenemos el resultado de la evaluación
        scoreEvaluation = Math.round((correctAnswer/arrayRespuestas.length)*100);
       
        //Guardamos las interacciones
        for (var i = 0; i < arrayInteraction.length; i++) {
            e = scorm.LMSSetValue(arrayInteraction[i].parameter,arrayInteraction[i].value);
        }
        scorm.LMSCommit();
        //Incrementamos el numero de intentos
        jsonData.i = intento;
        scorm.setSuspendData(jsonData);
    },

    saveScoreStatus: function (){
        var actualScore = scorm.LMSGetValue("cmi.core.score.raw");
        if(actualScore!=""){
            actualScore = parseInt(actualScore);    
        }else{
            actualScore = 0;
        }
        if (actualScore<=scoreEvaluation){
            scorm.LMSSetValue("cmi.core.score.raw", scoreEvaluation);
            actualScore = scoreEvaluation;
        }
    
        //MIN-MAX Score
        scorm.LMSSetValue("cmi.core.score.min", courseConfig.minScore);
        scorm.LMSSetValue("cmi.core.score.max", courseConfig.maxScore);
        if (actualScore<scoreToPass){
            scorm.LMSSetValue("cmi.core.lesson_status", "failed");
        }else{
            scorm.LMSSetValue("cmi.core.lesson_status", "passed");
        }
        scorm.LMSCommit();
    },

    setAnswerQuestion: function (questionId, studentAnswer, correctsAnswer){
        var jsonData = scorm.getSuspendData();
        jsonData.q.push({"id": questionId, "a": studentAnswer, "c": correctsAnswer});
        scorm.setSuspendData(jsonData);
    },

    clearAnswerQuestion: function(){
        var jsonData = scorm.getSuspendData();
        jsonData.q = [];
        scorm.setSuspendData(jsonData);
    }
}