var evolutiveIndex = -1;
var evolutiveFrags = [];
var huge_file = false;
var huge_files = [];

//Constants
HUGE_FILE_NUM = 100;
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
/*
    //Filter huge_file
    if((frags.length > HUGE_FILE_NUM) && !huge_file) {
        console.log("TESTING HUGE FILTERING");
        dialogHugeFile();
        //activateFilters();
        huge_file = true;
	}
*/
	var count=0

	console.time("processEvolutiveEvents");
    for (var i = frags.length - 1; i >= 18; i--){
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
    }
    console.timeEnd("processEvolutiveEvents");
    console.log(count);

    lines[index] = frags.slice(0);
    originalComparison[index] = frags.slice(0);

    evolutiveFrags[index] = evolutiveFrags[index].reverse();
    evolutiveEvents[index] = evolutiveEvents[index].reverse();

    huge_file = false;
    if(eeIndex) $("#EEmanag").show();
}

function processHugeFile(frags, index){
  if(frags[i][0] != "EndEE"){

      if (!filter(frags[i]) && huge_files) {
          frags.splice(i, 1);
          count++;
      }

  } else
}
var current_huge_file_index = 0;
function checkHugeFile(frags, index){
  if(current_huge_file_index == index){
    console.log("## --- checkHugeFile() | index: " + index + " | i: " + huge_file);
    huge_file = ( (frags.length > HUGE_FILE_NUM) && !huge_file );
    console.log("## --- checkHugeFile() | index: " + index + " | o: " + huge_file);
    return huge_file;
  }else{
    console.log("## --- checkHugeFile() | Timeout | index: " + index);
    return setTimeout(function(){
      checkHugeFile(frags,index);
    },  1000)
    return "timeout";
  }
}

function dialogHugeFile(message, frags, index) {
    if (!$('#hugeFileOutput').is(':visible')) {
        var $dialogContainer = $('#output');
        var $detachedChildren = $dialogContainer.children().detach();
        $('#hugeFileOutput').dialog({
            closeOnEscape: false,
            height:400,
            minHeight:400,
            width: 400,
            minWidth: 400,
            title: message + ' - Huge File Detected!',
            /*
            resize: function() {
               what is this??
                annotsGrid.forEach(function(grid) {
                    grid.resizeCanvas();
                });
            },
            */
            buttons: [
                {
                    text: "Continue",
                    click: function () {
                        $(this).dialog("close");
                        spinnerOn("Processing file");
                        filterHugeFile();
                        processEvolutiveEvents(frags, index);

                        reset = true;
                        map = false;
                        generateAnnotationTab(index);
                        if (parseCount == 0) {
                            redraw();
                            //calculateMatrix(lines[0]);
                            addPrevZoom();
                        }

                        spinnerOff();
                        overlayOff();
                        current_huge_file_index++;
                    },
                    "class": "ui-button-primary"
                }
            ],
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close").hide();
                $detachedChildren.appendTo($dialogContainer);
                updateAnnotsGrids();
            }
        });

    }else{
      //setTimeout(dialogHugeFile(),1000,message, frags, index);
      console.log("## -- ELSE checkHugeFile | message: " + message);
    }
}

function filterHugeFile(){
  /*
    $('#filterLenght').prop('checked', document.getElementById('filterLenght2').checked);
    $('#filterSimilarity').prop('checked', document.getElementById('filterSimilarity2').checked);
    $('#filterIdentity').prop('checked', document.getElementById('filterIdentity2').checked);
    */
    $('#filterLenghtNumber').val($('#filterLenghtNumber2').val());
    $('#filterSimilarityNumber').val($('#filterSimilarityNumber2').val());
    $('#filterIdentityNumber').val($('#filterIdentityNumber2').val());


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
            lines[0] = lines[0].slice(0, 16).concat(evolutiveEvents[0][evolutiveIndex]);
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

function activateFilters(){
	$('#filterLenght').prop('checked', true);
	$('#filterSimilarity').prop('checked', true);
	$('#filterIdentity').prop('checked', true);

	$('#filterLenghtNumber').val(1000);
	$('#filterSimilarityNumber').val(50);
	$('#filterIdentityNumber').val(50);
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
            lines[0] = lines[0].slice(0, 16).concat(evolutiveEvents[0][evolutiveIndex]);
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
