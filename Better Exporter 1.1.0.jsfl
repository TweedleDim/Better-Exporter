//-----------------------------------------------------------------------
//BETTER EXPORTER V 1.1.0 Dimitri Lecoussis 2023 CC BY
//-----------------------------------------------------------------------
// Script to generate .swf files layer by layer for Adobe Animate
// Prefixes for naming layers
  // S_layerName - to ask the exporter to enter the Symbol contained in the layer.
  // Only one symbol per layer.
  // M_folderToMerge - to ask the exporter to Merge the layers in the folder.
  // Do not put a folder inside a folder to be merged.
  // Do not have a layer tagged S_ inside the folder to be merged.
// Guide layers are not exported.
// But guided and masked layers will be exported as expected.
// You must be in the main timeline to launch the script.

//-----------------------------------------------------------------------
//DEBUG
fl.outputPanel.clear();

//VARIABLES
var doc = fl.getDocumentDOM();
var tl = doc.getTimeline();
// can be customized, but must contain only two characters that
// are not likely to be used in the naming of other layers
var tag1 = "S_";
var tag2 = "M_"

//Crée le dossier où seront exportés les .swf
var fullPath = doc.path;
var folderPath =  fullPath.substring(0, (doc.path.length - doc.name.length)) + getFlaName();
exportFolder = FLfile.platformPathToURI(folderPath)
FLfile.createFolder(exportFolder);

//Récupère le nom du fichier .fla et supprime ".fla"
function getFlaName(){
  var fileName = doc.name;
  var len = fileName.length;
  cutIndex = len;
  //cherche l'index du dernier "."
  for (var i = (len); i > 1; i--){
    if (fileName.charAt(i) == "."){
      cutIndex = i;
      break;
    }
  }
  var cutFileName = fileName.substring(0,cutIndex);
  return cutFileName
}

//Enregistre le type précis de chaque calque
//le layerType peut être normal, guide, guided, mask, masked ou folder
function typeofLayers(layersArray){
  var indexAndTypeOfLayers = [];
  for(var i = 0; i<layersArray.length; i++){
    indexAndTypeOfLayers.push(layersArray[i].layerType);
  }
  return indexAndTypeOfLayers
}

//Enregistre le préfix et l'index des calques préfixés, S_ ou M_
//--> renvoie un array de dictionnaire
function prefixedLayers(layersArray, tag){
  var indexAndPrefixOfLayers = [];
  for(var i = 0; i<layersArray.length; i++){
    var layerName = layersArray[i].name;
    if (layerName.slice(0,2) == tag){
      var dict = {
        index:i,
        prefix: layerName.slice(0,2)
      };
      indexAndPrefixOfLayers.push(dict);
    }
  }
  return indexAndPrefixOfLayers
}

//Check si le nom du calque contient un préfixe, si oui le renvoie
function whichPrefix(layer){
  var layerName = layer.name;
  if (layerName.slice(0,2) == tag1 || layerName.slice(0,2) == tag2){
    var prefixToReturn = layerName.slice(0,2);
    return prefixToReturn
  }
}

//Itère les calques passés en argument et les passe en guide
//exemple de l'arg : layersArray = fl.getDocumentDOM().getTimeline().layers;
function setAllLayersInGuide(layersArray){
  //mets tous les calques en guide
  for(var i = 0; i < layersArray.length; i++){
    //important d'exclure les dossiers
    if(layersArray[i].layerType == "folder"){
      continue;
    }else{
      layersArray[i].layerType = "guide";
    }
  }
}


//Itère les calques passés en argument et les repasse dans leur type d'origine
//exemple de l'arg : layersArray = fl.getDocumentDOM().getTimeline().layers;
function setLayersToOriginalType(layersArray, originalTypeArray){
  //mets tous les calques en guide
  for(var i = 0; i < layersArray.length; i++){
    if (layersArray[i].layerType == "guide"){
      layersArray[i].layerType = originalTypeArray[i];
    }
  }
}


//Transforme l'integer du calque à exporter en string
function numberToString(number){
  var str;
  if (number < 10){
    str = "0" + number.toString() + "_";
  }else{
    str = number.toString() + "_" ;
  }
  return str
}


//Exporte les layers non guide en swf
function exportLayers(increment, nomDuCalque){
  doc.exportSWF(exportFolder + "/" + increment + nomDuCalque + ".swf", true);
}


