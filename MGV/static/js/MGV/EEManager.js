var evolutiveIndex = -1;
var evolutiveFrags = [];

/**
 * Store evolutionary events information in a data estructure
 * @param  {String} frags File content
 * @param  {Integer} index Number of file
 */
function processEvolutiveEvents(frags, index){
    //console.log("Frags: "+frags);
    //console.log("Index: "+index);
    var eeIndex = 0;
    lines[index] = [];
    originalComparison[index] = [];
    evolutiveFrags[index] = [];
    evolutiveFrags[index][eeIndex] = [];
    evolutiveEvents[index] = [];

    console.time("processEvolutiveEvents");
    // ParseFileColumns?
    /*
    let header = frags.splice(0,fragsStarts);

    let filter_results = frags.reduce((output, frag) => {
        if(frag[0] == "StartEE") output[0].push(frag); // [0] StartEE
        else if (frag[0] == "EndEE") output[1].push(frag); // [1] EndEE
        output[2].push(parseLine2(frag)); // [2] Parsed frags
        return output;
    }, [[], [], []]);
    frags = header.concat(filter_results[2]);
    test_ee = filter_results;
    
*/
    for (var i = frags.length - 1; i >= fragsStarts; i--){
        if (frags[i][0] == "EndEE"){
            i--;
            evolutiveEvents[index][eeIndex] = [];
            evolutiveFrags[index][eeIndex] = [];
            while (frags[i][0] != "StartEE"){
                if ((frags[i][0] == "PrevFrag") || frags[i][0] == "NextFrag"){
                    evolutiveFrags[index][eeIndex].push(frags[i]);
                } else {
                    evolutiveEvents[index][eeIndex].push(frags[i]);
                }
                i--;
            }
            eeIndex++;
        }
        parseLine(frags[i]);
    }
    console.timeEnd("processEvolutiveEvents");
    lines[index] = frags.slice(0);

    originalComparison[index] = frags.slice(0);

    evolutiveFrags[index] = evolutiveFrags[index].reverse();
    evolutiveEvents[index] = evolutiveEvents[index].reverse();
    if(eeIndex) $("#EEmanag").show();
}

/**
 * Load the next Evolutionary event
 */
function nextEE (){
    if(evolutiveIndex < evolutiveEvents[0].length-1) {
        evolutiveIndex++;
        $("#EEindex").html(evolutiveIndex);
        console.log("EE: "+evolutiveIndex);

        var auxPrevArray = [];
        var auxNextArray = [];

        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        //drawHorizontalLinesInHorizontalLayer(auxPrevArray, document.getElementById("hSel0"), 0, rgb(255, 0, 0));
        drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines[0] = lines[0].slice(0, fragsStarts).concat(evolutiveEvents[0][evolutiveIndex]);
            redraw();
            drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            redraw();
            drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgba(R[0], G[0], B[0], 0.7));
        },3000);

    }
}

/**
 * Load the previous evolutionary event
 */
function prevEE (){
    console.log("EEi: "+evolutiveIndex);
    if(evolutiveIndex>0) {

       var auxPrevArray = [];
       var auxNextArray = [];

        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines[0] = lines[0].slice(0, fragsStarts).concat(evolutiveEvents[0][evolutiveIndex]);
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgba(R[0], G[0], B[0], 0.7));
        },3000);

       evolutiveIndex--;
        $("#EEindex").html(evolutiveIndex);


    } else if (evolutiveIndex == 0) {

        var auxPrevArray = [];
        var auxNextArray = [];
        $("#EEindex").html("-");
        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines [0] = originalComparison[0];
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines [0] = originalComparison[0];
            redraw();
            evolutiveIndex--;
       },3000);

    }
}

// Others...

function EEPromise(frags){
    let header = frags.splice(0,fragsStarts);
    console.log("EE Promise Start");

    let ee_results = [[], [], []]
    let ee_promise = new Promise( function(resolve, reject){
        ee_results = frags.reduce((output, frag) => {
            if(frag[0] == "StartEE") output[0].push(frag); // [0] StartEE
            else if (frag[0] == "EndEE") output[1].push(frag); // [1] EndEE
            output[2].push(parseLine2(frag)); // [2] Parsed frags
            return output;
        }, [[], [], []]);

        resolve(header, ee_results);
    });

    ee_promise.then(function (header, output){
        frags = header.concat(output[2]);
    })
    
    frags = header.concat(output[2]);
}

function activateFilters(){
	$('#filterLenght').prop('checked', true);
	$('#filterSimilarity').prop('checked', true);
	$('#filterIdentity').prop('checked', true);

	$('#filterLenghtNumber').val(1000);
	$('#filterSimilarityNumber').val(50);
	$('#filterIdentityNumber').val(50);
}