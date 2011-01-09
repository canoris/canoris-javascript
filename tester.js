/**
 * @author ciskavriezenga
 */
$(function(){
    var canoris = new Canoris("4d1f5dec394b4d148655b14fee3ad5b2", false, "ALL");

    var testTxt = "inside callback method TESTER\n";
    var myProps = false;
    var myCallback = function(data){
            var txt = testTxt ;
            console.debug(txt);
            console.debug(data);
            myProps = data;
        };

    canoris.getFilesPager("myFilePager", 1, myCallback);
    canoris.getCollectionsPager("myColPager", 1);
    canoris.getCollectionFilesPager("825daa22b4d04a649e5b2ba5294b2583","mycolFilePager", 1);

    //canoris.getCollectionsPager("0", canoris.savePager("myColPager"));
    canoris.getCollection("825daa22b4d04a649e5b2ba5294b2583", "test");
    //canoris.text2phonemes("Hola que tal");

    //canoris.getFile("8c9d88873c9b4e10b595dbf142306584", "test", myCallback);

    setTimeout(function(){
         //console.debug(canoris.collections.test);
    //canoris.collections.test.getSimilar("8c9d88873c9b4e10b595dbf142306584", "music", false, myCallback);
        // console.debug(myProps);
         //console.debug(canoris.pagers.myFilePager);
         //console.debug(canoris.pagers.myFilePager.getTotal());
        //canoris.pagers.myFilePager.next(myCallback);
        //canoris.pagers.myFilePager.update();
        //canoris.pagers.myFilePager.getItem("doesNotExists");

         //canoris.pagers.myFilePager.previous(myCallback);
         //canoris.pagers.myFilePager.update();
        //console.debug(canoris.files.test);

        //console.debug(canoris.pagers.myFilePager);
        //console.debug(canoris.pagers.myColPager);
        //canoris.files.test.update();
        //canoris.collections.test.update();

        //setTimeout(function(){
            //console.debug(canoris.pagers.myFilePager.properties.next);
        //    canoris.pagers.myFilePager.previous(myCallback);

            //console.debug(canoris.pagers.myFilePager);
            //canoris.pagers.myFilePager.next(myCallback);
            //setTimeout(function(){ console.debug(canoris.pagers.myFilePager);}, 2500);
        //    console.debug(canoris.pagers.myFilePager.properties.next);
        //    setTimeout(function(){
        //        console.debug(canoris.pagers.myFilePager.properties.next);
        //        canoris.pagers.myFilePager.previous(myCallback);
        //        }, 2500);
        //        console.debug(canoris.files.test);
        //}, 2500);
        //canoris.collections.test.getFiles(0);

        //canoris.collections.test.getSimilar("8c9d88873c9b4e10b595dbf142306584", "music", 5);
        //canoris.files.test.getConversions(myCallback);
        //canoris.files.test.getVisualisations(myCallback);
        //console.debug(canoris.files.test.getConversionUrl());
        //console.debug(canoris.files.test.getFileUrl());

        //console.debug(canoris.files.test.getVisualisationUrl("spectrum"));
        //console.debug(canoris.files.test.getVisualisationUrl("spectrum"));
        //$("#add").html($('<img src="'+canoris.files.test.getVisualisationUrl("waveform")+'"></img>'));
        //$("#add").html($('<img src="'+canoris.files.test.getVisualisationUrl("spectrum")+'"></img>'));
    }, 5000);
});