//Vérifie si un calque est vide ou non
function isLayerEmpty(selectedLayer){
  var layerFrameCount = selectedLayer.frameCount;
  for(var j = 0; j < layerFrameCount; j++){
    if (selectedLayer.frames[j].isEmpty){
      continue;
    }else{
      return false
    }
  }
  return true
}


//Scan et exporte les layers de la timeline
//exemple de l'arg : timeline = fl.getDocumentDOM().getTimeline();
//increment est un string pour la numérotation des calques
//au départ increment est un string vide = ""
function scanAllLayers(timeline, increment){
  var _increment = increment;
  var calques = timeline.layers;
  //garde en mémoire les type des calques
  var calquesType = typeofLayers(calques);
  var calquesToMerge = prefixedLayers(calques, tag2);
  //met tous les calques en guide
  setAllLayersInGuide(calques);
  //pour bien numéroter les layers
  var calqueNum = 0;

  for(var i = 0; i < calques.length; i++){
    //puis déguide un à un les calques
    var selectedLayer = calques[i];
    if (calquesType[i] == "folder"){
      //Si au moins un calque préfixé tag2 existe
      if (whichPrefix(selectedLayer) == tag2){
        //on vérifie qu'il ne s'agit pas du dernier calque
        if (i < calques.length){
          //on regarde si le calque suivant est enfant du folder
          var layerToMergeCount = 0;
          j = 1;
          selectedLayer = calques[i+j];
          var parent = selectedLayer.parentLayer;
          while (parent != null && parent == calques[i]){
            layerToMergeCount ++;
            j++;
            //si jamais on arrive au dernier calque de la tl
            if (i+j < calques.length){
              selectedLayer = calques[i+j];
              parent = selectedLayer.parentLayer;
            }else{
              break;
            }
          }
          //si le folder contient au moins un calque
          if (layerToMergeCount > 0){
            calqueNum ++;
            for(var k = 0; k < layerToMergeCount; k++){
              //remet les calques enfants dans leur type d'origine
              calques[i+1+k].layerType = calquesType[i+1+k];
            }
          }
          num = numberToString(calqueNum);
          num = _increment + num;
          selectedLayer = calques[i];
          exportLayers(num, selectedLayer.name);
          //remet les calques enfants en guide
          for(var k = 0; k < layerToMergeCount; k++){
            calques[i+1+k].layerType = "guide";
          }
          //update l'index de la boucle, on saute tous les calques mergés
          i += layerToMergeCount;
          _increment = increment;
        }
      }
      continue;
    }else if (isLayerEmpty(selectedLayer) == true){
      continue;
    }else if (calquesType[i] == "masked") {
      continue;
    }else if (calquesType[i] == "guided") {
      continue;
    }else if (calquesType[i] == "normal") {
      timeline.setSelectedLayers(i); //pas bien sûr de pourquoi c utile
      calqueNum ++;
      var selectedLayer = calques[i];
      //remet le calque dans son type d'origine
      selectedLayer.layerType = "normal";
      num = numberToString(calqueNum);
      num = _increment + num;
      //check si prefix
      if (whichPrefix(selectedLayer) == tag1){
        //parcourir les frames de la timeline à la recherche d'un symbole
        var layerFrameCount = selectedLayer.frameCount;
        var frameNumber;
        for(var j = 0; j < layerFrameCount; j++){
          if (selectedLayer.frames[j].isEmpty){
            continue;
          }else{
            frameNumber = j;
            break;
          }
        }
        if (frameNumber != undefined){
          var element = selectedLayer.frames[frameNumber].elements[0];
          if (element.instanceType == "symbol"){
            var symbolItem = element.libraryItem;
            var childTimeline = symbolItem.timeline;
            scanAllLayers(childTimeline, num);
            selectedLayer.layerType = "guide";
            continue;
          }
        }
      }
      exportLayers(num, selectedLayer.name);
      selectedLayer.layerType = "guide";
      _increment = increment;
    }else if (calquesType[i] == "mask") {
      //timeline.setSelectedLayers(i);
      //on vérifie qu'il ne s'agit pas du dernier calque
      if (i < calques.length){
        //on regarde si le calque suivant est masked ou non
        var maskedLayerCount = 0;
        while (calquesType[i+maskedLayerCount+1] == "masked"){
          maskedLayerCount ++;
        }
        //si un calque au moins est masked
        if (maskedLayerCount > 0){
          var maskedProperPosition = i+1;
          var selectedLayer = calques[i];
          selectedLayer.layerType = calquesType[i];
          for(var j = 0; j < maskedLayerCount; j++){
            selectedLayer = calques[i+1+j];
            if (isLayerEmpty(selectedLayer) == true){
              continue;
            };
            calqueNum ++;
            //change l'ordre du calque si plusieurs sont masked
            //il doit se trouver juste dessous son parent
            if (i+1+j != maskedProperPosition){
              timeline.reorderLayer(i+1+j, maskedProperPosition);
            }
            //remet le calque dans son type d'origine
            selectedLayer.layerType = "masked";
            num = numberToString(calqueNum);
            num = _increment + num;
            //check si prefix
            if (whichPrefix(selectedLayer) == tag1){
              //parcourir les frames de la timeline à la recherche d'un symbole
              var layerFrameCount = selectedLayer.frameCount;
              var frameNumber;
              for(var k = 0; k < layerFrameCount; k++){
                if (selectedLayer.frames[k].isEmpty){
                  continue;
                }else{
                  frameNumber = k;
                  break;
                }
              }
              if (frameNumber != undefined){
                var element = selectedLayer.frames[frameNumber].elements[0];
                if (element.instanceType == "symbol"){
                  var symbolItem = element.libraryItem;
                  var childTimeline = symbolItem.timeline;
                  scanAllLayers(childTimeline, num);
                  //rétabli l'ordre des calques
                  timeline.reorderLayer(maskedProperPosition, i+1+j, false);
                  selectedLayer.layerType = "guide";
                  continue;
                }
              }
            }
            exportLayers(num, selectedLayer.name);
            //puis de nouveau en guide
            selectedLayer.layerType = "guide";
            _increment = increment;
            //rétabli l'ordre des calques
            if (i+1+j != maskedProperPosition){
              timeline.reorderLayer(maskedProperPosition, i+1+j, false);
            }
          }
        }
      }
    }else if (calquesType[i] == "guide") {
      //timeline.setSelectedLayers(i);
      //on vérifie qu'il ne s'agit pas du dernier calque
      if (i < calques.length){
        //on regarde si le calque suivant est guided ou non
        var guidedLayerCount = 0;
        while (calquesType[i+guidedLayerCount+1] == "guided"){
          guidedLayerCount ++;
        }
        //si un calque au moins est guided
        if (guidedLayerCount > 0){
          var guidedProperPosition = i+1;
          var selectedLayer = calques[i];
          selectedLayer.layerType = calquesType[i];
          for(var j = 0; j < guidedLayerCount; j++){
            selectedLayer = calques[i+1+j];
            if (isLayerEmpty(selectedLayer) == true){
              continue;
            };
            calqueNum ++;
            //change l'ordre du calque si plusieurs sont guided
            //il doit se trouver juste dessous son parent
            if (i+1+j != guidedProperPosition){
              timeline.reorderLayer(i+1+j, guidedProperPosition);
            }
            //remet le calque dans son type d'origine
            selectedLayer.layerType = "guided";
            num = numberToString(calqueNum);
            num = _increment + num;
            //check si prefix
            if (whichPrefix(selectedLayer) == tag1){
              //parcourir les frames de la timeline à la recherche d'un symbole
              var layerFrameCount = selectedLayer.frameCount;
              var frameNumber;
              for(var k = 0; k < layerFrameCount; k++){
                if (selectedLayer.frames[k].isEmpty){
                  continue;
                }else{
                  frameNumber = k;
                  break;
                }
              }
              if (frameNumber != undefined){
                var element = selectedLayer.frames[frameNumber].elements[0];
                if (element.instanceType == "symbol"){
                  var symbolItem = element.libraryItem;
                  var childTimeline = symbolItem.timeline;
                  scanAllLayers(childTimeline, num);
                  //rétabli l'ordre des calques
                  timeline.reorderLayer(guidedProperPosition, i+1+j, false);
                  selectedLayer.layerType = "guide";
                  continue;
                }
              }
            }
            exportLayers(num, selectedLayer.name);
            //puis de nouveau en guide
            selectedLayer.layerType = "guide";
            _increment = increment;
            //rétabli l'ordre des calques
            if (i+1+j != guidedProperPosition){
              timeline.reorderLayer(guidedProperPosition, i+1+j, false);
            }
          }
        }
      }
    }
  }
  //remet tous les calques en type d'origine
  setLayersToOriginalType(calques,calquesType);
}


//------------------Call of the main function-------------------
scanAllLayers(tl,"");

//------------------------DEBUG-----------------------
// fl.outputPanel.clear();
// fl.trace();
//----------------------------------------------------